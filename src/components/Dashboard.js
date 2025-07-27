// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // subscribe to Firestore quotes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quotes'), snap => {
      setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // filter by name, email, or total
  const filtered = quotes.filter(q =>
    q.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    q.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    q.total.toString().includes(search)
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Main List */}
      <div style={{ opacity: selected ? 0.3 : 1, pointerEvents: selected ? 'none' : 'auto' }}>
        <h2>Admin Dashboard</h2>
        <input
          type="text"
          placeholder="Search by name, email or total"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        {filtered.length === 0 ? (
          <p>No quotes found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0074D9', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.date}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer.email}</td>
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
      </div>

      {/* Detail Panel */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              float: 'right',
              background: '#FF4136',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <h3>Quote Details</h3>
          <p><strong>Date:</strong> {selected.date}</p>
          <h4>Customer</h4>
          <p>
            <strong>Name:</strong> {selected.customer.name}<br />
            <strong>Address:</strong> {selected.customer.address}<br />
            <strong>Email:</strong> {selected.customer.email}<br />
            <strong>Phone:</strong> {selected.customer.phone}
          </p>
          <h4>Line Items</h4>
          <ul>
            {/* Roofline */}
            <li>
              Roofline ({selected.values.roof}):&nbsp;
              {selected.values.feet} ft × ${selected.values.roof.replace(/.*\$/,'')}
            </li>
            {/* Trees */}
            <li>
              Trees: {selected.values.treesCount} × ${selected.values.treesPrice}
            </li>
            {/* Bushes */}
            <li>
              Bushes: {selected.values.bushesCount} × ${selected.values.bushesPrice}
            </li>
            {/* Ground Lights */}
            <li>
              Ground Lights: {selected.values.ground} ft × $5
            </li>
            {/* Other */}
            {selected.values.otherPrice > 0 && (
              <li>
                Other ({selected.values.otherDesc}): ${selected.values.otherPrice}
              </li>
            )}
            {/* Additional Cost */}
            {selected.values.addPrice > 0 && (
              <li>
                Additional ({selected.values.addDesc}): ${selected.values.addPrice}
              </li>
            )}
          </ul>
          <h4>Total: ${selected.total}</h4>
        </div>
      )}
    </div>
  );
}
