import React, { useRef, useEffect } from 'react';
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

  const bounds = {
    minLng: 66.0,
    maxLng: 98.0,
    minLat: 7.0,
    maxLat: 36.0,
  };

  const project = (lat, lng, width, height) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear background (Clean Light Pale Sea)
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle latitude / longitude grid
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
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

    // 3. India Landmass (Clean White Land with Crisp Border)
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
    ctx.fillStyle = '#ffffff'; // White Land
    ctx.fill();
    ctx.strokeStyle = '#94a3b8'; // Crisp Slate Border
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. Western Ghats Topographic Ridge Shading
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
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = isMini ? 4 : 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Dynamic Meteorological Heatmap Overlay
    if (scenario.id === 'kerala_2018') {
      let centerLat = 10.2;
      let centerLng = 76.6;
      let radius = isMini ? 45 : 75;

      if (modelKey === 'ai') {
        centerLat = 10.5;
        centerLng = 75.8;
        radius = isMini ? 70 : 120;
      } else if (modelKey === 'naive') {
        centerLat = 10.35;
        centerLng = 76.2;
        radius = isMini ? 65 : 110;
      } else if (modelKey === 'atmos') {
        centerLat = 10.15;
        centerLng = 76.85;
        radius = isMini ? 42 : 70;
      }

      const centerPt = project(centerLat, centerLng, width, height);
      const grad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, radius);

      if (modelKey === 'atmos') {
        grad.addColorStop(0, 'rgba(219, 39, 119, 0.85)'); // Vibrant magenta
        grad.addColorStop(0.25, 'rgba(239, 68, 68, 0.75)'); // Red
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)'); // Amber
        grad.addColorStop(0.75, 'rgba(6, 182, 212, 0.35)'); // Cyan
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else if (modelKey === 'naive') {
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.65)'); // Smeared yellow
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (modelKey === 'ai') {
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.7)'); // Medium light blue
        grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.3)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.65)');
        grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.35)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (scenario.id === 'biparjoy_2023') {
      let centerLat = 23.1;
      let centerLng = 69.5;
      let radius = isMini ? 40 : 70;

      if (modelKey === 'ai') {
        centerLat = 23.8;
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
        grad.addColorStop(0, 'rgba(219, 39, 119, 0.85)');
        grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.75)');
        grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.5)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      } else if (modelKey === 'naive') {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.55)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (scenario.id === 'heatwave_2024') {
      let centerLat = 28.5;
      let centerLng = 76.5;
      let radius = isMini ? 50 : 85;

      if (modelKey === 'ai') radius = isMini ? 65 : 110;
      else if (modelKey === 'naive') radius = isMini ? 60 : 100;
      else if (modelKey === 'atmos') radius = isMini ? 45 : 75;

      const centerPt = project(centerLat, centerLng, width, height);
      const grad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, radius);

      if (modelKey === 'atmos') {
        grad.addColorStop(0, 'rgba(147, 51, 234, 0.9)');
        grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.75)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.45)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      } else if (modelKey === 'naive') {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. District Station Markers
    if (!isMini) {
      DISTRICT_STATIONS.forEach((station) => {
        const pt = project(station.lat, station.lng, width, height);
        const isSelected = selectedDistrict && selectedDistrict.id === station.id;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#2563eb' : '#334155';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = isSelected ? '#1d4ed8' : '#64748b';
        ctx.fillText(station.name.split(' ')[0], pt.x + 7, pt.y + 3);
      });
    }

  }, [scenario, modelKey, selectedDistrict, isMini, leadTimeHours]);

  const handleCanvasClick = (e) => {
    if (isMini) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

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
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col h-full shadow-xs">
      
      {/* Top Header Card */}
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
          {modelKey === 'atmos' ? 'Blended (PeakGuard)' :
           modelKey === 'naive' ? 'Arithmetic Mean' :
           modelKey === 'ai' ? 'AI Foundation' : 'Physical NWP'}
        </span>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 min-h-[250px] bg-[#f0f9ff]">
        <canvas
          ref={canvasRef}
          width={isMini ? 320 : 540}
          height={isMini ? 300 : 480}
          onClick={handleCanvasClick}
          className={`w-full h-full object-contain ${!isMini ? 'cursor-pointer' : ''}`}
        />

        {/* Minimal Color Scale Badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-slate-200 text-[9px] font-mono text-slate-600 flex flex-col gap-0.5 shadow-2xs">
          <span>{scenario.variable} ({scenario.unit})</span>
          <div className="w-20 h-1.5 rounded bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-600" />
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Peak Value:</span>
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
