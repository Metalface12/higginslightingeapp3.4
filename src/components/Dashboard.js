// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Price per foot rates for roofline categories
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
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // Subscribe to Firestore "quotes" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quotes'), (snap) => {
      setQuotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Filter logic: name, email, or total
  const filtered = quotes.filter(
    (q) =>
      q.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      q.customer?.email.toLowerCase().includes(search.toLowerCase()) ||
      q.total?.toString().includes(search)
  );

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <input
        type="text"
        placeholder="Search by name, email, or total"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />

      {/* Quotes Table */}
      {filtered.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
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
            {filtered.map((q) => (
              <tr key={q.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.date}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {q.customer?.name}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {q.customer?.email}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>${q.total}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => setSelected(q)}
                    style={{ padding: '4px 8px' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Detail Panel */}
      {selected && (
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
            onClick={() => setSelected(null)}
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

          {/* Customer Information */}
          <section style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '4px' }}>Customer Information</h4>
            <p style={{ lineHeight: '1.6' }}>
              <strong>Name:</strong> {selected.customer.name}
              <br />
              <strong>Address:</strong> {selected.customer.address}
              <br />
              <strong>Email:</strong> {selected.customer.email}
              <br />
              <strong>Phone:</strong> {selected.customer.phone}
            </p>
          </section>

          {/* Line Items */}
          <section style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '4px' }}>Line Items</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>
                <strong>Roofline</strong> ({selected.values.roof}):{' '}
                {selected.values.feet} ft × ${RATES[selected.values.roof] || 0} = $
                {selected.values.feet * (RATES[selected.values.roof] || 0)}
              </li>
              <li>
                <strong>Trees</strong>: {selected.values.treesCount} × $
                {selected.values.treesPrice}
              </li>
              <li>
                <strong>Bushes</strong>: {selected.values.bushesCount} × $
                {selected.values.bushesPrice}
              </li>
              <li>
                <strong>Ground Lights</strong>: {selected.values.ground} ft × $5 = $
                {selected.values.ground * 5}
              </li>
              {selected.values.otherPrice > 0 && (
                <li>
                  <strong>Other</strong> ({selected.values.otherDesc}): $
                  {selected.values.otherPrice}
                </li>
              )}
              {selected.values.addPrice > 0 && (
                <li>
                  <strong>Additional Cost</strong> ({selected.values.addDesc}): $
                  {selected.values.addPrice}
                </li>
              )}
            </ul>
          </section>

          {/* Total Estimate */}
          <div
            style={{
              marginTop: '24px',
              fontSize: '1.2em',
              fontWeight: 'bold',
            }}
          >
            Total Estimate: ${selected.total}
          </div>
        </div>
      )}
    </div>
  );
}
