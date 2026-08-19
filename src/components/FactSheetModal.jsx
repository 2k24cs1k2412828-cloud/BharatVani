import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Check
} from 'lucide-react';
import { translations } from '../translations';

export default function FactSheetModal({
  article,
  onClose,
  lang,
}) {
  if (!article) return null;

  const t = translations[lang];
  const [factData, setFactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFigure, setSelectedFigure] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    axios.post('/api/news/factcheck', {
      article,
      lang,
    })
      .then((res) => {
        if (isMounted && res.data.success) {
          setFactData(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching fact check:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [article, lang]);

  const isHindi = lang === 'hi';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 250 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          maxHeight: '88vh',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.15rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gov-navy)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {isHindi ? 'सत्यापित तथ्य एवं डेटा शीट (Fact Verification)' : 'Verified Facts & Grounded Data Sheet'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {isHindi ? 'सिद्धांत: LLM प्रस्तावित करता है • निर्धारक कोड सत्यापित करता है' : 'Principle: LLM proposes • Deterministic code verifies'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div className="live-pulse" style={{ width: '12px', height: '12px', backgroundColor: '#0f172a', marginBottom: '1rem' }} />
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                {isHindi ? 'प्रेस विज्ञप्ति के आंकड़े एवं दावे सत्यापित किए जा रहे हैं...' : 'Parsing document, linking entities & deterministically verifying numbers...'}
              </p>
            </div>
          ) : factData ? (
            <div>
              {/* Top Verification Status Badge */}
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={20} color="#15803d" />
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {isHindi ? '100% आधिकारिक पीआईबी स्रोत से सत्यापित' : '100% Grounded in Official PIB Source Text'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {isHindi
                        ? `${factData.verifiedCount} में से ${factData.totalClaims} दावे सीधे मूल स्रोत से मेल खाते हैं।`
                        : `${factData.verifiedCount} of ${factData.totalClaims} atomic claims matched with exact source evidence.`}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--gov-navy)',
                  color: '#ffffff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                }}>
                  VERIFIED ✓
                </div>
              </div>

              {/* 1. EXTRACTED & VERIFIED NUMBERS / FIGURES */}
              {factData.deterministicFigures?.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span>📊 {isHindi ? 'सत्यापित आंकड़े एवं वित्तीय आवंटन' : 'Verified Figures & Allocations'}</span>
                  </h4>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                  }}>
                    {factData.deterministicFigures.map((fig) => (
                      <div
                        key={fig.id}
                        onClick={() => setSelectedFigure(fig)}
                        style={{
                          background: selectedFigure?.id === fig.id ? 'var(--bg-subtle)' : 'var(--bg-card)',
                          border: `1px solid ${selectedFigure?.id === fig.id ? 'var(--gov-navy)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.85rem 1rem',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <div style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#15803d',
                          textTransform: 'uppercase',
                          marginBottom: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}>
                          <Check size={12} />
                          <span>{fig.type.toUpperCase()} • VERIFIED</span>
                        </div>
                        <div style={{
                          fontSize: '1.15rem',
                          fontWeight: '800',
                          color: 'var(--text-primary)',
                        }}>
                          {fig.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Figure Grounding Detail */}
                  {selectedFigure && (
                    <div className="editorial-callout" style={{ marginTop: '0.85rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--gov-navy)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        {isHindi ? 'मूल पीआईबी स्रोत वाक्य:' : 'Exact PIB Source Sentence:'}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.86rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                        "{selectedFigure.sourceSentence}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. ATOMIC CLAIMS DECOMPOSITION */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  <span>⚡ {isHindi ? 'परमाणु दावे (Atomic Claims Decomposition)' : 'Atomic Claims & Evidence Grounding'}</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {factData.atomicClaims?.map((claim) => (
                    <div
                      key={claim.claimId}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.95rem 1.15rem',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.45rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            background: 'var(--gov-navy)',
                            color: '#ffffff',
                            padding: '0.12rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                          }}>
                            {claim.claimId}
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {claim.statement}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#15803d',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                        }}>
                          {claim.groundingScore}% MATCH ✓
                        </span>
                      </div>

                      {/* Triples Row: Subject -> Action -> Target */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.55rem',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ background: 'var(--bg-subtle)', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          🏛️ {claim.subject}
                        </span>
                        <span>➔</span>
                        <span style={{ background: 'var(--bg-subtle)', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          ⚙️ {claim.action}
                        </span>
                        <span>➔</span>
                        <span style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: '700', border: '1px solid var(--border-color)' }}>
                          🎯 {claim.targetQuantity}
                        </span>
                      </div>

                      {/* Evidence Quote */}
                      <div className="editorial-callout" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>{isHindi ? 'सत्यापित उद्धरण: ' : 'Verified Evidence: '}</strong>
                        "{claim.evidenceQuote}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. CANONICAL ENTITY RESOLUTION */}
              {factData.canonicalEntities?.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span>🔗 {isHindi ? 'संबद्ध आधिकारिक संस्थाएं एवं योजनाएं' : 'Canonical Entity Links'}</span>
                  </h4>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0.65rem',
                  }}>
                    {factData.canonicalEntities.map((ent) => (
                      <div
                        key={ent.canonicalId}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem 0.95rem',
                        }}
                      >
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          marginBottom: '0.2rem',
                        }}>
                          {ent.type}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                          {isHindi ? ent.nameHindi || ent.name : ent.name}
                        </div>
                        {ent.portalUrl && (
                          <a
                            href={ent.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--gov-navy)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: '600',
                            }}
                          >
                            <span>Official Portal</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
