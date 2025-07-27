// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Loaded quotes:', data);
        setQuotes(data);
      },
      err => console.error('Firestore error:', err)
    );
    return unsubscribe;
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Quotes List</h2>
      <ul>
        {quotes.map(q => (
          <li key={q.id}>
            {q.customer?.name || '(no name)'} — Total: ${q.total || 0}
            &nbsp;
            <button
              onClick={() => console.log('Details for quote:', q)}
              style={{ padding: '2px 6px', marginLeft: 8 }}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
