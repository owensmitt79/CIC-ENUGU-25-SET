'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataStore } from '../../lib/dataStore';
import ReceiptModal from '../../components/ReceiptModal';

function PaymentCheckout() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'monthly_dues';
  const initialDesc = searchParams.get('desc') || '';

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(null);

  // Form State
  const [payerName, setPayerName] = useState('Engr. David Okon');
  const [payerPhone, setPayerPhone] = useState('08023456789');
  const [payerEmail, setPayerEmail] = useState('david.okon@example.com');
  const [payerClassYear, setPayerClassYear] = useState('Class of 1995');

  const [selectedCatId, setSelectedCatId] = useState(initialCategory);
  const [monthsCount, setMonthsCount] = useState(1);
  const [startMonth, setStartMonth] = useState('January 2026');
  const [customAmount, setCustomAmount] = useState(10000);
  const [paymentNote, setPaymentNote] = useState(initialDesc);
  const [gateway, setGateway] = useState('Paystack');

  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  useEffect(() => {
    setCategories(DataStore.getCategories());
    setConfig(DataStore.getConfig());
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0] || {
    id: 'monthly_dues',
    name: 'Monthly Dues',
    baseAmount: 5000,
    type: 'monthly'
  };

  // Calculate total amount
  let totalAmount = selectedCategory.baseAmount || 5000;
  if (selectedCategory.type === 'monthly') {
    totalAmount = (selectedCategory.baseAmount || 5000) * monthsCount;
  } else if (selectedCategory.type === 'custom') {
    totalAmount = Number(customAmount) || (selectedCategory.baseAmount || 5000);
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!payerName.trim() || !payerPhone.trim() || !payerEmail.trim()) {
        alert('Please complete all required fields.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const year = new Date().getFullYear();
      const randHex = Math.floor(100000 + Math.random() * 900000);
      const reference = `CIC-${year}-${randHex}`;
      const receiptNo = `REC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPayment = {
        id: `pay-${Date.now()}`,
        reference,
        receiptNumber: receiptNo,
        payerName,
        payerEmail,
        payerPhone,
        classYear: payerClassYear,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        amount: totalAmount,
        monthsCount: selectedCategory.type === 'monthly' ? monthsCount : null,
        period: selectedCategory.type === 'monthly' ? `${monthsCount} Month(s) starting ${startMonth}` : null,
        note: paymentNote,
        gateway,
        status: 'Successful',
        verified: true,
        date: new Date().toLocaleString()
      };

      DataStore.addPayment(newPayment);
      setIsProcessing(false);
      setGeneratedReceipt(newPayment);
    }, 900);
  };

  return (
    <>
      <section className="section" style={{ padding: '4.5rem 0 2.5rem 0', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-badge">Official Alumni Remittance</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>Dues &amp; Contributions Portal</h1>
            <p className="section-desc">
              Fulfill your monthly dues, welfare contributions, project support, and reunion levies with instant digital receipt issuance.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="paymentSection" style={{ padding: '3.5rem 0 5.5rem 0' }}>
        <div className="container">
          <div className="payment-section-box">
            <div className="payment-header-strip">
              <h2>Alumni Payment Checkout</h2>
              <p>Select your category, specify your months or custom donation, and proceed to secure checkout.</p>
              <div className="zero-login-pill">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Direct Remittance &bull; Instant Verifiable Official Receipt
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="payment-steps-indicator" style={{ display: 'flex', justifyContent: 'space-around', padding: '1.25rem', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}>
              {[
                { s: 1, label: 'Personal Info' },
                { s: 2, label: 'Category' },
                { s: 3, label: 'Amount' },
                { s: 4, label: 'Review & Pay' }
              ].map(({ s, label }) => (
                <div key={s} className={`step-item ${step === s ? 'active' : ''}`} style={{ textAlign: 'center', opacity: step >= s ? 1 : 0.45 }}>
                  <div className="step-badge" style={{ margin: '0 auto 0.25rem', width: '28px', height: '28px', borderRadius: '50%', background: step >= s ? 'var(--cic-blue-900)' : 'var(--slate-300)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    {s}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="payment-form-body" style={{ padding: '2rem' }}>
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="step-content-pane active">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    Step 1: Your Personal Information
                  </h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
                    Please enter your details so we can generate your official verified receipt upon successful payment.
                  </p>

                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Full Name <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="e.g. Engr. David Okon"
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                        Your name as it will appear on your official receipt
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Phone Number <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="e.g. 08023456789"
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                        For confirmation and receipt verification
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Email Address <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="e.g. david.okon@example.com"
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                        Digital receipt will be delivered to this email
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Class Year / Set
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={payerClassYear}
                        onChange={(e) => setPayerClassYear(e.target.value)}
                        placeholder="e.g. Class of 1995"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Continue to Payment Category &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Payment Category */}
              {step === 2 && (
                <div className="step-content-pane active">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    Step 2: Select What You Want to Pay For
                  </h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                    Select a payment category below. You can pay monthly dues, make developmental contributions, pay reunion fees, or donate.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        style={{
                          border: selectedCatId === cat.id ? '2px solid var(--cic-blue-900)' : '1px solid var(--slate-200)',
                          background: selectedCatId === cat.id ? 'var(--cic-blue-50)' : 'var(--white)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                            {cat.name}
                          </h4>
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: cat.type === 'monthly' ? '#DBEAFE' : '#FEF3C7', color: '#1E3A8A', fontWeight: 700 }}>
                            {cat.type}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cic-blue-900)', marginBottom: '0.35rem' }}>
                          ₦{Number(cat.baseAmount || 0).toLocaleString()} {cat.type === 'monthly' ? '/ month' : ''}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
                          {cat.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                      &larr; Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Continue to Amount Details &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Months / Amount Configuration */}
              {step === 3 && (
                <div className="step-content-pane active">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    Step 3: Months &amp; Amount Breakdown
                  </h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                    Configure the duration or specify your custom contribution for <strong>{selectedCategory.name}</strong>.
                  </p>

                  <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: '600px', marginBottom: '1.5rem' }}>
                    {selectedCategory.type === 'monthly' && (
                      <>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                            Number of Months to Pay:
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[1, 2, 3, 6, 12].map((m) => (
                              <button
                                key={m}
                                type="button"
                                className={`btn ${monthsCount === m ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setMonthsCount(m)}
                                style={{ padding: '0.4rem 1rem' }}
                              >
                                {m} {m === 1 ? 'Month' : 'Months'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                            Starting Month:
                          </label>
                          <select className="form-control" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                            {['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'].map((mo) => (
                              <option key={mo} value={mo}>{mo}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {selectedCategory.type === 'custom' && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          Contribution / Donation Amount (₦):
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="1000"
                          step="1000"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(Number(e.target.value))}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        Special Note / Dedication (Optional):
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. In memory of Late Chief Eneh or Project Pledge"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                      />
                    </div>

                    <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Calculated Total:</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', fontFamily: 'var(--font-heading)' }}>
                        ₦{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                      &larr; Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Review &amp; Choose Gateway &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Pay */}
              {step === 4 && (
                <div className="step-content-pane active">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-900)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    Step 4: Review &amp; Secure Payment
                  </h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                    Verify your remittance details and select your preferred payment channel.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Summary Card */}
                    <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 1rem', color: 'var(--cic-blue-900)', fontSize: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
                        Remittance Summary
                      </h4>
                      <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><strong>Payer:</strong> {payerName}</div>
                        <div><strong>Phone:</strong> {payerPhone}</div>
                        <div><strong>Email:</strong> {payerEmail}</div>
                        <div><strong>Purpose:</strong> {selectedCategory.name}</div>
                        {selectedCategory.type === 'monthly' && (
                          <div><strong>Coverage:</strong> {monthsCount} Month(s) ({startMonth})</div>
                        )}
                        {paymentNote && <div><strong>Note:</strong> {paymentNote}</div>}
                        <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>Total Payable:</span>
                          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-600)' }}>₦{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gateway Selector */}
                    <div>
                      <h4 style={{ margin: '0 0 1rem', color: 'var(--cic-blue-900)', fontSize: '1rem' }}>
                        Choose Payment Channel
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          { id: 'Paystack', label: 'Paystack (Instant Card, Transfer, USSD)', desc: 'Official direct channel with instant electronic receipt' },
                          { id: 'Flutterwave', label: 'Flutterwave (Card / Barter / Mobile Money)', desc: 'Multi-currency & diaspora cards supported' },
                          { id: 'Bank Transfer', label: 'Direct Bank Wire (First Heritage Bank)', desc: `Account: ${config?.bankAccount?.accountNumber || '1029384756'} • ${config?.bankAccount?.bankName || 'First Heritage Bank'}` }
                        ].map((gw) => (
                          <label
                            key={gw.id}
                            style={{
                              border: gateway === gw.id ? '2px solid var(--cic-blue-900)' : '1px solid var(--slate-200)',
                              background: gateway === gw.id ? 'var(--cic-blue-50)' : 'var(--white)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}
                          >
                            <input
                              type="radio"
                              name="gateway"
                              value={gw.id}
                              checked={gateway === gw.id}
                              onChange={() => setGateway(gw.id)}
                              style={{ marginTop: '4px' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--slate-900)' }}>{gw.label}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>{gw.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary" onClick={handlePrevStep} disabled={isProcessing}>
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      style={{ minWidth: '220px', padding: '0.85rem 1.5rem', fontSize: '1.05rem', fontWeight: 700 }}
                    >
                      {isProcessing ? 'Processing Transaction...' : `PAY ₦${totalAmount.toLocaleString()} NOW`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Render Official Verifiable Receipt Modal upon success */}
      {generatedReceipt && (
        <ReceiptModal
          receipt={generatedReceipt}
          onClose={() => {
            setGeneratedReceipt(null);
            setStep(1);
          }}
        />
      )}
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading checkout portal...</div>}>
      <PaymentCheckout />
    </Suspense>
  );
}
