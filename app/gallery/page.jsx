'use client';

import React, { useState, useEffect } from 'react';
import { DataStore } from '../../lib/dataStore';
import LightboxModal from '../../components/LightboxModal';

export default function GalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    setGallery(DataStore.getGallery());
  }, []);

  const categories = ['All', ...new Set(gallery.map((g) => g.category).filter(Boolean))];

  const filteredGallery = filter === 'All'
    ? gallery
    : gallery.filter((g) => g.category === filter);

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Memories &amp; Heritage</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Alumni Photo &amp; Media Gallery</h1>
            <p className="section-desc">
              Cherished memories of our formative days at CIC Enugu, monumental campus landmarks, set reunions, and transformational development projects.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Campus Highlights */}
      <section className="section" style={{ padding: '3rem 0 2rem 0', background: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Semper Fidelis Monument */}
            <div
              className="project-card"
              style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
              onClick={() => setSelectedPhoto({ src: '/images/cic-statue.jpg', title: 'Semper Fidelis Monument', caption: 'Iconic student monument standing vigil at College of the Immaculate Conception, Enugu.' })}
            >
              <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/cic-statue.jpg"
                  alt="CIC Semper Fidelis Monument"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'; }}
                />
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--cic-blue-900)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                  Historic Monument
                </span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                  Semper Fidelis Student Monument
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                  The symbolic student statue representing faithful brotherhood and devotion to the values of C.I.C.
                </p>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cic-blue-600)' }}>
                  Click to View Full Photo &rarr;
                </span>
              </div>
            </div>

            {/* Campus Grounds */}
            <div
              className="project-card"
              style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
              onClick={() => setSelectedPhoto({ src: '/images/campus.jpg', title: 'CIC Enugu Assembly Grounds', caption: 'Historic main assembly quadrangle and administration block of CIC Enugu.' })}
            >
              <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/campus.jpg"
                  alt="Historic CIC Campus Assembly"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'; }}
                />
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--cic-blue-900)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                  Campus Grounds
                </span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                  Historic Campus &amp; Quadrangle
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                  The legendary assembly grounds and academic classrooms where timeless brotherhood was forged.
                </p>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cic-blue-600)' }}>
                  Click to View Full Photo &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          {categories.length > 1 && (
            <div className="news-filters" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn-filter ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '0.4rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--slate-300)',
                    background: filter === cat ? 'var(--cic-blue-900)' : 'var(--white)',
                    color: filter === cat ? '#fff' : 'var(--slate-700)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedPhoto(item)}
              >
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'; }}
                  />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {item.category} {item.year ? `• ${item.year}` : ''}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--slate-900)', fontFamily: 'var(--font-heading)' }}>
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <LightboxModal item={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </>
  );
}
