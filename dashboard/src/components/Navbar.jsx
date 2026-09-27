import React from 'react';
import { CloudLightning, Activity, Cpu, ShieldCheck, Layers, AlertTriangle } from 'lucide-react';
import { SCENARIOS } from '../data/meteorologicalData';

export default function Navbar({ activeScenario, setActiveScenario, viewMode, setViewMode, onOpenThermoCheck }) {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CloudLightning className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">AtmosArbiter</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                MoES • NCMRWF
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-blue-950 text-blue-300 border border-blue-800/60">
                PS 26081
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hybrid AI–NWP Dynamic Forecast Arbitration System • SIH 2026 Tier-1 Prototype
            </p>
          </div>
        </div>

        {/* System Health Status Pills */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Triton TensorRT: <span className="text-emerald-400">ONLINE (34ms)</span></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grid: <span className="text-cyan-300">0.25° South Asia</span></span>
          </div>
          <button 
            onClick={onOpenThermoCheck}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>ThermoCheck Gate: <span className="text-emerald-400 font-bold">ARMED</span></span>
          </button>
        </div>

        {/* Scenario Switcher & View Mode Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Scenario Select */}
          <select
            value={activeScenario.id}
            onChange={(e) => {
              const selected = SCENARIOS.find(s => s.id === e.target.value);
              if (selected) setActiveScenario(selected);
            }}
            className="bg-slate-950 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.id === 'kerala_2018' ? '🌊 ' : scenario.id === 'biparjoy_2023' ? '🌀 ' : '☀️ '}
                {scenario.title}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('quad')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'quad' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Quad-Sync
            </button>
            <button
              onClick={() => setViewMode('focus')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'focus' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Focus & XAI
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
