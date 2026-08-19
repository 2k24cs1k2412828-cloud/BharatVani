import axios from 'axios';
import * as cheerio from 'cheerio';
import xml2js from 'xml2js';

const PIB_URLS = {
  hi_rss: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3',
  hi_page: 'https://pib.gov.in/Allrel.aspx?reg=3&lang=2',
  en_page: 'https://pib.gov.in/Allrel.aspx?reg=3&lang=1',
};

// In-memory cache for fast response
const cache = {
  hi: { data: [], timestamp: 0 },
  en: { data: [], timestamp: 0 },
  details: new Map(),
};

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

// Categorization helper
export function categorizeArticle(title = '', desc = '', ministry = '') {
  const text = `${title} ${desc} ${ministry}`.toLowerCase();

  if (
    /कृषि|किसान|फसल|बीज|उर्वरक|ग्रामीण|सिंचाई|मंडी|पशुपालन|मत्स्य|मखाना|agri|farmer|crop|fertilizer|rural|soil|mandi|pm-kisan|icar|harvest|horticulture|monsoon|makhana/i.test(text)
  ) {
    return 'agriculture';
  }
  if (
    /तकनीक|डिजिटल|उपग्रह|विज्ञान|एआई|इंटरनेट|इसरो|डीआरडीओ|इलेक्ट्रॉनिक्स|साइबर|रोबोट|tech|digital|space|isro|drdo|ai|cyber|software|electronics|innovation|engineering|telecom|satellite/i.test(text)
  ) {
    return 'technology';
  }
  if (
    /वित्त|बजट|वाणिज्य|उद्योग|जीएसटी|निर्यात|आयात|निवेश|बैंक|आरबीआई|अर्थव्यवस्था|टैक्स|शेयर|कारोबार|cbam|economy|finance|budget|commerce|trade|export|import|tax|rbi|industry|business|msme|market|gdp/i.test(text)
  ) {
    return 'economy';
  }
  if (
    /स्वास्थ्य|अस्पताल|चिकित्सा|आयुष|पोषण|दवा|टीका|रोग|कल्याण|डॉक्टर|योग|health|medicine|hospital|ayush|nutrition|vaccine|disease|medical|welfare|yoga|pharma|wellness/i.test(text)
  ) {
    return 'health';
  }
  if (
    /पर्यावरण|जलवायु|सौर|ऊर्जा|वन|प्रदूषण|नवीकरणीय|जल शक्ति|गंगा|environment|climate|solar|energy|forest|green|pollution|renewable|water|power|clean/i.test(text)
  ) {
    return 'environment';
  }
  return 'governance';
}

// Generate simple 2-3 sentence summary/takeaways for Kisan mode
export function generateKeyPoints(paragraphs = [], title = '', lang = 'hi') {
  const points = [];
  if (paragraphs.length > 0) {
    for (const p of paragraphs.slice(0, 4)) {
      const clean = p.trim().replace(/\s+/g, ' ');
      if (clean.length > 30 && clean.length < 240 && !clean.startsWith('***') && !clean.includes('PIB') && !clean.includes('पीआईबी')) {
        points.push(clean);
      }
      if (points.length >= 3) break;
    }
  }
  if (points.length === 0 && title) {
    points.push(title);
  }
  return points;
}

// Check if string has Devanagari/Hindi characters
export function isHindiText(str = '') {
  return /[\u0900-\u097F]/.test(str);
}

