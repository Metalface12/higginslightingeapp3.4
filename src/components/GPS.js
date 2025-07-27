// src/components/GPS.js
import React, { useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc
} from 'firebase/firestore';

// … (leaflet icon fix code stays the same)

const STATUS_OPTIONS = ['Not Home','Left Info','FollowUp','Quoted','Pending'];
const STATUS_COLORS = { /* same as before */ };

function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  // 1) Subscribe to Firestore collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'markers'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMarkers(data);
    });
    return unsub;
  }, []);

  // 2) Add marker
  const handleMapClick = async ({ lat, lng }) => {
    await addDoc(collection(db, 'markers'), {
      lat, lng,
      status: 'Not Home',
      address: 'Loading…'
    });
  };

  // 3) Update status
  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, 'markers', id);
    await updateDoc(ref, { status: newStatus });
  };

  // 4) Delete marker
  const deleteMarker = async id => {
    await deleteDoc(doc(db, 'markers', id));
  };

  // 5) Reverse‑geocode on initial add (could be done via Cloud Function, or client)
  //    For brevity assume address is set on creation (you can add fetchAddress there).

  if (!markers.length) return <p>Loading markers…</p>;

  return (
    <div>
      <h2>Door‑to‑Door GPS Tracking (shared)</h2>
      <MapContainer
        center={[markers[0].lat, markers[0].lng]}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ClickHandler onMapClick={handleMapClick} />
        {markers.map(m => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            pathOptions={{ color: STATUS_COLORS[m.status], fillOpacity: 0.7 }}
            radius={10}
          >
            <Popup>
              <strong>Address:</strong><br/>{m.address}<hr/>
              <label>Status:</label>
              <select
                value={m.status}
                onChange={e => updateStatus(m.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                style={{
                  marginTop: '8px',
                  padding: '6px',
                  background: '#FF4136',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px'
                }}
                onClick={() => deleteMarker(m.id)}
              >
                Delete
              </button>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
