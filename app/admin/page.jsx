'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataStore } from '../../lib/dataStore';
import ReceiptModal from '../../components/ReceiptModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data states
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [config, setConfig] = useState(null);

  // Modal / Receipt state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form states
  const [newCat, setNewCat] = useState({ name: '', type: 'fixed', baseAmount: 5000, description: '' });
  const [newNews, setNewNews] = useState({ title: '', category: 'Executive', author: 'Secretariat', summary: '', image: '/images/cic-statue.jpg' });
  const [newPhoto, setNewPhoto] = useState({ title: '', src: '/images/cic-statue.jpg', category: 'Reunions', year: '2026', caption: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: 'Dec 20, 2026', venue: 'Enugu Campus', fee: 15000, description: '' });

  useEffect(() => {
    // Check session
    const loggedIn = sessionStorage.getItem('cic_admin_logged_in');
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);

    // Load data
    loadAllData();
  }, [router]);

  const loadAllData = () => {
    setPayments(DataStore.getPayments());
    setCategories(DataStore.getCategories());
    setNews(DataStore.getNews());
    setGallery(DataStore.getGallery());
    setProjects(DataStore.getProjects());
    setEvents(DataStore.getEvents());
    setMembers(DataStore.getMembers());
    setConfig(DataStore.getConfig());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cic_admin_logged_in');
    router.push('/login');
  };

  // Add category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    const catId = newCat.name.toLowerCase().replace(/\s+/g, '_');
    const created = {
      id: catId,
      name: newCat.name,
      type: newCat.type,
      baseAmount: Number(newCat.baseAmount) || 5000,
      active: true,
      description: newCat.description || 'Alumni category'
    };
    DataStore.saveCategories([...categories, created]);
    setCategories([...categories, created]);
    setNewCat({ name: '', type: 'fixed', baseAmount: 5000, description: '' });
    alert('Category successfully created!');
  };

  const handleDeleteCategory = (id) => {
    if (!confirm('Are you sure you want to remove this dues category?')) return;
    const updated = categories.filter((c) => c.id !== id);
    DataStore.saveCategories(updated);
    setCategories(updated);
  };

  // Add News
  const handleAddNews = (e) => {
    e.preventDefault();
    if (!newNews.title.trim()) return;
    const item = {
      id: `news-${Date.now()}`,
      title: newNews.title,
      category: newNews.category,
      author: newNews.author,
      summary: newNews.summary,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: newNews.image
    };
    DataStore.addNews(item);
    setNews(DataStore.getNews());
    setNewNews({ title: '', category: 'Executive', author: 'Secretariat', summary: '', image: '/images/cic-statue.jpg' });
    alert('Announcement published successfully!');
  };

  const handleDeleteNews = (id) => {
    if (!confirm('Delete this announcement?')) return;
    DataStore.deleteNews(id);
    setNews(DataStore.getNews());
  };

  // Add Photo
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhoto.title.trim() || !newPhoto.src.trim()) return;
    const item = {
      id: `gal-${Date.now()}`,
      title: newPhoto.title,
      src: newPhoto.src,
      category: newPhoto.category,
      year: newPhoto.year,
      caption: newPhoto.caption
    };
    DataStore.addGalleryItem(item);
    setGallery(DataStore.getGallery());
    setNewPhoto({ title: '', src: '/images/cic-statue.jpg', category: 'Reunions', year: '2026', caption: '' });
    alert('Photo added to gallery!');
  };

  const handleDeletePhoto = (id) => {
    if (!confirm('Delete this photo from gallery?')) return;
    DataStore.deleteGalleryItem(id);
    setGallery(DataStore.getGallery());
  };

  // Add Event
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    const item = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      venue: newEvent.venue,
      fee: Number(newEvent.fee) || 0,
      description: newEvent.description
    };
    DataStore.addEvent(item);
    setEvents(DataStore.getEvents());
    setNewEvent({ title: '', date: 'Dec 20, 2026', venue: 'Enugu Campus', fee: 15000, description: '' });
    alert('Event added successfully!');
  };

  const handleDeleteEvent = (id) => {
    if (!confirm('Delete this event?')) return;
    DataStore.deleteEvent(id);
    setEvents(DataStore.getEvents());
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Authenticating executive session...</div>;
  }

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <>
      {/* Top Banner */}
      <section className="section" style={{ padding: '3rem 0 1.5rem 0', background: 'var(--cic-blue-900)', color: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-100)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>
              CIC Alumni 1995 &bull; Executive Governance
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', margin: '0.25rem 0 0', color: '#fff' }}>
              Administration &amp; Ledger Console
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/" className="btn btn-outline-light btn-sm" target="_blank">
              View Public Website ↗
            </Link>
            <button className="btn btn-sm" onClick={handleLogout} style={{ background: '#DC2626', color: '#fff', border: 'none' }}>
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--slate-200)', position: 'sticky', top: '70px', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
          {[
            { id: 'overview', label: '📊 Overview & KPIs' },
            { id: 'ledger', label: `💳 Payments & Ledger (${payments.length})` },
            { id: 'categories', label: `🏷️ Dues Categories (${categories.length})` },
            { id: 'news', label: `📢 News & Dispatches (${news.length})` },
            { id: 'gallery', label: `🖼️ Photo Gallery (${gallery.length})` },
            { id: 'events', label: `📅 Events (${events.length})` },
            { id: 'members', label: `👥 Members (${members.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.55rem 1rem',
                border: 'none',
                background: activeTab === tab.id ? 'var(--cic-blue-900)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--slate-700)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="section" style={{ padding: '2.5rem 0 5rem 0', background: 'var(--slate-50)', minHeight: '70vh' }}>
        <div className="container">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>TOTAL REMITTANCE COLLECTED</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '0.25rem 0' }}>₦{totalCollected.toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>100% verified digital entries</div>
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>TRANSACTIONS LOGGED</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cic-blue-900)', margin: '0.25rem 0' }}>{payments.length}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Direct online + wire transfers</div>
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>ACTIVE DUES CHANNELS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-600)', margin: '0.25rem 0' }}>{categories.filter((c) => c.active).length}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Configured payment categories</div>
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>REGISTERED ALUMNI</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cic-blue-900)', margin: '0.25rem 0' }}>{members.length}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Across 6 regional chapters</div>
                </div>
              </div>

              {/* Recent Ledger Teaser */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>Recent Remittance Ledger</h3>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab('ledger')}>View Full Ledger &rarr;</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', textAlign: 'left', borderBottom: '1px solid var(--slate-200)' }}>
                        <th style={{ padding: '0.75rem' }}>Reference / Receipt</th>
                        <th style={{ padding: '0.75rem' }}>Payer</th>
                        <th style={{ padding: '0.75rem' }}>Purpose</th>
                        <th style={{ padding: '0.75rem' }}>Amount</th>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                        <th style={{ padding: '0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 5).map((pay) => (
                        <tr key={pay.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                          <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--cic-blue-900)' }}>
                            {pay.reference || pay.receiptNumber}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{pay.payerName}</td>
                          <td style={{ padding: '0.75rem' }}>{pay.categoryName || pay.category}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--emerald-600)' }}>₦{Number(pay.amount || 0).toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--slate-500)' }}>{pay.date}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => setSelectedReceipt(pay)}
                            >
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEDGER */}
          {activeTab === 'ledger' && (
            <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>Complete Financial Ledger</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>All verified contributions, dues and donations</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--emerald-600)', fontSize: '1.1rem' }}>
                  Total: ₦{totalCollected.toLocaleString()}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-50)', textAlign: 'left', borderBottom: '2px solid var(--slate-200)' }}>
                      <th style={{ padding: '0.75rem' }}>Receipt #</th>
                      <th style={{ padding: '0.75rem' }}>Reference</th>
                      <th style={{ padding: '0.75rem' }}>Payer</th>
                      <th style={{ padding: '0.75rem' }}>Channel</th>
                      <th style={{ padding: '0.75rem' }}>Category</th>
                      <th style={{ padding: '0.75rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--cic-blue-900)' }}>
                          {pay.receiptNumber}
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {pay.reference}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <strong>{pay.payerName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{pay.payerPhone}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{pay.gateway || 'Paystack'}</td>
                        <td style={{ padding: '0.75rem' }}>{pay.categoryName || pay.category}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                          ₦{Number(pay.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--slate-500)', fontSize: '0.78rem' }}>{pay.date}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedReceipt(pay)}
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DUES CATEGORIES */}
          {activeTab === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Existing Categories List */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Configured Payment Categories ({categories.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {categories.map((cat) => (
                    <div key={cat.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Type: {cat.type} &bull; Base: ₦{Number(cat.baseAmount || 0).toLocaleString()}</div>
                        {cat.description && <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '2px' }}>{cat.description}</div>}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Category Form */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Create New Payment Category
                </h3>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 2026 Grand Gala Ticket"
                      value={newCat.name}
                      onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Billing Type</label>
                      <select className="form-control" value={newCat.type} onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}>
                        <option value="fixed">Fixed Single Amount</option>
                        <option value="monthly">Monthly Multiplier</option>
                        <option value="custom">Custom Variable Amount</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Base Amount (₦)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newCat.baseAmount}
                        onChange={(e) => setNewCat({ ...newCat, baseAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Brief details explaining what this fee covers"
                      value={newCat.description}
                      onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Save Category
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: NEWS & ANNOUNCEMENTS */}
          {activeTab === 'news' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* News List */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Published Announcements ({news.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {news.map((item) => (
                    <div key={item.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', background: 'var(--cic-blue-100)', color: 'var(--cic-blue-900)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '0.5rem' }}>{item.date}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          Delete
                        </button>
                      </div>
                      <h4 style={{ margin: '0.25rem 0', fontSize: '1rem', color: 'var(--slate-900)' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add News Form */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Publish New Announcement
                </h3>

                <form onSubmit={handleAddNews} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Resolution from Q4 Executive Council Meeting"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                      <select className="form-control" value={newNews.category} onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}>
                        <option value="Executive">Executive</option>
                        <option value="Projects">Projects</option>
                        <option value="Events">Events</option>
                        <option value="Welfare">Welfare</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Author / Desk</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newNews.author}
                        onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Summary / Content *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      required
                      placeholder="Details of the official communique..."
                      value={newNews.summary}
                      onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Publish Dispatch &rarr;
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Gallery Grid */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Alumni Photos ({gallery.length})
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {gallery.map((item) => (
                    <div key={item.id} style={{ border: '1px solid var(--slate-200)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '90px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.src} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '0.4rem', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.7rem' }}>{item.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(item.id)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220, 38, 38, 0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Photo Form */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Upload / Link New Photo
                </h3>

                <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Photo Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 2026 Grand Gala Award Night"
                      value={newPhoto.title}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Image URL / Asset Path *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. /images/cic-statue.jpg or https://..."
                      value={newPhoto.src}
                      onChange={(e) => setNewPhoto({ ...newPhoto, src: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                      <select className="form-control" value={newPhoto.category} onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}>
                        <option value="Reunions">Reunions</option>
                        <option value="Campus">Campus &amp; Grounds</option>
                        <option value="Projects">Projects</option>
                        <option value="Executive">Executive</option>
                        <option value="Sports">Sports &amp; Gala</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPhoto.year}
                        onChange={(e) => setNewPhoto({ ...newPhoto, year: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Caption / Memo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Brief note or participants in the photo"
                      value={newPhoto.caption}
                      onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Add Photo to Gallery
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: EVENTS */}
          {activeTab === 'events' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Scheduled Events &amp; Gatherings ({events.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {events.map((evt) => (
                    <div key={evt.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--slate-900)' }}>{evt.title}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                          📅 {evt.date} &bull; 📍 {evt.venue}
                        </div>
                        {evt.fee > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-600)', fontWeight: 700, marginTop: '2px' }}>
                            Registration Fee: ₦{Number(evt.fee).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Event Form */}
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Create New Event
                </h3>

                <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Event Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 2026 Grand Alumni Gala Dinner"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dec 20, 2026"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fee (₦, 0 for free)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newEvent.fee}
                        onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Main Auditorium, CIC Campus Enugu"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Schedule Event
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: MEMBERS ROSTER */}
          {activeTab === 'members' && (
            <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>
                  Alumni Membership Roll ({members.length})
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-50)', textAlign: 'left', borderBottom: '2px solid var(--slate-200)' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Chapter</th>
                      <th style={{ padding: '0.75rem' }}>Profession</th>
                      <th style={{ padding: '0.75rem' }}>Email / Contact</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>{m.name}</td>
                        <td style={{ padding: '0.75rem' }}>{m.chapter || 'Enugu Central'}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--slate-600)' }}>{m.profession || 'Alumnus'}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--slate-500)', fontSize: '0.78rem' }}>{m.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700 }}>
                            {m.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Render Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </>
  );
}
