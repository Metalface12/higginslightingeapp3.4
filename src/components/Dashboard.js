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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      (snapshot) => setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error('Firestore error:', error)
    );
    return unsubscribe;
  }, []);

  // Filter by name, email, or total
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
        placeholder="Search by customer or total"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: 8, margin: '12px 0' }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((item) => (
          <li key={item.id} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, marginBottom: 12 }}>
            <div>
              📅 {item.date} — <strong>{item.customer.name}</strong> — ${item.total}
            </div>
            <button
              onClick={() => setSelectedQuote(item)}
              style={{ marginTop: 8, padding: '6px 12px', background: '#0074D9', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>

      {selectedQuote && (
        <div
          style={{
            position: 'fixed', top: '10%', left: '10%', right: '10%', bottom: '10%',
            background: '#fff', border: '1px solid #ccc', borderRadius: 8,
            padding: 24, overflowY: 'auto', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <button
            onClick={() => setSelectedQuote(null)}
            style={{ float: 'right', background: '#FF4136', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}
          >Close</button>

          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: 8 }}>Quote Details</h3>

          <p><strong>ID:</strong> {selectedQuote.id}</p>
          <p><strong>Date:</strong> {selectedQuote.date}</p>

          <section style={{ marginTop: 16 }}>
            <h4>Customer</h4>
            <p>Name: {selectedQuote.customer.name}</p>
            <p>Address: {selectedQuote.customer.address}</p>
            <p>Email: {selectedQuote.customer.email}</p>
            <p>Phone: {selectedQuote.customer.phone}</p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h4>Line Items</h4>
            <ul style={{ paddingLeft: 20 }}>
              <li>Roofline ({selectedQuote.values.roof}): {selectedQuote.values.feet} ft × ${RATES[selectedQuote.values.roof]} = ${(selectedQuote.values.feet) * RATES[selectedQuote.values.roof]}</li>
              <li>Trees: {selectedQuote.values.treesCount} × ${selectedQuote.values.treesPrice}</li>
              <li>Bushes: {selectedQuote.values.bushesCount} × ${selectedQuote.values.bushesPrice}</li>
              <li>Ground Lights: {selectedQuote.values.ground} ft × $5 = ${(selectedQuote.values.ground) * 5}</li>
              {selectedQuote.values.otherPrice > 0 && <li>Other ({selectedQuote.values.otherDesc}): ${selectedQuote.values.otherPrice}</li>}
              {sele
