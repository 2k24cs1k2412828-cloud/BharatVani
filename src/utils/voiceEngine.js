// 🇮🇳 High-Fidelity Indian Voice Engine (Clear Indian Accent Speech Synthesis)
// Specially tuned for natural Hindi, Indian English, Tamil, Telugu, and Gujarati news broadcasting

let currentUtterance = null;
let currentUtteranceQueue = [];
let isSpeakingActive = false;
let isPausedState = false;
let activeListeners = new Set();
let cachedVoices = [];

// Load and cache browser voices with event listener
function loadAvailableVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadAvailableVoices();
  };
}

export function subscribeAudioEvents(callback) {
  activeListeners.add(callback);
  return () => activeListeners.delete(callback);
}

function notifyStateChange(isPlaying) {
  activeListeners.forEach((cb) => {
    try { cb(isPlaying); } catch {}
  });
}

export function getCurrentAudio() {
  return null;
}

// Find the best clear, authentic Indian voice for the target language
export function getBestIndianVoice(lang = 'hi') {
  loadAvailableVoices();
  const voices = cachedVoices;
  if (!voices || voices.length === 0) return null;

  const safeLang = ['hi', 'en', 'ta', 'te', 'gu'].includes(lang) ? lang : 'hi';

  if (safeLang === 'hi') {
    // 1. Prioritize natural Google / Microsoft Hindi female voices
    return (
      voices.find((v) => v.lang === 'hi-IN' && (v.name.includes('Google') || v.name.includes('Swara') || v.name.includes('Kalpana') || v.name.includes('Natural'))) ||
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.startsWith('hi')) ||
      voices.find((v) => v.name.toLowerCase().includes('hindi')) ||
      null
    );
  }

  if (safeLang === 'en') {
    // 2. Prioritize authentic Indian English (en-IN) voices
    return (
      voices.find((v) => (v.lang === 'en-IN' || v.lang === 'en_IN') && (v.name.includes('Neerja') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Heera'))) ||
      voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      voices.find((v) => v.name.toLowerCase().includes('india') && v.lang.startsWith('en')) ||
      voices.find((v) => v.lang === 'en-GB' && v.name.includes('Natural')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null
    );
  }

  if (safeLang === 'ta') {
    return (
      voices.find((v) => v.lang === 'ta-IN' || v.lang.startsWith('ta')) ||
      voices.find((v) => v.name.toLowerCase().includes('tamil')) ||
      null
    );
  }

  if (safeLang === 'te') {
    return (
      voices.find((v) => v.lang === 'te-IN' || v.lang.startsWith('te')) ||
      voices.find((v) => v.name.toLowerCase().includes('telugu')) ||
      null
    );
  }

  if (safeLang === 'gu') {
    return (
      voices.find((v) => v.lang === 'gu-IN' || v.lang.startsWith('gu')) ||
      voices.find((v) => v.name.toLowerCase().includes('gujarati')) ||
      null
    );
  }

  return null;
}

// Clean and prepare text for smooth Indian news broadcast delivery
export function sanitizeSpeechText(text = '') {
  return text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[#*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*%/g, '$1 प्रतिशत')
    .replace(/₹\s*(\d+)/g, '$1 रुपये')
    .trim();
}

// Split text into natural, bite-sized broadcast sentences
export function splitIntoSentences(text = '') {
  if (!text) return [];
  // Split on Devanagari danda '।', period '.', exclamation '!', question '?', or semicolon ';'
  const raw = text.split(/([।\.\!\?\;]+)/);
  const sentences = [];

  for (let i = 0; i < raw.length; i += 2) {
    const sentence = (raw[i] || '').trim();
    const punct = (raw[i + 1] || '').trim();
    const full = `${sentence}${punct ? ' ' + punct : ''}`.trim();
    if (full.length > 3) {
      sentences.push(full);
    }
  }

  return sentences.length > 0 ? sentences : [text];
}

// Stop all speech immediately and clear queues
export function stopAllSpeech() {
  isSpeakingActive = false;
  isPausedState = false;
  currentUtteranceQueue = [];
  currentUtterance = null;

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  notifyStateChange(false);
}

// Pause speech
export function pauseSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    isPausedState = true;
    window.speechSynthesis.pause();
    notifyStateChange(false);
  }
}

// Resume speech
export function resumeSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    isPausedState = false;
    window.speechSynthesis.resume();
    notifyStateChange(true);
  }
}

/**
 * Play clear, natural Indian Female Voice with sentence-by-sentence pacing
 * Eliminates Web Speech API 15-second cutoff bug and delivers crisp Indian pronunciation
 */
export function speakFemaleVoice({
  text,
  lang = 'hi',
  rate = 0.95,
  pitch = 1.02,
  onProgress = () => {},
  onEnd = () => {},
  onError = () => {},
}) {
  stopAllSpeech();

  const clean = sanitizeSpeechText(text);
  if (!clean || typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }

  isSpeakingActive = true;
  isPausedState = false;
  notifyStateChange(true);

  const sentences = splitIntoSentences(clean);
  const selectedVoice = getBestIndianVoice(lang);

  const localeMap = {
    hi: 'hi-IN',
    en: 'en-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    gu: 'gu-IN',
  };
  const targetLangCode = selectedVoice?.lang || localeMap[lang] || 'hi-IN';

  let currentSentenceIndex = 0;
  const totalSentences = sentences.length;

  function speakNextSentence() {
    if (!isSpeakingActive) return;

    if (currentSentenceIndex >= totalSentences) {
      isSpeakingActive = false;
      notifyStateChange(false);
      onProgress(1, 0, 0);
      onEnd();
      return;
    }

    const sentenceText = sentences[currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(sentenceText);
    currentUtterance = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = targetLangCode;
    // Calibrated natural broadcast speed (0.92 - 0.98 is ideal for news comprehension)
    utterance.rate = Math.max(0.85, Math.min(1.15, rate * 0.96));
    utterance.pitch = pitch;

    utterance.onboundary = (event) => {
      if (!isSpeakingActive) return;
      // Calculate overall progress across sentences
      const sentenceProgress = event.charIndex / Math.max(sentenceText.length, 1);
      const overallProgress = Math.min(
        (currentSentenceIndex + sentenceProgress) / totalSentences,
        0.98
      );
      onProgress(overallProgress, event.elapsedTime || 0, 0);
    };

    utterance.onend = () => {
      if (!isSpeakingActive) return;
      currentSentenceIndex++;
      const currentOverall = currentSentenceIndex / totalSentences;
      onProgress(currentOverall, 0, 0);

      // Natural conversational breath pause between sentences
      setTimeout(() => {
        speakNextSentence();
      }, 140);
    };

    utterance.onerror = (e) => {
      // If cancelled intentionally, don't report error
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('[VoiceEngine] Sentence speech warning:', e.error);
      currentSentenceIndex++;
      if (currentSentenceIndex < totalSentences && isSpeakingActive) {
        speakNextSentence();
      } else {
        isSpeakingActive = false;
        notifyStateChange(false);
        onError(e);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[VoiceEngine] speak failed:', err);
      onError(err);
    }
  }

  // Kick off speech
  speakNextSentence();
}
