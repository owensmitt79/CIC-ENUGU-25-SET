'use client';

import React from 'react';
import Link from 'next/link';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card receipt-modal-card" style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>

        <div className="receipt-container" id="printableReceipt" style={{ padding: '1rem' }}>
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--cic-blue-900)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="CIC Crest" style={{ width: '64px', height: '64px', margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cic-blue-900)', fontSize: '1.25rem', marginBottom: '0.2rem' }}>
              COLLEGE OF THE IMMACULATE CONCEPTION
            </h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)', letterSpacing: '0.05em' }}>
              ALUMNI ASSOCIATION &bull; CLASS OF 1995 SET
            </div>
            <div style={{ display: 'inline-block', background: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
              &check; OFFICIAL DIGITAL PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Data Table */}
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Receipt Number:</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--cic-blue-900)' }}>{receipt.receiptNumber || receipt.receiptNo}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Transaction Date:</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>{receipt.date || new Date().toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Payer Name:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{receipt.payerName || receipt.name}</strong>
            </div>

            {receipt.payerEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Email Address:</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>{receipt.payerEmail}</span>
              </div>
            )}

            {receipt.payerPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Phone Number:</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>{receipt.payerPhone}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Payment Purpose:</span>
              <strong style={{ color: 'var(--cic-blue-900)' }}>{receipt.categoryName || receipt.category}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Payment Method:</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>{receipt.gateway || receipt.method || 'Online Card / Transfer'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>Total Amount Paid:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)', fontFamily: 'var(--font-heading)' }}>
                ₦{Number(receipt.amount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Reference & Verification */}
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textAlign: 'center', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Reference: <strong style={{ color: 'var(--slate-700)', fontFamily: 'monospace' }}>{receipt.reference || receipt.ref}</strong>
            <br />
            Status: <span style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>SUCCESSFUL &amp; VERIFIED</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ flex: 1 }}>
              Print / Save PDF
            </button>
            <Link href={`/verify?ref=${encodeURIComponent(receipt.reference || receipt.receiptNumber || '')}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={onClose}>
              Verify Online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
