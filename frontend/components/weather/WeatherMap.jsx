'use client';

import React, { useEffect, useRef, useState } from 'react';

const GEO_NODES = [
  {
    id: 'resort',
    name: 'Azure Bay Resort & Villas',
    category: 'Resort Property',
    lat: 15.2993,
    lng: 74.124,
    icon: '🏨',
    color: '#0d9488',
    description: '45 inventory keys, 4 VIP villas, central HVAC system, outdoor infinity pool & beach bar.',
  },
  {
    id: 'airport',
    name: 'Goa Dabolim Airport (GOI)',
    category: 'Aviation Hub',
    lat: 15.3808,
    lng: 73.8312,
    icon: '✈️',
    color: '#f59e0b',
    description: 'Primary guest arrival conduit (32 km). Subject to NH66 coastal highway waterlogging in heavy monsoon bursts.',
  },
  {
    id: 'panaji',
    name: 'Panaji Urban Corridor',
    category: 'Supply & Civic Hub',
    lat: 15.4989,
    lng: 73.8278,
    icon: '🏛️',
    color: '#6366f1',
    description: 'Specialist HVAC contractor dispatch point and linen vendor central depot.',
  },
  {
    id: 'beach',
    name: 'Benaulim Beach Strip',
    category: 'Guest Excursion Zone',
    lat: 15.25,
    lng: 73.91,
    icon: '🏖️',
    color: '#ec4899',
    description: 'Beach cabanas, watersports & outdoor dining. High vulnerability to squall and rainfall events.',
  },
];

const OWM_KEY = '1635890195c2a384d84e0e9ebb3d7eb3';

const LAYERS = [
  { id: 'precipitation_new', label: '🌧 Rain', desc: 'Rainfall intensity' },
  { id: 'clouds_new', label: '☁️ Clouds', desc: 'Cloud coverage' },
  { id: 'wind_new', label: '💨 Wind', desc: 'Wind speed & direction' },
  { id: 'temp_new', label: '🌡 Temp', desc: 'Surface temperature' },
];

