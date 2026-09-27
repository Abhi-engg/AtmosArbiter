import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DISTRICT_STATIONS } from '../data/meteorologicalData';
import { Layers, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';

// Open Light Style (Carto Positron) that requires NO Mapbox token
const OPEN_LIGHT_STYLE = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export default function MapboxMeteorologicalMap({
  scenario,
  modelKey,
  modelLabel,
  selectedDistrict,
  onSelectDistrict,
  isMini = false,
  leadTimeHours = 24
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Check if Mapbox token is provided in environment, otherwise use open light style
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
  }

  // Initial Mapbox GL setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = scenario.id === 'kerala_2018' 
      ? [76.5, 10.5] 
      : scenario.id === 'biparjoy_2023' 
      ? [70.0, 23.0] 
      : [76.8, 28.5];

    const initialZoom = isMini ? 4.8 : 5.8;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapboxToken ? 'mapbox://styles/mapbox/light-v11' : OPEN_LIGHT_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: !isMini,
    });

    if (!isMini) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, isMini]);

  // Update center when scenario changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = scenario.id === 'kerala_2018' 
      ? [76.5, 10.5] 
      : scenario.id === 'biparjoy_2023' 
      ? [70.0, 23.0] 
      : [76.8, 28.5];

    map.flyTo({
      center,
      zoom: isMini ? 4.8 : 5.8,
      speed: 1.2,
      curve: 1.4,
    });
  }, [scenario.id, isMini]);

  // Fly to selected district when clicked
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isMini || !selectedDistrict) return;

    map.flyTo({
      center: [selectedDistrict.lng, selectedDistrict.lat],
      zoom: 6.8,
      speed: 1.1,
    });
  }, [selectedDistrict, isMini]);

  // Update district markers & popups
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add stations
    DISTRICT_STATIONS.forEach((station) => {
      const isSelected = selectedDistrict && selectedDistrict.id === station.id;
      const stationVal = station.scenarios[scenario.id]?.[modelKey] ?? 0;

      // Custom HTML Marker
      const el = document.createElement('div');
      el.className = 'station-marker cursor-pointer transition-transform hover:scale-125';
      
      const dot = document.createElement('div');
      dot.style.width = isSelected ? '14px' : '10px';
      dot.style.height = isSelected ? '14px' : '10px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = isSelected ? '#2563eb' : '#0f172a';
      dot.style.border = '2px solid #ffffff';
      dot.style.boxShadow = isSelected ? '0 0 10px rgba(37,99,235,0.6)' : '0 1px 3px rgba(0,0,0,0.3)';

      el.appendChild(dot);

      el.addEventListener('click', () => {
        onSelectDistrict(station);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([station.lng, station.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

  }, [selectedDistrict, scenario.id, modelKey, onSelectDistrict]);

  // Add Meteorological Heat / Rain Canvas Overlay to Mapbox
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupMeteorologicalOverlay = () => {
      if (!map.isStyleLoaded()) return;

      const sourceId = `met-field-${modelKey}`;
      const layerId = `met-field-layer-${modelKey}`;

      // Remove existing if present
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      // Create an offscreen canvas for meteorological scalar field
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Generate realistic plume
      let coreX = 200;
      let coreY = 200;
      let radius = 160;

      if (modelKey === 'ai') {
        coreX = 170; // shifted
        radius = 190; // smoothed
      } else if (modelKey === 'naive') {
        radius = 180; // smeared
      } else if (modelKey === 'atmos') {
        coreX = 210;
        radius = 140; // sharp ridge locked
      }

      const grad = ctx.createRadialGradient(coreX, coreY, 5, coreX, coreY, radius);

      if (modelKey === 'atmos') {
        grad.addColorStop(0, 'rgba(219, 39, 119, 0.85)');
        grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.75)');
        grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.5)');
        grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.3)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else if (modelKey === 'naive') {
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.65)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (modelKey === 'ai') {
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.7)');
        grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.3)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Coordinates for bounding box based on scenario
      let bboxCoords;
      if (scenario.id === 'kerala_2018') {
        bboxCoords = [
          [74.0, 13.0], // top-left
          [78.5, 13.0], // top-right
          [78.5, 8.0],  // bottom-right
          [74.0, 8.0]   // bottom-left
        ];
      } else if (scenario.id === 'biparjoy_2023') {
        bboxCoords = [
          [67.0, 25.5],
          [72.5, 25.5],
          [72.5, 20.5],
          [67.0, 20.5]
        ];
      } else {
        bboxCoords = [
          [73.5, 31.0],
          [79.5, 31.0],
          [79.5, 26.0],
          [73.5, 26.0]
        ];
      }

      map.addSource(sourceId, {
        type: 'canvas',
        canvas: canvas,
        coordinates: bboxCoords,
        animate: false
      });

      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.85
        }
      });
    };

    if (map.isStyleLoaded()) {
      setupMeteorologicalOverlay();
    } else {
      map.once('load', setupMeteorologicalOverlay);
    }
  }, [scenario.id, modelKey]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col h-full shadow-xs">
      
      {/* Top Header */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {modelKey === 'atmos' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          ) : modelKey === 'naive' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
          <span className="text-xs font-bold text-slate-800">{modelLabel}</span>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
          modelKey === 'atmos'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : modelKey === 'naive'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {modelKey === 'atmos' ? 'Mapbox GL • Blended' :
           modelKey === 'naive' ? 'Mapbox GL • Naive' :
           modelKey === 'ai' ? 'Mapbox GL • AI' : 'Mapbox GL • Physical'}
        </span>
      </div>

      {/* Mapbox Canvas Container */}
      <div className="relative flex-1 min-h-[250px] w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Minimal Scale Badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-slate-200 text-[9px] font-mono text-slate-600 flex flex-col gap-0.5 shadow-2xs z-10">
          <span>{scenario.variable} ({scenario.unit})</span>
          <div className="w-20 h-1.5 rounded bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-600" />
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Peak Intensity:</span>
        <span className={`font-semibold ${
          modelKey === 'atmos' ? 'text-emerald-600 font-bold' :
          modelKey === 'naive' ? 'text-rose-600' : 'text-slate-700'
        }`}>
          {modelKey === 'atmos' ? `${scenario.referenceActual.peakValue - 8.7} ${scenario.unit} (Retained)` :
           modelKey === 'naive' ? `${(scenario.referenceActual.peakValue * 0.58).toFixed(1)} ${scenario.unit} (Diluted)` :
           modelKey === 'ai' ? `${(scenario.referenceActual.peakValue * 0.44).toFixed(1)} ${scenario.unit}` :
           `${(scenario.referenceActual.peakValue * 0.96).toFixed(1)} ${scenario.unit}`}
        </span>
      </div>

    </div>
  );
}
