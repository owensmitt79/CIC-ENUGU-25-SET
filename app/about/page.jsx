import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | CIC Alumni 1995 Set',
  description: 'History, heritage, anthem, and mission of the College of the Immaculate Conception (CIC) Enugu Class of 1995 Alumni Association.',
};

export default function AboutPage() {
  return (
    <>
      {/* Page Banner */}
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Heritage &amp; Brotherhood</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>About CIC Alumni 1995 Set</h1>
            <p className="section-desc">
              Rooted in Catholic discipline, intellectual excellence, and lifelong camaraderie forged on the historic grounds of the College of the Immaculate Conception (CIC) Enugu.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ padding: '4.5rem 0 5.5rem 0' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-image-col">
              <div className="about-crest-card" style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', fontSize: '1.45rem', marginBottom: '0.5rem' }}>
                  College of the Immaculate Conception
                </h3>
                <div style={{ color: 'var(--cic-blue-600)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  SEMPER FIDELIS &bull; 1995 SET
                </div>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Guided by the timeless school motto <strong>&ldquo;Semper Fidelis&rdquo;</strong> (Always Faithful), the 1995 set remains steadfast in fraternal unity, mutual upliftment, and philanthropic dedication to our alma mater.
                </p>
              </div>

              {/* Quick Stats Box */}
              <div style={{ marginTop: '2rem', background: 'var(--cic-blue-50)', border: '1px solid var(--cic-blue-200)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', fontSize: '1.15rem', marginBottom: '1rem', textAlign: 'center' }}>
                  Set Highlights at a Glance
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cic-blue-600)' }}>200+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 500 }}>Active Members</div>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cic-blue-600)' }}>30+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 500 }}>Years of Brotherhood</div>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cic-blue-600)' }}>₦100M+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 500 }}>Infrastructural Impact</div>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cic-blue-600)' }}>12+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 500 }}>Global Chapters</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-content">
              <span className="section-badge">Who We Are</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                Fostering Brotherhood. Elevating Our Alma Mater.
              </h2>
              <p className="about-lead">
                The CIC Alumni 1995 Set is the official fellowship uniting graduates of the prestigious College of the Immaculate Conception (Class of 1995) across Nigeria and the global diaspora.
              </p>
              <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Since walking out through the historic gates of CIC Enugu in 1995, our members have distinguished themselves globally in medicine, engineering, business, law, academia, civil service, and technology. United by our shared formative years, we come together to ensure that no member walks alone, while continuing to give back generously to the institution that shaped us.
              </p>

              <div className="vision-mission-grid">
                <div className="vm-box">
                  <div className="vm-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <h4 className="vm-title">Our Vision</h4>
                  <p className="vm-desc">
                    To be the foremost, most cohesive, and philanthropic alumni set of the College of the Immaculate Conception, celebrated for fostering member prosperity and educational excellence at CIC.
                  </p>
                </div>

                <div className="vm-box">
                  <div className="vm-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h4 className="vm-title">Our Mission</h4>
                  <p className="vm-desc">
                    To maintain an unbreakable lifelong bond of brotherhood among all 1995 set alumni, protect members&apos; welfare, and execute strategic legacy development projects for CIC Enugu.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/leadership" className="btn btn-primary">
                  Meet Executive Council
                </Link>
                <Link href="/payment" className="btn btn-outline-primary">
                  Support Class Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Anthem Section */}
      <section className="anthem-section">
        <div className="container anthem-container">
          <div className="anthem-header">
            <span className="anthem-badge">Alma Mater Heritage</span>
            <h2 className="anthem-title">The College Anthem</h2>
            <p className="anthem-subtitle">&ldquo;Semper Fidelis&rdquo; &bull; The Sacred Hymn of Gallant C.I.C.</p>
          </div>

          <div className="anthem-grid">
            <div className="anthem-card">
              <div className="anthem-label">
                <span>Stanza I</span>
              </div>
              <p className="anthem-lyrics">
                Out of the shadows of the past<br />
                We come to cheer you,<br />
                Boys of the Old Brigade of Gallant C.I.C.<br />
                A thousand voices unite in a Mighty chorus<br />
                Boys of Old Saint Mary march to victory.
              </p>
            </div>

            <div className="anthem-card anthem-card-refrain">
              <div className="anthem-label">
                <span>Chorus &bull; Refrain</span>
                <span style={{ color: '#FCD34D' }}>Old White &amp; Blue</span>
              </div>
              <p className="anthem-lyrics">
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
    </>
  );
}
