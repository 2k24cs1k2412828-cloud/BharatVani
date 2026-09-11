// 🇮🇳 High-Definition Indian Female Voice Engine
// Delivers 100% authentic, clear, studio-grade female Indian voices across Hindi, English, Tamil, Telugu, and Gujarati

const API_BASE = import.meta.env.VITE_API_URL || '';

let currentAudio = null;
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

// Split text into natural broadcast phrases
export function chunkTextIntoPhrases(text = '', maxLen = 140) {
  if (!text) return [];

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

// Get cloud sound URL via soundoftext for static hosts
async function getCloudAudioUrl(text, lang) {
  const voiceCodeMap = {
    hi: 'hi-IN',
    en: 'en-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    gu: 'gu-IN',
  };
  const voiceCode = voiceCodeMap[lang] || 'hi-IN';

  try {
    const res = await fetch('https://api.soundoftext.com/sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engine: 'Google',
        data: { text: text.slice(0, 150), voice: voiceCode },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.id) {
        // Poll for location
        const locRes = await fetch(`https://api.soundoftext.com/sounds/${data.id}`);
        if (locRes.ok) {
          const locData = await locRes.json();
          if (locData.location) {
            return locData.location;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[VoiceEngine] Cloud TTS service notice:', err.message);
  }
  return null;
}

/**
 * Play authentic, crystal-clear Indian Female Voice
 * Priority: 1. Local/Backend /api/tts -> 2. SoundOfText Cloud MP3 -> 3. Calibrated SpeechSynthesis
 */
export async function speakFemaleVoice({
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

  const chunks = chunkTextIntoPhrases(clean, 140);
  let chunkIndex = 0;
  const totalChunks = chunks.length;

  async function playNextChunk() {
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

    // Priority 1: Backend TTS Endpoint
    let audioUrl = `${API_BASE}/api/tts?lang=${lang}&text=${encodeURIComponent(chunkText)}`;

    // If on static hosting without backend, get cloud MP3
    if (!API_BASE && window.location.hostname !== 'localhost') {
      const cloudUrl = await getCloudAudioUrl(chunkText, lang);
      if (cloudUrl) {
        audioUrl = cloudUrl;
      }
    }

    try {
      const audio = new Audio();
      audio.src = audioUrl;
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

        setTimeout(() => {
          playNextChunk();
        }, 80);
      };

      audio.onerror = async () => {
        console.warn('[VoiceEngine] Backend TTS stream error, attempting cloud fallback...');
        // Try cloud audio once before speech synthesis
        const cloudUrl = await getCloudAudioUrl(chunkText, lang);
        if (cloudUrl && isPlaybackActive) {
          audio.src = cloudUrl;
          audio.play().catch(() => {
            fallbackToWebSpeech(clean, lang, rate, onProgress, onEnd, onError);
          });
        } else {
          fallbackToWebSpeech(clean, lang, rate, onProgress, onEnd, onError);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[VoiceEngine] Playback error or autoplay blocked:', err);
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

// Fallback to Web Speech API with explicit female voice preference
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
