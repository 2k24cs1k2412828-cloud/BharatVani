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
  CheckCircle2
} from 'lucide-react';
import { translations } from '../translations';

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

  const t = translations[lang];
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isThisPlaying = isPlaying && currentAudioId === article.id;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    axios.get(`/api/news/detail?prid=${article.prid || article.id}&lang=${lang}`)
      .then((res) => {
        if (isMounted && res.data.success) {
          setDetail(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching detail:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [article, lang]);

  const handleCopy = () => {
    const textToCopy = `${detail?.title || article.title}\n\n${(detail?.paragraphs || [article.description]).join('\n\n')}\n\n${t.source}: ${article.link}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const paragraphs = detail?.paragraphs || (article.description ? [article.description] : [article.title]);
  const takeaways = detail?.keyTakeaways || [article.description || article.title];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
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
              {t.officialSource}
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
              title={isBookmarked ? t.bookmarked : t.bookmark}
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
              title={t.print}
            >
              <Printer size={15} />
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              title={t.close}
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
              {detail?.ministry || (lang === 'hi' ? 'भारत सरकार' : 'Government of India')}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} />
              {detail?.releaseDate || article.pubDate}
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

          {/* Action Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Volume2 size={18} color="var(--gov-green)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {t.audioPlayerTitle}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'स्पष्ट आवाज में पूरी खबर सुनें' : 'Listen to full story in authentic clear voice'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                onClick={() => onWatchVideo(article)}
                className="btn btn-primary"
              >
                <Film size={14} />
                <span>{t.watchVideo}</span>
              </button>

              <button
                onClick={() => onPlayAudio({ ...article, textToRead: paragraphs.join('. ') })}
                className={`btn ${isThisPlaying ? 'btn-playing' : 'btn-secondary'}`}
              >
                <Volume2 size={14} />
                <span>{isThisPlaying ? t.playing : t.listenAudio}</span>
              </button>

              <button
                onClick={() => onOpenFactSheet(article)}
                className="btn btn-secondary"
              >
                <Check size={14} />
                <span>{t.factCheckBtn}</span>
              </button>
            </div>
          </div>

          {/* Key Takeaways Box for Easy Mode */}
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
                <span>{t.quickSummary}</span>
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <p>{lang === 'hi' ? 'विस्तृत विवरण लोड हो रहा है...' : 'Loading official release details...'}</p>
              </div>
            ) : (
              paragraphs.map((p, idx) => (
                <p key={idx} style={{
                  fontSize: mode === 'kisan' ? '1.08rem' : '1rem',
                  lineHeight: mode === 'kisan' ? '1.75' : '1.65',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)',
                }}>
                  {p}
                </p>
              ))
            )}
          </div>

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
              {t.footerDisclaimer}
            </div>

            <a
              href={article.link || `https://pib.gov.in/PressReleasePage.aspx?PRID=${article.prid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <span>{t.viewOriginal}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
