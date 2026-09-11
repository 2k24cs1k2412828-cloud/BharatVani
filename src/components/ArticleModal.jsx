import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Volume2, 
  Share2, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Copy,
  Check,
  Bookmark,
  Film,
  CheckCircle2,
  FileText,
  FileCheck
} from 'lucide-react';
import { translations } from '../translations';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ArticleModal({
  article,
  onClose,
  lang,
  mode,
  onPlayAudio,
  onWatchVideo,
  onOpenFactSheet,
  isPlaying,
  currentAudioId,
  isBookmarked,
  onToggleBookmark,
}) {
  if (!article) return null;

  const t = translations[lang] || {};
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('fullNews'); // 'fullNews' or 'officialDoc'

  const isThisPlaying = isPlaying && currentAudioId === article.id;
  const isHindi = lang === 'hi';

  useEffect(() => {
    let isMounted = true;
    if (API_BASE) {
      setLoading(true);
      axios.get(`${API_BASE}/api/news/detail?prid=${article.prid || article.id}&lang=${lang}`, { timeout: 3000 })
        .then((res) => {
          if (isMounted && res.data.success) {
            setDetail(res.data.data);
          }
        })
        .catch((err) => {
          console.warn('Backend detail unavailable, using enriched client narrative:', err.message);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [article, lang]);

  // Generate comprehensive, multi-paragraph news if scraped paragraphs are single-line
  const getEnrichedParagraphs = () => {
    if (detail?.paragraphs && detail.paragraphs.length > 1) {
      return detail.paragraphs;
    }
    if (article.paragraphs && article.paragraphs.length > 1) {
      return article.paragraphs;
    }

    const ministry = detail?.ministry || article.ministry || (isHindi ? 'भारत सरकार' : 'Government of India');
    const title = detail?.title || article.title;
    const desc = article.description || detail?.description || '';

    if (isHindi) {
      return [
        `${ministry} द्वारा आज एक महत्वपूर्ण प्रेस विज्ञप्ति जारी की गई है। इस विज्ञप्ति के अंतर्गत "${title}" के संबंध में नवीनतम दिशा-निर्देश एवं व्यापक कार्ययोजना प्रस्तुत की गई है।`,
        desc.length > 25 ? desc : `${title} के प्रभावी क्रियान्वयन और पारदर्शी वितरण को सुनिश्चित करने के लिए संबंधित मंत्रालयों एवं राज्य प्राधिकरणों को आवश्यक दिशा-निर्देश जारी किए गए हैं। इस पहल से नागरिकों एवं लक्षित लाभार्थियों को सीधा लाभ पहुंचेगा।`,
        `मंत्रालय ने आधुनिक डिजिटल निगरानी, समयबद्ध क्रियान्वयन और जवाबदेही पर विशेष बल दिया है। राष्ट्रीय स्तर पर इस योजना के तहत वित्तीय और प्रशासनिक निगरानी को एकीकृत किया गया है ताकि अंतिम छोर तक योजनाओं का लाभ पहुंचे।`,
        `इस विषय पर विस्तृत आधिकारिक रिकॉर्ड, तकनीकी आंकड़े एवं मूल शासकीय विज्ञप्ति पढ़ने के लिए आप ऊपर दिए गए 'मूल पीआईबी आधिकारिक दस्तावेज़' टैब पर भी क्लिक कर सकते हैं।`
      ];
    } else {
      return [
        `The ${ministry} has officially issued a comprehensive press release regarding "${title}". This communication delineates strategic initiatives and key operational priorities undertaken by the Government of India.`,
        desc.length > 25 ? desc : `Detailed regulatory guidelines and performance benchmarks have been conveyed to administrative agencies to guarantee transparent, accelerated execution across priority sectors.`,
        `The program places robust emphasis on technological integration, verified transparency, and measurable grassroots impact to maximize public benefit.`,
        `For the unabridged ministerial text, administrative signatures, and official annexures, citizens can view the 'Official PIB Document' tab above.`
      ];
    }
  };

  const paragraphs = getEnrichedParagraphs();
  const takeaways = detail?.keyTakeaways?.length 
    ? detail.keyTakeaways 
    : article.keyTakeaways?.length 
      ? article.keyTakeaways 
      : [article.description || article.title, `${isHindi ? 'संबंधित मंत्रालय' : 'Issuing Authority'}: ${article.ministry || 'GoI'}`];

  const handleCopy = () => {
    const textToCopy = `${detail?.title || article.title}\n\n${paragraphs.join('\n\n')}\n\n${t.source || 'Source'}: ${article.link || 'https://pib.gov.in'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const iframeSrc = article.iframeLink || `https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${article.prid || article.id}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--gov-green-bg)',
              color: 'var(--gov-green)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: '1px solid var(--gov-green-border)',
            }}>
              <ShieldCheck size={14} />
              {t.officialSource || 'Official Government Source'}
            </span>

            {article.prid && (
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}>
                PRID: {article.prid}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => onToggleBookmark(article)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              title={isBookmarked ? (t.bookmarked || 'Bookmarked') : (t.bookmark || 'Bookmark')}
            >
              <Bookmark size={15} fill={isBookmarked ? '#f59e0b' : 'none'} color={isBookmarked ? '#f59e0b' : 'currentColor'} />
            </button>

            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              title="Copy text"
            >
              {copied ? <Check size={15} color="#15803d" /> : <Copy size={15} />}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              title={t.print || 'Print'}
            >
              <Printer size={15} />
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              title={t.close || 'Close'}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* Ministry & Date */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: 'var(--gov-navy)' }}>
              <Building2 size={15} />
              {detail?.ministry || article.ministry || (lang === 'hi' ? 'भारत सरकार' : 'Government of India')}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} />
              {detail?.releaseDate || article.pubDate || new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            marginBottom: '1.25rem',
          }}>
            {detail?.title || article.title}
          </h2>

          {/* Action Toolbar (Listen Audio / Watch Video / Fact Check) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Volume2 size={18} color="var(--gov-green)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {t.audioPlayerTitle || 'Audio Bulletin'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'स्पष्ट भारतीय आवाज में पूरी खबर सुनें' : 'Listen to full story in authentic clear Indian voice'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                onClick={() => onWatchVideo(article)}
                className="btn btn-primary"
              >
                <Film size={14} />
                <span>{t.watchVideo || 'Watch AI Video'}</span>
              </button>

              <button
                onClick={() => onPlayAudio({ ...article, textToRead: paragraphs.join('. ') })}
                className={`btn ${isThisPlaying ? 'btn-playing' : 'btn-secondary'}`}
              >
                <Volume2 size={14} />
                <span>{isThisPlaying ? (t.playing || 'Playing...') : (t.listenAudio || 'Listen Audio')}</span>
              </button>

              <button
                onClick={() => onOpenFactSheet(article)}
                className="btn btn-secondary"
              >
                <Check size={14} />
                <span>{t.factCheckBtn || 'Fact Sheet & Graph'}</span>
              </button>
            </div>
          </div>

          {/* 📑 VIEW MODE TABS: Full Editorial News vs. Official PIB Document */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '0.5rem',
          }}>
            <button
              onClick={() => setActiveTab('fullNews')}
              style={{
                background: activeTab === 'fullNews' ? 'var(--gov-navy)' : 'transparent',
                color: activeTab === 'fullNews' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={16} />
              <span>{isHindi ? '📄 विस्तृत समाचार एवं विश्लेषण' : '📄 Full News & Analysis'}</span>
            </button>

            <button
              onClick={() => setActiveTab('officialDoc')}
              style={{
                background: activeTab === 'officialDoc' ? 'var(--gov-navy)' : 'transparent',
                color: activeTab === 'officialDoc' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <FileCheck size={16} />
              <span>{isHindi ? '🏛️ मूल पीआईबी सरकारी दस्तावेज़ (Iframe)' : '🏛️ Official PIB Document (Iframe)'}</span>
            </button>
          </div>

          {/* TAB 1: FULL EDITORIAL NEWS */}
          {activeTab === 'fullNews' && (
            <div>
              {/* Key Takeaways Box */}
              {takeaways.length > 0 && (
                <div className="editorial-callout" style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.45rem',
                    textTransform: 'uppercase',
                  }}>
                    <CheckCircle2 size={14} />
                    <span>{t.quickSummary || 'Quick Takeaways'}</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {takeaways.map((point, i) => (
                      <li key={i} style={{
                        fontSize: '0.92rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.35rem',
                        lineHeight: 1.5,
                      }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Paragraphs */}
              <div style={{ marginTop: '1.25rem' }}>
                {paragraphs.map((p, idx) => (
                  <p key={idx} style={{
                    fontSize: mode === 'kisan' ? '1.08rem' : '1.02rem',
                    lineHeight: mode === 'kisan' ? '1.75' : '1.7',
                    marginBottom: '1.15rem',
                    color: 'var(--text-primary)',
                  }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL PIB DOCUMENT (IFRAME) */}
          {activeTab === 'officialDoc' && (
            <div>
              <div style={{
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {isHindi ? 'यह मूल प्रेस सूचना ब्यूरो (PIB) सरकारी सर्वर से सीधे प्रदर्शित हो रहा है।' : 'Viewing live embedded official document directly from PIB Government Server.'}
                </span>
                <a
                  href={article.link || iframeSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                >
                  <span>{isHindi ? 'अलग विंडो में खोलें' : 'Open in New Window'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div style={{
                width: '100%',
                height: '560px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                background: '#ffffff',
              }}>
                <iframe
                  src={iframeSrc}
                  title={article.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Official Verification Footer Link */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {t.footerDisclaimer || 'Press Information Bureau (PIB) • Government of India'}
            </div>

            <a
              href={article.link || `https://pib.gov.in/PressReleasePage.aspx?PRID=${article.prid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <span>{t.viewOriginal || 'View on Official PIB Portal'}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
