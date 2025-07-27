import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';

// Leaflet icon fix for CRA
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from    'leaflet/dist/images/marker-icon.png';
import shadowUrl from  'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const STATUS_OPTIONS = ['Not Home','Left Info','FollowUp','Quoted','Pending'];
const STATUS_COLORS = {
  'Not Home':  'gray',
  'Left Info': 'blue',
  'FollowUp':  'orange',
  'Quoted':    'green',
  'Pending':   'yellow'
};

// Reverse‐geocode helper (same as before)
async function fetchAddress(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || 'Unknown address';
  } catch {
    return 'Unable to fetch address';
  }
}

// Capture map clicks
function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  // 1) Subscribe to Firestore markers collection
  useEffect(() => {
    const q = query(collection(db, 'markers'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMarkers(data);
    });
    return unsub;
  }, []);

  // 2) On mount: add your current-location marker *once* if the collection is empty
  useEffect(() => {
    (async () => {
      if (!navigator.geolocation) return;
      // Only add if no markers exist yet
      const existing = await getDocs(collection(db, 'markers'));
      if (!existing.empty) return;

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const address = await fetchAddress(lat, lng);
          await addDoc(collection(db, 'markers'), {
            lat,
            lng,
            status: 'Not Home',
            address
          });
        },
        err => console.error('GPS error:', err),
        { enableHighAccuracy: true }
      );
    })();
  }, []);

  // 3) Add a new marker on map click
  const handleMapClick = async ({ lat, lng }) => {
    const id = uuidv4();
    await addDoc(collection(db, 'markers'), {
      lat,
      lng,
      status: 'Not Home',
      address: await fetchAddress(lat, lng)
    });
  };

  // 4) Update marker status
  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, 'markers', id);
    await ref.update({ status: newStatus });
  };

  // 5) Delete marker
  const deleteMarker = async id => {
    await deleteDoc(doc(db, 'markers', id));
  };

  if (markers.length === 0) {
    return <p>Loading GPS location…</p>;
  }

  return (
    <div>
      <h2>Door‑to‑Door GPS Tracking</h2>
      <MapContainer
        center={[markers[0].lat, markers[0].lng]}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
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
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      <strong>Address:</strong>
      <span style={{ fontSize:'0.9em' }}>{m.address}</span>
      <strong>Status:</strong>
      <select
        value={m.status}
        onChange={e => updateStatus(m.id, e.target.value)}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button
       onClick={e => {
         e.preventDefault();
         e.stopPropagation();
         deleteMarker(m.id);
       }}
        style={{
          marginTop: '8px',
          backgroundColor: '#FF4136',
          color: 'white',
          border: 'none',
          padding: '6px',
          borderRadius: '4px'
        }}
      >
        Delete Marker
      </button>
    </div>
  </Popup>
</CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
