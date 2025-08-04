import { useEffect, useRef } from 'react';
import { Map, setAPIKey } from '@trimblemaps/trimblemaps-js';

const stops = [
  { lat: 40.7128, lon: -74.006, label: 'NYC' },
  { lat: 41.2033, lon: -77.1945, label: 'PA' },
  { lat: 34.0522, lon: -118.2437, label: 'LA' },
  { lat: 36.1699, lon: -115.1398, label: 'Vegas' },
];

const MapLayout = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    setAPIKey(import.meta.env.VITE_API_URL);

    const map = new Map({
      container: mapRef.current,
      center: [stops[0].lon, stops[0].lat],
      zoom: 6,
    });

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      id="map"
      ref={mapRef}
      style={{ width: '100%', height: '600px' }} // 👈 MUST have dimensions
    />
  );
};

export default MapLayout;
