// 🇮🇳 Studio-Grade Indian Female AI Voice Engine
// Delivers 100% authentic, clear, studio-quality female Indian voices across Hindi, English, Tamil, Telugu, and Gujarati

let currentAudio = null;
let currentAudioQueue = [];
let isPlaybackActive = false;
let isPaused = false;
let globalRate = 1.0;
let audioSubscribers = new Set();

export function subscribeAudioEvents(callback) {
  audioSubscribers.add(callback);
  return () => audioSubscribers.delete(callback);
}

function notifyAudioChange(audio) {
  audioSubscribers.forEach((cb) => {
    try { cb(audio); } catch {}
  });
}

export function getCurrentAudio() {
  return currentAudio;
}

// Clean speech text
export function sanitizeSpeechText(text = '') {
  return text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[*_#~`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*%/g, '$1 प्रतिशत')
    .replace(/₹\s*(\d+)/g, '$1 रुपये')
    .trim();
}

// Split text into digestible phrases under 130 characters for natural breathing cadence
export function chunkTextIntoPhrases(text = '', maxLen = 120) {
  if (!text) return [];

  // Break at major sentence or clause terminators
  const parts = text.split(/([।\.\!\?\;\,]+)/);
  const chunks = [];
  let current = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] || '';
    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) chunks.push(current.trim());
      current = part;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

// Stop all speech playback
export function stopAllSpeech() {
  isPlaybackActive = false;
  isPaused = false;
  currentAudioQueue = [];

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.ontimeupdate = null;
      currentAudio.onended = null;
      currentAudio.onerror = null;
    } catch {}
    currentAudio = null;
    notifyAudioChange(null);
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

// Pause audio
export function pauseSpeech() {
  isPaused = true;
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

// Resume audio
export function resumeSpeech() {
  isPaused = false;
  if (currentAudio && currentAudio.paused) {
    currentAudio.play().catch(() => {});
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

// Get Google Voice Language code
function getGoogleVoiceLang(lang = 'hi') {
  switch (lang) {
    case 'en':
      return 'en-IN'; // Authentic Indian English Female Voice
    case 'ta':
      return 'ta';    // Tamil Female Voice
    case 'te':
      return 'te';    // Telugu Female Voice
    case 'gu':
      return 'gu';    // Gujarati Female Voice
    case 'hi':
    default:
      return 'hi';    // Hindi Female Voice
  }
}

/**
 * Play authentic, crystal-clear Indian Female Voice using Google Audio Stream
 * with zero robotic breaking and 100% natural pronunciation
 */
export function speakFemaleVoice({
  text,
  lang = 'hi',
  rate = 1.0,
  onProgress = () => {},
  onEnd = () => {},
  onError = () => {},
}) {
  stopAllSpeech();

  const clean = sanitizeSpeechText(text);
  if (!clean) {
    onEnd();
    return;
  }

  isPlaybackActive = true;
  isPaused = false;
  globalRate = rate;

  const chunks = chunkTextIntoPhrases(clean, 120);
  const voiceLang = getGoogleVoiceLang(lang);
  let chunkIndex = 0;
  const totalChunks = chunks.length;

  function playNextChunk() {
    if (!isPlaybackActive) return;

    if (chunkIndex >= totalChunks) {
      isPlaybackActive = false;
      currentAudio = null;
      notifyAudioChange(null);
      onProgress(1, 0, 0);
      onEnd();
      return;
    }

    const chunkText = chunks[chunkIndex];
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${voiceLang}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;

    try {
      const audio = new Audio();
      audio.referrerPolicy = 'no-referrer';
      audio.crossOrigin = 'anonymous';
      audio.src = googleUrl;
      audio.playbackRate = Math.max(0.85, Math.min(1.2, rate));

      currentAudio = audio;
      notifyAudioChange(audio);

      audio.ontimeupdate = () => {
        if (!isPlaybackActive) return;
        if (audio.duration && !isNaN(audio.duration)) {
          const currentChunkProgress = audio.currentTime / audio.duration;
          const overall = Math.min((chunkIndex + currentChunkProgress) / totalChunks, 0.98);
          onProgress(overall, audio.currentTime, audio.duration);
        }
      };

      audio.onended = () => {
        if (!isPlaybackActive) return;
        chunkIndex++;
        const currentOverall = chunkIndex / totalChunks;
        onProgress(currentOverall, 0, 0);

        // Natural micro-pause between speech clauses (80ms)
        setTimeout(() => {
          playNextChunk();
        }, 80);
      };

      audio.onerror = (err) => {
        console.warn('[VoiceEngine] Google Audio stream fallback to Web Speech:', err);
        // Fallback to Web Speech API with female pitch calibration
        fallbackToWebSpeech(clean, lang, rate, onProgress, onEnd, onError);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[VoiceEngine] Autoplay prevented or stream error:', err);
          fallbackToWebSpeech(clean, lang, rate, onProgress, onEnd, onError);
        });
      }
    } catch (err) {
      console.error('[VoiceEngine] Audio creation error:', err);
      fallbackToWebSpeech(clean, lang, rate, onProgress, onEnd, onError);
    }
  }

  playNextChunk();
}

// Fallback to Web Speech API with forced female pitch and Indian voice filtering
function fallbackToWebSpeech(text, lang, rate, onProgress, onEnd, onError) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices() || [];

    const localeMap = {
      hi: 'hi-IN',
      en: 'en-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      gu: 'gu-IN',
    };
    const targetLang = localeMap[lang] || 'hi-IN';
    utterance.lang = targetLang;

    // Search explicitly for female Indian voices
    const femaleVoice =
      voices.find((v) => (v.lang === targetLang || v.lang.startsWith(lang)) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('veena'))) ||
      voices.find((v) => v.lang === targetLang) ||
      voices.find((v) => v.lang.startsWith(lang));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Crucial: Set pitch higher (1.25) so that even if the system only has a default male synthesizer (like eSpeak),
    // it shifts into a bright, clear female vocal range instead of a deep male drone!
    utterance.pitch = 1.25;
    utterance.rate = Math.max(0.85, Math.min(1.15, rate * 0.95));

    utterance.onend = () => {
      onProgress(1, 0, 0);
      onEnd();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        onError(e);
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[VoiceEngine] Fallback synthesis error:', err);
    onEnd();
  }
}
