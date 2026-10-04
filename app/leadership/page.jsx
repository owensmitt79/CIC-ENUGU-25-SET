'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '../../lib/dataStore';

export default function LeadershipPage() {
  const [leadership, setLeadership] = useState([]);

  useEffect(() => {
    setLeadership(DataStore.getLeadership());
  }, []);

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Governance &amp; Stewardship</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Association Leadership</h1>
            <p className="section-desc">
              Dedicated alumni leaders steering the affairs, fiscal transparency, and strategic vision of the CIC Class of 1995.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '3.5rem 0 5.5rem 0', background: 'var(--slate-50)' }}>
        <div className="container">
          <div className="leadership-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {leadership.map((member) => (
              <div
                key={member.id}
                className="leader-card"
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'; }}
                  />
                  <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--cic-blue-900)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    {member.role}
                  </span>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                    {member.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gold-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    {member.profession || member.city}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '1.25rem', flex: 1 }}>
                    {member.bio}
                  </p>

                  <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                    {member.email && <div><strong>Email:</strong> {member.email}</div>}
                    {member.phone && <div><strong>Phone:</strong> {member.phone}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link href="/members" className="btn btn-primary">
              View All Class of 1995 Members &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
