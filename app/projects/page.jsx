'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '../../lib/dataStore';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setProjects(DataStore.getProjects());
  }, []);

  const categories = ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))];

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter((p) => p.category === filter);

  const totalRaised = projects.reduce((sum, p) => sum + (Number(p.raisedAmount) || 0), 0);
  const totalTarget = projects.reduce((sum, p) => sum + (Number(p.targetAmount) || 0), 0);

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Institutional Growth &amp; Legacy</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Development Projects &amp; Initiatives</h1>
            <p className="section-desc">
              Witness how alumni voluntary contributions, endowments, and project levies transform our Alma Mater, empower indigent students, and elevate learning standards.
            </p>
          </div>

          {/* Real-Time Project Impact Metrics */}
          <div className="admin-kpis-grid" style={{ marginTop: '3rem', marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="admin-kpi-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)' }}>
              <span className="admin-kpi-label" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Active Initiatives</span>
              <div className="admin-kpi-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cic-blue-900)', margin: '0.25rem 0' }}>{projects.length}</div>
              <span className="admin-kpi-sub" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Campus &amp; Alumni Programs</span>
            </div>
            <div className="admin-kpi-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)' }}>
              <span className="admin-kpi-label" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Total Capital Raised</span>
              <div className="admin-kpi-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '0.25rem 0' }}>₦{totalRaised.toLocaleString()}</div>
              <span className="admin-kpi-sub" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Direct member donations</span>
            </div>
            <div className="admin-kpi-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)' }}>
              <span className="admin-kpi-label" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Funding Target</span>
              <div className="admin-kpi-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cic-blue-900)', margin: '0.25rem 0' }}>₦{totalTarget.toLocaleString()}</div>
              <span className="admin-kpi-sub" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Target capital budget</span>
            </div>
            <div className="admin-kpi-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)' }}>
              <span className="admin-kpi-label" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Alumni Donors</span>
              <div className="admin-kpi-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-600)', margin: '0.25rem 0' }}>100%</div>
              <span className="admin-kpi-sub" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Verifiable online receipts</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="projects" style={{ padding: '3.5rem 0 5.5rem 0' }}>
        <div className="container">
          {/* Category Filter Chips */}
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

          {/* Dynamic Project Cards Grid */}
          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredProjects.map((proj) => {
              const pct = proj.targetAmount ? Math.min(100, Math.round(((proj.raisedAmount || 0) / proj.targetAmount) * 100)) : 100;
              return (
                <div key={proj.id} className="project-card" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proj.image || '/images/cic-statue.jpg'}
                      alt={proj.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'; }}
                    />
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--cic-blue-900)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                      {proj.status}
                    </span>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {proj.category}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '1.25rem', flex: 1 }}>
                      {proj.description}
                    </p>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '0.4rem', fontWeight: 600 }}>
                        <span>Funding: {pct}%</span>
                        <span>₦{Number(proj.raisedAmount || 0).toLocaleString()} of ₦{Number(proj.targetAmount || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--emerald-600)', borderRadius: '4px' }}></div>
                      </div>
                    </div>

                    <Link
                      href={`/payment?category=project_contribution&desc=${encodeURIComponent(proj.title)}`}
                      className="btn btn-primary"
                      style={{ textAlign: 'center' }}
                    >
                      Pledge / Donate to Project &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Propose an Initiative Callout */}
          <div style={{ marginTop: '5rem', background: 'var(--white)', border: '1px solid var(--cic-blue-200)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', maxWidth: '850px', marginLeft: 'auto', marginRight: 'auto', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Have a Project Idea or Capital Initiative?
            </h3>
            <p style={{ color: 'var(--slate-600)', maxWidth: '600px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem' }}>
              The project planning committee welcomes proposals from all alumni sets, branches, and diaspora chapters.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Submit Proposal to Secretariat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
