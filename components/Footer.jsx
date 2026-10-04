'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand-crest" style={{ marginBottom: '1.25rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="CIC Crest" className="brand-logo-img" style={{ width: '48px', height: '48px' }} />
              <div className="crest-text">
                <span className="crest-title" style={{ color: 'var(--cic-blue-900)' }}>CIC ALUMNI</span>
                <span className="crest-subtitle" style={{ color: 'var(--slate-500)' }}>1995 SET</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              College of the Immaculate Conception (CIC) Enugu — Class of 1995 Alumni Association. United in brotherhood, excellence, and legacy.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              <div><strong>Secretariat:</strong> Enugu, Enugu State, Nigeria</div>
              <div><strong>Email:</strong> info@cic1995.org</div>
              <div><strong>Phone:</strong> +234 803 123 4567</div>
            </div>
          </div>

          <div className="footer-col">
            <h5>Quick Navigation</h5>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/members">Members Roster</Link></li>
              <li><Link href="/leadership">Leadership Directory</Link></li>
              <li><Link href="/projects">Development Projects</Link></li>
              <li><Link href="/gallery">Alumni Gallery</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Alumni Services</h5>
            <ul className="footer-links">
              <li><Link href="/payment">Make a Payment (No Login)</Link></li>
              <li><Link href="/payment">Pay Monthly Dues</Link></li>
              <li><Link href="/verify">Verify Payment Reference</Link></li>
              <li><Link href="/gallery">Alumni Photo Gallery</Link></li>
              <li><Link href="/login">Executive Admin Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Make a Payment</h5>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
              No login or password needed. Simply provide your name, phone, and email to pay dues or donate.
            </p>
            <Link href="/payment" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'inline-block' }}>
              PAY DUES NOW &rarr;
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} CIC Alumni 1995 Set (College of the Immaculate Conception). All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/verify">Public Verification</Link>
            <Link href="/contact">Secretariat</Link>
            <Link href="/login">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
