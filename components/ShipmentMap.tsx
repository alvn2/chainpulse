"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/711/711224.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Coordinate dictionary for Kenyan hubs
const LOCATIONS: Record<string, [number, number]> = {
  'Naivasha Farm': [-0.7143, 36.4311],
  'Naivasha': [-0.7143, 36.4311],
  'Nairobi': [-1.2921, 36.8219],
  'JKIA Export Hub': [-1.3192, 36.9275],
  'JKIA': [-1.3192, 36.9275],
  'Mombasa Port': [-4.0435, 39.6682],
  'Eldoret Hub': [0.5143, 35.2698],
  'Kisumu Hub': [-0.0917, 34.7680]
};

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219]; // Nairobi

type ShipmentMapProps = {
  origin: string;
  destination: string;
  progress: number;
  shipmentId: string;
  status: string;
};

export default function ShipmentMap({ origin, destination, progress, shipmentId, status }: ShipmentMapProps) {
  const originCoords = LOCATIONS[origin] || LOCATIONS['Naivasha Farm'];
  const destCoords = LOCATIONS[destination] || LOCATIONS['JKIA Export Hub'];

  // Calculate truck position based on progress
  const latDiff = destCoords[0] - originCoords[0];
  const lngDiff = destCoords[1] - originCoords[1];
  const currentLat = originCoords[0] + (latDiff * (progress / 100));
  const currentLng = originCoords[1] + (lngDiff * (progress / 100));
  const currentCoords: [number, number] = [currentLat, currentLng];

  // Bounds to fit both origin and destination
  const bounds = L.latLngBounds(originCoords, destCoords);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        bounds={bounds} 
        zoom={7} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0a0a0a' }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Route Line */}
        <Polyline 
          positions={[originCoords, destCoords]} 
          pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.5, dashArray: '5, 10' }} 
        />
        <Polyline 
          positions={[originCoords, currentCoords]} 
          pathOptions={{ color: status === 'BREACH' ? '#ef4444' : '#10b981', weight: 4 }} 
        />

        {/* Origin Marker */}
        <Marker position={originCoords}>
          <Popup>
            <div className="font-mono text-xs font-bold text-black">{origin} (Origin)</div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destCoords}>
          <Popup>
            <div className="font-mono text-xs font-bold text-black">{destination} (Destination)</div>
          </Popup>
        </Marker>

        {/* Truck Marker */}
        {progress > 0 && progress < 100 && (
          <Marker position={currentCoords} icon={truckIcon}>
            <Popup>
              <div className="font-mono text-xs font-bold text-black">
                {shipmentId}
                <br />
                Status: {status}
                <br />
                Progress: {progress}%
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
