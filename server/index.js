import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import { fetchPibFeed, fetchArticleDetail } from './scraper.js';
import { generateGeminiStoryboard } from './geminiService.js';
import { extractAndVerifyFacts } from './factEngine.js';
import { isSupabaseConfigured } from './supabaseClient.js';
import {
  upsertArticles,
  getArticles as getDbArticles,
  saveArticleDetail,
  getFactReport,
  saveFactReport,
  getStoryboard,
  saveStoryboard,
  getDatabaseStats,
} from './dbService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const getSafeLang = (l) => (['hi', 'en', 'ta', 'te', 'gu'].includes(l) ? l : 'hi');

// API Health Check with Database Status
app.get('/api/health', async (req, res) => {
  const dbStats = await getDatabaseStats();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'BharatVani PIB Live & Archive News Engine',
    database: dbStats,
    languages: ['hi', 'en', 'ta', 'te', 'gu'],
  });
});

// API: Get PIB Feed with filters + Supabase persistence
app.get('/api/news', async (req, res) => {
  try {
    const lang = getSafeLang(req.query.lang);
    const category = req.query.category || 'all';
    const search = (req.query.search || '').trim().toLowerCase();
    const force = req.query.force === 'true';
    const useArchive = req.query.archive === 'true';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    // If historical archive mode requested and Supabase is configured
    if (useArchive && isSupabaseConfigured()) {
      const dbResult = await getDbArticles({
        lang,
        category,
        search,
        limit,
        offset,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      });

      if (dbResult && dbResult.articles.length > 0) {
        return res.json({
          success: true,
          count: dbResult.articles.length,
          total: dbResult.total,
          page,
          limit,
          lang,
          category,
          source: 'supabase_archive',
          data: dbResult.articles,
        });
      }
    }

    // Default live scrape feed
    const articles = await fetchPibFeed(lang, force);

    // Persist scraped articles to Supabase in the background
    if (isSupabaseConfigured() && articles && articles.length > 0) {
      upsertArticles(articles).catch((err) =>
        console.warn('Background Supabase article sync error:', err.message)
      );
    }

    let filtered = articles;

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    // Filter by search query
    if (search) {
      filtered = filtered.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(search)) ||
          (a.description && a.description.toLowerCase().includes(search)) ||
          (a.category && a.category.toLowerCase().includes(search))
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      total: articles.length,
      lang: lang,
      category: category,
      dbSynced: isSupabaseConfigured(),
      lastUpdated: new Date().toISOString(),
      data: filtered,
    });
  } catch (error) {
    console.error('Error in /api/news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news feed',
      error: error.message,
    });
  }
});

// API: Dedicated Historical Archive Endpoint
app.get('/api/news/archive', async (req, res) => {
  try {
    const lang = getSafeLang(req.query.lang);
    const category = req.query.category || 'all';
    const search = (req.query.search || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const dbResult = await getDbArticles({
      lang,
      category,
      search,
      limit,
      offset,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });

    if (dbResult) {
      return res.json({
        success: true,
        count: dbResult.articles.length,
        total: dbResult.total,
        page,
        limit,
        lang,
        category,
        data: dbResult.articles,
      });
    }

    // Fallback if DB not configured: return current live feed
    const articles = await fetchPibFeed(lang, false);
    res.json({
      success: true,
      count: articles.length,
      total: articles.length,
      page: 1,
      limit: articles.length,
      lang,
      category,
      fallback: true,
      data: articles,
    });
  } catch (error) {
    console.error('Error in /api/news/archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query news archive',
      error: error.message,
    });
  }
});

// API: Get Full Article Detail
app.get('/api/news/detail', async (req, res) => {
  try {
    const prid = req.query.prid || req.query.id;
    const lang = getSafeLang(req.query.lang);

    if (!prid) {
      return res.status(400).json({
        success: false,
        message: 'PRID parameter is required',
      });
    }

    const detail = await fetchArticleDetail(prid, lang);

    // Save detailed paragraphs & takeaways to Supabase if configured
    if (isSupabaseConfigured() && detail) {
      saveArticleDetail(prid, lang, detail).catch((err) =>
        console.warn('Background Supabase saveArticleDetail error:', err.message)
      );
    }

    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error('Error in /api/news/detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article detail',
      error: error.message,
    });
  }
});

