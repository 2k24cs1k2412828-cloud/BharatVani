import axios from 'axios';

// Curated high-resolution thematic images (royalty-free Unsplash CDN)
export const THEME_VISUALS = {
  agriculture: [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', // lush golden farm
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80', // farmer in field with crop
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80', // modern smart farming
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80', // tractors & agriculture
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // technology microchip circuit
    'https://images.unsplash.com/photo-1517976487507-e1055e886915?auto=format&fit=crop&w=1200&q=80', // space rocket satellite
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // global digital network AI
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // cyber digital code
  ],
  economy: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80', // trade stock market chart
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', // cargo shipping container port
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // modern finance district
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80', // banking & growth
  ],
  health: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80', // medical doctor healthcare
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80', // hospital care clinic
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', // wellness holistic health
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80', // pharmacy research
  ],
  environment: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', // solar panels green energy
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80', // wind turbines clean energy
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80', // green forest nature
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80', // mountains and rivers
  ],
  governance: [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', // India Gate New Delhi
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80', // Indian flag tricolor national
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80', // architecture government
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80', // handshakes collaboration
  ],
};

// Smart fallback storyboard generator (when no key or offline)
export function generateFallbackStoryboard(article, lang = 'hi') {
  const isHindi = lang === true || lang === 'hi' || lang === 'HINDI' || lang === 'hindi';
  const cat = article.category || 'governance';
  const visuals = THEME_VISUALS[cat] || THEME_VISUALS.governance;

  const desc = article.description || article.title;
  const ministry = article.ministry || (isHindi ? 'भारत सरकार' : 'Government of India');

  return {
    success: true,
    source: 'Built-in Smart Engine',
    title: article.title,
    category: cat,
    scenes: [
      {
        sceneIndex: 1,
        headline: isHindi ? 'प्रमुख सरकारी घोषणा एवं समाचार' : 'Official Government Announcement',
        narration: isHindi
          ? `नमस्कार। ${ministry} द्वारा जारी इस महत्वपूर्ण विज्ञप्ति के अनुसार: ${article.title}`
          : `Hello and welcome. According to the latest release from the ${ministry}: ${article.title}`,
        keyPoints: [
          isHindi ? `🏛️ जारीकर्ता: ${ministry}` : `🏛️ Source: ${ministry}`,
          isHindi ? `📌 श्रेणी: ${cat.toUpperCase()}` : `📌 Category: ${cat.toUpperCase()}`,
        ],
        visualImage: visuals[0],
        accentColor: '#1e40af',
      },
      {
        sceneIndex: 2,
        headline: isHindi ? 'मुख्य विवरण एवं प्रभाव' : 'Key Details & Public Impact',
        narration: isHindi
          ? `इस योजना और विज्ञप्ति का मुख्य उद्देश्य नागरिकों और लाभार्थियों तक महत्वपूर्ण जानकारी पहुँचाना है। ${desc}`
          : `The core objective of this initiative is to empower citizens and stakeholders with direct updates. ${desc}`,
        keyPoints: [
          isHindi ? '⚡ सीधा एवं पारदर्शी लाभ' : '⚡ Direct & Transparent Delivery',
          isHindi ? '📈 राष्ट्रव्यापी क्रियान्वयन' : '📈 Nationwide Implementation',
        ],
        visualImage: visuals[1] || visuals[0],
        accentColor: '#16a34a',
      },
      {
        sceneIndex: 3,
        headline: isHindi ? 'नागरिकों और किसानों के लिए सीख' : 'Actionable Takeaways',
        narration: isHindi
          ? `विस्तृत जानकारी एवं आधिकारिक दस्तावेजों के लिए नागरिक मूल पीआईबी पोर्टल या आधिकारिक वेबसाइट पर जा सकते हैं।`
          : `For full documentation, verification and application guidelines, citizens can visit the official PIB portal.`,
        keyPoints: [
          isHindi ? '✅ सत्यापित सरकारी सूचना' : '✅ Verified Government Source',
          isHindi ? '📱 डिजिटल रूप से उपलब्ध' : '📱 Available on Digital Portals',
        ],
        visualImage: visuals[2] || visuals[0],
        accentColor: '#f97316',
      },
    ],
  };
}

// Generate Storyboard using Google Gemini API
export async function generateGeminiStoryboard(article, apiKey, lang = 'hi') {
  const isHindi = lang === true || lang === 'hi' || lang === 'HINDI' || lang === 'hindi';
  const languageCode = isHindi ? 'hi' : 'en';

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return generateFallbackStoryboard(article, languageCode);
  }

  const cat = article.category || 'governance';
  const visuals = THEME_VISUALS[cat] || THEME_VISUALS.governance;

  const prompt = `
You are an expert news anchor and visual producer explaining government news so that BOTH rural farmers and technical engineers can easily understand it.

Create a 3-scene visual video storyboard in ${isHindi ? 'HINDI (Devanagari script)' : 'ENGLISH'} for this press release:
Title: "${article.title}"
Description: "${article.description || ''}"
Category: "${cat}"
Ministry: "${article.ministry || 'Government of India'}"

Respond ONLY with a valid JSON array of 3 objects (no markdown code fences, just pure JSON array). Each object must have:
- "headline": (A short, punchy 4-8 word title for the visual slide in ${isHindi ? 'Hindi (Devanagari)' : 'English'})
- "narration": (A natural, warm, conversational 1-2 sentence voice script explaining this scene simply in ${isHindi ? 'Hindi (Devanagari)' : 'English'})
- "keyPoints": (An array of 2-3 short bullet badges with emojis in ${isHindi ? 'Hindi' : 'English'}, e.g. ["🌾 ₹6,000 किसान सम्मान", "📱 मोबाइल पर सीधा लाभ"])
- "accentColor": (A hex color like "#16a34a", "#2563eb", or "#ea580c")
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      },
      { timeout: 15000 }
    );

    let textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean potential markdown blocks
    textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedScenes = JSON.parse(textResponse);

    if (Array.isArray(parsedScenes) && parsedScenes.length > 0) {
      const formattedScenes = parsedScenes.slice(0, 4).map((s, idx) => {
        let kpList = [];
        if (Array.isArray(s.keyPoints)) {
          kpList = s.keyPoints;
        } else if (typeof s.keyPoints === 'string') {
          kpList = s.keyPoints.replace(/[\[\]]/g, '').split(',').map((x) => x.trim()).filter(Boolean);
        }
        if (kpList.length === 0) kpList = [isHindi ? '✅ सत्यापित सूचना' : '✅ Verified Info'];

        return {
          sceneIndex: idx + 1,
          headline: s.headline || (isHindi ? `दृश्य ${idx + 1}` : `Scene ${idx + 1}`),
          narration: s.narration || article.title,
          keyPoints: kpList,
          visualImage: visuals[idx % visuals.length],
          accentColor: s.accentColor || (idx === 0 ? '#1e40af' : idx === 1 ? '#16a34a' : '#ea580c'),
        };
      });

      return {
        success: true,
        source: 'Google Gemini 2.5 Flash',
        title: article.title,
        category: cat,
        scenes: formattedScenes,
      };
    }
  } catch (err) {
    console.error('[Gemini Service] API call failed, falling back to smart engine:', err.response?.data || err.message);
  }

  // Fallback if Gemini fails or invalid key
  return generateFallbackStoryboard(article, languageCode);
}