// Scrape / Fetch PIB Feed according to Language
export async function fetchPibFeed(lang = 'hi', forceRefresh = false) {
  const now = Date.now();
  const cached = cache[lang];

  if (!forceRefresh && cached && cached.data.length > 0 && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  if (lang === 'en') {
    // 1. ENGLISH FEED SCRAPER
    try {
      const response = await axios.get(PIB_URLS.en_page, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const items = [];

      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        const title = $(el).text().trim();
        
        // Check for valid English release link and ensure it's not a generic nav link
        if (
          (href.includes('PRID=') || href.includes('PressReleaseDetail') || href.includes('PressReleasePage')) &&
          title.length > 15 &&
          !isHindiText(title) && // Must be strictly English!
          !title.toLowerCase().includes('skip to') &&
          !title.toLowerCase().includes('screen reader')
        ) {
          const pridMatch = href.match(/PRID=(\d+)/i);
          const prid = pridMatch ? pridMatch[1] : `pib-en-${items.length + 1}`;

          if (!items.some((i) => i.id === prid || i.title === title)) {
            const category = categorizeArticle(title, '');
            items.push({
              id: prid,
              prid: prid,
              title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
              link: href.startsWith('http') ? href : `https://pib.gov.in${href.startsWith('/') ? '' : '/'}${href}`,
              iframeLink: `https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${prid}`,
              pubDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              description: `Official press release from Government of India regarding ${title}.`,
              category: category,
              lang: 'en',
              source: 'Press Information Bureau (PIB), GoI',
            });
          }
        }
      });

      if (items.length > 0) {
        // Supplement with fallback seed items if count is small
        const allEn = [...items, ...getFallbackData('en').filter((fb) => !items.some((it) => it.id === fb.id))];
        cache.en = { data: allEn, timestamp: now };
        return allEn;
      }
    } catch (err) {
      console.error('[Scraper] Error fetching English PIB page:', err.message);
    }

    const fallbackEn = getFallbackData('en');
    cache.en = { data: fallbackEn, timestamp: now };
    return fallbackEn;

  } else {
    // 2. HINDI FEED SCRAPER
    try {
      const response = await axios.get(PIB_URLS.hi_rss, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const parser = new xml2js.Parser({ explicitArray: false, trim: true });
      const parsed = await parser.parseStringPromise(response.data);
      const rawItems = parsed?.rss?.channel?.item || [];
      const itemsArray = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);

      const articles = itemsArray.map((item, idx) => {
        const title = item.title || 'प्रेस विज्ञप्ति';
        const link = item.link || '';
        const pubDate = item.pubDate || new Date().toISOString();
        const description = item.description || '';
        
        const pridMatch = link.match(/PRID=(\d+)/i);
        const prid = pridMatch ? pridMatch[1] : `pib-hi-${idx}`;
        const category = categorizeArticle(title, description);

        return {
          id: prid,
          prid: prid,
          title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
          link: link || `https://pib.gov.in/PressReleasePage.aspx?PRID=${prid}`,
          iframeLink: `https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${prid}`,
          pubDate: pubDate,
          description: description || `भारत सरकार द्वारा जारी आधिकारिक प्रेस विज्ञप्ति: ${title}`,
          category: category,
          lang: 'hi',
          source: 'Press Information Bureau (PIB), GoI',
        };
      });

      if (articles.length > 0) {
        cache.hi = { data: articles, timestamp: now };
        return articles;
      }
    } catch (err) {
      console.error('[Scraper] Error fetching Hindi PIB feed:', err.message);
    }

    const fallbackHi = getFallbackData('hi');
    cache.hi = { data: fallbackHi, timestamp: now };
    return fallbackHi;
  }
}

