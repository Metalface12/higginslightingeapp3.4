import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { v4 as uuidv4 } from 'uuid';

export default function GPS() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setMarkers([{ id: uuidv4(), lat: latitude, lng: longitude, status: 'Knocked' }]);
    });
  }, []);

  return (
    <div>
      <h2>Door‑to‑Door GPS Tracking</h2>
      <MapContainer
        center={[markers[0]?.lat || 0, markers[0]?.lng || 0]}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>Status: {m.status}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
