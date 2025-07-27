// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [quotes, setQuotes]   = useState([]);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  // Subscribe to Firestore "quotes" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quotes'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Loaded quotes:', data);
      setQuotes(data);
    });
    return unsub;
  }, []);

  // Filter logic
  const filtered = quotes.filter(q =>
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
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />

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
            {filtered.map(q => (
              <tr key={q.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.date}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer?.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer?.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>${q.total}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => {
                      console.log('Viewing quote details:', q);
                      setSelected(q);
                    }}
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          <h3>Quote Details</h3>

          {/* DEBUG: show raw JSON so you can see what fields you actually have */}
          <pre
            style={{
              background: '#f4f4f4',
              padding: '10px',
              borderRadius: '4px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}
          >
            {JSON.stringify(selected, null, 2)}
          </pre>

          {/* Once you confirm the structure above, uncomment and format the fields you need below */}
          {selected.customer && (
            <>
              <h4>Customer Info</h4>
              <p>
                <strong>Name:</strong> {selected.customer.name}<br/>
                <strong>Address:</strong> {selected.customer.address}<br/>
                <strong>Email:</strong> {selected.customer.email}<br/>
                <strong>Phone:</strong> {selected.customer.phone}
              </p>
            </>
          )}

          {selected.values && (
            <>
              <h4>Line Items</h4>
              <ul>
                <li>
                  Roofline ({selected.values.roof}): {selected.values.feet} ft × 
                  ${selected.values.roofPrice /* if you store roofPrice separately */ || '…'}
                </li>
                <li>
                  Trees: {selected.values.treesCount} × ${selected.values.treesPrice}
                </li>
                <li>
                  Bushes: {selected.values.bushesCount} × ${selected.values.bushesPrice}
                </li>
                <li>
                  Ground Lights: {selected.values.ground} ft × $5
                </li>
                {selected.values.otherPrice > 0 && (
                  <li>Other ({selected.values.otherDesc}): ${selected.values.otherPrice}</li>
                )}
                {selected.values.addPrice > 0 && (
                  <li>Additional ({selected.values.addDesc}): ${selected.values.addPrice}</li>
                )}
              </ul>
            </>
          )}

          <h4>Total: ${selected.total}</h4>
        </div>
      )}
    </div>
  );
}
