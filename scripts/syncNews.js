import 'dotenv/config';
import { fetchPibFeed } from '../server/scraper.js';
import { upsertArticles } from '../server/dbService.js';

async function runSync() {
  console.log('🔄 Starting automated PIB news sync to Supabase...');
  const languages = ['hi', 'en', 'ta', 'te', 'gu'];
  let totalCount = 0;

  for (const lang of languages) {
    try {
      console.log(`📡 Fetching live PIB RSS/feed for [${lang}]...`);
      const articles = await fetchPibFeed(lang, true);
      console.log(`✅ Received ${articles.length} articles for [${lang}]`);
      
      if (articles.length > 0) {
        const ok = await upsertArticles(articles);
        console.log(`💾 Upserted [${lang}] to Supabase: ${ok ? 'SUCCESS' : 'FAILED'}`);
        totalCount += articles.length;
      }
    } catch (err) {
      console.error(`❌ Error syncing language [${lang}]:`, err.message);
    }
  }

  console.log(`🎉 Sync completed successfully! Total processed: ${totalCount}`);
}

runSync().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
