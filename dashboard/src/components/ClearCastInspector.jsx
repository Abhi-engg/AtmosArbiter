import React from 'react';
import { ShieldAlert, CheckCircle, Sparkles, ChevronDown } from 'lucide-react';
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
  const delta = (stationData.atmos - stationData.actual).toFixed(1);
  
  const maxVal = Math.max(stationData.ncup, stationData.ai, stationData.naive, stationData.atmos, stationData.actual) * 1.2 || 1;

  // For chips
  const topStations = DISTRICT_STATIONS.slice(0, 4);
  const otherStations = DISTRICT_STATIONS.slice(4);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
      
      {/* Header & Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold mb-1.5">Point Diagnostic</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {topStations.map(st => (
              <button 
                key={st.id}
                onClick={() => onSelectDistrict(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${station.id === st.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {st.name}
              </button>
            ))}
            {otherStations.length > 0 && (
              <div className="relative inline-block">
                <select
                  value={otherStations.some(s => s.id === station.id) ? station.id : ''}
                  onChange={(e) => {
                    const found = DISTRICT_STATIONS.find(s => s.id === e.target.value);
                    if (found) onSelectDistrict(found);
                  }}
                  className={`appearance-none pl-2.5 pr-6 py-1 rounded-md text-xs font-semibold cursor-pointer outline-none transition-colors ${
                    otherStations.some(s => s.id === station.id) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <option value="" disabled>More...</option>
                  {otherStations.map(st => (
                    <option key={st.id} value={st.id} className="text-slate-800 bg-white">{st.name}</option>
                  ))}
                </select>
                <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${otherStations.some(s => s.id === station.id) ? 'text-slate-300' : 'text-slate-400'}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Numerical Model Comparison - Horizontal Bars */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Arbitration Performance</h4>
          {/* Sparkline error comparison */}
          <div className="flex items-end gap-1.5 h-6 opacity-80" title="Model errors relative to Ground Truth">
            <div className="w-2 bg-slate-300 rounded-t" style={{height: `${Math.min(100, Math.max(10, Math.abs(stationData.ncup - stationData.actual)*15))}%`}}></div>
            <div className="w-2 bg-slate-300 rounded-t" style={{height: `${Math.min(100, Math.max(10, Math.abs(stationData.ai - stationData.actual)*15))}%`}}></div>
            <div className="w-2 bg-rose-300 rounded-t" style={{height: `${Math.min(100, Math.max(10, Math.abs(stationData.naive - stationData.actual)*15))}%`}}></div>
            <div className="w-2 bg-emerald-500 rounded-t" style={{height: `${Math.min(100, Math.max(2, Math.abs(stationData.atmos - stationData.actual)*15))}%`}}></div>
            <span className="text-[9px] text-slate-400 ml-1 font-mono uppercase tracking-tighter">Err</span>
          </div>
        </div>
        
        <div className="space-y-2 text-xs font-mono">
          {[
            { label: 'NCUM Physical', val: stationData.ncup, color: 'bg-slate-300', text: 'text-slate-800' },
            { label: 'GraphCast AI', val: stationData.ai, color: 'bg-slate-300', text: 'text-slate-800' },
            { label: 'Naive Average', val: stationData.naive, color: 'bg-rose-200', text: 'text-rose-900' },
            { label: 'AtmosArbiter', val: stationData.atmos, color: 'bg-emerald-500', text: 'text-white', isHighlight: true },
            { label: 'Ground Truth', val: stationData.actual, color: 'bg-blue-600', text: 'text-white' }
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-24 text-right text-[10px] text-slate-500 truncate pr-2">{m.label}</div>
              <div className="flex-1 h-5 bg-slate-50 rounded-sm relative flex items-center border border-slate-100">
                <div className={`h-full ${m.color} transition-all duration-500`} style={{ width: `${(m.val / maxVal) * 100}%` }} />
                <span className={`absolute left-2 text-[10px] font-bold z-10 ${m.text}`}>
                  {m.val.toFixed(1)} <span className="text-[9px] font-normal opacity-70">{scenario.unit}</span>
                </span>
              </div>
              {m.isHighlight ? (
                <div className="w-14 flex items-center gap-1 text-[10px]">
                  <span className={`font-bold ${delta > 0 ? 'text-rose-500' : delta < 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                  <span className="text-slate-400">vs GT</span>
                </div>
              ) : (
                <div className="w-14"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Stacked Bar & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        
        {/* Dynamic Weight Bar */}
        <div className="flex flex-col justify-center space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono tracking-wide">
            <span className="text-blue-700 font-bold">NWP ({(dynamicNwpWeight * 100).toFixed(0)}%)</span>
            <span className="text-amber-600 font-bold">AI ({(dynamicAiWeight * 100).toFixed(0)}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${dynamicNwpWeight * 100}%` }} />
            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${dynamicAiWeight * 100}%` }} />
          </div>
        </div>

        {/* Orographic Specs inline */}
        <div className="flex items-center justify-between md:justify-around text-[10px] md:border-l border-slate-200 md:pl-4 text-slate-600 font-mono">
          <div className="text-center">
            <div className="text-slate-400 uppercase">Elev</div>
            <div className="font-bold text-slate-800">{station.elevation}m</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 uppercase">Slope</div>
            <div className="font-bold text-slate-800">{station.slope}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 uppercase">Relief</div>
            <div className="font-bold text-blue-700 truncate max-w-[60px]">{station.terrainType.split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* XAI Attribution */}
      <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg flex items-start gap-2.5 text-[11px]">
        <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-slate-700 line-clamp-2 leading-relaxed">
          <span className="font-bold text-blue-900">Arbitration Logic: </span>
          {station.xaiReasoning}
        </p>
      </div>

      {/* Compact Alert Banner */}
      <div className={`px-3 py-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
        isExtremeAlert 
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          {isExtremeAlert ? <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
          <div>
            <span className="font-bold mr-2">
              {isExtremeAlert ? 'DISASTER ALERT' : 'NOMINAL ENVELOPE'}
            </span>
            <span className="text-[11px] text-slate-600 hidden sm:inline-block">
              P({scenario.variable} &gt; {scenario.extremeThreshold}) = <strong className="font-mono">{exceedanceProb}%</strong>
            </span>
          </div>
        </div>
        <div className={`text-[10px] font-mono px-2 py-0.5 rounded bg-white border ${isExtremeAlert ? "border-rose-200 text-rose-700" : "border-emerald-200 text-emerald-700"} font-bold shrink-0`}>
          NDRF: {isExtremeAlert ? "ACTIVE" : "STANDBY"}
        </div>
      </div>

    </div>
  );
}
