'use client';

import React from 'react';

export default function LightboxModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      className="modal-backdrop open"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card lightbox-card" style={{ background: '#000', padding: '1rem', maxWidth: '850px', width: '95%', textAlign: 'center' }}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', top: '10px', right: '10px' }}
          aria-label="Close image"
        >
          &times;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src || item.imageUrl || item.url}
          alt={item.title || 'Alumni Gallery Image'}
          style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '4px' }}
        />
        {(item.title || item.caption) && (
          <div style={{ color: '#fff', marginTop: '1rem', fontSize: '0.95rem', padding: '0.5rem' }}>
            <h4 style={{ margin: 0, fontWeight: 600 }}>{item.title}</h4>
            {item.caption && <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{item.caption}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
