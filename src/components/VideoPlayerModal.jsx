import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  Smartphone,
  Tv,
  Zap,
  Flame,
  UserCheck
} from 'lucide-react';
import { translations } from '../translations';
import { speakFemaleVoice, stopAllSpeech } from '../utils/voiceEngine';
import NewsAnchor3D from './NewsAnchor3D';
import { generateFallbackStoryboard } from '../data/fallbackNews';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Precise Single-Word Karaoke Subtitles (Clean, Non-Confusing & High-Contrast)
function PreciseWordCaptions({ text, progress, lang, accentColor = '#2563eb' }) {
  const words = useMemo(() => {
    if (!text) return [];
    return text.trim().split(/\s+/).filter(Boolean);
  }, [text]);

  const activeWordIdx = Math.min(
    Math.floor(progress * words.length),
    Math.max(0, words.length - 1)
  );

  return (
    <div style={{
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '0.85rem 1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.68rem',
        color: '#16a34a',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <Volume2 size={13} />
        <span>{lang === 'hi' ? '🔴 लाइव AI समाचार वाचन (हिंदी)' : '🔴 LIVE AI VOICE CAPTIONS'}</span>
      </div>

      <p style={{
        fontSize: '1.05rem',
        lineHeight: 1.6,
        color: '#0f172a',
        margin: 0,
        fontFamily: lang === 'hi' ? 'var(--font-hindi)' : 'var(--font-sans)',
        wordBreak: 'break-word',
      }}>
        {words.map((word, idx) => {
          const isActive = idx === activeWordIdx;
          const isPassed = idx < activeWordIdx;

          if (isActive) {
            return (
              <span
                key={idx}
                style={{
                  background: '#fef08a', // High-contrast soft lemon yellow highlight
                  color: '#0f172a',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'inline-block',
                  margin: '0 2px',
                  transition: 'background 0.15s ease',
                }}
              >
                {word}{' '}
              </span>
            );
          }

          return (
            <span
              key={idx}
              style={{
                color: isPassed ? '#0f172a' : '#64748b',
                fontWeight: isPassed ? '600' : '400',
                margin: '0 1px',
                transition: 'color 0.15s ease',
              }}
            >
              {word}{' '}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default function VideoPlayerModal({
  article,
  onClose,
  lang,
}) {
  if (!article) return null;

  const t = translations[lang] || {};
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [viewFormat, setViewFormat] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'reel' : 'split')); // 'split' (Studio) or 'reel' (Reel layout)
  const [speechProgress, setSpeechProgress] = useState(0);

  const progressIntervalRef = useRef(null);

  // Fetch or generate AI storyboard
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    axios.post(`${API_BASE}/api/ai/storyboard`, {
      article,
      lang: lang === 'en' ? 'en' : 'hi',
    }, { timeout: 5000 })
      .then((res) => {
        if (isMounted && res.data.success && res.data.data) {
          setStoryboard(res.data.data);
          setCurrentSceneIndex(0);
          setIsPlaying(true);
        } else if (isMounted) {
          const fb = generateFallbackStoryboard(article, lang);
          setStoryboard(fb);
          setCurrentSceneIndex(0);
          setIsPlaying(true);
        }
      })
      .catch((err) => {
        console.warn('Backend AI storyboard unavailable, using client storyboard generator:', err.message);
        if (isMounted) {
          const fb = generateFallbackStoryboard(article, lang);
          setStoryboard(fb);
          setCurrentSceneIndex(0);
          setIsPlaying(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      stopAllSpeech();
    };
  }, [article, lang]);

  const scenes = storyboard?.scenes || [];
  const activeScene = scenes[currentSceneIndex];

  // Play audio speech synthesis with time-synchronized progress
  useEffect(() => {
    if (!activeScene || loading) return;

    stopAllSpeech();
    setSpeechProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!isPlaying || isMuted) return;

    const textToSpeak = `${activeScene.headline}. ${activeScene.narration}`;

    // Estimated duration for smooth progress interpolation
    const wordCount = textToSpeak.split(/\s+/).length;
    const estSeconds = Math.max((wordCount / (2.6 * voiceRate)), 3.5);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const calcProgress = Math.min(elapsed / estSeconds, 0.95);
      setSpeechProgress((prev) => Math.max(prev, calcProgress));
    }, 80);

    speakFemaleVoice({
      text: textToSpeak,
      lang: lang === 'en' ? 'en' : 'hi',
      rate: voiceRate,
      onProgress: (prog) => {
        setSpeechProgress(prog);
      },
      onEnd: () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setSpeechProgress(1);

        if (autoAdvance) {
          if (currentSceneIndex < scenes.length - 1) {
            setTimeout(() => {
              setCurrentSceneIndex((prev) => prev + 1);
            }, 600);
          } else {
            setIsPlaying(false);
          }
        }
      },
      onError: () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setIsPlaying(false);
      },
    });

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      stopAllSpeech();
    };
  }, [currentSceneIndex, isPlaying, isMuted, voiceRate, loading, autoAdvance, lang, scenes.length]);

  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      stopAllSpeech();
      setCurrentSceneIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      stopAllSpeech();
      setCurrentSceneIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    stopAllSpeech();
    setCurrentSceneIndex(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAllSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => { stopAllSpeech(); onClose(); }}
      style={{
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Main Clean White Container */}
      <div
        className="video-cinema-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: viewFormat === 'reel' ? '540px' : '1180px',
          maxHeight: '94vh',
          height: 'auto',
          background: '#ffffff',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* National Tricolor Top Ribbon */}
        <div style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(90deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)',
          flexShrink: 0,
        }} />

        {/* Top Header Bar (Clean White Theme) */}
        <div style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}>
          {/* Identity & Ministry Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#b91c1c',
              color: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              <span className="live-pulse" style={{ backgroundColor: '#ffffff', width: '6px', height: '6px' }}></span>
              <span>BHARATVANI LIVE</span>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: '700',
            }}>
              <ShieldCheck size={16} color="#16a34a" />
              <span style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {article.ministry || (lang === 'hi' ? 'भारत सरकार • आधिकारिक विज्ञप्ति' : 'Government of India • Official')}
              </span>
            </div>
          </div>

          {/* Right Controls: Format Switcher & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* View Mode Toggle: Cinema Studio vs Reel */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              border: '1px solid #e2e8f0',
            }}>
              <button
                onClick={() => setViewFormat('split')}
                title="Studio Broadcast View"
                style={{
                  background: viewFormat === 'split' ? '#0f172a' : 'transparent',
                  color: viewFormat === 'split' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                }}
              >
                <Tv size={13} />
                <span className="hide-mobile">{lang === 'hi' ? 'स्टूडियो' : 'Studio'}</span>
              </button>

              <button
                onClick={() => setViewFormat('reel')}
                title="Instagram Reel View"
                style={{
                  background: viewFormat === 'reel' ? '#b91c1c' : 'transparent',
                  color: viewFormat === 'reel' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={13} />
                <span>{lang === 'hi' ? 'रील्स (Reel)' : 'Reel'}</span>
              </button>
            </div>

            <button
              onClick={() => { stopAllSpeech(); onClose(); }}
              className="btn btn-secondary"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <X size={14} />
              <span>{t.close || 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Scene Segment Progress Timeline */}
        {scenes.length > 0 && (
          <div style={{
            padding: '0.35rem 1.25rem 0 1.25rem',
            display: 'flex',
            gap: '0.35rem',
            background: '#ffffff',
            flexShrink: 0,
          }}>
            {scenes.map((s, idx) => {
              const isCurrent = idx === currentSceneIndex;
              const isDone = idx < currentSceneIndex;
              let fillWidth = '0%';
              if (isDone) fillWidth = '100%';
              else if (isCurrent) fillWidth = `${speechProgress * 100}%`;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    stopAllSpeech();
                    setCurrentSceneIndex(idx);
                    setIsPlaying(true);
                  }}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: '#e2e8f0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: fillWidth,
                      background: '#0f172a',
                      transition: isCurrent ? 'width 0.1s linear' : 'width 0.3s ease',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Central Stage: Left Explainer Video & Right 3D Anchor */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: viewFormat === 'reel' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          alignItems: 'stretch',
          overflowY: 'auto',
          background: '#f8fafc',
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
              <div className="live-pulse" style={{ width: '16px', height: '16px', backgroundColor: '#0f172a', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: '#0f172a' }}>
                {t.generatingVideo || 'Generating AI Video Storyboard...'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                {lang === 'hi' ? 'दृश्य एवं सटीक समाचार सामग्री तैयार की जा रही है...' : 'Synthesizing scene visuals and official bullet points...'}
              </p>
            </div>
          ) : activeScene ? (
            <>
              {/* LEFT COLUMN: Clean White TV Explainer Video Stage */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              }}>
                {/* 1. TOP HEADER: Scene Counter & Headline */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {lang === 'hi' ? `दृश्य ${currentSceneIndex + 1}/${scenes.length}` : `SCENE ${currentSceneIndex + 1}/${scenes.length}`}
                    </div>

                    <h2 style={{
                      fontSize: '0.98rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {activeScene.headline}
                    </h2>
                  </div>

                  {/* Frequency Equalizer */}
                  {isPlaying && (
                    <div style={{
                      background: '#e2e8f0',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2.5px',
                      height: '18px',
                      flexShrink: 0,
                    }}>
                      <span className="eq-bar eq-1" style={{ backgroundColor: '#0f172a' }}></span>
                      <span className="eq-bar eq-2" style={{ backgroundColor: '#0f172a' }}></span>
                      <span className="eq-bar eq-3" style={{ backgroundColor: '#0f172a' }}></span>
                      <span className="eq-bar eq-4" style={{ backgroundColor: '#0f172a' }}></span>
                    </div>
                  )}
                </div>

                {/* 2. MIDDLE VIDEO / B-ROLL DISPLAY: Exact Context Image for This Scene */}
                <div style={{
                  position: 'relative',
                  flex: 1,
                  minHeight: viewFormat === 'reel' ? '300px' : '220px',
                  background: '#0f172a',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div
                    key={activeScene.sceneIndex + activeScene.visualImage}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${activeScene.visualImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      animation: 'kenburns 14s infinite alternate ease-in-out',
                    }}
                  />

                  {/* Subtle contextual sticker badge on the image */}
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.85rem',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    <Sparkles size={12} color="#facc15" />
                    <span>{activeScene.badge || (lang === 'hi' ? 'सटीक दृश्य' : 'VISUAL')}</span>
                  </div>

                  {/* PiP Anchor for Reel Format (Prominently visible on mobile with live lip-sync) */}
                  {viewFormat === 'reel' && (
                    <div style={{
                      position: 'absolute',
                      right: '0.75rem',
                      bottom: '0.75rem',
                      width: '105px',
                      height: '105px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #ffffff',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                      zIndex: 25,
                      background: '#f8fafc',
                    }}>
                      <NewsAnchor3D isPlaying={isPlaying && !isMuted} lang={lang} isPiP={true} />
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.04em',
                        pointerEvents: 'none',
                      }}>
                        AI ANCHOR
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Key Takeaways Ribbon */}
                <div style={{
                  padding: '0.55rem 0.85rem',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginRight: '0.2rem' }}>
                    {lang === 'hi' ? 'मुख्य बिंदु:' : 'Key Facts:'}
                  </div>

                  {activeScene.keyPoints?.map((kp, kIdx) => (
                    <div
                      key={kIdx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <CheckCircle2 size={13} color="#16a34a" />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>

                {/* 4. PRECISE SINGLE-WORD SUBTITLES */}
                <PreciseWordCaptions
                  text={activeScene.narration}
                  progress={speechProgress}
                  lang={lang}
                  accentColor={activeScene.accentColor}
                />
              </div>

              {/* RIGHT COLUMN: 3D AI News Presenter Lady (Matching Clean Light Studio) */}
              {viewFormat === 'split' && (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: '380px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.85rem',
                    zIndex: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <UserCheck size={14} color="#0f172a" />
                    <span>{lang === 'hi' ? '3D AI एंकर वाचन' : '3D AI Presenter'}</span>
                  </div>

                  <NewsAnchor3D
                    isPlaying={isPlaying && !isMuted}
                    lang={lang}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Bottom Master Playback Toolbar (Clean White Theme) */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem',
          flexShrink: 0,
        }}>
          {/* Left Audio & Speed Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              onClick={() => {
                if (!isMuted) stopAllSpeech();
                setIsMuted(!isMuted);
              }}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
              }}
              title="Mute/Unmute"
            >
              {isMuted ? <VolumeX size={15} color="#ef4444" /> : <Volume2 size={15} color="#16a34a" />}
            </button>

            {/* Voice Speed */}
            <button
              onClick={() => {
                const next = voiceRate === 1 ? 1.2 : (voiceRate === 1.2 ? 0.85 : 1);
                setVoiceRate(next);
              }}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: '700',
              }}
              title="Voice Speed"
            >
              <span>{voiceRate === 0.85 ? (lang === 'hi' ? '🌾 0.85x (सरल)' : '🌾 0.85x') : `${voiceRate}x`}</span>
            </button>

            {/* Auto Play */}
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className="btn btn-secondary"
              style={{
                background: autoAdvance ? '#f0fdf4' : '#ffffff',
                borderColor: autoAdvance ? '#86efac' : '#cbd5e1',
                color: autoAdvance ? '#15803d' : '#475569',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: '700',
              }}
            >
              <span>{t.autoPlay || 'Auto'}: {autoAdvance ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Center Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrev}
              disabled={currentSceneIndex === 0}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                opacity: currentSceneIndex === 0 ? 0.35 : 1,
              }}
            >
              <ChevronLeft size={15} />
              <span>{t.prevScene || 'Prev'}</span>
            </button>

            <button
              onClick={togglePlayPause}
              className="btn btn-primary"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentSceneIndex === scenes.length - 1}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                opacity: currentSceneIndex === scenes.length - 1 ? 0.35 : 1,
              }}
            >
              <span>{t.nextScene || 'Next'}</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Right: Replay */}
          <div>
            <button
              onClick={handleReplay}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RotateCcw size={13} />
              <span>{t.replay || 'Replay'}</span>
            </button>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes kenburns {
            0% { transform: scale(1.02); }
            100% { transform: scale(1.08) translate(-1%, -1%); }
          }
          .eq-bar {
            width: 2.5px;
            border-radius: 2px;
            animation: bounce-eq 0.8s ease-in-out infinite alternate;
          }
          .eq-1 { height: 4px; animation-delay: 0.1s; }
          .eq-2 { height: 11px; animation-delay: 0.3s; }
          .eq-3 { height: 7px; animation-delay: 0.2s; }
          .eq-4 { height: 13px; animation-delay: 0.4s; }

          @keyframes bounce-eq {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
}


