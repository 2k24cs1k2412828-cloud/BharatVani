// Document Parsing, Chunking & Token Extraction Engine

// Number & Numerical Metric Regular Expressions
export const NUMBER_PATTERNS = {
  // Money & Budget Allocations (₹, Rs, Crore, Lakh, Million, Billion)
  money: /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:करोड़|लाख|हजार|crore|cr|lakh|thousand|million|billion|trillion)?|[\d,]+(?:\.\d+)?\s*(?:करोड़|लाख|crore|cr|lakh|million|billion)\s*(?:रुपये|रु|₹|rupees|inr)?/gi,
  
  // Percentages & Rates (%, प्रतिशत)
  percentage: /[\d,]+(?:\.\d+)?\s*(?:%|प्रतिशत|percent|percentage)/gi,
  
  // Quantities & Units (MW, GW, tonnes, hectares, districts, farmers, villages, centres)
  quantity: /[\d,]+(?:\.\d+)?\s*(?:टन|हेक्टेयर|मेगावाट|गीगावाट|जिले|गाँव|किसान|केंद्र|पंप|tonnes|tons|hectares|ha|mw|gw|districts|villages|farmers|centres|units|pumps|beneficiaries|quintal|mt)/gi,
  
  // Dates & Years (e.g. 19 August 2026, 2026-27, FY26)
  date: /\b\d{1,2}\s+(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b|\b\d{4}-\d{2,4}\b|\bFY\s*\d{2,4}\b/gi,
};

// Normalize text for strict deterministic comparison
export function normalizeText(text = '') {
  return text
    .replace(/[*#_~`]/g, '')
    .replace(/[,\s]+/g, ' ')
    .toLowerCase()
    .trim();
}

// Split raw document text into clean structured sentence chunks with offset tracking
export function parseDocumentChunks(rawText = '') {
  if (!rawText) return [];

  // Clean raw HTML or boilerplate
  const clean = rawText
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r?\n+/g, '\n')
    .trim();

  // Split into sentences (Devanagari purna viram '।' and standard periods '.')
  const rawSentences = clean.split(/(?<=[.।!?])\s+/);
  const chunks = [];
  let currentOffset = 0;

  rawSentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (trimmed.length > 10 && !trimmed.startsWith('***') && !trimmed.includes('उपयोग संबंधी शर्तें')) {
      const charStart = currentOffset;
      const charEnd = currentOffset + trimmed.length;

      // Extract raw numerical tokens in this sentence
      const numbersFound = [];

      for (const [type, regex] of Object.entries(NUMBER_PATTERNS)) {
        const matches = trimmed.match(regex);
        if (matches) {
          matches.forEach((m) => {
            numbersFound.push({
              type,
              value: m.trim(),
            });
          });
        }
      }

      chunks.push({
        id: `chunk-${index + 1}`,
        index: index + 1,
        text: trimmed,
        charStart,
        charEnd,
        numbers: numbersFound,
      });

      currentOffset = charEnd + 1;
    }
  });

  return chunks;
}

// Extract all deterministic figures from document chunks
export function extractDeterministicFigures(chunks = []) {
  const figures = [];
  const seen = new Set();

  chunks.forEach((chunk) => {
    chunk.numbers.forEach((num) => {
      const key = `${num.type}_${num.value.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        figures.push({
          id: `fig-${figures.length + 1}`,
          type: num.type,
          value: num.value,
          sourceSentence: chunk.text,
          chunkId: chunk.id,
          verified: true, // Deterministically parsed from source!
        });
      }
    });
  });

  return figures;
}
