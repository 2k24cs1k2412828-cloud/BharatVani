// Natural Indian Female Voice Engine (100% Authentic Google Audio Stream)

let currentAudio = null;
let currentAudioUrl = null;
let audioListeners = new Set();

export function getCurrentAudio() {
  return currentAudio;
}

export function subscribeAudioEvents(callback) {
  audioListeners.add(callback);
  return () => audioListeners.delete(callback);
}

function notifyAudioStarted(audio) {
  audioListeners.forEach((cb) => {
    try { cb(audio); } catch {}
  });
}

// Stop any currently playing audio completely
export function stopAllSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.onended = null;
      currentAudio.onerror = null;
    } catch {}
    currentAudio = null;
    notifyAudioStarted(null);
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Pause current speech
export function pauseSpeech() {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
}

// Resume current speech
export function resumeSpeech() {
  if (currentAudio && currentAudio.paused) {
    currentAudio.play().catch(() => {});
  }
}

// Clean and sanitize text for speech
export function sanitizeSpeechText(text = '') {
  return text
    .replace(/[*#_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Play speech using pure, natural Google Female Voice Audio Stream
export function speakFemaleVoice({
  text,
  lang = 'hi',
  rate = 1,
  onEnd = () => {},
  onError = () => {},
}) {
  stopAllSpeech();

  const clean = sanitizeSpeechText(text);
  if (!clean) return;

  const targetLang = lang === 'en' ? 'en' : 'hi';
  const ttsUrl = `/api/tts?lang=${targetLang}&text=${encodeURIComponent(clean.slice(0, 200))}`;

  try {
    const audio = new Audio(ttsUrl);
    audio.crossOrigin = 'anonymous';
    currentAudio = audio;
    currentAudioUrl = ttsUrl;
    audio.volume = 1.0;
    audio.playbackRate = rate;

    notifyAudioStarted(audio);

    audio.onended = () => {
      currentAudio = null;
      notifyAudioStarted(null);
      onEnd();
    };

    audio.onerror = (err) => {
      console.error('Audio playback error:', err);
      currentAudio = null;
      notifyAudioStarted(null);
      onError(err);
    };

    audio.play().catch((err) => {
      console.warn('Audio autoplay prevented or error:', err);
      onError(err);
    });
  } catch (err) {
    console.error('Failed to initialize Audio:', err);
    onError(err);
  }
}
