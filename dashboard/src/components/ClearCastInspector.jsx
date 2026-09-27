import React from 'react';
import { Mountain, Compass, ShieldAlert, Cpu, Sparkles, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { DISTRICT_STATIONS, LEAD_TIME_PROFILES } from '../data/meteorologicalData';

export default function ClearCastInspector({ scenario, selectedDistrict, onSelectDistrict, leadTimeHours }) {
  const currentLead = LEAD_TIME_PROFILES.find(p => p.hours === leadTimeHours) || LEAD_TIME_PROFILES[0];
  const station = selectedDistrict || DISTRICT_STATIONS[0];
  const stationData = station.scenarios[scenario.id] || { ncup: 0, ai: 0, naive: 0, atmos: 0, actual: 0 };

  // Calculate dynamic weights for this specific district based on elevation/slope and lead time
  const isHighRelief = station.elevation > 500;
  const topoBoost = isHighRelief ? 0.25 : 0.0;
  const dynamicNwpWeight = Math.min(0.92, Math.max(0.20, currentLead.nwpWeightBase + topoBoost));
  const dynamicAiWeight = 1.0 - dynamicNwpWeight;

  // Exceedance Probability calculation
  const exceedanceProb = stationData.atmos >= scenario.extremeThreshold 
    ? Math.min(99.2, 70 + ((stationData.atmos - scenario.extremeThreshold) / 50) * 28).toFixed(1)
    : Math.max(4.2, (stationData.atmos / scenario.extremeThreshold) * 45).toFixed(1);

  const isExtremeAlert = parseFloat(exceedanceProb) > 65;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5">
      
      {/* Header: District Selector & Elevation Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              ClearCast XAI District Inspector
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {station.name}, {station.state}
          </h3>
        </div>

        {/* Station Dropdown */}
        <select
          value={station.id}
          onChange={(e) => {
            const found = DISTRICT_STATIONS.find(s => s.id === e.target.value);
            if (found) onSelectDistrict(found);
          }}
          className="bg-slate-950 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
        >
          {DISTRICT_STATIONS.map((st) => (
            <option key={st.id} value={st.id}>
              📍 {st.name} ({st.elevation}m)
            </option>
          ))}
        </select>
      </div>

      {/* Topographic Priors (SRTM DEM) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 text-xs">
        <div>
          <div className="text-slate-500 flex items-center gap-1">
            <Mountain className="w-3.5 h-3.5 text-slate-400" />
            Elevation (SRTM DEM)
          </div>
          <div className="font-mono font-bold text-slate-200 mt-0.5">{station.elevation} meters</div>
        </div>
        <div>
          <div className="text-slate-500 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Orographic Slope
          </div>
          <div className="font-mono font-bold text-slate-200 mt-0.5">{station.slope}</div>
        </div>
        <div className="col-span-2">
          <div className="text-slate-500">Morphological Classification</div>
          <div className="font-medium text-cyan-300 mt-0.5 truncate">{station.terrainType}</div>
        </div>
      </div>

      {/* Numerical Model Comparison for Selected Pixel */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2">
          Point Prediction Comparison ({scenario.variable} in {scenario.unit}):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
          
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500">NCUM (Physical)</div>
            <div className="text-sm font-bold text-slate-200 mt-1">{stationData.ncup}</div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500">GraphCast (AI)</div>
            <div className="text-sm font-bold text-slate-200 mt-1">{stationData.ai}</div>
          </div>

          <div className="bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
            <div className="text-[10px] text-rose-300">Naive Average</div>
            <div className="text-sm font-bold text-rose-400 mt-1">{stationData.naive}</div>
          </div>

          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-700">
            <div className="text-[10px] text-emerald-300 font-bold">AtmosArbiter</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">{stationData.atmos}</div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-cyan-950/50 p-2.5 rounded-lg border border-cyan-800">
            <div className="text-[10px] text-cyan-300">IMD Observed</div>
            <div className="text-sm font-bold text-cyan-400 mt-1">{stationData.actual}</div>
          </div>

        </div>
      </div>

      {/* Live Dynamic Weights Assigned to this Cell */}
      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Dynamic Arbitration Tensor at ({station.lat}°N, {station.lng}°E):
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            &Sigma; W_m = 1.00
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-cyan-400">W_NCUM (Physical NWP Weight):</span>
            <span className="font-bold text-white">{(dynamicNwpWeight * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${dynamicNwpWeight * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-amber-400">W_AI (Foundation AI Weight):</span>
            <span className="font-bold text-white">{(dynamicAiWeight * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${dynamicAiWeight * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ClearCast Natural Language XAI Driver Attribution */}
      <div className="bg-blue-950/30 border border-blue-900/50 p-3.5 rounded-lg flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-cyan-300">Meteorological XAI Attribution: </span>
          <span className="text-slate-300 leading-relaxed">{station.xaiReasoning}</span>
        </div>
      </div>

      {/* Operational Early Warning & Exceedance Probability Badge */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isExtremeAlert 
          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          {isExtremeAlert ? (
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">
              {isExtremeAlert ? '🚨 SEVERE DISASTER EXCEEDANCE TRIGGER' : '✅ NORMAL OPERATIONAL ENVELOPE'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              P({scenario.variable} &gt; {scenario.extremeThreshold} {scenario.unit}) ={' '}
              <span className="font-mono font-bold text-white text-sm">{exceedanceProb}%</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
          Target Window: <span className="text-cyan-400 font-bold">{currentLead.label}</span>
        </div>
      </div>

    </div>
  );
}
