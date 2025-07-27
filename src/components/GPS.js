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
  updateDoc,
  doc
} from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';

// Leaflet default icon fix
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from    'leaflet/dist/images/marker-icon.png';
import shadowUrl from  'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const STATUS_OPTIONS = ['Not Home','Left Info','FollowUp','Quoted','Pending'];
const STATUS_COLORS  = {
  'Not Home':  'gray',
  'Left Info': 'blue',
  'FollowUp':  'orange',
  'Quoted':    'green',
  'Pending':   'yellow'
};

// reverse‐geocode helper
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

// map click handler
function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  // Subscribe to Firestore
  useEffect(() => {
    const q = query(collection(db, 'markers'));
    const unsub = onSnapshot(q, snap => {
      setMarkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // On mount: add initial marker only if none exist
  useEffect(() => {
    (async () => {
      const col = collection(db, 'markers');
      const existing = await getDocs(col);
      if (!existing.empty) return;
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await fetchAddress(lat, lng);
        await addDoc(col, { lat, lng, status: 'Not Home', address });
      });
    })();
  }, []);

  // Add a new marker
  const handleMapClick = async ({ lat, lng }) => {
    const address = await fetchAddress(lat, lng);
    await addDoc(collection(db, 'markers'), {
      lat, lng,
      status: 'Not Home',
      address
    });
  };

  // Update status
  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, 'markers', id);
    await updateDoc(ref, { status: newStatus });
  };

  // Delete marker
  const deleteMarker = async id => {
    await deleteDoc(doc(db, 'markers', id));
  };

  if (!markers.length) return <p>Loading GPS location…</p>;

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
            <Popup
              closeOnClick={false}
              autoClose={false}
            >
              {/* Stop clicks here from bubbling to the map */}
              <div onClick={e => e.stopPropagation()}>
                <strong>Address:</strong>
                <div style={{ fontSize: '0.9em', marginBottom: 8 }}>{m.address}</div>

                <strong>Status:</strong>
                <select
                  value={m.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStatus(m.id, e.target.value)}
                  style={{ marginBottom: 8 }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteMarker(m.id);
                  }}
                  style={{
                    display: 'block',
                    marginTop: 8,
                    backgroundColor: '#FF4136',
                    color: '#fff',
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
