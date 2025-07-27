```jsx
// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Roofline per-foot rates
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

  // Subscribe to Firestore "quotes" collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuotes(data);
      },
      (error) => console.error('Firestore error:', error)
    );
    return unsubscribe;
  }, []);

  // Filter logic
  const filteredQuotes = quotes.filter((quote) => {
    const term = searchTerm.toLowerCase();
    return (
      quote.customer?.name.toLowerCase().includes(term) ||
      quote.customer?.email.toLowerCase().includes(term) ||
      quote.total.toString().includes(term)
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Quotes</h2>
      <input
        type="text"
        placeholder="Search by name, email, or total"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: 8, margin: '12px 0' }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredQuotes.map((quote) => (
          <li
            key={quote.id}
            style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 4 }}
          >
            <div>
              📅 {quote.date} — <strong>{quote.customer.name}</strong> — ${quote.total}
            </div>
            <button
              onClick={() => setSelectedQuote(quote)}
              style={{
                marginTop: 6,
                padding: '4px 8px',
                background: '#0074D9',
                color: '#fff',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>

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
            borderRadius: 8,
            padding: 20,
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
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: 8 }}>Quote Details</h3>

          <p><strong>ID:</strong> {selectedQuote.id}</p>
          <p><strong>Date:</strong> {selectedQuote.date}</p>

          <section style={{ marginTop: 16 }}>
            <h4>Customer Info</h4>
            <p style={{ lineHeight: 1.6 }}>
              <strong>Name:</strong> {selectedQuote.customer.name}<br />
              <strong>Address:</strong> {selectedQuote.customer.address}<br />
              <strong>Email:</strong> {selectedQuote.customer.email}<br />
              <strong>Phone:</strong> {selectedQuote.customer.phone}
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h4>Line Items</h4>
            <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li>
                <strong>Roofline ({selectedQuote.values.roof})</strong>: {selectedQuote.values.feet} ft × ${RATES[selectedQuote.values.roof]} = ${(selectedQuote.values.feet) * RATES[selectedQuote.values.roof]}
              </li>
              <li>
                <strong>Trees:</strong> {selectedQuote.values.treesCount} × ${selectedQuote.values.treesPrice}
              </li>
              <li>
                <strong>Bushes:</strong> {selectedQuote.values.bushesCount} × ${selectedQuote.values.bushesPrice}
              </li>
              <li>
                <strong>Ground Lights:</strong> {selectedQuote.values.ground} ft × $5 = ${(selectedQuote.values.ground) * 5}
              </li>
              {selectedQuote.values.otherPrice > 0 && (
                <li>
                  <strong>Other ({selectedQuote.values.otherDesc}):</strong> ${selectedQuote.values.otherPrice}
                </li>
              )}
              {selectedQuote.values.addPrice > 0 && (
                <li>
                  <strong>Additional Cost ({selectedQuote.values.addDesc}):</strong> ${selectedQuote.values.addPrice}
                </li>
              )}
            </ul>
          </section>

          <div style={{ marginTop: 24, fontWeight: 'bold', fontSize: '1.1em' }}>
            Total Estimate: ${selectedQuote.total}
          </div>
        </div>
      )}
    </div>
  );
}
```