// API: Generate AI Visual Video Storyboard (with DB Cache)
app.post('/api/ai/storyboard', async (req, res) => {
  try {
    const { article, apiKey, lang } = req.body;

    if (!article) {
      return res.status(400).json({
        success: false,
        message: 'Article object is required in request body',
      });
    }

    const language = getSafeLang(lang || article.lang);
    const articleId = article.id || article.prid;

    // Check Supabase Cache first to save Gemini quotas & time
    if (isSupabaseConfigured() && articleId) {
      const cachedStoryboard = await getStoryboard(articleId, language);
      if (cachedStoryboard) {
        return res.json({
          success: true,
          cached: true,
          data: cachedStoryboard,
        });
      }
    }

    const keyToUse = process.env.GEMINI_API_KEY || apiKey;
    const storyboard = await generateGeminiStoryboard(article, keyToUse, language);

    // Persist to Supabase in background
    if (isSupabaseConfigured() && articleId && storyboard) {
      saveStoryboard(articleId, language, storyboard).catch((err) =>
        console.warn('Supabase saveStoryboard cache error:', err.message)
      );
    }

    res.json({
      success: true,
      cached: false,
      data: storyboard,
    });
  } catch (error) {
    console.error('Error in /api/ai/storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI storyboard',
      error: error.message,
    });
  }
});

// API: Fact Verification & Grounded Entity-Claim Extraction (with DB Cache)
app.post('/api/news/factcheck', async (req, res) => {
  try {
    const { article, rawText, lang } = req.body;

    if (!article) {
      return res.status(400).json({
        success: false,
        message: 'Article object is required in request body',
      });
    }

    const language = getSafeLang(lang || article.lang);
    const articleId = article.id || article.prid;

    // Check Supabase Cache first
    if (isSupabaseConfigured() && articleId) {
      const cachedReport = await getFactReport(articleId, language);
      if (cachedReport) {
        return res.json({
          success: true,
          cached: true,
          data: cachedReport,
        });
      }
    }

    const factReport = await extractAndVerifyFacts({
      article,
      rawText,
      lang: language,
    });

    // Save verified report to Supabase
    if (isSupabaseConfigured() && articleId && factReport) {
      saveFactReport(articleId, language, factReport).catch((err) =>
        console.warn('Supabase saveFactReport error:', err.message)
      );
    }

    res.json({
      success: true,
      cached: false,
      data: factReport,
    });
  } catch (error) {
    console.error('Error in /api/news/factcheck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify facts',
      error: error.message,
    });
  }
});

// In-memory TTS audio cache for instant playback
const ttsCache = new Map();

// API: Natural Indian Female Voice Audio Stream (Google TTS Engine)
app.get('/api/tts', async (req, res) => {
  try {
    const text = (req.query.text || '').trim();
    const lang = getSafeLang(req.query.lang);

    if (!text) {
      return res.status(400).send('Text is required');
    }

    // Clean and normalize text
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 200)
      .trim();

    const cacheKey = `${lang}_${cleanText}`;

    // Serve from cache if available
    if (ttsCache.has(cacheKey)) {
      const cachedBuffer = ttsCache.get(cacheKey);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': cachedBuffer.length,
        'Cache-Control': 'public, max-age=86400',
      });
      return res.send(cachedBuffer);
    }

    const googleLang = lang === 'en' ? 'en-IN' : lang;
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(
      cleanText
    )}`;

    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ family: 4 }),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: '*/*',
      },
      timeout: 10000,
    });

    const buffer = Buffer.from(response.data);

    // Save to cache (limit cache size to 200 items)
    if (ttsCache.size > 200) {
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, buffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(buffer);
  } catch (error) {
    console.error('Error in /api/tts:', error.message);
    res.status(500).json({ error: 'Failed to generate speech audio' });
  }
});

app.listen(PORT, () => {
  console.log(`📡 PIB News API Server running on port ${PORT}`);
  console.log(`🌐 Ready to serve news at http://localhost:${PORT}/api/news`);
});
