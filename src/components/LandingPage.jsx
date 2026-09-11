import React, { useState } from 'react';
import { 
  Building2, 
  Volume2, 
  Film, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Radio, 
  Globe, 
  LogIn, 
  UserPlus, 
  Sprout, 
  Terminal, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Lock,
  Mail,
  User,
  MapPin,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  GraduationCap,
  Shield
} from 'lucide-react';
import { translations } from '../translations';
import { speakFemaleVoice, stopAllSpeech } from '../utils/voiceEngine';
import { supabase, isSupabaseClientConfigured } from '../utils/supabaseClient';
import { INDIAN_STATES } from '../data/indianLocations';

const CITIZEN_ROLES = [
  { id: 'citizen', label: 'नागरिक / Citizen', icon: Users },
  { id: 'farmer', label: 'किसान / Farmer', icon: Sprout },
  { id: 'student', label: 'छात्र / Student', icon: GraduationCap },
  { id: 'official', label: 'अधिकारी / Official', icon: Shield },
  { id: 'professional', label: 'पेशेवर / Professional', icon: Briefcase },
];

const GREETINGS = {
  hi: 'नमस्ते! भारतवाणी में आपका स्वागत है। प्रेस सूचना ब्यूरो का आधिकारिक मल्टीमॉडल समाचार मंच।',
  en: 'Welcome to BharatVani. Official Press Information Bureau multimodal news intelligence platform.',
  ta: 'வணக்கம்! பாரத்வாணிக்கு உங்களை வரவேற்கிறோம். அதிகாரப்பூர்வ அரசு செய்திகள்.',
  te: 'నమస్కారం! భారత్‌వాణికి స్వాగతం. అధికారిక ప్రభుత్వ వార్తలు.',
  gu: 'નમસ્તે! ભારતવાણીમાં તમારું સ્વાગત છે. સત્તાવાર સરકારી સમાચાર.',
};

