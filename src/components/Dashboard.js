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

  // Listen to Firestore 'quotes'
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuotes(data);
      },
      (error) => console.error('Error loading quotes:', error)
    );
    return unsubscribe;
  }, []);

  // Filter by customer name, email, or total
  const filteredQuotes = quotes.filter(quote => {
    const term = searchTerm.toLowerCase();
    const name = quote.customer?.name?.toLowerCase() || '';
    const email = quote.customer?.email?.toLowerCase() || '';
    const total = quote.total?.toString() || '';
    return (
      name.includes(term) ||
      email.includes(term) ||
      total.includes(term)
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Quotes Dashboard</h2>
      <input
        type="search"
        placeholder="Search by name, email, or total"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 20, fontSize: 16 }}
      />
      {filteredQuotes.map(quote => (
        <div
          key={quote.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: 16,
            marginBottom: 16,
            background: '#f9f9f9'
          }}
        >
          <p><strong>ID:</strong> {quote.id}</p>
          <p><strong>Date:</strong> {quote.date}</p>

          <h4>Customer Info</h4>
          <p style={{ margin: 0 }}><strong>Name:</strong> {quote.customer.name}</p>
          <p style={{ margin: 0 }}><strong>Address:</strong> {quote.customer.address}</p>
          <p style={{ margin: 0 }}><strong>Email:</strong> {quote.customer.email}</p>
          <p style={{ margin: 0, marginBottom: 8 }}><strong>Phone:</strong> {quote.customer.phone}</p>

          <h4>Line Items</h4>
          <ul style={{ paddingLeft: 20, marginTop: 0, marginBottom: 8 }}>
            <li>
              <strong>Roofline ({quote.values.roof}):</strong> {quote.values.feet} ft × ${RATES[quote.values.roof]} = ${(quote.values.feet || 0) * RATES[quote.values.roof]}
            </li>
            <li>
              <strong>Trees:</strong> {quote.values.treesCount} × ${quote.values.treesPrice}
            </li>
            <li>
              <strong>Bushes:</strong> {quote.values.bushesCount} × ${quote.values.bushesPrice}
            </li>
            <li>
              <strong>Ground Lights:</strong> {quote.values.ground} ft × $5 = {(quote.values.ground || 0) * 5}
            </li>
            {quote.values.otherPrice > 0 && (
              <li>
                <strong>Other ({quote.values.otherDesc}):</strong> ${quote.values.otherPrice}
              </li>
            )}
            {quote.values.addPrice > 0 && (
              <li>
                <strong>Additional Cost ({quote.values.addDesc}):</strong> ${quote.values.addPrice}
              </li>
            )}
          </ul>

          <p style={{ fontSize: '1.1em', fontWeight: 'bold', margin: 0 }}>
            Total Estimate: ${quote.total}
          </p>
        </div>
      ))}
    </div>
  );
}
```
