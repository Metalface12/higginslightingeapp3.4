// src/components/Pricing.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Pricing() {
  // … same state for vals, total, customer, but remove localStorage logic

  async function saveQuote() {
    import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ...
await addDoc(collection(db, 'quotes'), {
  customer,
  values: vals,
  total,
  date: new Date().toLocaleString()
});
    
    setMsg('Quote saved (shared)!');
  }

  return (
    <div> … same inputs … 
      <button onClick={saveQuote}>Save Quote</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
