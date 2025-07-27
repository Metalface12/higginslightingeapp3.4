import React, { useState } from 'react';
import jsPDF from 'jspdf';

export default function Pricing() {
  const rates = {
    'Haven Evolution': 60,
    'Haven Classic': 40,
    GlowFi: 25,
    Jasco: 15,
    'Christmas Lights Leasing': 8,
    'Christmas Lights Labor Only': 6
  };
  const [values, setValues] = useState({
    feet: 0,
    roof: 'Haven Evolution',
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

  function calculate() {
    let t = 0;
    t += values.feet * rates[values.roof];
    t += values.treesCount * values.treesPrice;
    t += values.bushesCount * values.bushesPrice;
    t += values.ground * 5;
    t += values.otherPrice;
    t += values.addPrice;
    if (t < 200) t = 200;
    setTotal(t);
  }
  function genPDF() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Higgins Lighting Estimate', 20, 20);
    doc.setFontSize(12);
    doc.text(`Total: $${total}`, 20, 40);
    doc.save('estimate.pdf');
  }

  return (
    <div>
      <h2>Pricing Tool</h2>
      <div>
        <select
          value={values.roof}
          onChange={e => setValues({ ...values, roof: e.target.value })}
        >
          {Object.keys(rates).map(r => <option key={r}>{r}</option>)}
        </select>
        <input
          type="number"
          placeholder="Roofline Feet"
          onChange={e => setValues({ ...values, feet: +e.target.value })}
        />
      </div>
      {/* Trees */}
      <div>
        <input
          type="number"
          placeholder="# Trees"
          onChange={e => setValues({ ...values, treesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price/tree"
          onChange={e => setValues({ ...values, treesPrice: +e.target.value })}
        />
      </div>
      {/* Bushes */}
      <div>
        <input
          type="number"
          placeholder="# Bushes"
          onChange={e => setValues({ ...values, bushesCount: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price/bush"
          onChange={e => setValues({ ...values, bushesPrice: +e.target.value })}
        />
      </div>
      {/* Ground */}
      <div>
        <input
          type="number"
          placeholder="Ground Lights ft"
          onChange={e => setValues({ ...values, ground: +e.target.value })}
        />
      </div>
      {/* Other */}
      <div>
        <input
          type="text"
          placeholder="Other description"
          onChange={e => setValues({ ...values, otherDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Other price"
          onChange={e => setValues({ ...values, otherPrice: +e.target.value })}
        />
      </div>
      {/* Additional */}
      <div>
        <input
          type="text"
          placeholder="Additional description"
          onChange={e => setValues({ ...values, addDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Additional price"
          onChange={e => setValues({ ...values, addPrice: +e.target.value })}
        />
      </div>
      <button onClick={calculate}>Calculate Price</button>
      <p>Total: ${total}</p>
      <button onClick={genPDF}>Download PDF</button>
    </div>
  );
}
