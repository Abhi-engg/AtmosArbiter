import React from 'react';
import { Mountain, Compass, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';
import { DISTRICT_STATIONS, LEAD_TIME_PROFILES } from '../data/meteorologicalData';

export default function ClearCastInspector({ scenario, selectedDistrict, onSelectDistrict, leadTimeHours }) {
  const currentLead = LEAD_TIME_PROFILES.find(p => p.hours === leadTimeHours) || LEAD_TIME_PROFILES[0];
  const station = selectedDistrict || DISTRICT_STATIONS[0];
  const stationData = station.scenarios[scenario.id] || { ncup: 0, ai: 0, naive: 0, atmos: 0, actual: 0 };

  const isHighRelief = station.elevation > 500;
  const topoBoost = isHighRelief ? 0.25 : 0.0;
  const dynamicNwpWeight = Math.min(0.92, Math.max(0.20, currentLead.nwpWeightBase + topoBoost));
  const dynamicAiWeight = 1.0 - dynamicNwpWeight;

  const exceedanceProb = stationData.atmos >= scenario.extremeThreshold 
    ? Math.min(99.2, 70 + ((stationData.atmos - scenario.extremeThreshold) / 50) * 28).toFixed(1)
    : Math.max(4.2, (stationData.atmos / scenario.extremeThreshold) * 45).toFixed(1);

  const isExtremeAlert = parseFloat(exceedanceProb) > 65;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Point Diagnostic
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
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
          className="bg-slate-50 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {DISTRICT_STATIONS.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name} ({st.elevation}m)
            </option>
          ))}
        </select>
      </div>

      {/* Numerical Model Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
        
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase">NCUM Physical</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{stationData.ncup} {scenario.unit}</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase">GraphCast AI</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{stationData.ai} {scenario.unit}</div>
        </div>

        <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-200">
          <div className="text-[10px] text-rose-700 uppercase font-medium">Naive Average</div>
          <div className="text-sm font-bold text-rose-700 mt-0.5">{stationData.naive} {scenario.unit}</div>
        </div>

        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300">
          <div className="text-[10px] text-emerald-800 uppercase font-bold">AtmosArbiter</div>
          <div className="text-sm font-bold text-emerald-700 mt-0.5">{stationData.atmos} {scenario.unit}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
          <div className="text-[10px] text-blue-700 uppercase font-medium">IMD Ground Truth</div>
          <div className="text-sm font-bold text-blue-900 mt-0.5">{stationData.actual} {scenario.unit}</div>
        </div>

      </div>

      {/* Dynamic Weight Allocation & Terrain Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        
        {/* Dynamic Weight Sliders */}
        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Physical NWP Weight:</span>
            <span className="font-bold text-blue-700">{(dynamicNwpWeight * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${dynamicNwpWeight * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-slate-600 pt-1">
            <span>AI Foundation Weight:</span>
            <span className="font-bold text-amber-700">{(dynamicAiWeight * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${dynamicAiWeight * 100}%` }}
            />
          </div>
        </div>

        {/* Orographic Priors */}
        <div className="flex flex-col justify-center space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span>Elevation:</span>
            <span className="font-mono font-semibold text-slate-800">{station.elevation} m</span>
          </div>
          <div className="flex justify-between">
            <span>Slope:</span>
            <span className="font-mono font-semibold text-slate-800">{station.slope}</span>
          </div>
          <div className="flex justify-between">
            <span>Terrain Relief:</span>
            <span className="font-medium text-blue-700">{station.terrainType.split(' ')[0]} {station.terrainType.split(' ')[1] || ''}</span>
          </div>
        </div>

      </div>

      {/* XAI Attribution */}
      <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg flex items-start gap-2.5 text-xs">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-slate-700 leading-snug">
          <span className="font-semibold text-slate-900">Arbitration Logic: </span>
          {station.xaiReasoning}
        </div>
      </div>

      {/* Exceedance Alert Banner */}
      <div className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
        isExtremeAlert 
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          {isExtremeAlert ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-semibold">
            {isExtremeAlert ? 'Exceedance Warning:' : 'Nominal Envelope:'}{' '}
            P({scenario.variable} &gt; {scenario.extremeThreshold} {scenario.unit}) ={' '}
            <span className="font-mono font-bold">{exceedanceProb}%</span>
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500 font-medium">
          Window: {currentLead.label}
        </span>
      </div>

    </div>
  );
}
