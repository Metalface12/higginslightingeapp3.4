import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');

  // Load quotes from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('higgins_quotes') || '[]');
    setQuotes(stored);
  }, []);

  const filtered = quotes.filter(q =>
    q.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    q.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    q.total.toString().includes(search)
  );

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <input
        type="text"
        placeholder="Search by name, email or total"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
      />
      {filtered.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0074D9', color: 'white' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.date}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{q.customer.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>${q.total}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {/* Potential future: view details, delete, etc. */}
                  <button
                    onClick={() => alert(JSON.stringify(q, null, 2))}
                    style={{ padding: '4px 8px' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
