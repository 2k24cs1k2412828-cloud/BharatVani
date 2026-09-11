import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  Globe, 
  LogIn, 
  Video, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Users,
  Sprout,
  Terminal,
  X
} from 'lucide-react';
import { speakFemaleVoice, stopAllSpeech } from '../utils/voiceEngine';

const LANDING_LANGUAGES = [
  {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    greeting: 'नमस्ते! भारतवाणी में आपका स्वागत है। भारत सरकार की सभी प्रामाणिक खबरें अब एक ही स्थान पर।',
    flag: '🇮🇳',
  },
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    greeting: 'Welcome to BharatVani. Transforming official government releases into verified multimodal news.',
    flag: '🌐',
  },
  {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    greeting: 'வணக்கம்! பாரத்வாணிக்கு உங்களை வரவேற்கிறோம். அதிகாரப்பூர்வ அரசு செய்திகள்.',
    flag: '🏛️',
  },
  {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    greeting: 'నమస్కారం! భారత్‌వాణికి స్వాగతం. అధికారిక ప్రభుత్వ వార్తలు.',
    flag: '🌾',
  },
  {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    greeting: 'નમસ્તે! ભારતવાણીમાં તમારું સ્વાગત છે. સત્તાવાર સરકારી સમાચાર.',
    flag: '⚡',
  },
];

