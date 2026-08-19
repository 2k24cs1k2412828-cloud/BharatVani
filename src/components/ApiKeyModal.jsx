import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { translations } from '../translations';

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  lang,
}) {
  if (!isOpen) return null;

  const t = translations[lang];
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Key size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
              {t.keyModalTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.25rem',
          }}>
            {t.keyModalDesc}
          </p>

          {/* Current Status Box */}
          <div style={{
            background: apiKey ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${apiKey ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.86rem',
            fontWeight: '600',
            color: apiKey ? '#15803d' : '#2563eb',
          }}>
            <Sparkles size={16} />
            <span>{apiKey ? t.usingGemini : t.usingSmartEngine}</span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSave}>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              Google Gemini API Key:
            </label>

            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t.keyInputPlaceholder}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                outline: 'none',
              }}
            />

            {/* Free Link */}
            <div style={{ marginBottom: '1.5rem' }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{t.getKeyFree}</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn btn-secondary"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={15} />
                  <span>{t.clearKey}</span>
                </button>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '130px' }}
              >
                {savedSuccess ? <Check size={16} /> : <Key size={16} />}
                <span>{savedSuccess ? 'Saved!' : t.saveKey}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
