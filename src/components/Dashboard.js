```jsx
// src/components/Dashboard.js
import React, { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function Dashboard() {
  const [quotes, setQuotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Define per-foot rates
  const rates = {
    'Haven Evolution': 60,
    'Haven Classic': 40,
    GlowFi: 25,
    Jasco: 15,
    'Christmas Lights Leasing': 8,
    'Christmas Lights Labor Only': 6,
  }

  // Load quotes from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'quotes'),
      snapshot => setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      error => console.error('Error loading quotes:', error)
    )
    return unsubscribe
  }, [])

  // Filter logic
  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase()
    const name = q.customer?.name.toLowerCase() || ''
    const email = q.customer?.email.toLowerCase() || ''
    const total = q.total?.toString() || ''
    return name.includes(term) || email.includes(term) || total.includes(term)
  })

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

      {filteredQuotes.map(q => {
        // compute line-item totals
        const roofRate = rates[q.values.roof] || 0
        const roofTotal = (q.values.feet || 0) * roofRate
        const groundTotal = (q.values.ground || 0) * 5

        return (
          <div
            key={q.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: 16,
              marginBottom: 16,
              background: '#f9f9f9',
              color: '#000',
            }}
          >
            <p><strong>ID:</strong> {q.id}</p>
            <p><strong>Date:</strong> {q.date}</p>

            <h4>Customer Info</h4>
            <p style={{ margin: 0 }}><strong>Name:</strong> {q.customer.name}</p>
            <p style={{ margin: 0 }}><strong>Address:</strong> {q.customer.address}</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> {q.customer.email}</p>
            <p style={{ margin: 0, marginBottom: 8 }}><strong>Phone:</strong> {q.customer.phone}</p>

            <h4>Line Items</h4>
            <ul style={{ paddingLeft: 20, marginTop: 0, marginBottom: 8 }}>
              <li>
                <strong>Roofline ({q.values.roof}):</strong> {q.values.feet || 0} ft × ${roofRate} = ${roofTotal}
              </li>
              <li>
                <strong>Trees:</strong> {q.values.treesCount} × ${q.values.treesPrice}
              </li>
              <li>
                <strong>Bushes:</strong> {q.values.bushesCount} × ${q.values.bushesPrice}
              </li>
              <li>
                <strong>Ground Lights:</strong> {q.values.ground || 0} ft × $5 = ${groundTotal}
              </li>
              {q.values.otherPrice > 0 && (
                <li>
                  <strong>Other ({q.values.otherDesc}):</strong> ${q.values.otherPrice}
                </li>
              )}
              {q.values.addPrice > 0 && (
                <li>
                  <strong>Additional Cost ({q.values.addDesc}):</strong> ${q.values.addPrice}
                </li>
              )}
            </ul>

            <p style={{ fontSize: '1.1em', fontWeight: 'bold', margin: 0 }}>
              Total Estimate: ${q.total}
            </p>
          </div>
        )
      })}
    </div>
  )
}
```
