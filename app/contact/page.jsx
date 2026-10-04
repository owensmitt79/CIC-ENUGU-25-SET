'use client';

import React, { useState } from 'react';
import { DataStore } from '../../lib/dataStore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const config = DataStore.getConfig();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Secretariat &amp; Liaison</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Contact Secretariat</h1>
            <p className="section-desc">
              Have questions about membership, dues reconciliation, chapters, reunions, or school developmental projects? Reach out to our executive secretariat.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="contact" style={{ padding: '4.5rem 0 5.5rem 0' }}>
        <div className="container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Contact Information Cards */}
            <div className="contact-info-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="contact-info-card" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div className="contact-icon" style={{ color: 'var(--cic-blue-900)', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>National Secretariat</h4>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                    CIC Alumni Secretariat,<br />
                    College of the Immaculate Conception,<br />
                    Uwani, Enugu, Enugu State, Nigeria.
                  </p>
                </div>
              </div>

              <div className="contact-info-card" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div className="contact-icon" style={{ color: 'var(--cic-blue-900)', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>Email Correspondences</h4>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                    <strong>General Secretariat:</strong> secretariat@cicalumni1995.org<br />
                    <strong>Financial / Dues:</strong> treasury@cicalumni1995.org<br />
                    <strong>Welfare Committee:</strong> welfare@cicalumni1995.org
                  </p>
                </div>
              </div>

              <div className="contact-info-card" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div className="contact-icon" style={{ color: 'var(--cic-blue-900)', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>Phone &amp; WhatsApp Hotlines</h4>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                    +234 (0) 803 123 4567 (Presidential Desk)<br />
                    +234 (0) 802 987 6543 (Secretariat Desk)<br />
                    +234 (0) 803 456 7890 (Treasury)
                  </p>
                </div>
              </div>

              {/* Official Bank Account Card */}
              <div style={{ background: 'var(--cic-blue-50)', border: '1px solid var(--cic-blue-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--cic-blue-900)', fontFamily: 'var(--font-heading)' }}>Official Bank Account</h4>
                <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: '1.6' }}>
                  <div><strong>Bank Name:</strong> {config.bankAccount?.bankName}</div>
                  <div><strong>Account Number:</strong> {config.bankAccount?.accountNumber}</div>
                  <div><strong>Account Name:</strong> {config.bankAccount?.accountName}</div>
                  <div><strong>USSD Quick Code:</strong> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{config.ussdPrefix}</code></div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', marginBottom: '0.5rem' }}>
                Send a Message
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
                Complete the dispatch form below and an officer will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div style={{ background: 'var(--emerald-50)', border: '1px solid #A7F3D0', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: 'var(--emerald-600)', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.5rem' }}>Message Transmitted!</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Thank you. Your dispatch has been logged with the secretariat desk.</p>
                  <button className="btn btn-outline-primary" style={{ marginTop: '1rem' }} onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Kenneth Ugwu"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+234 800 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                      Subject
                    </label>
                    <select
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Dues Reconciliation">Dues Reconciliation &amp; Receipt</option>
                      <option value="Membership Directory Update">Membership Directory Update</option>
                      <option value="Project Sponsorship">Project Sponsorship / Donation</option>
                      <option value="Reunion Planning">Reunion Planning Committee</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                      Message *
                    </label>
                    <textarea
                      className="form-control"
                      rows={5}
                      required
                      placeholder="Type your inquiry or message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Send Dispatch &rarr;
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
