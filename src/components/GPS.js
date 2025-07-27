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

// Default icon fix (still needed for popups)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const STATUS_OPTIONS = [
  'Not Home',
  'Left Info',
  'FollowUp',
  'Quoted',
  'Pending'
];

const STATUS_COLORS = {
  'Not Home': 'gray',
  'Left Info': 'blue',
  'FollowUp': 'orange',
  'Quoted': 'green',
  'Pending': 'yellow'
};

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  // On mount: prompt GPS and add initial marker
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setMarkers([{
          id: uuidv4(),
          lat: latitude,
          lng: longitude,
          status: 'Not Home'
        }]);
      },
      err => console.error('GPS error:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleMapClick = ({ lat, lng }) => {
    setMarkers(ms => [
      ...ms,
      { id: uuidv4(), lat, lng, status: 'Not Home' }
    ]);
  };

  const updateStatus = (id, newStatus) => {
    setMarkers(ms =>
      ms.map(m => m.id === id ? { ...m, status: newStatus } : m)
    );
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
        {markers.map(marker => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            pathOptions={{ color: STATUS_COLORS[marker.status], fillOpacity: 0.7 }}
            radius={10}
          >
            <Popup>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong>Status:</strong>
                <select
                  value={marker.status}
                  onChange={e => updateStatus(marker.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
