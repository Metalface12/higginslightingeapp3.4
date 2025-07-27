```jsx
// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const RATES = {
  'Haven Evolution': 60,
  'Haven Classic': 40,
  GlowFi: 25,
  Jasco: 15,
  'Christmas Lights Leasing': 8,
  'Christmas Lights Labor Only': 6
};

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      snapshot => setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      error => console.error('Error loading quotes:', error)
    );
    return unsubscribe;
  }, []);

  const filtered = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    return (
      q.customer?.name.toLowerCase().includes(term) ||
      q.customer?.email.toLowerCase().includes(term) ||
      q.total.toString().includes(term)
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Quotes</h2>
      <input
        type="text"
        placeholder="Search by name, email, total"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: 8, margin: '12px 0' }}
      />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map(quote => (
          <li
            key={quote.id}
            style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 4 }}
          >
            <div>
              📅 {quote.date} — {quote.customer?.name} — ${quote.total}
            </div>
            <button onClick={() => setSelectedQuote(quote)} style={{ marginTop: 8 }}>
              View Details
            </button>
          </li>
        ))}
      </ul>
      {selectedQuote && (
        <div
          style={{ position: 'fixed', top: '10%', left: '10%', right: '10%', bottom: '10%', background: '#fff', padding: 20, border: '1px solid #ccc' }}
        >
          <button onClick={() => setSelectedQuote(null)} style={{ float: 'right' }}>
            Close
          </button>
          <h3>Quote Details</h3>
          <p><strong>ID:</strong> {selectedQuote.id}</p>
          <p><strong>Date:</strong> {selectedQuote.date}</p>
          <h4>Customer</h4>
          <p>Name: {selectedQuote.customer.name}</p>
          <p>Address: {selectedQuote.customer.address}</p>
          <p>Email: {selectedQuote.customer.email}</p>
          <p>Phone: {selectedQuote.customer.phone}</p>
          <h4>Line Items</h4>
          <ul>
            <li>Roofline ({selectedQuote.values.roof}): {selectedQuote.values.feet} ft × ${RATES[selectedQuote.values.roof]} = {selectedQuote.values.feet * RATES[selectedQuote.values.roof]}</li>
            <li>Trees: {selectedQuote.values.treesCount} × ${selectedQuote.values.treesPrice}</li>
            <li>Bushes: {selectedQuote.values.bushesCount} × ${selectedQuote.values.bushesPrice}</li>
            <li>Ground Lights: {selectedQuote.values.ground} ft × $5 = {selectedQuote.values.ground * 5}</li>
            {selectedQuote.values.otherPrice > 0 && <li>Other ({selectedQuote.values.otherDesc}): ${selectedQuote.values.otherPrice}</li>}
            {selectedQuote.values.addPrice > 0 && <li>Additional Cost ({selectedQuote.values.addDesc}): ${selectedQuote.values.addPrice}</li>}
          </ul>
          <h4>Total Estimate: ${selectedQuote.total}</h4>
        </div>
      )}
    </div>
  );
}
```
