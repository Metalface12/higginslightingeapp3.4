import React, { useState } from 'react';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const filtered = jobs.filter(
    j => j.email?.includes(query) || j.total?.toString().includes(query)
  );
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <input
        placeholder="Search by email or total"
        onChange={e => setQuery(e.target.value)}
      />
      <table>
        <thead>
          <tr><th>Email</th><th>Total</th></tr>
        </thead>
        <tbody>
          {filtered.map((job, i) => (
            <tr key={i}>
              <td>{job.email}</td>
              <td>${job.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
