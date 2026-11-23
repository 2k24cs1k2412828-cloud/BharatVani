import 'dotenv/config';
import { fetchPibFeed, fetchArticleDetail } from '../server/scraper.js';
import { upsertArticles } from '../server/dbService.js';

async function runSync() {
  console.log('🔄 Starting automated PIB news sync to Supabase (with Full Text archiving)...');
  const languages = ['hi', 'en', 'ta', 'te', 'gu'];
  let totalCount = 0;

  for (const lang of languages) {
    try {
      console.log(`📡 Fetching live PIB RSS/feed for [${lang}]...`);
      const articles = await fetchPibFeed(lang, true);
      console.log(`✅ Received ${articles.length} articles for [${lang}]`);

      // Enrich releases with full body text paragraphs so past news can be used for AI generation
      console.log(`📖 Scraping and embedding full release text for [${lang}]...`);
      for (const a of articles.slice(0, 10)) {
        try {
          const detail = await fetchArticleDetail(a.prid, lang);
          if (detail && Array.isArray(detail.paragraphs) && detail.paragraphs.length > 0) {
            a.paragraphs = detail.paragraphs;
            a.fullText = detail.paragraphs.join('\n\n');
            a.keyTakeaways = detail.keyTakeaways || a.keyTakeaways;
            a.images = detail.images || a.images;
            a.ministry = detail.ministry || a.ministry;
          }
        } catch (detailErr) {
          console.warn(`  ↳ Could not fetch detail for PRID ${a.prid}:`, detailErr.message);
        }
      }

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