export default function WeatherMap({ weather, severity, onNodeSelect, selectedNodeId }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const owmLayerRef = useRef(null);
  const corridorRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState('precipitation_new');
  const [mapReady, setMapReady] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const getSeverityColor = () => {
    if (severity === 'EXTREME') return '#dc2626';
    if (severity === 'HIGH') return '#f59e0b';
    if (severity === 'MEDIUM') return '#eab308';
    return '#10b981';
  };

  const getSeverityBg = () => {
    if (severity === 'EXTREME') return 'bg-red-600 text-white border-red-500';
    if (severity === 'HIGH') return 'bg-amber-500 text-white border-amber-400';
    if (severity === 'MEDIUM') return 'bg-yellow-400 text-gray-900 border-yellow-300';
    return 'bg-emerald-500 text-white border-emerald-400';
  };

  // Load Leaflet from CDN and initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || leafletMapRef.current) return;

    const initLeaflet = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;

      // Initialize map centered on South Goa
      const map = L.map(mapRef.current, {
        center: [15.32, 73.97],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      });

      leafletMapRef.current = map;

      // Esri World Imagery (free satellite tiles, no key needed)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18,
        }
      ).addTo(map);

      // Esri labels on top of satellite
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          opacity: 0.7,
          maxZoom: 18,
        }
      ).addTo(map);

      // Add OWM weather layer
      addOwmLayer(map, 'precipitation_new');

      // Add airport → resort corridor polyline
      const corrLine = L.polyline(
        [[15.3808, 73.8312], [15.2993, 74.124]],
        {
          color: '#0d9488',
          weight: 2.5,
          opacity: 0.85,
          dashArray: null,
        }
      ).addTo(map);
      corridorRef.current.push(corrLine);

      // Panaji supply route
      const supplyLine = L.polyline(
        [[15.4989, 73.8278], [15.2993, 74.124]],
        {
          color: '#6366f1',
          weight: 1.5,
          opacity: 0.6,
          dashArray: '5, 8',
        }
      ).addTo(map);
      corridorRef.current.push(supplyLine);

      // Add markers
      GEO_NODES.forEach((node) => {
        const isResort = node.id === 'resort';
        const markerHtml = `
          <div style="
            background: ${node.color};
            width: ${isResort ? '40px' : '34px'};
            height: ${isResort ? '40px' : '34px'};
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isResort ? '18px' : '15px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
            ${isResort ? 'animation: pulse-ring 2s infinite;' : ''}
          ">${node.icon}</div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [isResort ? 40 : 34, isResort ? 40 : 34],
          iconAnchor: [isResort ? 20 : 17, isResort ? 20 : 17],
        });

        const popup = L.popup({ closeButton: true, className: 'weather-popup' }).setContent(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 20px;">${node.icon}</span>
              <strong style="font-size: 13px; color: #111; line-height: 1.3;">${node.name}</strong>
            </div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 999px; background: ${node.color}22; border: 1px solid ${node.color}66; color: ${node.color}; font-size: 10px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${node.category}
            </div>
            <p style="font-size: 11.5px; color: #555; margin: 0; line-height: 1.5;">${node.description}</p>
            <div style="margin-top: 8px; padding: 5px 8px; background: #f4f4f5; border-radius: 6px; font-size: 10px; color: #777; font-family: monospace;">
              📍 ${node.lat.toFixed(4)}°N, ${node.lng.toFixed(4)}°E
            </div>
          </div>
        `);

        const marker = L.marker([node.lat, node.lng], { icon })
          .addTo(map)
          .bindPopup(popup);

        marker.on('click', () => {
          if (onNodeSelect) onNodeSelect(node);
        });

        markersRef.current.push(marker);
      });

      setMapReady(true);
    };

    // Check if Leaflet is already loaded
    if (window.L) {
      initLeaflet();
      return;
    }

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initLeaflet;
      document.head.appendChild(script);
    }
  }, []);

  // Update OWM weather layer when activeLayer changes
  const addOwmLayer = (map, layerId) => {
    const L = window.L;
    if (!L || !map) return;

    if (owmLayerRef.current) {
      map.removeLayer(owmLayerRef.current);
    }

    const owmLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${layerId}/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
      {
        opacity: 0.55,
        zIndex: 1000,
        attribution: 'Weather © OpenWeatherMap',
      }
    ).addTo(map);

    owmLayerRef.current = owmLayer;
  };

  const handleLayerChange = (layerId) => {
    setActiveLayer(layerId);
    if (leafletMapRef.current && window.L) {
      addOwmLayer(leafletMapRef.current, layerId);
    }
  };

  // Update corridor color when severity changes
  useEffect(() => {
    if (!leafletMapRef.current || corridorRef.current.length === 0) return;
    const color = severity === 'HIGH' || severity === 'EXTREME' ? '#f59e0b' : '#0d9488';
    corridorRef.current[0]?.setStyle({
      color,
      dashArray: severity === 'HIGH' || severity === 'EXTREME' ? '6, 8' : null,
    });
  }, [severity]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* CSS for custom popup style */}
      <style>{`
        .weather-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: 1px solid #e5e7eb;
        }
        .weather-popup .leaflet-popup-tip { background: white; }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(13,148,136,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(13,148,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,148,136,0); }
        }
        .leaflet-container { background: #0f172a !important; }
      `}</style>

      {/* ─── Leaflet Map Container ─── */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

      {/* ─── Layer Switcher ─── */}
      <div className="absolute top-3 left-3 z-[1001] flex flex-col gap-1">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => handleLayerChange(l.id)}
            title={l.desc}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg border transition-all ${
              activeLayer === l.id
                ? 'bg-white text-gray-900 border-white scale-105 shadow-xl'
                : 'bg-gray-900/85 text-gray-200 border-gray-600 hover:bg-gray-800 backdrop-blur-sm'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* ─── Severity Badge ─── */}
      <div className="absolute top-3 right-3 z-[1001]">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl border backdrop-blur-sm ${getSeverityBg()}`}>
          ⚡ SEVERITY: {severity || 'LOW'}
        </div>
      </div>

      {/* ─── Live Weather HUD ─── */}
      {weather?.current && (
        <div className="absolute bottom-8 left-3 z-[1001] bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-700/80 p-3 text-white shadow-2xl min-w-[165px]">
          <div className="text-[9px] text-gray-400 font-mono uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping inline-block" />
            Live Sensors · Goa
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{weather.current.temperature}°C</div>
          <div className="text-xs text-gray-300 mt-0.5">{weather.current.condition}</div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
            <span>🌧 {weather.current.precipitation}mm/h</span>
            <span>💨 {weather.current.windSpeed}km/h</span>
            <span>💧 {weather.current.humidity}% RH</span>
            <span>☀️ UV {weather.current.uvIndex}</span>
          </div>
        </div>
      )}

      {/* ─── Attribution Overlay ─── */}
      <div className="absolute bottom-1 right-2 z-[1001] text-[9px] text-white/50 pointer-events-none">
        Satellite © Esri · Weather © OpenWeatherMap
      </div>
    </div>
  );
}
