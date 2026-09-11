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
      currentAudio.ontimeupdate = null;
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
  onProgress = () => {},
  onEnd = () => {},
  onError = () => {},
}) {
  stopAllSpeech();

  const clean = sanitizeSpeechText(text);
  if (!clean) return;

  const safeLang = ['hi', 'en', 'ta', 'te', 'gu'].includes(lang) ? lang : 'hi';
  const ttsUrl = `/api/tts?lang=${safeLang}&text=${encodeURIComponent(clean.slice(0, 200))}`;

  try {
    const audio = new Audio(ttsUrl);
    audio.crossOrigin = 'anonymous';
    currentAudio = audio;
    currentAudioUrl = ttsUrl;
    audio.volume = 1.0;
    audio.playbackRate = rate;

    notifyAudioStarted(audio);

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        onProgress(0, 0, audio.duration);
      }
    };

    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const progress = Math.min(audio.currentTime / audio.duration, 1);
        onProgress(progress, audio.currentTime, audio.duration);
      }
    };

    audio.onended = () => {
      onProgress(1, audio.duration || 1, audio.duration || 1);
      currentAudio = null;
      notifyAudioStarted(null);
      onEnd();
    };

    audio.onerror = (err) => {
      console.warn('Audio stream error, falling back to Web Speech synthesis:', err);
      currentAudio = null;
      notifyAudioStarted(null);

      // Web Speech API fallback with precise boundary support
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(clean);
        const localeMap = {
          hi: 'hi-IN',
          en: 'en-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          gu: 'gu-IN',
        };
        utterance.lang = localeMap[safeLang] || 'hi-IN';
        utterance.rate = rate;

        const words = clean.split(/\s+/);
        let currentWordIndex = 0;

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            currentWordIndex++;
            const p = Math.min(currentWordIndex / Math.max(words.length, 1), 1);
            onProgress(p, event.elapsedTime || 0, 0);
          }
        };

        utterance.onend = () => {
          onProgress(1, 0, 0);
          onEnd();
        };

        utterance.onerror = (sErr) => {
          onError(sErr);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        onError(err);
      }
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

