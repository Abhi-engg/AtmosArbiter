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
  activeParameter = 'rain', // 'rain' | 'temp' | 'wind' | 'weights'
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
      pitch: mapboxToken && !isMini ? 45 : 0,
      attributionControl: false,
    });

    if (!isMini) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
      map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    }

    map.on('load', () => {
      if (mapboxToken && !isMini) {
        map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      }
    });

    map.on('mousemove', (e) => {
      // Mocking interpolated value based on parameter
      let val = '0.0';
      if (activeParameter === 'rain') val = (Math.random() * 200).toFixed(1);
      else if (activeParameter === 'temp') val = (25 + Math.random() * 20).toFixed(1);
      else if (activeParameter === 'wind') val = (Math.random() * 100).toFixed(1);
      else val = (Math.random()).toFixed(2);

      setHoverCoords({
        lat: e.lngLat.lat.toFixed(2),
        lng: e.lngLat.lng.toFixed(2),
        val
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, isMini]); // exclude scenario and activeParameter from init to prevent recreation

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

      const canvas = generateMeteorologicalCanvas(scenario.id, modelKey, activeParameter, 300, 300);

      const indiaGridBounds = [
        [68.0, 37.0], // Top-Left (North-West)
        [98.0, 37.0], // Top-Right (North-East)
        [98.0, 7.0],  // Bottom-Right (South-East)
        [68.0, 7.0]   // Bottom-Left (South-West)
      ];

      if (map.getLayer(layerId)) {
        // Smooth transition out
        map.setPaintProperty(layerId, 'raster-opacity-transition', { duration: 300 });
        map.setPaintProperty(layerId, 'raster-opacity', 0);
        
        setTimeout(() => {
          if (map.getSource(sourceId)) {
            map.removeLayer(layerId);
            map.removeSource(sourceId);
            addSourceAndLayer();
          }
        }, 300);
      } else {
        addSourceAndLayer();
      }

      function addSourceAndLayer() {
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'canvas',
                canvas: canvas,
                coordinates: indiaGridBounds,
                animate: false
            });
        }
        
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'raster',
                source: sourceId,
                paint: {
                'raster-opacity': 0,
                'raster-opacity-transition': { duration: 400 },
                'raster-resampling': 'linear'
                }
            });
            
            // Trigger animation in next frame
            requestAnimationFrame(() => {
                if (map.getLayer(layerId)) {
                    map.setPaintProperty(layerId, 'raster-opacity', 0.88);
                }
            });
        }
      }
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
      el.className = 'group cursor-pointer relative';
      el.innerHTML = `
        <div class="transition-all duration-300 ease-in-out" style="
          width: ${isSelected ? '14px' : '8px'};
          height: ${isSelected ? '14px' : '8px'};
          background-color: ${isSelected ? '#3b82f6' : '#94a3b8'};
          border: 1.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: ${isSelected ? '0 0 12px rgba(59,130,246,0.6)' : '0 1px 2px rgba(0,0,0,0.3)'};
        "></div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white/95 backdrop-blur text-[10px] font-semibold text-slate-700 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-200">
            ${station.name}
        </div>
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
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col h-full shadow-sm">
      
      {/* Top Header */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {modelKey === 'atmos' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          ) : modelKey === 'naive' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
          <span className="text-sm font-semibold text-slate-800 tracking-tight">{modelLabel}</span>
        </div>
      </div>

      {/* Mapbox Canvas Container */}
      <div className="relative flex-1 min-h-[260px] w-full bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live Hover Coordinate Pill (bottom right) */}
        {hoverCoords && !isMini && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-600 border border-slate-200 z-10 shadow-sm flex gap-3">
            <span>{hoverCoords.lat}°N, {hoverCoords.lng}°E</span>
            <span className="text-slate-800 font-bold border-l border-slate-200 pl-3">
                {activeParameter === 'rain' ? `${hoverCoords.val} mm` :
                 activeParameter === 'temp' ? `${hoverCoords.val} °C` :
                 activeParameter === 'wind' ? `${hoverCoords.val} km/h` :
                 `w=${hoverCoords.val}`}
            </span>
          </div>
        )}

        {/* IMD Standard Meteorological Color Scale Legend (Overlay on Map) */}
        {!isMini && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 flex flex-col gap-2 shadow-sm z-10 w-[220px]">
            <div className="flex items-center justify-between font-bold text-slate-900 group relative">
              <span className="flex items-center gap-1.5 cursor-help">
                {activeParameter === 'rain' ? '🌧️ Rainfall (mm/day)' :
                 activeParameter === 'temp' ? '🌡️ Max Temp (°C)' : 
                 activeParameter === 'wind' ? '💨 Wind Speed (km/h)' : 
                 '🗺️ W_NWP Dynamic Trust'}
              </span>
              <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 text-slate-100 text-[10px] rounded hidden group-hover:block z-20 w-max max-w-[200px] shadow-lg font-sans font-normal">
                Active Scenario:<br/><span className="font-semibold">{scenario.name}</span>
              </div>
            </div>

            {/* Stepped Color Bar matching IMD Portal in screenshot */}
            {activeParameter === 'rain' ? (
              <div>
                <div className="flex h-2.5 rounded overflow-hidden border border-slate-200 shadow-inner">
                  <div style={{ width: '16.6%', backgroundColor: '#a7f3d0' }} title="Light (<15.5mm)" />
                  <div style={{ width: '16.6%', backgroundColor: '#34d399' }} title="Moderate (15-35mm)" />
                  <div style={{ width: '16.6%', backgroundColor: '#fde047' }} title="Rather Heavy (35-64mm)" />
                  <div style={{ width: '16.6%', backgroundColor: '#fb923c' }} title="Heavy (65-115mm)" />
                  <div style={{ width: '16.6%', backgroundColor: '#ef4444' }} title="Very Heavy (115-204mm)" />
                  <div style={{ width: '16.6%', backgroundColor: '#a855f7' }} title="Extreme (>204mm)" />
                </div>
                <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 font-mono tracking-tighter">
                  <span>0</span>
                  <span>15</span>
                  <span>65</span>
                  <span>115</span>
                  <span>204+</span>
                </div>
              </div>
            ) : activeParameter === 'temp' ? (
              <div>
                <div className="flex h-2.5 rounded overflow-hidden border border-slate-200 shadow-inner">
                  <div style={{ width: '16.6%', backgroundColor: '#3b82f6' }} title="Cool (<24°C)" />
                  <div style={{ width: '16.6%', backgroundColor: '#10b981' }} title="Normal (24-30°C)" />
                  <div style={{ width: '16.6%', backgroundColor: '#eab308' }} title="Warm (30-36°C)" />
                  <div style={{ width: '16.6%', backgroundColor: '#f97316' }} title="Hot (36-40°C)" />
                  <div style={{ width: '16.6%', backgroundColor: '#ef4444' }} title="Heatwave (40-44°C)" />
                  <div style={{ width: '16.6%', backgroundColor: '#9333ea' }} title="Severe (>45°C)" />
                </div>
                <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 font-mono tracking-tighter">
                  <span>20°</span>
                  <span>30°</span>
                  <span>36°</span>
                  <span>44°</span>
                  <span>48°C+</span>
                </div>
              </div>
            ) : activeParameter === 'wind' ? (
              <div>
                <div className="flex h-2.5 rounded overflow-hidden border border-slate-200 shadow-inner">
                  <div style={{ width: '20%', backgroundColor: '#93c5fd' }} title="Light (<20)" />
                  <div style={{ width: '20%', backgroundColor: '#38bdf8' }} title="Moderate (20-45)" />
                  <div style={{ width: '20%', backgroundColor: '#facc15' }} title="Strong (45-65)" />
                  <div style={{ width: '20%', backgroundColor: '#f97316' }} title="Gale (65-90)" />
                  <div style={{ width: '20%', backgroundColor: '#d946ef' }} title="Storm (>120)" />
                </div>
                <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 font-mono tracking-tighter">
                  <span>0</span>
                  <span>45</span>
                  <span>65</span>
                  <span>90</span>
                  <span>140+</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex h-2.5 rounded overflow-hidden border border-slate-200 shadow-inner">
                  <div style={{ width: '20%', backgroundColor: '#ea580c' }} title="100% AI Dominant" />
                  <div style={{ width: '20%', backgroundColor: '#f59e0b' }} title="AI Leaning" />
                  <div style={{ width: '20%', backgroundColor: '#10b981' }} title="50-50 Balanced" />
                  <div style={{ width: '20%', backgroundColor: '#06b6d4' }} title="NWP Leaning" />
                  <div style={{ width: '20%', backgroundColor: '#2563eb' }} title="100% NWP Dominant" />
                </div>
                <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 font-mono tracking-tighter">
                  <span className="text-amber-600 font-bold">AI</span>
                  <span>50-50</span>
                  <span className="text-blue-600 font-bold">NWP</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono tracking-tight">
        <span className="text-slate-500">
          {activeParameter === 'rain' ? 'Peak:' : 
           activeParameter === 'temp' ? 'Max:' : 
           activeParameter === 'wind' ? 'Gale:' : 'Trust:'}
        </span>
        <span className={`font-semibold ${
          modelKey === 'atmos' ? 'text-emerald-700' :
          modelKey === 'naive' ? 'text-rose-700' : 'text-slate-800'
        }`}>
          {activeParameter === 'rain' ? (
            modelKey === 'atmos' ? '183.7 mm (Preserved)' :
            modelKey === 'naive' ? '108.3 mm (Diluted)' :
            modelKey === 'ai' ? '84.5 mm (Smoothed)' : '186.2 mm'
          ) : activeParameter === 'temp' ? (
            modelKey === 'atmos' ? '47.9 °C (Preserved)' :
            modelKey === 'naive' ? '44.9 °C (Diluted)' :
            modelKey === 'ai' ? '43.8 °C (Smoothed)' : '47.1 °C'
          ) : activeParameter === 'wind' ? (
            modelKey === 'atmos' ? '142 km/h (Preserved)' :
            modelKey === 'naive' ? '100 km/h (Diluted)' :
            modelKey === 'ai' ? '80 km/h (Smoothed)' : '135 km/h'
          ) : (
            modelKey === 'atmos' ? '84% NWP / 16% AI' :
            modelKey === 'naive' ? '50% / 50% Blind' :
            modelKey === 'ai' ? '100% AI' : '100% NWP'
          )}
        </span>
      </div>
    </div>
  );
}
