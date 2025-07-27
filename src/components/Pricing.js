import React, { useState } from 'react';
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

  function calculate() {
    let t = 0;
    t += vals.feet * rates[vals.roof];
    t += vals.treesCount * vals.treesPrice;
    t += vals.bushesCount * vals.bushesPrice;
    t += vals.ground * 5;
    t += vals.otherPrice;
    t += vals.addPrice;
    if (t < 200) t = 200;
    setTotal(t);
    setMsg('');
  }

  function saveQuote() {
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
    const stored = JSON.parse(localStorage.getItem('higgins_quotes') || '[]');
    stored.push(quote);
    localStorage.setItem('higgins_quotes', JSON.stringify(stored));
    setMsg('Quote saved successfully!');
  }

  return (
    <div>
      <h2>Pricing Tool</h2>
      {/* Pricing inputs */}
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
          onChange={e => setVals({ ...vals, feet: +e.target.value })}
        />
      </div>
      <div>
        <label>Trees (# and $/tree):</label>
        <input
          type="number"
          placeholder="# Trees"
          onChange={e => setVals({ ...vals, treesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price per Tree"
          onChange={e => setVals({ ...vals, treesPrice: +e.target.value })}
        />
      </div>
      <div>
        <label>Bushes (# and $/bush):</label>
        <input
          type="number"
          placeholder="# Bushes"
          onChange={e => setVals({ ...vals, bushesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price per Bush"
          onChange={e => setVals({ ...vals, bushesPrice: +e.target.value })}
        />
      </div>
      <div>
        <label>Ground Lights (5$/ft):</label>
        <input
          type="number"
          placeholder="Feet"
          onChange={e => setVals({ ...vals, ground: +e.target.value })}
        />
      </div>
      <div>
        <label>Other:</label>
        <input
          type="text"
          placeholder="Description"
          onChange={e => setVals({ ...vals, otherDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          onChange={e => setVals({ ...vals, otherPrice: +e.target.value })}
        />
      </div>
      <div>
        <label>Additional Cost:</label>
        <input
          type="text"
          placeholder="Description"
          onChange={e => setVals({ ...vals, addDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          onChange={e => setVals({ ...vals, addPrice: +e.target.value })}
        />
      </div>

      <button onClick={calculate}>Calculate Price</button>
      <p>Total: ${total}</p>

      {/* Customer Info */}
      <h3>Customer Info</h3>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={customer.name}
          onChange={e => setCustomer({ ...customer, name: e.target.value })}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Address"
          value={customer.address}
          onChange={e => setCustomer({ ...customer, address: e.target.value })}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={customer.email}
          onChange={e => setCustomer({ ...customer, email: e.target.value })}
        />
      </div>
      <div>
        <input
          type="tel"
          placeholder="Phone #"
          value={customer.phone}
          onChange={e => setCustomer({ ...customer, phone: e.target.value })}
        />
      </div>

      <button onClick={saveQuote}>Save Quote</button>
      {msg && <p style={{ color: msg.includes('successfully') ? 'green' : 'red' }}>{msg}</p>}
    </div>
  );
}
