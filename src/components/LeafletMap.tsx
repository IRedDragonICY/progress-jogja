'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Address {
  id: string;
  text: string;
  latitude: number;
  longitude: number;
  notes: string;
}

interface LeafletMapProps {
  locations: Address[];
}

const LeafletMap: React.FC<LeafletMapProps> = ({ locations }) => {
  useEffect(() => {
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      document.head.appendChild(link);
    }

    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    return () => {
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (existingLink && existingLink.parentNode) {
        existingLink.parentNode.removeChild(existingLink);
      }
    };
  }, []);

  // Calculate center point
  const centerLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-red-500/20 shadow-2xl">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
        attributionControl={false}
        zoomControl={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-48">
                <h4 className="font-bold text-lg text-gray-900 mb-2">{location.notes}</h4>
                <p className="text-gray-700 text-sm mb-3">{location.text}</p>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors w-full"
                >
                  Buka di Google Maps
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap; 