export default function SplashScreen({ 
  onComplete, 
  onOpenAuth, 
  currentLang = 'hi', 
  onSelectLanguage = () => {},
  onClose
}) {
  const [selectedLang, setSelectedLang] = useState(currentLang || 'hi');
  const [playingVoice, setPlayingVoice] = useState(null);

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    onSelectLanguage(code);
  };

  const playVoicePreview = (langItem, e) => {
    if (e) e.stopPropagation();
    stopAllSpeech();

    if (playingVoice === langItem.code) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(langItem.code);
    speakFemaleVoice({
      text: langItem.greeting,
      lang: langItem.code,
      rate: 1.0,
      onEnd: () => setPlayingVoice(null),
      onError: () => setPlayingVoice(null),
    });
  };

  const handleEnter = () => {
    stopAllSpeech();
    onComplete();
  };

  const handleAuth = () => {
    stopAllSpeech();
    if (onOpenAuth) onOpenAuth();
    else onComplete();
  };

  return (
    <div className="gov-landing-overlay">
      <div className="gov-landing-card">
        {/* National Tricolor Top Ribbon */}
        <div className="tricolor-ribbon">
          <div className="tricolor-saffron" />
          <div className="tricolor-white" />
          <div className="tricolor-green" />
        </div>

        {/* Top Official Masthead */}
        <div className="gov-landing-header">
          {onClose && (
            <button
              onClick={() => { stopAllSpeech(); onClose(); }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {/* Government Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#002b66',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                fontWeight: '900',
                boxShadow: '0 2px 5px rgba(0, 43, 102, 0.25)',
              }}>
                🇮🇳
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  भारत सरकार • Government of India
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#002b66' }}>
                  प्रेस सूचना ब्यूरो • Press Information Bureau (PIB)
                </div>
              </div>
            </div>

            {/* Live Indicator Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#b91c1c',
              letterSpacing: '0.02em',
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#dc2626',
                boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.25)',
                display: 'inline-block',
                animation: 'pulse 1.8s infinite',
              }} />
              <span>लाइव PIB सत्यापन इंजन • Real-time AI Intelligence</span>
            </div>
          </div>

          {/* Portal Title & Subtitle */}
          <div style={{ marginTop: '0.5rem' }}>
            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 0.35rem 0',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}>
              <span>BharatVani</span>
              <span style={{ color: '#ff9933' }}>•</span>
              <span style={{ color: '#002b66', fontWeight: '800' }}>भारतवाणी</span>
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#475569',
              margin: 0,
              lineHeight: 1.5,
              fontWeight: '500',
            }}>
              "भारत की आवाज़, हर नागरिक तक" — Transforming official government press releases into authentic Indian voice broadcasts, visual video reels, and verified fact graphs.
            </p>
          </div>
        </div>

        {/* Middle Body */}
        <div className="gov-landing-body">
          {/* Quick Language Selector with Audio Preview */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.15rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.65rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: '700', color: '#002b66' }}>
                <Globe size={14} />
                <span>अपनी पसंदीदा भाषा चुनें / Choose Your Language:</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                (क्लिक करके लाइव AI आवाज़ सुनें / Click speaker to preview voice)
              </div>
            </div>

            <div className="gov-lang-picker">
              {LANDING_LANGUAGES.map((item) => {
                const isSelected = selectedLang === item.code;
                const isPlaying = playingVoice === item.code;

                return (
                  <div
                    key={item.code}
                    onClick={() => handleLanguageChange(item.code)}
                    className={`gov-lang-chip ${isSelected ? 'active' : ''}`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.name}</span>
                    <button
                      type="button"
                      onClick={(e) => playVoicePreview(item, e)}
                      style={{
                        background: isPlaying ? '#ff9933' : 'rgba(0,0,0,0.06)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isPlaying ? '#ffffff' : (isSelected ? '#ffffff' : '#475569'),
                        marginLeft: '3px',
                      }}
                      title={`Listen to ${item.name} AI Voice`}
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Multimodal Pillars (Matching Website Theme) */}
          <div className="gov-landing-feature-grid">
            {/* Feature 1: Indian AI Voice */}
            <div className="gov-landing-feature-card">
              <div className="gov-landing-feature-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Volume2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  🎙️ लाइव AI समाचार वाचक (Live Indian Voice)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Studio-grade authentic Indian female voice with 60 FPS real-time synchronized karaoke subtitles across Hindi and Indian regional languages.
                </p>
              </div>
            </div>

            {/* Feature 2: 3-Scene Video Stories & Reels */}
            <div className="gov-landing-feature-card">
              <div className="gov-landing-feature-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Video size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  🎬 AI वीडियो एवं रील्स (3-Scene Video & Reels)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Dynamic TV broadcast graphics, lower-third chyrons, Ken-Burns visual backdrops, and interactive presentation mode.
                </p>
              </div>
            </div>

            {/* Feature 3: Grounded Fact Verification */}
            <div className="gov-landing-feature-card">
              <div className="gov-landing-feature-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  🛡️ 100% सत्यापित PIB फैक्ट ग्राफ (Fact Graph)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Zero-hallucination guarantee. Direct Ministry source attribution, PRID release code verification, and numeric fact matching.
                </p>
              </div>
            </div>

            {/* Feature 4: Kisan & Pro Dual Modes */}
            <div className="gov-landing-feature-card">
              <div className="gov-landing-feature-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  🌾 किसान व 💻 प्रो शैली (Kisan & Pro Modes)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Tailored accessibility: Large print audio bulletins for farmers and citizens, alongside deep technical analysis for researchers.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            textAlign: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#002b66' }}>147+</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>दैनिक PIB विज्ञप्तियां</div>
            </div>
            <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#16a34a' }}>100%</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>मंत्रालय स्रोत सत्यापन</div>
            </div>
            <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ff9933' }}>5 भाषाई</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>AI आवाज़ व समाचार</div>
            </div>
            <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0284c7' }}>0.3s</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>शून्य लेटेंसी प्लेबैक</div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Hub */}
        <div className="gov-landing-footer">
          {/* SIH Note */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#ff9933' }}>🇮🇳</span>
            <span>Smart India Hackathon • Accessible Government Communication</span>
          </div>

          {/* Buttons: Enter Portal + Login/Signup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Login / Signup Button */}
            <button
              type="button"
              onClick={handleAuth}
              style={{
                padding: '0.7rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#002b66',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#002b66';
                e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <LogIn size={15} />
              <span>लॉग इन / साइन अप (Login / Register)</span>
            </button>

            {/* Enter Portal Button */}
            <button
              type="button"
              onClick={handleEnter}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #002b66 0%, #001838 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 43, 102, 0.25)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 43, 102, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 43, 102, 0.25)';
              }}
            >
              <span>पोर्टल में प्रवेश करें / Enter Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
