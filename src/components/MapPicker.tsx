// components/MapPicker.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';

// Define interface for the Icon prototype with the internal method
interface IconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

// Fix for default Leaflet icon path issues with Webpack
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  initialPosition?: LatLngTuple | null;
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

const DEFAULT_CENTER: LatLngTuple = [-7.7956, 110.3695]; // Yogyakarta
const DEFAULT_ZOOM = 13;

const LocationMarker: React.FC<{
  position: LatLngTuple | null;
  setPosition: (pos: LatLngTuple) => void;
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onPositionChange }) => {
  const map = useMapEvents({
    click(e) {
      const newPos: LatLngTuple = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onPositionChange(newPos[0], newPos[1]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const ChangeView: React.FC<{ center: LatLngTuple; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({
  initialPosition,
  onPositionChange,
  height = '300px',
}) => {
  const [markerPosition, setMarkerPosition] = useState<LatLngTuple | null>(initialPosition || null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(initialPosition || DEFAULT_CENTER);

  useEffect(() => {
    if (initialPosition && (!markerPosition || initialPosition[0] !== markerPosition[0] || initialPosition[1] !== markerPosition[1])) {
      setMarkerPosition(initialPosition);
      setMapCenter(initialPosition);
    } else if (!initialPosition && markerPosition) {
        // If initial position becomes null, clear marker
        // setMarkerPosition(null); // Or keep current if preferred
    }
  }, [initialPosition, markerPosition]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      style={{ height, width: '100%', borderRadius: '0.75rem', border: '1px solid #4B5563' }} // Tailwind gray-600
    >
      <ChangeView center={mapCenter} zoom={DEFAULT_ZOOM} />
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        position={markerPosition}
        setPosition={setMarkerPosition}
        onPositionChange={onPositionChange}
      />
    </MapContainer>
  );
};

export default MapPicker;