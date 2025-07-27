// src/components/Pricing.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function Pricing() {
  const rates = {
    'Haven Evolution': 60,
    'Haven Classic': 40,
    GlowFi: 25,
    Jasco: 15,
    'Christmas Lights Leasing': 8,
    'Christmas Lights Labor Only': 6
  };

  const [vals, setVals] = useState({
    roof: 'Haven Evolution',
    feet: 0,
    treesCount: 0,
    treesPrice: 0,
    bushesCount: 0,
    bushesPrice: 0,
    ground: 0,
    otherDesc: '',
    otherPrice: 0,
    addDesc: '',
    addPrice: 0
  });
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    email: '',
    phone: ''
  });
  const [msg, setMsg] = useState('');

  const calculate = () => {
    let t = 0;
    t += vals.feet * rates[vals.roof];
    t += vals.treesCount * vals.treesPrice;
    t += vals.bushesCount * vals.bushesPrice;
    t += vals.ground * 5;
    if (vals.otherPrice > 0) t += vals.otherPrice;
    if (vals.addPrice > 0) t += vals.addPrice;
    if (t < 200) t = 200;
    setTotal(t);
    setMsg('');
  };

  const saveQuote = async () => {
    if (!customer.name || !customer.email) {
      setMsg('Please enter at least Name and Email.');
      return;
    }
    const quote = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      customer,
      values: vals,
      total
    };
    try {
      await addDoc(collection(db, 'quotes'), quote);
      setMsg('Quote saved successfully!');
    } catch (e) {
      console.error('Error saving quote:', e);
      setMsg('Error saving quote.');
    }
  };

  return (
    <div>
      <h2>Pricing Tool</h2>

      {/* Roofline */}
      <div>
        <label>Roofline:</label>
        <select
          value={vals.roof}
          onChange={e => setVals({ ...vals, roof: e.target.value })}
        >
          {Object.keys(rates).map(r => (
            <option key={r} value={r}>
              {r} (${rates[r]}/ft)
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Feet"
          value={vals.feet}
          onChange={e => setVals({ ...vals, feet: +e.target.value })}
        />
      </div>

      {/* Trees */}
      <div>
        <label>Trees:</label>
        <input
          type="number"
          placeholder="# Trees"
          value={vals.treesCount}
          onChange={e => setVals({ ...vals, treesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price/tree"
          value={vals.treesPrice}
          onChange={e => setVals({ ...vals, treesPrice: +e.target.value })}
        />
      </div>

      {/* Bushes */}
      <div>
        <label>Bushes:</label>
        <input
          type="number"
          placeholder="# Bushes"
          value={vals.bushesCount}
          onChange={e => setVals({ ...vals, bushesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price/bush"
          value={vals.bushesPrice}
          onChange={e => setVals({ ...vals, bushesPrice: +e.target.value })}
        />
      </div>

      {/* Ground Lights */}
      <div>
        <label>Ground Lights (5$/ft):</label>
        <input
          type="number"
          placeholder="Feet"
          value={vals.ground}
          onChange={e => setVals({ ...vals, ground: +e.target.value })}
        />
      </div>

      {/* Other */}
      <div>
        <label>Other:</label>
        <input
          type="text"
          placeholder="Description"
          value={vals.otherDesc}
          onChange={e => setVals({ ...vals, otherDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={vals.otherPrice}
          onChange={e => setVals({ ...vals, otherPrice: +e.target.value })}
        />
      </div>

      {/* Additional Cost */}
      <div>
        <label>Additional Cost:</label>
        <input
          type="text"
          placeholder="Description"
          value={vals.addDesc}
          onChange={e => setVals({ ...vals, addDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={vals.addPrice}
          onChange={e => setVals({ ...vals, addPrice: +e.target.value })}
        />
      </div>

      <button onClick={calculate}>Calculate Price</button>
      <p>Total: ${total}</p>

      <h3>Customer Info</h3>
      <input
        type="text"
        placeholder="Name"
        value={customer.name}
        onChange={e => setCustomer({ ...customer, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Address"
        value={customer.address}
        onChange={e => setCustomer({ ...customer, address: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={customer.email}
        onChange={e => setCustomer({ ...customer, email: e.target.value })}
      />
      <input
        type="tel"
        placeholder="Phone #"
        value={customer.phone}
        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
      />

      <button onClick={saveQuote}>Save Quote</button>
      {msg && (
        <p style={{ color: msg.includes('successfully') ? 'green' : 'red' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
