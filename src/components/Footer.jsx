import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Sprout, Terminal } from 'lucide-react';
import { translations } from '../translations';

export default function Footer({ lang, mode }) {
  const t = translations[lang];

  return (
    <footer style={{
      marginTop: '4rem',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '2.5rem 1.25rem 2rem 1.25rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🇮🇳</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{t.appTitle}</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '420px' }}>
              {t.footerDisclaimer}
            </p>
          </div>

          {/* Dual Audience Statement */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {lang === 'hi' ? 'सर्वजन सुलभ मंच' : 'Designed for Everyone'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={16} color="#16a34a" />
                <span>{lang === 'hi' ? 'किसानों के लिए: सरल भाषा, बड़े अक्षर, ऑडियो वाचन' : 'For Farmers: Simple language, big text, crystal-clear audio'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={16} color="#2563eb" />
                <span>{lang === 'hi' ? 'इंजीनियरों के लिए: तकनीकी विवरण, पीआरआईडी, सरकारी संदर्भ' : 'For Engineers: Technical data, PRID references, official verification'}</span>
              </div>
            </div>
          </div>

          {/* Source Attribution */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {lang === 'hi' ? 'आधिकारिक स्रोत' : 'Official Sources'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>
                <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)' }}>
                  <span>Press Information Bureau (PIB)</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)' }}>
                  <span>National Portal of India</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="https://agricoop.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)' }}>
                  <span>Ministry of Agriculture & Farmers Welfare</span>
                  <ExternalLink size={13} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color-subtle)',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <div>{t.footerCopyright}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>{t.accessibilityNotice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
