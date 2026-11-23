import { fetchPibFeed } from '../server/scraper.js';
import { getFallbackNews } from '../src/data/fallbackNews.js';
import { getArticles as getDbArticles, upsertArticles } from '../server/dbService.js';
import { isSupabaseConfigured } from '../server/supabaseClient.js';

export default async function handler(req, res) {
  // Universal CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const lang = ['hi', 'en', 'ta', 'te', 'gu'].includes(req.query.lang) ? req.query.lang : 'hi';
    const category = req.query.category || 'all';
    const search = (req.query.search || '').trim().toLowerCase();
    const force = req.query.force === 'true';
    const useArchive = req.query.archive === 'true';

    // 1. If requesting historical archive and database is configured
    if (useArchive && isSupabaseConfigured()) {
      try {
        const dbResult = await getDbArticles({ lang, category, search, limit: 30 });
        if (dbResult && dbResult.articles && dbResult.articles.length > 0) {
          return res.status(200).json({
            success: true,
            count: dbResult.articles.length,
            total: dbResult.total,
            lang: lang,
            category: category,
            source: 'supabase_archive',
            data: dbResult.articles,
          });
        }
      } catch (dbErr) {
        console.warn('Archive query error:', dbErr.message);
      }
    }

    let articles = [];

    // 2. Fetch live PIB news feed
    try {
      articles = await fetchPibFeed(lang, force);
      // Background sync to database if configured
      if (isSupabaseConfigured() && articles.length > 0) {
        upsertArticles(articles).catch(() => {});
      }
    } catch (scrapeErr) {
      console.warn('Scraper error in Vercel serverless function:', scrapeErr.message);
    }

    // 3. Fallback to Supabase historical archive if scraper failed
    if ((!Array.isArray(articles) || articles.length === 0) && isSupabaseConfigured()) {
      try {
        const dbResult = await getDbArticles({ lang, category, search, limit: 25 });
        if (dbResult?.articles?.length > 0) {
          articles = dbResult.articles;
        }
      } catch {}
    }

    // 4. Fallback to bundled dataset
    if (!Array.isArray(articles) || articles.length === 0) {
      articles = getFallbackNews(lang);
    }

    let filtered = articles;

    if (category && category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    if (search) {
      filtered = filtered.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(search)) ||
          (a.description && a.description.toLowerCase().includes(search)) ||
          (a.category && a.category.toLowerCase().includes(search))
      );
    }

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({
      success: true,
      count: filtered.length,
      total: articles.length,
      lang: lang,
      category: category,
      source: 'pib_live_engine',
      lastUpdated: new Date().toISOString(),
      data: filtered,
    });
  } catch (error) {
    console.error('Error in /api/news handler:', error);
    const lang = req.query?.lang || 'hi';
    const fallback = getFallbackNews(lang);
    return res.status(200).json({
      success: true,
      count: fallback.length,
      total: fallback.length,
      lang: lang,
      source: 'pib_fallback_engine',
      data: fallback,
    });
  }
}
