import React from 'react';
import { Search, X } from 'lucide-react';
import { translations } from '../translations';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  lang,
  totalResults,
}) {
  const t = translations[lang];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      margin: '1.25rem 0',
      flexWrap: 'wrap',
    }}>
      {/* Search Input Box */}
      <div style={{
        position: 'relative',
        flex: 1,
        minWidth: '280px',
        maxWidth: '600px',
      }}>
        <div style={{
          position: 'absolute',
          left: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={16} />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          style={{
            width: '100%',
            padding: '0.6rem 2.2rem 0.6rem 2.4rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--gov-navy)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              padding: '0.2rem',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Result Counter */}
      <div style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: '600',
      }}>
        {lang === 'hi' ? `${totalResults} विज्ञप्तियां उपलब्ध` : `${totalResults} releases available`}
      </div>
    </div>
  );
}
