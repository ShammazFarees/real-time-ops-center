import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';
import { Incident } from '../types/incident';

// Custom Marker Icons factory
const createCustomIcon = (severity: string, isSelected: boolean) => {
  let color = '#3b82f6';
  let pulseClass = '';

  if (severity === 'CRITICAL') {
    color = '#ef4444';
    pulseClass = 'marker-pulse-critical';
  } else if (severity === 'HIGH') {
    color = '#f97316';
  } else if (severity === 'MEDIUM') {
    color = '#eab308';
  }

  const border = isSelected ? '3px solid #06b6d4' : '2px solid #ffffff';
  const scale = isSelected ? 'scale(1.25)' : 'scale(1)';

  const html = `
    <div style="
      width: 24px;
      height: 24px;
      background-color: ${color};
      border-radius: 50%;
      border: ${border};
      box-shadow: 0 0 12px ${color};
      transform: ${scale};
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    " class="${pulseClass}">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Component to handle map re-centering when selected incident changes
const MapRecenter: React.FC<{ selectedIncident: Incident | null }> = ({ selectedIncident }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident && selectedIncident.location?.coordinates) {
      const [lng, lat] = selectedIncident.location.coordinates;
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [selectedIncident, map]);

  return null;
};

export const IncidentMap: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident } = useSocket();

  // Default initial map center (Islamabad / Rawalpindi Metropolitan Area, Pakistan)
  const defaultCenter: [number, number] = [33.6844, 73.0479];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex-1 bg-dark-900 overflow-hidden">
      {/* Overlay Radar Graphic */}
      <div className="absolute top-4 left-4 z-[400] bg-dark-800/90 backdrop-blur border border-dark-700 p-2.5 rounded-lg shadow-xl font-mono text-xs text-slate-300 pointer-events-none flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
        <span>GEOSPATIAL RADAR SCANNER ACTIVE</span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter selectedIncident={selectedIncident} />

        {incidents.map(inc => {
          if (!inc.location?.coordinates || inc.location.coordinates.length < 2) return null;
          const [lng, lat] = inc.location.coordinates;
          const isSelected = selectedIncident?.incidentId === inc.incidentId;

          return (
            <Marker
              key={inc.incidentId}
              position={[lat, lng]}
              icon={createCustomIcon(inc.severity, isSelected)}
              eventHandlers={{
                click: () => setSelectedIncident(inc)
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold text-slate-100 mb-1">{inc.title}</div>
                  <div className="text-slate-300 font-mono text-[11px] mb-1">
                    Severity: <span className="font-bold text-cyan-400">{inc.severity}</span> | {inc.category}
                  </div>
                  <div className="text-slate-400 text-[10px] line-clamp-2">{inc.rawPayload}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
