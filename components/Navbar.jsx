'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="site-header">
      <div className="container">
        <nav className="navbar">
          <Link href="/" className="brand-crest" onClick={closeMobileMenu}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="CIC Alumni 1995 Set Crest" className="brand-logo-img" />
            <div className="crest-text">
              <span className="crest-title">CIC ALUMNI</span>
              <span className="crest-subtitle">1995 SET</span>
            </div>
          </Link>

          {/* Desktop & Mobile Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
            <li>
              <Link
                href="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
            </li>
            <li className="nav-item-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
              <span
                className={`nav-link dropdown-toggle ${isActive('/leadership') || isActive('/members') ? 'active' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                Leadership
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '4px' }}>
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
              <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} style={{ display: dropdownOpen ? 'block' : undefined }}>
                <li>
                  <Link href="/leadership" className="dropdown-link" onClick={closeMobileMenu}>
                    Executive Council
                  </Link>
                </li>
                <li>
                  <Link href="/members" className="dropdown-link" onClick={closeMobileMenu}>
                    Members Directory
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                href="/projects"
                className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/#news"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                News
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/verify"
                className={`nav-link ${isActive('/verify') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Verify Payment
              </Link>
            </li>
            <li className="mobile-only-action" style={{ padding: '0.5rem 0' }}>
              <Link
                href="/payment"
                className="btn-pay-dues"
                onClick={closeMobileMenu}
                style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
              >
                Pay Dues
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <Link href="/payment" className="btn-pay-dues">
              Pay Dues
            </Link>
            <button
              className="hamburger"
              id="hamburgerBtn"
              aria-label="Toggle Navigation Menu"
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
