import { fetchArticleDetail } from '../../server/scraper.js';
import { getFallbackNews } from '../../src/data/fallbackNews.js';

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
    const prid = req.query.prid || req.query.id;
    const lang = ['hi', 'en', 'ta', 'te', 'gu'].includes(req.query.lang) ? req.query.lang : 'hi';

    if (!prid) {
      return res.status(400).json({ success: false, message: 'PRID parameter is required' });
    }

    let detail = null;
    try {
      detail = await fetchArticleDetail(prid, lang);
    } catch (scrapeErr) {
      console.warn('Scraper error in detail handler:', scrapeErr.message);
    }

    if (!detail) {
      // Find from fallback news
      const fallbackList = getFallbackNews(lang);
      const match = fallbackList.find((a) => a.id === prid || a.prid === prid);
      if (match) {
        detail = {
          prid: match.prid || match.id,
          title: match.title,
          paragraphs: match.paragraphs || [match.description],
          keyTakeaways: match.keyTakeaways || [match.description],
          images: match.images || [],
          lang: match.lang || lang,
          category: match.category,
          ministry: match.ministry,
          link: match.link,
          iframeLink: match.iframeLink,
        };
      } else {
        detail = {
          prid: prid,
          title: 'प्रेस विज्ञप्ति / Press Release',
          paragraphs: ['आधिकारिक प्रेस सूचना ब्यूरो विज्ञप्ति। Official PIB Press Release.'],
          keyTakeaways: ['आधिकारिक सरकारी प्रेस विज्ञप्ति।'],
          link: `https://pib.gov.in/PressReleasePage.aspx?PRID=${prid}`,
          iframeLink: `https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${prid}`,
        };
      }
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error('Error in /api/news/detail handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch article detail',
      error: error.message,
    });
  }
}
