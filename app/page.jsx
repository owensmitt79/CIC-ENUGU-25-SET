'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '../lib/dataStore';
import LightboxModal from '../components/LightboxModal';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    setProjects(DataStore.getProjects());
    setNews(DataStore.getNews());
    setGallery(DataStore.getGallery());
  }, []);

  const galleryCategories = ['All', ...new Set(gallery.map((g) => g.category).filter(Boolean))];

  const filteredGallery = galleryCategory === 'All'
    ? gallery
    : gallery.filter((g) => g.category === galleryCategory);

  return (
    <>
      {/* ==========================================================================
           HERO SECTION
           ========================================================================== */}
      <section class="hero" id="home">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <div class="hero-eyebrow">College of the Immaculate Conception, Enugu</div>
              <h1 class="hero-title">Class of 1995 Alumni Association</h1>
              <div class="hero-slogan">Semper Fidelis &bull; Connecting the Past, Building the Future</div>
              <p class="hero-desc">
                The official digital portal for the 1995 graduating set. Reconnect with classmates, support ongoing capital projects, and fulfill annual and monthly dues with instant verifiable receipts.
              </p>
              <div class="hero-ctas">
                <Link href="/payment" class="btn btn-primary btn-lg">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  Make Payment
                </Link>
                <Link href="/about" class="btn btn-outline-light btn-lg">
                  About the Set
                </Link>
              </div>

              <div class="hero-highlights">
                <div class="hero-stat-item">
                  <span class="hero-stat-number">1995</span>
                  <span class="hero-stat-label">Graduating Class</span>
                </div>
                <div class="hero-stat-item">
                  <span class="hero-stat-number">100%</span>
                  <span class="hero-stat-label">Direct Online Receipts</span>
                </div>
                <div class="hero-stat-item">
                  <span class="hero-stat-number">30+</span>
                  <span class="hero-stat-label">Years of Brotherhood</span>
                </div>
              </div>
            </div>

            {/* Authentic CIC Semper Fidelis Monument Photo Showcase */}
            <div class="hero-image-col">
              <div class="hero-campus-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/cic-statue.jpg"
                  alt="College of the Immaculate Conception (CIC) Semper Fidelis Monument"
                  class="hero-campus-img"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'; }}
                />
                <div class="hero-campus-caption">
                  <div class="campus-caption-title">Semper Fidelis</div>
                  <div class="campus-caption-sub">College of the Immaculate Conception &bull; Class of 1995</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
           OFFICIAL SCHOOL ANTHEM
           ========================================================================== */}
      <section class="anthem-section" id="anthem">
        <div class="container anthem-container">
          <div class="anthem-header">
            <span class="anthem-badge">Alma Mater Heritage</span>
            <h2 class="anthem-title">The College Anthem</h2>
            <p class="anthem-subtitle">&ldquo;Semper Fidelis&rdquo; &bull; The Sacred Hymn of Gallant C.I.C.</p>
          </div>

          <div class="anthem-grid">
            {/* Stanza 1 */}
            <div class="anthem-card">
              <div class="anthem-label">
                <span>Stanza I</span>
              </div>
              <p class="anthem-lyrics">
                Out of the shadows of the past<br />
                We come to cheer you,<br />
                Boys of the Old Brigade of Gallant C.I.C.<br />
                A thousand voices unite in a Mighty chorus<br />
                Boys of Old Saint Mary march to victory.
              </p>
            </div>

            {/* Refrain */}
            <div class="anthem-card anthem-card-refrain">
              <div class="anthem-label">
                <span>Chorus &bull; Refrain</span>
                <span style={{ color: '#FCD34D' }}>Old White &amp; Blue</span>
              </div>
              <p class="anthem-lyrics">
                Fearless and strong<br />
                Are the boys of Saint Mary College<br />
                Glorious and proud<br />
                Loyal sons of the old White and Blue.<br />
                Brave hearts and true<br />
                Let their names be etched in triumph glory<br />
                Onward march on<br />
                Boys of C.I.C. to glory!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
           PROJECTS & INITIATIVES
           ========================================================================== */}
      <section class="section section-alt" id="projects">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Giving Back</span>
            <h2 class="section-title">Projects &amp; Initiatives</h2>
            <p class="section-desc">Witness how alumni dues, endowments, and voluntary contributions transform our institution and support student scholars.</p>
          </div>

          <div class="projects-grid" id="projectsGrid">
            {projects.slice(0, 3).map((proj) => {
              const pct = proj.targetAmount ? Math.min(100, Math.round(((proj.raisedAmount || 0) / proj.targetAmount) * 100)) : 100;
              return (
                <div key={proj.id} className="project-card">
                  <div className="project-img-wrap" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proj.image || '/images/cic-statue.jpg'}
                      alt={proj.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'; }}
                    />
                    <span className="badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--cic-blue-900)', color: '#fff' }}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="project-card-body" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--cic-blue-900)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {proj.description}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                        <span>Progress: {pct}%</span>
                        <span>₦{Number(proj.raisedAmount || 0).toLocaleString()} of ₦{Number(proj.targetAmount || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--emerald-600)', borderRadius: '4px' }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/payment?category=project_contribution&desc=${encodeURIComponent(proj.title)}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                        Support Project
                      </Link>
                      <Link href="/projects" className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/projects" className="btn btn-outline-primary">
              View All Class Projects &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
           NEWS & ANNOUNCEMENTS
           ========================================================================== */}
      <section class="section" id="news">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Official Dispatches</span>
            <h2 class="section-title">News &amp; Announcements</h2>
            <p class="section-desc">Stay informed about executive resolutions, chapter meeting notices, project milestones, and alumni honors.</p>
          </div>

          <div className="news-grid">
            {news.map((item) => (
              <article key={item.id} className="news-card" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'; }}
                  />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--cic-blue-900)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                    {item.date} &bull; By {item.author || 'Secretariat'}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6', flex: 1 }}>
                    {item.summary || item.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
           ALUMNI GALLERY
           ========================================================================== */}
      <section class="section section-alt" id="gallery">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Moments &amp; Memories</span>
            <h2 class="section-title">Alumni Photo Gallery</h2>
            <p class="section-desc">Glimpse through cherished memories of our grand reunions, AGMs, award galas, and community project commissions.</p>
          </div>

          {galleryCategories.length > 1 && (
            <div className="news-filters" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  className={`btn-filter ${galleryCategory === cat ? 'active' : ''}`}
                  onClick={() => setGalleryCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--slate-300)',
                    background: galleryCategory === cat ? 'var(--cic-blue-900)' : 'var(--white)',
                    color: galleryCategory === cat ? '#fff' : 'var(--slate-700)',
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

          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filteredGallery.slice(0, 8).map((photo) => (
              <div
                key={photo.id}
                className="gallery-item-card"
                onClick={() => setSelectedPhoto(photo)}
                style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#fff', border: '1px solid var(--slate-200)', position: 'relative' }}
              >
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={photo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'; }}
                  />
                </div>
                <div style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {photo.category} &bull; {photo.year}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                    {photo.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/gallery" className="btn btn-primary">
              View Full Alumni Gallery &rarr;
            </Link>
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
