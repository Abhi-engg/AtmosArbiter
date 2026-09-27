import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Eye, Info, Sparkles } from 'lucide-react';
import { DISTRICT_STATIONS } from '../data/meteorologicalData';

export default function MeteorologicalMap({ 
  scenario, 
  modelKey, 
  modelLabel, 
  selectedDistrict, 
  onSelectDistrict,
  isMini = false,
  leadTimeHours = 24
}) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Geographic bounds for India projection on canvas (approx 66°E to 98°E, 7°N to 36°N)
  const bounds = {
    minLng: 66.0,
    maxLng: 98.0,
    minLat: 7.0,
    maxLat: 36.0,
  };

  // Convert GPS (Lat, Lng) to Canvas coordinates (X, Y)
  const project = (lat, lng, width, height) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  // Draw meteorological canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear background (Deep Oceanic Blue/Black)
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle latitude / longitude grid lines (0.25° grid simulation)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let lat = 10; lat <= 35; lat += 5) {
      const p1 = project(lat, bounds.minLng, width, height);
      const p2 = project(lat, bounds.maxLng, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let lng = 70; lng <= 95; lng += 5) {
      const p1 = project(bounds.minLat, lng, width, height);
      const p2 = project(bounds.maxLat, lng, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 3. Draw Simplified High-Precision India Landmass Polygon
    const indiaCoastline = [
      [35.5, 74.8], [34.5, 77.5], [32.0, 78.8], [30.2, 80.8], [28.0, 88.5], 
      [27.5, 92.5], [28.2, 97.0], [24.0, 94.5], [22.0, 92.2], [22.2, 89.0], 
      [21.5, 87.0], [19.8, 85.8], [17.5, 83.2], [15.8, 80.5], [13.1, 80.3], 
      [10.8, 79.8], [9.3, 79.2], [8.1, 77.5], [8.8, 76.5], [10.5, 75.8], 
      [13.0, 74.8], [15.5, 73.8], [19.0, 72.8], [20.5, 72.8], [21.0, 70.0], 
      [22.5, 69.0], [23.8, 68.2], [24.5, 70.8], [27.0, 71.0], [30.5, 73.5], 
      [32.5, 74.5], [35.5, 74.8]
    ];

    ctx.beginPath();
    indiaCoastline.forEach(([lat, lng], idx) => {
      const p = project(lat, lng, width, height);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = '#0f172a'; // Land fill
    ctx.fill();
    ctx.strokeStyle = '#334155'; // Coastline stroke
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Draw Western Ghats Topographic Elevation Ridge (Shaded relief)
    const westernGhats = [
      [20.5, 73.5], [19.0, 73.4], [17.8, 73.7], [16.0, 74.1], 
      [14.2, 74.8], [12.0, 75.8], [10.0, 76.8], [8.6, 77.3]
    ];
    ctx.beginPath();
    westernGhats.forEach(([lat, lng], idx) => {
      const p = project(lat, lng, width, height);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = isMini ? 4 : 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Draw Dynamic Meteorological Scalar Field (Precipitation / Temperature Heatmap)
    // We compute intensity based on the active scenario and modelKey
    const renderScenarioField = () => {
      const isRain = scenario.variable.includes('Precipitation');

      if (scenario.id === 'kerala_2018') {
        // Kerala orographic rain core around [10.2°N, 76.5°E]
        let centerLat = 10.2;
        let centerLng = 76.6;
        let radius = isMini ? 45 : 75;
        let maxVal = 186; // NCUM

        if (modelKey === 'ai') {
          // AI model smooths and displaces offshore into Arabian Sea
          centerLat = 10.5;
          centerLng = 75.8; // shifted west into ocean
          radius = isMini ? 70 : 120; // blurred, diffused
          maxVal = 85;
        } else if (modelKey === 'naive') {
          // Naive Average smears both! Creates ghost storm
          centerLat = 10.35;
          centerLng = 76.2;
          radius = isMini ? 65 : 110;
          maxVal = 108; // Washed out peak!
        } else if (modelKey === 'atmos') {
          // AtmosArbiter locks tightly to Western Ghats ridge with PeakGuard
          centerLat = 10.15;
          centerLng = 76.85; // right on Idukki ridge
          radius = isMini ? 42 : 70; // sharp orographic gradients
          maxVal = 184; // Preserved extreme peak!
        }

        const centerPt = project(centerLat, centerLng, width, height);
        const grad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, radius);

        if (isRain) {
          if (modelKey === 'ai') {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.7)'); // Medium Cyan
            grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
            grad.addColorStop(1, 'rgba(3, 105, 161, 0)');
          } else if (modelKey === 'naive') {
            // Smeared washed-out colors
            grad.addColorStop(0, 'rgba(234, 179, 8, 0.65)'); // Yellow
            grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
            grad.addColorStop(1, 'rgba(3, 105, 161, 0)');
          } else if (modelKey === 'atmos') {
            // Intense preserved peak: Magenta/Crimson core
            grad.addColorStop(0, 'rgba(236, 72, 153, 0.95)'); // Extreme magenta
            grad.addColorStop(0.2, 'rgba(239, 68, 68, 0.85)'); // Red
            grad.addColorStop(0.45, 'rgba(245, 158, 11, 0.7)'); // Amber
            grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.45)'); // Cyan
            grad.addColorStop(1, 'rgba(3, 105, 161, 0)');
          } else {
            // NCUM physical
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.9)'); // Red
            grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.75)');
            grad.addColorStop(0.65, 'rgba(6, 182, 212, 0.4)');
            grad.addColorStop(1, 'rgba(3, 105, 161, 0)');
          }
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (scenario.id === 'biparjoy_2023') {
        // Cyclone Landfall over Gujarat Mandvi/Kutch [23.1°N, 69.5°E]
        let centerLat = 23.1;
        let centerLng = 69.5;
        let radius = isMini ? 40 : 70;

        if (modelKey === 'ai') {
          centerLat = 23.8; // Track drift north
          centerLng = 68.8;
          radius = isMini ? 60 : 100;
        } else if (modelKey === 'naive') {
          radius = isMini ? 55 : 95;
        } else if (modelKey === 'atmos') {
          centerLat = 23.15;
          centerLng = 69.6;
          radius = isMini ? 38 : 65;
        }

        const centerPt = project(centerLat, centerLng, width, height);
        const grad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, radius);

        if (modelKey === 'atmos') {
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.9)');
          grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.8)');
          grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.5)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        } else if (modelKey === 'naive') {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        } else {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (scenario.id === 'heatwave_2024') {
        // Northern thermal dome over Rajasthan / Delhi / Haryana [28.5°N, 76.5°E]
        let centerLat = 28.5;
        let centerLng = 76.5;
        let radius = isMini ? 50 : 85;

        if (modelKey === 'ai') radius = isMini ? 65 : 110;
        else if (modelKey === 'naive') radius = isMini ? 60 : 100;
        else if (modelKey === 'atmos') radius = isMini ? 45 : 75;

        const centerPt = project(centerLat, centerLng, width, height);
        const grad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, radius);

        if (modelKey === 'atmos') {
          grad.addColorStop(0, 'rgba(147, 51, 234, 0.95)'); // Ultra-hot purple >47.5°C
          grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.8)');
          grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
          grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        } else if (modelKey === 'naive') {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Diluted red
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        } else {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
          grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    renderScenarioField();

    // 6. Draw District Pins on full-size map
    if (!isMini) {
      DISTRICT_STATIONS.forEach((station) => {
        const pt = project(station.lat, station.lng, width, height);
        const isSelected = selectedDistrict && selectedDistrict.id === station.id;

        // Outer glow for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.fill();
        }

        // Inner marker pin
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '10px ui-sans-serif, system-ui';
        ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
        ctx.fillText(station.name.split(' ')[0], pt.x + 8, pt.y + 3);
      });
    }

  }, [scenario, modelKey, selectedDistrict, isMini, leadTimeHours]);

  // Handle click on canvas to select station
  const handleCanvasClick = (e) => {
    if (isMini) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find closest station within 25px
    let closest = null;
    let minD = 25;
    DISTRICT_STATIONS.forEach(st => {
      const pt = project(st.lat, st.lng, canvas.width, canvas.height);
      const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
      if (dist < minD) {
        minD = dist;
        closest = st;
      }
    });

    if (closest) onSelectDistrict(closest);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col h-full shadow-lg">
      
      {/* Top Header Card */}
      <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {modelKey === 'atmos' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : modelKey === 'naive' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          )}
          <span className="text-xs font-bold tracking-tight text-white">{modelLabel}</span>
        </div>

        {/* Model Characteristic Tag */}
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
          modelKey === 'atmos'
            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            : modelKey === 'naive'
            ? 'bg-rose-950 text-rose-300 border border-rose-800'
            : 'bg-slate-800 text-slate-300 border border-slate-700'
        }`}>
          {modelKey === 'atmos' ? '✅ TopoWeight + PeakGuard' :
           modelKey === 'naive' ? '❌ Diluted Smearing Flaw' :
           modelKey === 'ai' ? '⚡ GraphCast Foundation' : '🌐 NCUM 12km Physical'}
        </span>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 min-h-[260px]">
        <canvas
          ref={canvasRef}
          width={isMini ? 320 : 540}
          height={isMini ? 300 : 480}
          onClick={handleCanvasClick}
          className={`w-full h-full object-contain ${!isMini ? 'cursor-pointer' : ''}`}
        />

        {/* Interactive Overlay Helper */}
        {!isMini && (
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur px-2.5 py-1.5 rounded-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any station dot to inspect ClearCast XAI attribution</span>
          </div>
        )}

        {/* Color Legend (Precipitation / Temperature) */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex flex-col gap-1">
          <span className="font-semibold text-slate-200">
            {scenario.variable} ({scenario.unit})
          </span>
          <div className="w-24 h-2.5 rounded bg-gradient-to-r from-cyan-600 via-amber-500 to-rose-600" />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0</span>
            <span>{scenario.extremeThreshold}</span>
            <span>{scenario.variable.includes('Rain') ? '180+' : '48+'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3.5 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Peak Anomaly:</span>
        <span className={`font-bold ${
          modelKey === 'atmos' ? 'text-emerald-400' :
          modelKey === 'naive' ? 'text-rose-400' : 'text-slate-200'
        }`}>
          {modelKey === 'atmos' ? `${scenario.metrics.atmosPeakLoss}% error (Retained)` :
           modelKey === 'naive' ? `${scenario.metrics.naivePeakLoss}% WASHED OUT` :
           modelKey === 'ai' ? '-56.1% (Smoothed)' : '-3.2% (Physical)'}
        </span>
      </div>

    </div>
  );
}
