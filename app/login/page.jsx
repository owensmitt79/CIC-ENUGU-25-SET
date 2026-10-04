'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataStore } from '../../lib/dataStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cic1995.org');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const validPin = DataStore.getAdminPin ? DataStore.getAdminPin() : 'admin123';
    const validEmail = (DataStore.getAdminEmail ? DataStore.getAdminEmail() : 'admin@cic1995.org').toLowerCase();

    if (password.trim() === validPin) {
      setLoading(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cic_admin_logged_in', 'true');
      }
      setTimeout(() => {
        router.push('/admin');
      }, 400);
    } else {
      setError('Invalid executive PIN or password. Try demo credentials below.');
    }
  };

  const handleOneClickLogin = () => {
    setEmail('admin@cic1995.org');
    setPassword('admin123');
    setLoading(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cic_admin_logged_in', 'true');
    }
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  return (
    <section className="section" style={{ padding: '5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center', background: 'var(--slate-50)' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          {/* Logo & Header */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="CIC Crest" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            Executive Console Login
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '1.75rem' }}>
            Authorized portal for CIC 1995 Set Secretariat, Treasury &amp; Executive Council.
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Executive Email
              </label>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Security PIN / Password
              </label>
              <div style={{ display: 'flex', position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--slate-500)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Executive Dashboard'}
            </button>
          </form>

          {/* Quick 1-Click Demo Login */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-100)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleOneClickLogin}
              disabled={loading}
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              ⚡ 1-Click Demo Executive Login
            </button>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.75rem' }}>
              Default PIN: <code>admin123</code> &bull; Email: <code>admin@cic1995.org</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
