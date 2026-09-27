import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DISTRICT_STATIONS } from '../data/meteorologicalData';
import { generateMeteorologicalCanvas } from '../data/gridFieldGenerator';

// Clean Light Tile Style (Carto Positron) fallback
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
      attribution: '&copy; OpenStreetMap &copy; CARTO'
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
  activeParameter = 'rain', // 'rain' | 'temp' | 'wind'
  isMini = false,
  leadTimeHours = 24
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [hoverCoords, setHoverCoords] = useState(null);

  // Secure Mapbox Access Token
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
  }

  // Initial Mapbox setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on India domain
    const initialCenter = scenario.id === 'kerala_2018' 
      ? [77.5, 12.0] 
      : scenario.id === 'biparjoy_2023' 
      ? [71.5, 23.5] 
      : [77.5, 27.5];

    const initialZoom = isMini ? 4.3 : 5.4;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapboxToken ? 'mapbox://styles/mapbox/light-v11' : OPEN_LIGHT_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    if (!isMini) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    }

    map.on('mousemove', (e) => {
      setHoverCoords({
        lat: e.lngLat.lat.toFixed(2),
        lng: e.lngLat.lng.toFixed(2)
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, isMini]);

  // Center update on scenario change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = scenario.id === 'kerala_2018' 
      ? [77.5, 12.0] 
      : scenario.id === 'biparjoy_2023' 
      ? [71.5, 23.5] 
      : [77.5, 27.5];

    map.flyTo({
      center,
      zoom: isMini ? 4.3 : 5.4,
      speed: 1.2,
    });
  }, [scenario.id, isMini]);

  // Fly to selected district
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isMini || !selectedDistrict) return;

    map.flyTo({
      center: [selectedDistrict.lng, selectedDistrict.lat],
      zoom: 6.5,
      speed: 1.1,
    });
  }, [selectedDistrict, isMini]);

  // Render IMD 0.25° Gridded Heatmap Overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateGridLayer = () => {
      if (!map.isStyleLoaded()) return;

      const sourceId = `met-grid-src-${modelKey}`;
      const layerId = `met-grid-layer-${modelKey}`;

      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      // Generate IMD-standard meteorological grid canvas (covers 68°E to 98°E, 7°N to 37°N)
      const canvas = generateMeteorologicalCanvas(scenario.id, modelKey, activeParameter, 300, 300);

      const indiaGridBounds = [
        [68.0, 37.0], // Top-Left (North-West)
        [98.0, 37.0], // Top-Right (North-East)
        [98.0, 7.0],  // Bottom-Right (South-East)
        [68.0, 7.0]   // Bottom-Left (South-West)
      ];

      map.addSource(sourceId, {
        type: 'canvas',
        canvas: canvas,
        coordinates: indiaGridBounds,
        animate: false
      });

      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.88,
          'raster-resampling': 'linear'
        }
      });
    };

    if (map.isStyleLoaded()) {
      updateGridLayer();
    } else {
      map.once('load', updateGridLayer);
    }
  }, [scenario.id, modelKey, activeParameter]);

  // District Station Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    DISTRICT_STATIONS.forEach((station) => {
      const isSelected = selectedDistrict && selectedDistrict.id === station.id;

      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform hover:scale-125';
      el.innerHTML = `
        <div style="
          width: ${isSelected ? '14px' : '9px'};
          height: ${isSelected ? '14px' : '9px'};
          background-color: ${isSelected ? '#2563eb' : '#0f172a'};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: ${isSelected ? '0 0 10px rgba(37,99,235,0.7)' : '0 1px 3px rgba(0,0,0,0.4)'};
        "></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectDistrict(station);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([station.lng, station.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [selectedDistrict, scenario.id, onSelectDistrict]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col h-full shadow-xs">
      
      {/* Top Header */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {modelKey === 'atmos' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          ) : modelKey === 'naive' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
          <span className="text-xs font-bold text-slate-800">{modelLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            modelKey === 'atmos'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : modelKey === 'naive'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {modelKey === 'atmos' ? 'AtmosArbiter Blend' :
             modelKey === 'naive' ? 'Arithmetic Mean' :
             modelKey === 'ai' ? 'GraphCast AI' : 'NCUM Physical'}
          </span>
        </div>
      </div>

      {/* Mapbox Canvas Container */}
      <div className="relative flex-1 min-h-[260px] w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live Hover Coordinate Pill (bottom right) */}
        {hoverCoords && !isMini && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-600 border border-slate-200 z-10 shadow-2xs">
            {hoverCoords.lat}°N, {hoverCoords.lng}°E (0.25° Grid)
          </div>
        )}

        {/* IMD Standard Meteorological Color Scale Legend (Overlay on Map) */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 flex flex-col gap-1.5 shadow-xs z-10 max-w-[210px]">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>
              {activeParameter === 'rain' ? '🌧️ Rainfall (mm/day)' :
               activeParameter === 'temp' ? '🌡️ Max Temp (°C)' : '💨 Wind Speed (km/h)'}
            </span>
          </div>

          {/* Stepped Color Bar matching IMD Portal in screenshot */}
          {activeParameter === 'rain' ? (
            <div>
              <div className="flex h-2.5 rounded overflow-hidden border border-slate-200">
                <div style={{ width: '16.6%', backgroundColor: '#a7f3d0' }} title="Light (<15.5mm)" />
                <div style={{ width: '16.6%', backgroundColor: '#34d399' }} title="Moderate (15-35mm)" />
                <div style={{ width: '16.6%', backgroundColor: '#fde047' }} title="Rather Heavy (35-64mm)" />
                <div style={{ width: '16.6%', backgroundColor: '#fb923c' }} title="Heavy (65-115mm)" />
                <div style={{ width: '16.6%', backgroundColor: '#ef4444' }} title="Very Heavy (115-204mm)" />
                <div style={{ width: '16.6%', backgroundColor: '#a855f7' }} title="Extreme (>204mm)" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
                <span>0</span>
                <span>15</span>
                <span>65</span>
                <span>115</span>
                <span>204+</span>
              </div>
            </div>
          ) : activeParameter === 'temp' ? (
            <div>
              <div className="flex h-2.5 rounded overflow-hidden border border-slate-200">
                <div style={{ width: '16.6%', backgroundColor: '#3b82f6' }} title="Cool (<24°C)" />
                <div style={{ width: '16.6%', backgroundColor: '#10b981' }} title="Normal (24-30°C)" />
                <div style={{ width: '16.6%', backgroundColor: '#eab308' }} title="Warm (30-36°C)" />
                <div style={{ width: '16.6%', backgroundColor: '#f97316' }} title="Hot (36-40°C)" />
                <div style={{ width: '16.6%', backgroundColor: '#ef4444' }} title="Heatwave (40-44°C)" />
                <div style={{ width: '16.6%', backgroundColor: '#9333ea' }} title="Severe (>45°C)" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
                <span>20°</span>
                <span>30°</span>
                <span>36°</span>
                <span>44°</span>
                <span>48°C+</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex h-2.5 rounded overflow-hidden border border-slate-200">
                <div style={{ width: '20%', backgroundColor: '#93c5fd' }} title="Light (<20)" />
                <div style={{ width: '20%', backgroundColor: '#38bdf8' }} title="Moderate (20-45)" />
                <div style={{ width: '20%', backgroundColor: '#facc15' }} title="Strong (45-65)" />
                <div style={{ width: '20%', backgroundColor: '#f97316' }} title="Gale (65-90)" />
                <div style={{ width: '20%', backgroundColor: '#d946ef' }} title="Storm (>120)" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
                <span>0</span>
                <span>45</span>
                <span>65</span>
                <span>90</span>
                <span>140+</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">
          {activeParameter === 'rain' ? 'Peak Rainfall:' : activeParameter === 'temp' ? 'Max Temp Core:' : 'Peak Gale Wind:'}
        </span>
        <span className={`font-semibold ${
          modelKey === 'atmos' ? 'text-emerald-700 font-bold' :
          modelKey === 'naive' ? 'text-rose-700' : 'text-slate-800'
        }`}>
          {activeParameter === 'rain' ? (
            modelKey === 'atmos' ? '183.7 mm/day (Preserved)' :
            modelKey === 'naive' ? '108.3 mm/day (-43.7% Diluted)' :
            modelKey === 'ai' ? '84.5 mm/day (Smoothed)' : '186.2 mm/day (Physical)'
          ) : activeParameter === 'temp' ? (
            modelKey === 'atmos' ? '47.9 °C (Preserved)' :
            modelKey === 'naive' ? '44.9 °C (Diluted)' :
            modelKey === 'ai' ? '43.8 °C (Smoothed)' : '47.1 °C (Physical)'
          ) : (
            modelKey === 'atmos' ? '142 km/h (Preserved)' :
            modelKey === 'naive' ? '100 km/h (Diluted)' :
            modelKey === 'ai' ? '80 km/h (Smoothed)' : '135 km/h (Physical)'
          )}
        </span>
      </div>

    </div>
  );
}
