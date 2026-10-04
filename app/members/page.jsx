'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '../../lib/dataStore';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [chapter, setChapter] = useState('ALL');

  useEffect(() => {
    setMembers(DataStore.getMembers());
  }, []);

  const chapters = ['ALL', ...new Set(members.map((m) => m.chapter).filter(Boolean))];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter?.toLowerCase().includes(search.toLowerCase()) ||
      m.profession?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());

    const matchesChapter = chapter === 'ALL' || m.chapter === chapter;

    return matchesSearch && matchesChapter;
  });

  return (
    <>
      <section className="section" style={{ padding: '4rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Alumni Roll</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Class of 1995 Members</h1>
            <p className="section-desc">
              Official membership roster and directory of the College of the Immaculate Conception (CIC) Class of 1995.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '3rem 0 5.5rem 0', background: 'var(--slate-50)' }}>
        <div className="container">
          {/* Search & Filter Bar */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Search Alumni
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, profession, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filter Chapter
                </label>
                <select
                  className="form-control"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {chapters.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch === 'ALL' ? 'All Chapters' : ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ background: 'var(--cic-blue-50)', color: 'var(--cic-blue-800)', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--cic-blue-200)', textAlign: 'center' }}>
                  Showing {filteredMembers.length} of {members.length} Members
                </div>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'var(--cic-blue-100)',
                    color: 'var(--cic-blue-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                >
                  {member.name ? member.name.charAt(0).toUpperCase() : 'C'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--slate-900)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gold-600)', fontWeight: 600, marginTop: '2px' }}>
                    {member.chapter || 'Enugu Central'} &bull; {member.profession || 'Alumnus'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                    {member.email || 'Secretariat Verified'}
                  </div>
                </div>

                <span
                  style={{
                    background: member.status === 'Active' ? 'var(--emerald-50)' : 'var(--slate-100)',
                    color: member.status === 'Active' ? 'var(--emerald-600)' : 'var(--slate-600)',
                    border: `1px solid ${member.status === 'Active' ? '#A7F3D0' : 'var(--slate-300)'}`,
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {member.status || 'Active'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Action Callout */}
          <div style={{ marginTop: '4rem', background: 'var(--white)', border: '1.5px solid var(--cic-blue-200)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', maxWidth: '860px', marginLeft: 'auto', marginRight: 'auto', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Are You a Class of 1995 Alumnus?
            </h3>
            <p style={{ color: 'var(--slate-600)', maxWidth: '600px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem' }}>
              Connect with the national secretariat to verify your membership record, update your chapter details, or contribute to ongoing set initiatives.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary">
                Contact Secretariat
              </Link>
              <Link href="/payment" className="btn btn-secondary">
                Pay Monthly Dues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
