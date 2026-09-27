import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, Database, CheckCircle2 } from 'lucide-react';
import MapboxMeteorologicalMap from './MapboxMeteorologicalMap';

export default function ModelComparisonQuad({ 
  scenario, 
  selectedDistrict, 
  onSelectDistrict, 
  leadTimeHours,
  activeParameter = 'rain'
}) {
  return (
    <div className="space-y-4">
      {/* 1. Header row above panels */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Model Comparison Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">Comparing standalone models with naive and dynamic ensembles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            NWP
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            AI
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-md border border-rose-200 text-rose-700 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            Naive Baseline
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200 text-emerald-700 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            AtmosArbiter
          </div>
        </div>
      </div>

      {/* 4. 2x2 grid on md, 4-col on xl */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Panel 1: Physical NWP */}
        <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Physical NWP (NCUM)</span>
            </div>
          </div>
          {/* 6. Heights: 300px mobile, 380px desktop */}
          <div className="h-[300px] md:h-[380px] w-full relative">
            <MapboxMeteorologicalMap
              scenario={scenario}
              modelKey="ncup"
              modelLabel="NCUM NWP"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              activeParameter={activeParameter}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          </div>
        </div>

        {/* Panel 2: AI Model */}
        <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-slate-700">AI Model (GraphCast)</span>
            </div>
          </div>
          <div className="h-[300px] md:h-[380px] w-full relative">
            <MapboxMeteorologicalMap
              scenario={scenario}
              modelKey="ai"
              modelLabel="GraphCast AI"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              activeParameter={activeParameter}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          </div>
        </div>

        {/* Panel 3: Naive Average */}
        <div className="flex flex-col border-2 border-rose-400 rounded-xl overflow-hidden bg-white shadow-sm relative">
          <div className="p-3 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-sm font-semibold text-rose-900">Naive Ensemble</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-700 bg-rose-200/50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Baseline (Flawed)
            </span>
          </div>
          <div className="h-[300px] md:h-[380px] w-full relative">
            <MapboxMeteorologicalMap
              scenario={scenario}
              modelKey="naive"
              modelLabel="Naive Average"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              activeParameter={activeParameter}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          </div>
        </div>

        {/* Panel 4: AtmosArbiter Blend */}
        <div className="flex flex-col border-2 border-emerald-500 rounded-xl overflow-hidden bg-white shadow-md relative ring-4 ring-emerald-500/10">
          <div className="p-3 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-bold text-emerald-900">AtmosArbiter</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Recommended
            </span>
          </div>
          <div className="h-[300px] md:h-[380px] w-full relative">
            <MapboxMeteorologicalMap
              scenario={scenario}
              modelKey="atmos"
              modelLabel="Dynamic Blend"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              activeParameter={activeParameter}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          </div>
        </div>

      </div>

      {/* 5. Compact summary row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">AtmosArbiter Outperforms Baseline</h4>
            <p className="text-xs text-slate-500">RMSE comparison over validation period</p>
          </div>
        </div>
        <div className="flex items-center gap-6 divide-x divide-slate-200">
          <div className="flex flex-col px-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Naive Average RMSE</span>
            <span className="text-lg font-mono font-semibold text-rose-600">4.2<span className="text-xs text-rose-400 font-sans ml-1">mm</span></span>
          </div>
          <div className="flex flex-col pl-6">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">AtmosArbiter RMSE</span>
            <span className="text-lg font-mono font-semibold text-emerald-600">2.8<span className="text-xs text-emerald-400 font-sans ml-1">mm</span></span>
          </div>
          <div className="flex flex-col pl-6">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Improvement</span>
            <span className="text-lg font-semibold text-indigo-600 flex items-center">
              +33.3%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