// Fetch Full Article Details from PIB
export async function fetchArticleDetail(prid, lang = 'hi') {
  if (!prid) throw new Error('PRID is required');

  const cacheKey = `${prid}_${lang}`;
  if (cache.details.has(cacheKey)) {
    return cache.details.get(cacheKey);
  }

  const targetUrl = `https://pib.gov.in/PressReleasePage.aspx?PRID=${prid}`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 12000,
    });

    const $ = cheerio.load(response.data);

    let title = $('h2').first().text().trim() || 
                $('h3').first().text().trim() || 
                $('.ReleaseHeadline').text().trim() || 
                $('title').text().replace(': Press Information Bureau', '').trim();

    let ministry = $('#lblMinistry').text().trim() || 
                   $('.MinistryName').text().trim() || 
                   $('.innner-content h3').first().text().trim();

    let releaseDate = $('#lblReleaseDate').text().trim() || 
                      $('.ReleaseDate').text().trim() || 
                      $('.innner-content .release-date').text().trim();

    const paragraphs = [];
    const images = [];

    const contentArea = $('.innner-content, .release-content, #pageContent, form');
    
    contentArea.find('p').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && !text.startsWith('***') && !text.includes('उपयोग संबंधी शर्तें') && text.length > 15) {
        paragraphs.push(text);
      }
    });

    contentArea.find('img').each((_, el) => {
      let src = $(el).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('header')) {
        if (src.startsWith('/')) src = `https://pib.gov.in${src}`;
        images.push(src);
      }
    });

    const category = categorizeArticle(title, paragraphs.join(' '), ministry);
    const keyTakeaways = generateKeyPoints(paragraphs, title, lang);

    const result = {
      id: prid,
      prid: prid,
      title: title,
      ministry: ministry || (lang === 'hi' ? 'भारत सरकार' : 'Government of India'),
      releaseDate: releaseDate || (lang === 'hi' ? new Date().toLocaleDateString('hi-IN') : new Date().toLocaleDateString('en-US')),
      paragraphs: paragraphs.length > 0 ? paragraphs : [title],
      keyTakeaways: keyTakeaways,
      images: images.slice(0, 3),
      category: category,
      originalUrl: targetUrl,
      lang: lang,
    };

    cache.details.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[Scraper] Error fetching detail for PRID ${prid}:`, err.message);

    const feed = cache[lang]?.data || [];
    const item = feed.find((i) => i.prid === prid) || {};

    return {
      id: prid,
      prid: prid,
      title: item.title || (lang === 'hi' ? 'प्रेस विज्ञप्ति' : 'Press Release'),
      ministry: lang === 'hi' ? 'भारत सरकार' : 'Government of India',
      releaseDate: item.pubDate || new Date().toLocaleDateString(),
      paragraphs: [
        item.description || item.title || (lang === 'hi' ? 'विस्तृत जानकारी मूल प्रेस विज्ञप्ति में उपलब्ध है।' : 'Full details available in the official PIB press release.')
      ],
      keyTakeaways: [item.title || ''],
      images: [],
      category: item.category || 'governance',
      originalUrl: targetUrl,
      lang: lang,
    };
  }
}

// Fallback seed data in case PIB server times out
function getFallbackData(lang = 'hi') {
  if (lang === 'hi') {
    return [
      {
        id: '2301058',
        prid: '2301058',
        title: 'भारत का मखाना सेक्टर: पारंपरिक फसल से ग्लोबल सुपरफूड तक की प्रेरक यात्रा',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301058',
        pubDate: '19 Aug 2026 10:00:00 GMT',
        description: 'मखाना उत्पादन, प्रसंस्करण और वैश्विक निर्यात को बढ़ावा देने के लिए नई योजनाओं और सब्सिडी की घोषणा।',
        category: 'agriculture',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301039',
        prid: '2301039',
        title: 'वाणिज्य विभाग द्वारा निर्यातकों के लिए यूरोपीय संघ के कार्बन बॉर्डर एडजस्टमेंट मैकेनिज्म (CBAM) नियमों पर जागरूकता सत्र का आयोजन',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301039',
        pubDate: '19 Aug 2026 09:00:00 GMT',
        description: 'भारतीय निर्यातकों को वैश्विक मानकों और ईयू सीएबीएम नियमों की तकनीकी जानकारी देने के लिए विशेष सत्र आयोजित किया गया।',
        category: 'economy',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301016',
        prid: '2301016',
        title: 'कौशल विकास और उद्यमिता मंत्रालय द्वारा आयोजित कौशल महोत्सव में युवाओं और किसानों ने लिया भारी उत्साह से भाग',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301016',
        pubDate: '19 Aug 2026 08:30:00 GMT',
        description: 'ग्रामीण युवाओं और कृषि तकनीशियनों के कौशल उन्नयन हेतु आधुनिक तकनीकों और डिजिटल साधनों का प्रदर्शन किया गया।',
        category: 'agriculture',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301001',
        prid: '2301001',
        title: 'डिजिटल सार्वजनिक अवसंरचना (DPI) और डिजिटल शासन पर खास ज़ोर के साथ 7वीं ब्रिक्स आईसीटी कार्य समूह की बैठक',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301001',
        pubDate: '19 Aug 2026 07:45:00 GMT',
        description: 'भारत ने ग्रामीण कनेक्टिविटी, डिजिटल भुगतान और आर्टिफिशियल इंटेलिजेंस के लोक-कल्याणकारी उपयोग पर विचार साझा किए।',
        category: 'technology',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301005',
        prid: '2301005',
        title: 'सटीक आंकड़े और पारदर्शी योजनाएं ग्रामीण विकास और कल्याणकारी योजनाओं के सफल क्रियान्वयन की कुंजी: उपराष्ट्रपति',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301005',
        pubDate: '19 Aug 2026 07:00:00 GMT',
        description: 'प्रत्येक जरूरतमंद किसान और नागरिक तक सरकारी योजनाओं का सीधा लाभ पहुंचाने पर दिया गया जोर।',
        category: 'governance',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2300990',
        prid: '2300990',
        title: 'कृषि एवं किसान कल्याण मंत्रालय द्वारा पीएम-किसान और मृदा स्वास्थ्य कार्ड योजना के तहत नए डिजिटल टूल्स जारी',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2300990',
        pubDate: '19 Aug 2026 06:15:00 GMT',
        description: 'किसानों को मौसम पूर्वानुमान, सटीक उर्वरक सलाह और प्रत्यक्ष वित्तीय सहायता ट्रैकिंग की सुविधा मोबाइल ऐप पर मिलेगी।',
        category: 'agriculture',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2300970',
        prid: '2300970',
        title: 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय द्वारा पीएम-कुसुम योजना के तहत सौर पंपों की स्थापना में रिकॉर्ड वृद्धि',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2300970',
        pubDate: '19 Aug 2026 04:45:00 GMT',
        description: 'किसानों को दिन के समय निर्बाध सौर बिजली मिलने से सिंचाई लागत में 70% तक की भारी बचत।',
        category: 'environment',
        lang: 'hi',
        source: 'Press Information Bureau (PIB), GoI',
      }
    ];
  } else {
    return [
      {
        id: '2301052',
        prid: '2301052',
        title: 'India’s Makhana Sector: Traditional Crop to Global Superfood Milestone',
        link: 'https://pib.gov.in/PressReleaseDetail.aspx?PRID=2301052',
        pubDate: '19 Aug 2026 10:00:00 GMT',
        description: 'Government announces major processing infrastructure upgrades and export incentives to position Indian Makhana in premier international markets.',
        category: 'agriculture',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301050',
        prid: '2301050',
        title: 'Union Minister of Commerce & Industry Shri Piyush Goyal leaves for Singapore for 4th India-Singapore Ministerial Roundtable',
        link: 'https://pib.gov.in/PressReleaseDetail.aspx?PRID=2301050',
        pubDate: '19 Aug 2026 09:30:00 GMT',
        description: 'High-level delegation to deepen bilateral trade, semiconductor cooperation, green energy investments, and supply chain resiliency.',
        category: 'economy',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301039',
        prid: '2301039',
        title: 'Department of Commerce organizes Awareness Session for Exporters on EU Carbon Border Adjustment Mechanism (CBAM)',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301039',
        pubDate: '19 Aug 2026 09:00:00 GMT',
        description: 'Special session conducted to empower Indian exporters with technical knowledge of EU CBAM regulations and compliance tools.',
        category: 'economy',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2301001',
        prid: '2301001',
        title: '7th BRICS ICT Working Group Meeting spotlights Digital Public Infrastructure and Citizen-Centric Governance',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2301001',
        pubDate: '19 Aug 2026 07:45:00 GMT',
        description: 'India showcases success of digital payments, rural connectivity models, and open digital ecosystems.',
        category: 'technology',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2300990',
        prid: '2300990',
        title: 'Ministry of Agriculture launches Upgraded Digital Suite for PM-KISAN and Soil Health Advisory',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2300990',
        pubDate: '19 Aug 2026 06:15:00 GMT',
        description: 'Real-time weather tracking, customized fertilizer calculations, and direct subsidy monitoring enabled on mobile phones.',
        category: 'agriculture',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2300985',
        prid: '2300985',
        title: 'Health Ministry scales e-Sanjeevani Teleconsultation Network across 150,000 Rural Ayushman Arogya Mandirs',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2300985',
        pubDate: '19 Aug 2026 05:30:00 GMT',
        description: '24x7 expert physician consultations and diagnostic guidance now directly accessible in village health centers.',
        category: 'health',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      },
      {
        id: '2300970',
        prid: '2300970',
        title: 'Ministry of New & Renewable Energy reports Milestone 40% Growth in PM-KUSUM Solar Irrigation Pumps',
        link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2300970',
        pubDate: '19 Aug 2026 04:45:00 GMT',
        description: 'Solarized agriculture feeders provide dependable daytime irrigation power, slashing diesel expenses for farming families.',
        category: 'environment',
        lang: 'en',
        source: 'Press Information Bureau (PIB), GoI',
      }
    ];
  }
}
