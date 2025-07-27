// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Per‑foot rates for roofline categories
const RATES = {
  'Haven Evolution': 60,
  'Haven Classic': 40,
  GlowFi: 25,
  Jasco: 15,
  'Christmas Lights Leasing': 8,
  'Christmas Lights Labor Only': 6,
};

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Subscribe to Firestore 'quotes' collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      snapshot => {
        setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      error => {
        console.error('Firestore error:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Filter by customer name, email, or total
  const filtered = quotes.filter(quote => {
    const term = searchTerm.toLowerCase();
    const name = quote.customer?.name?.toLowerCase() || '';
    const email = quote.customer?.email?.toLowerCase() || '';
    const total = quote.total?.toString() || '';
    return name.includes(term) || email.includes(term) || total.includes(term);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <input
        type="text"
        placeholder="Search by name, email, or total"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '8px', margin: '12px 0' }}
      />

      {/* Quotes Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0074D9', color: '#fff' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(quote => (
            <tr key={quote.id}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{quote.date}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{quote.customer?.name}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{quote.customer?.email}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>${quote.total}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <button
                  onClick={() => setSelectedQuote(quote)}
                  style={{ padding: '4px 8px' }}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Panel */}
      {selectedQuote && (
        <div
          style={{
            position: 'fixed',
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <button
            onClick={() => setSelectedQuote(null)}
            style={{
              float: 'right',
              background: '#FF4136',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            Quote Details
          </h3>

          {/* Date */}
          <p><strong>Date:</strong> {selectedQuote.date}</p>

          {/* Customer Information */}
          <section style={{ marginTop: '16px' }}>
            <h4>Customer Information</h4>
            <p style={{ lineHeight: '1.6' }}>
              <strong>Name:</strong> {selectedQuote.customer.name}<br />
              <strong>Address:</strong> {selectedQuote.customer.address}<br />
              <strong>Email:</strong> {selectedQuote.customer.email}<br />
              <strong>Phone:</strong> {selectedQuote.customer.phone}
            </p>
          </section>

          {/* Line Items */}
          <section style={{ marginTop: '24px' }}>
            <h4>Line Items</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>
                <strong>Roofline ({selectedQuote.values.roof})</strong>: {selectedQuote.values.feet} ft × ${RATES[selectedQuote.values.roof] || 0} = ${(selectedQuote.values.feet || 0) * (RATES[selectedQuote.values.roof] || 0)}
              </li>
              <li>
                <strong>Trees</strong>: {selectedQuote.values.treesCount} × ${selectedQuote.values.treesPrice}
              </li>
              <li>
                <strong>Bushes</strong>: {selectedQuote.values.bushesCount} × ${selectedQuote.values.bushesPrice}
              </li>
              <li>
                <strong>Ground Lights</strong>: {selectedQuote.values.ground} ft × $5 = {(selectedQuote.values.ground || 0) * 5}
              </li>
              {selectedQuote.values.otherPrice > 0 && (
                <li>
                  <strong>Other ({selectedQuote.values.otherDesc})</strong>: ${selectedQuote.values.otherPrice}
                </li>
              )}
              {selectedQuote.values.addPrice > 0 && (
                <li>
                  <strong>Additional Cost ({selectedQuote.values.addDesc})</strong>: ${selectedQuote.values.addPrice}
                </li>
              )}
            </ul>
          </section>

          {/* Total Estimate */}
          <div style={{ marginTop: '24px', fontSize: '1.2em', fontWeight: 'bold' }}>
            Total Estimate: ${selectedQuote.total}
          </div>
        </div>
      )}
    </div>
  );
}
