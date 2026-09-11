import { createClient } from '@supabase/supabase-js';

// Read from env or fallback to project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rpalsmczwimzvwyqqtcc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jhMRpsEBS3QOH--oFnRsRw_SNza2ED2';

export const isSupabaseClientConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-ref')
  );
};

export const supabase = isSupabaseClientConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Directly fetch articles from Supabase table if Node.js Express backend is unavailable
 * @param {string} lang - language filter ('hi', 'en', etc.)
 * @returns {Promise<Array>} list of formatted articles
 */
export async function fetchArticlesDirectlyFromSupabase(lang = 'hi') {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('lang', lang)
      .order('pub_date', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('Direct Supabase fetch warning:', error.message);
      return [];
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        id: item.id || item.prid,
        prid: item.prid || item.id,
        title: item.title,
        description: item.description,
        category: item.category || 'governance',
        ministry: item.ministry || 'Government of India',
        lang: item.lang || lang,
        link: item.link || '',
        iframeLink: item.iframe_link || '',
        pubDate: item.pub_date || new Date().toISOString(),
        paragraphs: item.paragraphs || [],
        keyTakeaways: item.key_takeaways || [],
        images: item.images || [],
        source: item.source || 'Press Information Bureau (PIB)',
      }));
    }
    return [];
  } catch (err) {
    console.warn('Error querying Supabase directly:', err.message);
    return [];
  }
}

/**
 * Subscribe to live PIB press releases published to the Supabase database
 * @param {Function} onNewArticle - Callback when a new article is inserted
 * @param {string} lang - Optional language filter (e.g., 'hi', 'en')
 * @returns {Function} unsubscribe cleanup function
 */
export function subscribeToLiveNews(onNewArticle, lang = 'hi') {
  if (!isSupabaseClientConfigured() || !supabase) {
    return () => {};
  }

  const channel = supabase
    .channel('public:articles')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'articles',
      },
      (payload) => {
        if (payload.new) {
          const formatted = {
            id: payload.new.id,
            prid: payload.new.prid,
            title: payload.new.title,
            description: payload.new.description,
            category: payload.new.category,
            ministry: payload.new.ministry,
            lang: payload.new.lang,
            link: payload.new.link,
            iframeLink: payload.new.iframe_link,
            pubDate: payload.new.pub_date,
            paragraphs: payload.new.paragraphs || [],
            keyTakeaways: payload.new.key_takeaways || [],
            images: payload.new.images || [],
            source: payload.new.source,
            isLiveIncoming: true,
          };

          if (!lang || formatted.lang === lang) {
            onNewArticle(formatted);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
