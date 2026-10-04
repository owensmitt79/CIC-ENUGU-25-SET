'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataStore } from '../../lib/dataStore';
import ReceiptModal from '../../components/ReceiptModal';

function VerifyLookup() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);

  const doVerify = (searchCode) => {
    const code = (searchCode || refInput).trim().toUpperCase();
    if (!code) return;

    setSearched(true);
    const payments = DataStore.getPayments();
    const found = payments.find(
      (p) =>
        (p.reference && p.reference.toUpperCase() === code) ||
        (p.receiptNumber && p.receiptNumber.toUpperCase() === code) ||
        (p.id && p.id.toUpperCase() === code)
    );

    setResult(found || null);
  };

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      doVerify(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    doVerify(refInput);
  };

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Transparency &amp; Audit Trail</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Verify Official Payment</h1>
            <p className="section-desc">
              Validate any alumni dues receipt, development levy, or project donation record instantly using your official Transaction Reference or Receipt Number.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="verify" style={{ padding: '3.5rem 0 5.5rem 0' }}>
        <div className="container">
          <div className="lookup-card" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--cic-blue-200)', maxWidth: '820px', margin: '0 auto 3.5rem auto', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(43, 87, 151, 0.08)', color: 'var(--cic-blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', fontSize: '1.45rem', marginBottom: '0.5rem' }}>
                Instant Receipt &amp; Settlement Lookup
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)', maxWidth: '540px', margin: '0 auto' }}>
                Enter your <strong>Transaction Reference</strong> (e.g. <code>HAA-2026-89104</code> or <code>CIC-2026-XXXX</code>) or <strong>Receipt Number</strong> below:
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. HAA-2026-89104 or REC-2026-1049"
                required
                style={{ fontFamily: 'monospace', fontSize: '1.1rem', flex: 1, height: '50px', textTransform: 'uppercase' }}
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', height: '50px', fontWeight: 700, padding: '0 1.75rem' }}>
                Verify Record
              </button>
            </form>

            {/* Quick Sample Reference Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              <span>Sample references:</span>
              {['HAA-2026-89104', 'HAA-2026-10492', 'HAA-2026-92811'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                  onClick={() => {
                    setRefInput(sample);
                    doVerify(sample);
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Verification Result */}
            {searched && (
              <div style={{ marginTop: '1.5rem' }}>
                {result ? (
                  <div style={{ background: 'var(--emerald-50)', border: '1.5px solid #A7F3D0', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      VALID &amp; VERIFIED SETTLEMENT
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5', marginBottom: '1rem', fontSize: '0.88rem' }}>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>RECEIPT NUMBER</div>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--cic-blue-900)' }}>{result.receiptNumber}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>TRANSACTION DATE</div>
                        <strong>{result.date}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>PAYER</div>
                        <strong>{result.payerName}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>AMOUNT SETTLED</div>
                        <strong style={{ color: 'var(--emerald-600)', fontSize: '1.1rem' }}>₦{Number(result.amount || 0).toLocaleString()}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>PURPOSE</div>
                        <strong>{result.categoryName || result.categoryId}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>SETTLEMENT GATEWAY</div>
                        <strong>{result.gateway || 'Paystack'}</strong>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={() => setActiveReceiptModal(result)}>
                      View &amp; Print Official Receipt &rarr;
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '1.5rem', color: '#991B1B' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Record Not Found</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      No record exists matching reference <code>{refInput}</code>. Please double check the reference or contact the secretariat if you completed an offline bank wire transfer.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trust Standards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Privacy Protected</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Payer records are securely verified while providing undeniable confirmation of settlement for auditors and third parties.
              </p>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Official Settlement Check</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Every transaction records directly to our real-time audit ledger with digital timestamps and official proof of payment.
              </p>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zero-Login Transparency</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Public verification empowers every member and alumnus to confirm that their dues are safely logged with treasury.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal preview when user clicks View & Print Official Receipt */}
      {activeReceiptModal && (
        <ReceiptModal receipt={activeReceiptModal} onClose={() => setActiveReceiptModal(null)} />
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading verification portal...</div>}>
      <VerifyLookup />
    </Suspense>
  );
}
