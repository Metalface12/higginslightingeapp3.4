import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';

// Fix default Leaflet icon paths
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const STATUS_OPTIONS = ['Not Home','Left Info','FollowUp','Quoted','Pending'];
const STATUS_COLORS = {
  'Not Home': 'gray',
  'Left Info': 'blue',
  'FollowUp': 'orange',
  'Quoted': 'green',
  'Pending': 'yellow'
};

// Reverse‐geocode helper
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

// Handles map clicks
function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  // On mount: get user location and address
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const address = await fetchAddress(lat, lng);
      setMarkers([{ id: uuidv4(), lat, lng, status: 'Not Home', address }]);
    });
  }, []);

  // Add new marker on map click
  const handleMapClick = async ({ lat, lng }) => {
    const id = uuidv4();
    setMarkers(ms => [...ms, { id, lat, lng, status: 'Not Home', address: 'Loading...' }]);
    const address = await fetchAddress(lat, lng);
    setMarkers(ms => ms.map(m => m.id === id ? { ...m, address } : m));
  };

  // Change marker status
  const updateStatus = (id, newStatus) => {
    setMarkers(ms => ms.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  if (markers.length === 0) {
    return <p>Loading GPS location...</p>;
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
                <select value={m.status} onChange={e => updateStatus(m.id, e.target.value)}>
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
