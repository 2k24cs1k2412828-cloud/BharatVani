import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import { fetchPibFeed, fetchArticleDetail } from './scraper.js';
import { generateGeminiStoryboard } from './geminiService.js';
import { extractAndVerifyFacts } from './factEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PIB Live News Engine',
  });
});

// API: Get PIB Feed with filters
app.get('/api/news', async (req, res) => {
  try {
    const lang = req.query.lang === 'en' ? 'en' : 'hi';
    const category = req.query.category || 'all';
    const search = (req.query.search || '').trim().toLowerCase();
    const force = req.query.force === 'true';

    const articles = await fetchPibFeed(lang, force);

    let filtered = articles;

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    // Filter by search query
    if (search) {
      filtered = filtered.filter((a) =>
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

// API: Get Full Article Detail
app.get('/api/news/detail', async (req, res) => {
  try {
    const prid = req.query.prid || req.query.id;
    const lang = req.query.lang === 'en' ? 'en' : 'hi';

    if (!prid) {
      return res.status(400).json({
        success: false,
        message: 'PRID parameter is required',
      });
    }

    const detail = await fetchArticleDetail(prid, lang);

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

// API: Generate AI Visual Video Storyboard
app.post('/api/ai/storyboard', async (req, res) => {
  try {
    const { article, apiKey, lang } = req.body;

    if (!article) {
      return res.status(400).json({
        success: false,
        message: 'Article object is required in request body',
      });
    }

    const keyToUse = process.env.GEMINI_API_KEY || apiKey;
    const language = lang === 'en' ? 'en' : 'hi';
    const storyboard = await generateGeminiStoryboard(article, keyToUse, language);

    res.json({
      success: true,
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

// API: Fact Verification & Grounded Entity-Claim Extraction
app.post('/api/news/factcheck', async (req, res) => {
  try {
    const { article, rawText, lang } = req.body;

    if (!article) {
      return res.status(400).json({
        success: false,
        message: 'Article object is required in request body',
      });
    }

    const language = lang === 'en' ? 'en' : 'hi';
    const factReport = await extractAndVerifyFacts({
      article,
      rawText,
      lang: language,
    });

    res.json({
      success: true,
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
    const lang = req.query.lang === 'en' ? 'en' : 'hi';

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

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ family: 4 }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': '*/*',
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
