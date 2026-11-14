import { fetchPibFeed } from '../server/scraper.js';
import { getFallbackNews } from '../src/data/fallbackNews.js';

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

    let articles = [];

    try {
      articles = await fetchPibFeed(lang, force);
    } catch (scrapeErr) {
      console.warn('Scraper error in Vercel serverless function:', scrapeErr.message);
    }

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
