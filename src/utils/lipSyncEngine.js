// Real-time Audio Lip-Sync & Viseme Analyser Engine

let audioCtx = null;
let analyser = null;
let currentSourceNode = null;
let currentAudioElement = null;
let frequencyData = null;

let smoothedJawOpen = 0;
let smoothedMouthWidth = 0;

export function initAudioAnalyser(audioElement) {
  if (!audioElement) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    if (currentAudioElement !== audioElement) {
      currentAudioElement = audioElement;

      if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
      }

      // Connect media element source node
      try {
        if (!audioElement._sourceConnected) {
          const source = audioCtx.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          audioElement._sourceConnected = true;
          currentSourceNode = source;
        }
      } catch (e) {
        // Fallback for CORS or reconnect issues
      }
    }
  } catch (err) {
    console.warn('[LipSync] Web Audio init error:', err);
  }
}

// Get real-time lip-sync weights
export function getLipSyncWeights(isPlaying = false) {
  if (!isPlaying) {
    smoothedJawOpen = smoothedJawOpen * 0.7;
    smoothedMouthWidth = smoothedMouthWidth * 0.7;
    return {
      jawOpen: Math.max(0, smoothedJawOpen),
      viseme_aa: Math.max(0, smoothedJawOpen * 1.1),
      viseme_O: Math.max(0, smoothedJawOpen * 0.75),
      mouthSmile: 0.15,
      isSpeaking: false,
      volume: 0,
    };
  }

  let rawVolume = 0;

  if (analyser && frequencyData) {
    analyser.getByteFrequencyData(frequencyData);

    // Sum voice formant frequency bins (approx. 250Hz - 2500Hz)
    let sum = 0;
    const startBin = 2;
    const endBin = Math.min(24, frequencyData.length);

    for (let i = startBin; i < endBin; i++) {
      sum += frequencyData[i];
    }
    rawVolume = sum / ((endBin - startBin) * 255);
  }

  // Natural speech envelope fallback if analyser is 0 or Web Audio restricted
  if (rawVolume < 0.02 && isPlaying) {
    const time = Date.now() / 120;
    const syllabicRhythm = Math.sin(time * 2.5) * 0.5 + Math.sin(time * 4.2) * 0.3 + 0.5;
    rawVolume = Math.max(0.1, Math.min(0.85, syllabicRhythm * 0.65));
  }

  // Smooth lerp for realistic human jaw inertia
  const targetJaw = Math.min(1.0, rawVolume * 1.35);
  smoothedJawOpen = smoothedJawOpen + (targetJaw - smoothedJawOpen) * 0.35;
  smoothedMouthWidth = smoothedMouthWidth + (rawVolume * 0.5 - smoothedMouthWidth) * 0.3;

  return {
    jawOpen: parseFloat(smoothedJawOpen.toFixed(3)),
    viseme_aa: parseFloat(Math.min(1.0, smoothedJawOpen * 1.15).toFixed(3)),
    viseme_O: parseFloat(Math.min(1.0, smoothedJawOpen * 0.8).toFixed(3)),
    mouthSmile: 0.2 + smoothedMouthWidth * 0.2,
    isSpeaking: isPlaying && smoothedJawOpen > 0.08,
    volume: parseFloat(rawVolume.toFixed(3)),
  };
}
