import { supabase, isSupabaseConfigured } from './supabaseClient.js';
export { isSupabaseConfigured };

/**
 * Batch upsert scraped PIB articles into Supabase with full text support
 */
export async function upsertArticles(articles = []) {
  if (!isSupabaseConfigured() || !articles.length) return false;

  try {
    const rows = articles.map((a) => {
      const safeLang = a.lang || 'hi';
      const safePrid = String(a.prid || a.id || '');
      // Composite ID ensures that Hindi, English, Tamil, Telugu, and Gujarati versions
      // of the same release never overwrite each other in the database
      const rowId = a.id?.includes('_') ? a.id : `${safePrid}_${safeLang}`;
      const cleanFullText = a.fullText || (Array.isArray(a.paragraphs) && a.paragraphs.length > 0 ? a.paragraphs.join('\n\n') : '') || a.description || '';

      return {
        id: rowId,
        prid: safePrid,
        title: a.title,
        description: a.description || '',
        full_text: cleanFullText,
        category: a.category || 'governance',
        ministry: a.ministry || '',
        lang: safeLang,
        link: a.link || '',
        iframe_link: a.iframeLink || '',
        pub_date: a.pubDate ? new Date(a.pubDate).toISOString() : new Date().toISOString(),
        paragraphs: a.paragraphs || [],
        key_takeaways: a.keyTakeaways || [],
        images: a.images || [],
        source: a.source || 'Press Information Bureau (PIB), GoI',
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.warn('⚠️ Supabase upsertArticles warning:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error upserting articles to Supabase:', err.message);
    return false;
  }
}

/**
 * Query articles with filtering, search, pagination, and date ranges
 */
export async function getArticles({
  lang = 'hi',
  category = 'all',
  search = '',
  limit = 20,
  offset = 0,
  dateFrom = null,
  dateTo = null,
} = {}) {
  if (!isSupabaseConfigured()) return null;

  try {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('lang', lang)
      .order('pub_date', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      // Search in title, description, ministry, or full_text
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,ministry.ilike.%${search}%,full_text.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('pub_date', new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      query = query.lte('pub_date', new Date(dateTo).toISOString());
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.warn('⚠️ Supabase getArticles error:', error.message);
      return null;
    }

    // Format DB rows back into app Article format
    const formatted = (data || []).map((row) => ({
      id: row.id,
      prid: row.prid,
      title: row.title,
      description: row.description,
      fullText: row.full_text || (Array.isArray(row.paragraphs) ? row.paragraphs.join('\n\n') : '') || row.description || '',
      category: row.category,
      ministry: row.ministry,
      lang: row.lang,
      link: row.link,
      iframeLink: row.iframe_link,
      pubDate: row.pub_date,
      paragraphs: row.paragraphs || [],
      keyTakeaways: row.key_takeaways || [],
      images: row.images || [],
      source: row.source,
      createdAt: row.created_at,
    }));

    return {
      articles: formatted,
      total: count || formatted.length,
    };
  } catch (err) {
    console.error('Error fetching articles from Supabase:', err.message);
    return null;
  }
}

/**
 * Fetch a single past or current article by PRID & Language from Supabase
 * Ensures full text and paragraphs are available for AI video, audio, and fact check generation
 */
export async function getArticleById(prid, lang = 'hi') {
  if (!isSupabaseConfigured() || !prid) return null;

  try {
    const safeLang = lang || 'hi';
    const rowId = `${prid}_${safeLang}`;

    let { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', rowId)
      .maybeSingle();

    if (!data) {
      // Fallback search by prid & lang
      const res = await supabase
        .from('articles')
        .select('*')
        .eq('prid', String(prid))
        .eq('lang', safeLang)
        .limit(1);
      data = res.data?.[0];
    }

    if (data) {
      return {
        id: data.id,
        prid: data.prid,
        title: data.title,
        description: data.description,
        fullText: data.full_text || (Array.isArray(data.paragraphs) ? data.paragraphs.join('\n\n') : '') || data.description || '',
        category: data.category,
        ministry: data.ministry,
        lang: data.lang,
        link: data.link,
        iframeLink: data.iframe_link,
        pubDate: data.pub_date,
        paragraphs: data.paragraphs || [],
        keyTakeaways: data.key_takeaways || [],
        images: data.images || [],
        source: data.source,
        createdAt: data.created_at,
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching article by id from Supabase:', err.message);
    return null;
  }
}

/**
 * Save full scraped detail (paragraphs, takeaways, images, full text) for an article
 */
export async function saveArticleDetail(prid, lang, detail) {
  if (!isSupabaseConfigured() || !prid || !detail) return false;

  try {
    const safeLang = lang || 'hi';
    const rowId = `${prid}_${safeLang}`;
    const cleanFullText = detail.fullText || (Array.isArray(detail.paragraphs) && detail.paragraphs.length > 0 ? detail.paragraphs.join('\n\n') : '') || '';

    const { error } = await supabase
      .from('articles')
      .upsert(
        {
          id: rowId,
          prid: String(prid),
          title: detail.title,
          description: detail.paragraphs?.[0] || detail.title,
          full_text: cleanFullText,
          category: detail.category || 'governance',
          ministry: detail.ministry || '',
          lang: safeLang,
          link: detail.originalUrl || `https://pib.gov.in/PressReleasePage.aspx?PRID=${prid}`,
          iframe_link: `https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${prid}`,
          paragraphs: detail.paragraphs || [],
          key_takeaways: detail.keyTakeaways || [],
          images: detail.images || [],
          source: 'Press Information Bureau (PIB), GoI',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('⚠️ Supabase saveArticleDetail error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving article detail to Supabase:', err.message);
    return false;
  }
}

/**
 * Get cached Fact-Checking report for an article
 */
export async function getFactReport(articleId, lang = 'hi') {
  if (!isSupabaseConfigured() || !articleId) return null;

  try {
    const { data, error } = await supabase
      .from('fact_reports')
      .select('*')
      .eq('article_id', articleId)
      .eq('lang', lang)
      .single();

    if (error || !data) return null;

    return {
      atomicClaims: data.atomic_claims,
      deterministicFigures: data.deterministic_figures,
      canonicalEntities: data.canonical_entities,
      groundingScore: data.grounding_score,
      fromDbCache: true,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Save Fact-Checking report to Supabase
 */
export async function saveFactReport(articleId, lang, report) {
  if (!isSupabaseConfigured() || !articleId || !report) return false;

  try {
    const { error } = await supabase.from('fact_reports').upsert(
      {
        article_id: articleId,
        lang: lang || 'hi',
        atomic_claims: report.atomicClaims || [],
        deterministic_figures: report.deterministicFigures || [],
        canonical_entities: report.canonicalEntities || [],
        grounding_score: report.groundingScore || 1.0,
      },
      { onConflict: 'article_id,lang' }
    );

    if (error) {
      console.warn('⚠️ Supabase saveFactReport error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving fact report:', err.message);
    return false;
  }
}

/**
 * Get cached AI Storyboard for an article
 */
export async function getStoryboard(articleId, lang = 'hi') {
  if (!isSupabaseConfigured() || !articleId) return null;

  try {
    const { data, error } = await supabase
      .from('storyboards')
      .select('*')
      .eq('article_id', articleId)
      .eq('lang', lang)
      .single();

    if (error || !data) return null;

    return {
      title: data.title,
      category: data.category,
      scenes: data.scenes,
      fromDbCache: true,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Save AI Storyboard to Supabase
 */
export async function saveStoryboard(articleId, lang, storyboard) {
  if (!isSupabaseConfigured() || !articleId || !storyboard) return false;

  try {
    const { error } = await supabase.from('storyboards').upsert(
      {
        article_id: articleId,
        lang: lang || 'hi',
        title: storyboard.title || '',
        category: storyboard.category || 'governance',
        scenes: storyboard.scenes || [],
      },
      { onConflict: 'article_id,lang' }
    );

    if (error) {
      console.warn('⚠️ Supabase saveStoryboard error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving storyboard:', err.message);
    return false;
  }
}

/**
 * Get database statistics for health and admin views
 */
export async function getDatabaseStats() {
  if (!isSupabaseConfigured()) {
    return { status: 'unconfigured', articlesCount: 0 };
  }

  try {
    const { count: articlesCount, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return {
      status: 'connected',
      articlesCount: articlesCount || 0,
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message,
    };
  }
}
