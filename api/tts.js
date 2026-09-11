import https from 'https';
import axios from 'axios';

// In-memory cache for serverless invocation reuse
const ttsCache = new Map();

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
    const text = (req.query.text || '').trim();
    const lang = req.query.lang || 'hi';

    if (!text) {
      return res.status(400).send('Text parameter is required');
    }

    // Clean and normalize text
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 200)
      .trim();

    const cacheKey = `${lang}_${cleanText}`;

    // Return from edge / memory cache if available
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', cached.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader(
        'Cache-Control',
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      );
      return res.send(cached);
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
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: '*/*',
      },
      timeout: 10000,
    });

    const buffer = Buffer.from(response.data);

    if (ttsCache.size > 300) {
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, buffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    );
    return res.send(buffer);
  } catch (err) {
    console.error('Vercel TTS handler error:', err.message);
    res.status(500).json({ error: 'Failed to generate speech audio', details: err.message });
  }
}