export default function LandingPage({
  lang,
  setLang,
  articles = [],
  onExploreNews,
  onOpenAuth,
  onOpenArticle,
  onPlayAudio,
  onWatchVideo,
  onOpenFactSheet,
  currentUser,
  onAuthSuccess,
}) {
  const t = translations[lang] || translations.hi;
  const [playingVoice, setPlayingVoice] = useState(false);
  
  // Embedded Quick Auth Form State
  const [authTab, setAuthTab] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState('citizen');
  const [authState, setAuthState] = useState('Delhi');
  const [authDistrict, setAuthDistrict] = useState('New Delhi');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const featuredArticle = articles[0] || null;
  const currentDistricts = INDIAN_STATES.find((s) => s.state === authState)?.districts || [];

  const handleVoicePreview = () => {
    stopAllSpeech();
    if (playingVoice) {
      setPlayingVoice(false);
      return;
    }

    setPlayingVoice(true);
    const greetingText = GREETINGS[lang] || GREETINGS.hi;
    speakFemaleVoice({
      text: greetingText,
      lang: lang,
      rate: 1.0,
      onEnd: () => setPlayingVoice(false),
      onError: () => setPlayingVoice(false),
    });
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setAuthError('');
    if (!isSupabaseClientConfigured() || !supabase) {
      const mockUser = {
        id: 'google_guest_' + Date.now(),
        email: 'citizen@gov.in',
        user_metadata: {
          full_name: 'Verified Citizen',
          role: 'citizen',
          state: 'Delhi',
          district: 'New Delhi',
        },
      };
      localStorage.setItem('bharatvani_user', JSON.stringify(mockUser));
      if (onAuthSuccess) onAuthSuccess(mockUser);
      onExploreNews();
      return;
    }

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Google Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Submit Handler for Email Auth
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError('कृपया ईमेल और पासवर्ड भरें / Please enter email and password.');
      return;
    }

    if (!isSupabaseClientConfigured() || !supabase) {
      const mockUser = {
        id: 'user_' + Date.now(),
        email: authEmail,
        user_metadata: {
          full_name: authFullName || authEmail.split('@')[0],
          role: authRole,
          state: authState,
          district: authDistrict,
        },
      };
      localStorage.setItem('bharatvani_user', JSON.stringify(mockUser));
      if (onAuthSuccess) onAuthSuccess(mockUser);
      setAuthSuccess('सफलतापूर्वक लॉगिन हुआ! Welcome to BharatVani.');
      setTimeout(() => onExploreNews(), 600);
      return;
    }

    setAuthLoading(true);
    try {
      if (authTab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authFullName,
              role: authRole,
              state: authState,
              district: authDistrict,
            },
          },
        });
        if (error) throw error;
        if (data?.user) {
          setAuthSuccess('खाता सफलतापूर्वक बनाया गया! Welcome to BharatVani.');
          if (onAuthSuccess) onAuthSuccess(data.user);
          setTimeout(() => onExploreNews(), 800);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data?.user) {
          setAuthSuccess('सफलतापूर्वक लॉगिन हुआ! Welcome to BharatVani.');
          if (onAuthSuccess) onAuthSuccess(data.user);
          setTimeout(() => onExploreNews(), 600);
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Official Government Hero Section */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '2.5rem 1.25rem 2rem 1.25rem',
      }}>
        <div className="container">
          
          {/* Top Breaking PIB Ticker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Radio size={12} style={{ animation: 'pulse 1.5s infinite' }} />
              PIB LIVE
            </span>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--gov-navy)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              भारत सरकार • प्रेस सूचना ब्यूरो • आधिकारिक राष्ट्रीय मल्टीमॉडल पोर्टल
            </span>
          </div>

          {/* Main Editorial Headline */}
          <div style={{ maxWidth: '960px', marginBottom: '1.75rem' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: '900',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              margin: '0 0 1rem 0',
            }}>
              {lang === 'hi'
                ? 'भारत की आवाज़, हर नागरिक तक: प्रामाणिक सरकारी समाचार, ऑडियो एवं तथ्य पोर्टल'
                : 'Voice of India, Reaching Every Citizen: Verified Multimodal Government News Intelligence'}
            </h1>

            <p style={{
              fontSize: '1.08rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              margin: 0,
              fontWeight: '400',
              maxWidth: '840px',
            }}>
              {lang === 'hi'
                ? 'प्रेस सूचना ब्यूरो (PIB) द्वारा जारी 147+ दैनिक आधिकारिक विज्ञप्तियों को स्पष्ट भारतीय आवाज़, 3-दृश्य वीडियो बुलेटिन और 100% शून्य-भ्रम (Zero-Hallucination) तथ्य रिपोर्ट में परिवर्तित करने वाला राष्ट्रीय मंच।'
                : 'Transforming 147+ daily official Press Information Bureau releases into authentic Indian female voice broadcasts, 3-scene television reels, and 100% zero-hallucination verified fact sheets.'}
            </p>
          </div>

          {/* Primary Action Buttons & Language Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onExploreNews}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  gap: '0.5rem',
                }}
              >
                <span>{lang === 'hi' ? 'ताज़ा सरकारी समाचार बुलेटिन पढ़ें' : 'Explore Live News Portal'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleVoicePreview}
                className="btn btn-secondary"
                style={{
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  gap: '0.5rem',
                }}
              >
                <Volume2 size={16} color={playingVoice ? '#16a34a' : 'inherit'} />
                <span>
                  {playingVoice 
                    ? (lang === 'hi' ? 'वाचन चल रहा है...' : 'Playing Voice...')
                    : (lang === 'hi' ? '🎙️ लाइव AI आवाज़ सुनें' : '🎙️ Listen Live Indian AI Voice')}
                </span>
              </button>
            </div>

            {/* Quick Language Selector Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-subtle)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <Globe size={14} style={{ margin: '0 4px', color: 'var(--gov-navy)' }} />
              {[
                { code: 'hi', label: 'हिन्दी' },
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'gu', label: 'ગુજરાતી' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: lang === item.code ? '700' : '500',
                    color: lang === item.code ? '#ffffff' : 'var(--text-secondary)',
                    background: lang === item.code ? 'var(--gov-navy)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Editorial & Auth Gateway */}
      <section className="container" style={{ padding: '2.5rem 1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.95fr)',
          gap: '2rem',
          alignItems: 'start',
        }}>
          
          {/* Left Column: Real Live PIB Spotlight & Multimodal Columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Real PIB Spotlight Card */}
            {featuredArticle && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge">{featuredArticle.category}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={13} />
                      <span>{featuredArticle.ministry || 'भारत सरकार'}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--gov-navy)' }}>
                    PRID #{featuredArticle.id?.slice(0, 8) || '2026-PIB'}
                  </span>
                </div>

                <h3
                  onClick={() => onOpenArticle && onOpenArticle(featuredArticle)}
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    lineHeight: 1.35,
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {featuredArticle.title}
                </h3>

                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}>
                  {featuredArticle.description || featuredArticle.summary}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                }}>
                  {onWatchVideo && (
                    <button
                      type="button"
                      onClick={() => onWatchVideo(featuredArticle)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      <Film size={14} color="#b91c1c" />
                      <span>{lang === 'hi' ? '3-दृश्य वीडियो देखें' : 'Watch 3-Scene Video'}</span>
                    </button>
                  )}

                  {onPlayAudio && (
                    <button
                      type="button"
                      onClick={() => onPlayAudio(featuredArticle)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      <Volume2 size={14} color="#0284c7" />
                      <span>{lang === 'hi' ? 'ऑडियो सुनें' : 'Listen Audio'}</span>
                    </button>
                  )}

                  {onOpenFactSheet && (
                    <button
                      type="button"
                      onClick={() => onOpenFactSheet(featuredArticle)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      <ShieldCheck size={14} color="#16a34a" />
                      <span>{lang === 'hi' ? 'सत्यापन रिपोर्ट' : 'Fact Report'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Editorial Broadsheet 3-Pillar Layout */}
            <div>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                letterSpacing: '-0.01em',
              }}>
                {lang === 'hi' ? 'भारतवाणी के प्रमुख स्तंभ एवं तकनीकी विशेषताएं' : 'Core Capabilities & Technical Innovations'}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {/* Pillar 1 */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Volume2 size={18} color="var(--gov-navy)" />
                    <h4 style={{ fontSize: '0.94rem', fontWeight: '800', margin: 0 }}>
                      {lang === 'hi' ? 'प्रामाणिक भारतीय स्वर' : 'Authentic Indian Voice'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {lang === 'hi'
                      ? 'उच्च स्पष्टता वाली भारतीय महिला स्वर, 60fps सटीक शब्द कराओके हाइलाइटिंग और 5 क्षेत्रीय भाषाओं में सहज वाचन।'
                      : 'Crystal-clear Indian female voice synthesis with 60 FPS synchronous karaoke word tracking across Hindi and regional languages.'}
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Film size={18} color="#b91c1c" />
                    <h4 style={{ fontSize: '0.94rem', fontWeight: '800', margin: 0 }}>
                      {lang === 'hi' ? '3-दृश्य टीवी प्रसारण' : '3-Scene Broadcast'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {lang === 'hi'
                      ? 'टीवी समाचार शैली के लोअर-थर्ड ग्राफिक्स, आधिकारिक छायाचित्र एवं स्टूडियो एंकर द्वारा त्वरित 45-सेकंड वीडियो सार।'
                      : 'Television-grade lower-third chyrons, authentic PIB backdrop visuals, and animated presenter delivery in 45-second reels.'}
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <ShieldCheck size={18} color="#16a34a" />
                    <h4 style={{ fontSize: '0.94rem', fontWeight: '800', margin: 0 }}>
                      {lang === 'hi' ? '100% तथ्य सत्यापन' : 'Grounded Fact Graph'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {lang === 'hi'
                      ? 'शून्य-भ्रम गारंटी। हर आंकड़े और दावे का मूल मंत्रालय विज्ञप्ति एवं पीआरआईडी संदर्भ से 1-टू-1 मिलान।'
                      : 'Zero-hallucination guarantee with 100% Ministry source attribution, PRID traceability, and numeric claim verification.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Accessibility Dual Modes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <div style={{
                background: 'var(--gov-green-bg, #f0fdf4)',
                border: '1px solid var(--gov-green-border, #bbf7d0)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <Sprout size={16} />
                  <span>{lang === 'hi' ? 'किसान व सरल पठन शैली' : 'Kisan & Simple Mode'}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5, margin: 0 }}>
                  {lang === 'hi'
                    ? 'बड़े अक्षर, सीधी व सरल भाषा, ऑडियो वाचन एवं कृषि योजनाओं का त्वरित मुख्य विवरण।'
                    : 'Large print, simplified language, one-touch audio read-aloud, and scheme benefits for farmers.'}
                </p>
              </div>

              <div style={{
                background: 'var(--gov-navy-light, #f1f5f9)',
                border: '1px solid var(--gov-navy-border, #cbd5e1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gov-navy)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <Terminal size={16} />
                  <span>{lang === 'hi' ? 'इंजीनियर व प्रो शैली' : 'Engineer & Pro Mode'}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {lang === 'hi'
                    ? 'संपूर्ण मूल विज्ञप्ति, पीआरआईडी संदर्भ, सांख्यिकी विश्लेषण एवं आधिकारिक दस्तावेज।'
                    : 'Complete original press releases, official PRID references, statistics, and embedded PIB documents.'}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Unified Official Citizen Auth Card (Exact Website Theme) */}
          <div style={{
            position: 'sticky',
            top: '5rem',
          }}>
            <div className="gov-auth-card" style={{ maxWidth: '100%', boxShadow: 'var(--shadow-md)' }}>
              
              {/* National Tricolor Ribbon */}
              <div className="tricolor-ribbon">
                <div className="tricolor-saffron" />
                <div className="tricolor-white" />
                <div className="tricolor-green" />
              </div>

              {/* Official Header */}
              <div className="gov-auth-header" style={{ textAlign: 'left', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--gov-navy)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1rem',
                  }}>
                    🇮🇳
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      भारत सरकार • Government of India
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      नागरिक सेवा पोर्टल / Citizen Portal
                    </h3>
                  </div>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="#16a34a" />
                  <span>256-Bit SSL Encrypted • Official Government Access</span>
                </div>
              </div>

              {/* Body */}
              <div className="gov-auth-body">
                
                {/* Tabs */}
                <div className="gov-auth-tabs">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                    className={`gov-auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
                  >
                    <LogIn size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    लॉग इन / Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                    className={`gov-auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                  >
                    <UserPlus size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    पंजीकरण / Register
                  </button>
                </div>

                {/* Google Single Sign-On Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.86rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.32 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.68 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google खाते से जारी रखें / Continue with Google</span>
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '1rem 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                  <span style={{ padding: '0 8px' }}>अथवा ईमेल क्रेडेंशियल / or Email</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                {/* Alerts */}
                {authError && (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '1rem',
                  }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#166534',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '1rem',
                  }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuthSubmit}>
                  {authTab === 'signup' && (
                    <>
                      {/* Name */}
                      <div className="gov-form-group">
                        <label className="gov-form-label">
                          <span>पूरा नाम / Full Name</span>
                          <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div className="gov-input-wrapper">
                          <User size={15} color="var(--text-muted)" />
                          <input
                            type="text"
                            required
                            placeholder="उदा. रमेश कुमार / e.g. Ramesh Kumar"
                            value={authFullName}
                            onChange={(e) => setAuthFullName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Citizen Role Category */}
                      <div className="gov-form-group">
                        <label className="gov-form-label">
                          <span>नागरिक श्रेणी / Citizen Category</span>
                        </label>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {CITIZEN_ROLES.map((role) => {
                            const Icon = role.icon;
                            const isActive = authRole === role.id;
                            return (
                              <button
                                key={role.id}
                                type="button"
                                onClick={() => setAuthRole(role.id)}
                                className={`gov-role-pill-btn ${isActive ? 'active' : ''}`}
                              >
                                <Icon size={12} />
                                <span>{role.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* State & District */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="gov-form-label">
                            <span>राज्य / State</span>
                          </label>
                          <div className="gov-input-wrapper">
                            <MapPin size={14} color="var(--text-muted)" />
                            <select
                              required
                              value={authState}
                              onChange={(e) => {
                                setAuthState(e.target.value);
                                setAuthDistrict('');
                              }}
                            >
                              <option value="">State</option>
                              {INDIAN_STATES.map((s) => (
                                <option key={s.state} value={s.state}>
                                  {s.state}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="gov-form-label">
                            <span>जिला / District</span>
                          </label>
                          <div className="gov-input-wrapper">
                            <Compass size={14} color="var(--text-muted)" />
                            <select
                              required
                              disabled={!authState}
                              value={authDistrict}
                              onChange={(e) => setAuthDistrict(e.target.value)}
                            >
                              <option value="">District</option>
                              {currentDistricts.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="gov-form-group">
                    <label className="gov-form-label">
                      <span>ईमेल / Official or Personal Email</span>
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div className="gov-input-wrapper">
                      <Mail size={15} color="var(--text-muted)" />
                      <input
                        type="email"
                        required
                        placeholder="citizen@gov.in / name@example.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="gov-form-group">
                    <label className="gov-form-label">
                      <span>सुरक्षित पासवर्ड / Secure Password</span>
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div className="gov-input-wrapper">
                      <Lock size={15} color="var(--text-muted)" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      marginTop: '0.5rem',
                    }}
                  >
                    {authLoading ? (
                      <span>प्रमाणीकरण जारी है / Processing...</span>
                    ) : authTab === 'signup' ? (
                      <>
                        <UserPlus size={16} />
                        <span>पंजीकरण पूर्ण करें / Complete Registration</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        <span>सुरक्षित लॉग इन / Secure Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Continue as Guest Button */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={onExploreNews}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    अतिथि के रूप में सीधे समाचार पढ़ें / Continue as Guest
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
