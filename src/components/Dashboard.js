// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState(null);

  // Listen to Firestore 'quotes'
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'quotes'),
      snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('💾 Loaded quotes:', data);
        setQuotes(data);
      },
      err => console.error('Firestore error:', err)
    );
    return unsub;
  }, []);

  // If none selected, show list; else show raw JSON
  return (
    <div style={{ padding: 20 }}>
      {!selected ? (
        <>
          <h2>Quotes List</h2>
          <ul>
            {quotes.map((q) => (
              <li key={q.id} style={{ margin: '8px 0' }}>
                📅 {q.date || '–'} – {q.customer?.name || '–'} – ${q.total}
                {' '}
                <button onClick={() => setSelected(q)}>View Details</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)}>◀ Back to list</button>
          <h2>Raw Quote Data</h2>
          <pre style={{
            background: '#f0f0f0',
            padding: '12px',
            borderRadius: 4,
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            {JSON.stringify(selected, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
