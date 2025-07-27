// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quotes'), snap => {
      setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filtered = quotes.filter(q =>
    q.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    q.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    q.total.toString().includes(search)
  );

  return (
    <div>
      <h2>Admin Dashboard (shared)</h2>
      <input
        placeholder="Search…"
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      {filtered.map(q => (
        <div key={q.id} style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
          <strong>{q.customer.name}</strong> – ${q.total}<br/>
          {q.customer.email} | {q.date}
        </div>
      ))}
    </div>
  );
}
