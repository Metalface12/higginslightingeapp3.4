import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';

// Fix for default marker icons in Create React App
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setMarkers([{ id: uuidv4(), lat: latitude, lng: longitude, status: 'Knocked' }]);
      },
      err => console.error('GPS error:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  // If no position yet, render a loading state
  if (!markers.length) {
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
        {markers.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>Status: {m.status}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
