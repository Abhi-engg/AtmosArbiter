import React from 'react';
import { CloudLightning, Layers, Activity } from 'lucide-react';
import { SCENARIOS } from '../data/meteorologicalData';

export default function Navbar({ activeScenario, setActiveScenario, viewMode, setViewMode, onOpenThermoCheck }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-8 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <CloudLightning className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">AtmosArbiter</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-200 font-medium">
                PS 26081
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
            className="bg-slate-50 text-slate-800 text-xs font-medium rounded-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name || scenario.title.split(' - ')[0] || scenario.title}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-full bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('quad')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'focus' 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Focus View
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
