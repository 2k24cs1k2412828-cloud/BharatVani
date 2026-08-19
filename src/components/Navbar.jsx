import React from 'react';
import { 
  Globe, 
  RotateCw, 
  Sun, 
  Moon, 
  Sprout, 
  ZoomIn, 
  Bookmark,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { translations } from '../translations';

export default function Navbar({
  lang,
  setLang,
  theme,
  setTheme,
  mode,
  setMode,
  fontScale,
  setFontScale,
  onRefresh,
  isRefreshing,
  bookmarkCount,
  activeCategory,
  setActiveCategory,
}) {
  const t = translations[lang];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('warm');
    else setTheme('light');
  };

  const cycleFont = () => {
    if (fontScale === 1) setFontScale(1.15);
    else if (fontScale === 1.15) setFontScale(1.25);
    else setFontScale(1);
  };

  return (
    <header className="header-masthead">
      {/* Top National Ribbon */}
      <div className="tricolor-ribbon">
        <div className="tricolor-saffron" />
        <div className="tricolor-white" />
        <div className="tricolor-green" />
      </div>

      {/* Main Masthead Bar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Official Emblem & Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gov-navy)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}>
              🇮🇳
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}>
                  {t.appTitle}
                </h1>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: 'var(--gov-navy)',
                  background: 'var(--gov-navy-light)',
                  border: '1px solid var(--gov-navy-border)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  textTransform: 'uppercase',
                }}>
                  PIB GOI
                </span>
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                margin: 0,
                fontWeight: '500',
              }}>
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls (Clean Editorial Toolbar) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            
            {/* Bilingual Toggle (हिंदी / English) */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}>
              <button
                onClick={() => setLang('hi')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: lang === 'hi' ? '700' : '500',
                  color: lang === 'hi' ? '#ffffff' : 'var(--text-secondary)',
                  background: lang === 'hi' ? 'var(--gov-navy)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('en')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: lang === 'en' ? '700' : '500',
                  color: lang === 'en' ? '#ffffff' : 'var(--text-secondary)',
                  background: lang === 'en' ? 'var(--gov-navy)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                English
              </button>
            </div>

            {/* Reading Mode Switcher (Kisan / Pro) */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}>
              <button
                onClick={() => setMode('kisan')}
                title={t.kisanModeDesc}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: mode === 'kisan' ? '700' : '500',
                  color: mode === 'kisan' ? '#ffffff' : 'var(--text-secondary)',
                  background: mode === 'kisan' ? 'var(--gov-green)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sprout size={13} />
                <span>{t.kisanModeShort}</span>
              </button>

              <button
                onClick={() => setMode('pro')}
                title={t.proModeDesc}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: mode === 'pro' ? '700' : '500',
                  color: mode === 'pro' ? '#ffffff' : 'var(--text-secondary)',
                  background: mode === 'pro' ? 'var(--gov-navy)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <FileText size={13} />
                <span>{t.proModeShort}</span>
              </button>
            </div>

            {/* Font Size Adjuster */}
            <button
              onClick={cycleFont}
              className="btn btn-secondary"
              title={`${t.fontSize}: ${fontScale}x`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
            >
              <ZoomIn size={14} />
              <span>A{fontScale > 1 ? '+' : ''}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="btn btn-secondary"
              title="Theme"
              style={{ padding: '0.35rem 0.65rem' }}
            >
              {theme === 'light' && <Sun size={14} color="#d97706" />}
              {theme === 'dark' && <Moon size={14} color="#38bdf8" />}
              {theme === 'warm' && <Sprout size={14} color="#16a34a" />}
            </button>

            {/* Saved Bookmarks */}
            <button
              onClick={() => setActiveCategory(activeCategory === 'bookmarks' ? 'all' : 'bookmarks')}
              className="btn btn-secondary"
              title={t.categories.bookmarks}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: activeCategory === 'bookmarks' ? '700' : '500',
                background: activeCategory === 'bookmarks' ? 'var(--gov-navy-light)' : 'transparent',
                borderColor: activeCategory === 'bookmarks' ? 'var(--gov-navy-border)' : 'var(--border-color)',
                color: activeCategory === 'bookmarks' ? 'var(--gov-navy)' : 'inherit',
              }}
            >
              <Bookmark size={14} fill={bookmarkCount > 0 ? "currentColor" : "none"} />
              <span>{bookmarkCount}</span>
            </button>

            {/* Live Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="btn btn-primary"
              title={t.refresh}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              <RotateCw size={13} className={isRefreshing ? 'pulse-audio' : ''} />
              <span>{isRefreshing ? t.refreshing : t.refresh}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
