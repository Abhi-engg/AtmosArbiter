import React from 'react';
import { CloudLightning, Cpu, ShieldCheck, Layers, Activity } from 'lucide-react';
import { SCENARIOS } from '../data/meteorologicalData';

export default function Navbar({ activeScenario, setActiveScenario, viewMode, setViewMode, onOpenThermoCheck }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <CloudLightning className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">AtmosArbiter</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Live Console
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Scenario Selector */}
          <select
            value={activeScenario.id}
            onChange={(e) => {
              const selected = SCENARIOS.find(s => s.id === e.target.value);
              if (selected) setActiveScenario(selected);
            }}
            className="bg-slate-50 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('quad')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'quad' 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Quad View
            </button>
            <button
              onClick={() => setViewMode('focus')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'focus' 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Focus View
            </button>
          </div>

          {/* ThermoCheck Quick Trigger */}
          <button 
            onClick={onOpenThermoCheck}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer font-medium"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Physics Gate</span>
          </button>

        </div>

      </div>
    </header>
  );
}
