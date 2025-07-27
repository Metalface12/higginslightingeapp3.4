import React, { useState, useEffect } from 'react';
import GPS from './components/GPS';
import Pricing from './components/Pricing';
import Uploads from './components/Uploads';
import Dashboard from './components/Dashboard';

export default function App() {
  const [tab, setTab] = useState('gps');

  // Pre-enable GPS prompt on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }
  }, []);

  const tabs = ['gps','pricing','uploads','dashboard'];
  return (
    <div>
      <header style={{ background: '#0074D9', padding: '10px', textAlign: 'center', color: '#fff' }}>
        <img src="/logo192.png" alt="Logo" style={{ height: 40 }} />
        <h1>Higgins Lighting App</h1>
      </header>
      <nav style={{ display: 'flex', justifyContent: 'center', background: '#001f3f', padding: '10px' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'active' : ''}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      <main style={{ padding: '20px' }}>
        {tab === 'gps' && <GPS />}
        {tab === 'pricing' && <Pricing />}
        {tab === 'uploads' && <Uploads />}
        {tab === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}
