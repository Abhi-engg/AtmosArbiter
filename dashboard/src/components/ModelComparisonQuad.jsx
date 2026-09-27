import React from 'react';
import MeteorologicalMap from './MeteorologicalMap';
import { ShieldCheck, AlertOctagon, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ModelComparisonQuad({ scenario, selectedDistrict, onSelectDistrict, leadTimeHours }) {
  return (
    <div className="space-y-4">
      
      {/* Overview Banner explaining the Flaw vs Solution */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Core Paradigm Demonstration
            </span>
            <h2 className="text-base font-bold text-white m-0">
              The Consensus Delusion vs. Dynamic Arbitration
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Notice Panel 3 below: Traditional ensemble averaging dilutes the extreme disaster peak by{' '}
            <span className="text-rose-400 font-bold font-mono">{Math.abs(scenario.metrics.naivePeakLoss)}%</span>, 
            turning a life-threatening flash flood or heatwave alert into a harmless average. 
            AtmosArbiter (Panel 4) uses <span className="text-cyan-300 font-medium">TopoWeight</span> and{' '}
            <span className="text-emerald-300 font-medium">PeakGuard</span> to preserve{' '}
            <span className="text-emerald-400 font-bold font-mono">95.5%</span> of the true peak.
          </p>
        </div>

        {/* Quick Comparative Stat Pill */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800/80 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Naive RMSE</div>
            <div className="text-rose-400 font-bold">{scenario.metrics.naiveRmse} {scenario.unit}</div>
          </div>
          <div className="text-slate-600">→</div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">AtmosArbiter RMSE</div>
            <div className="text-emerald-400 font-bold">{scenario.metrics.atmosRmse} {scenario.unit} (-60%)</div>
          </div>
        </div>
      </div>

      {/* 4-Panel Synchronized Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Panel 1: Physical NWP */}
        <div className="flex flex-col h-[380px]">
          <MeteorologicalMap
            scenario={scenario}
            modelKey="ncup"
            modelLabel="1. Physical NWP (NCUM 12km)"
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            isMini={true}
            leadTimeHours={leadTimeHours}
          />
        </div>

        {/* Panel 2: AI Foundation Model */}
        <div className="flex flex-col h-[380px]">
          <MeteorologicalMap
            scenario={scenario}
            modelKey="ai"
            modelLabel="2. AI Model (GraphCast / Pangu)"
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            isMini={true}
            leadTimeHours={leadTimeHours}
          />
        </div>

        {/* Panel 3: Naive Arithmetic Average (Flawed) */}
        <div className="flex flex-col h-[380px] ring-2 ring-rose-500/30 rounded-xl">
          <MeteorologicalMap
            scenario={scenario}
            modelKey="naive"
            modelLabel="3. Naive MME Average (Current Flaw)"
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            isMini={true}
            leadTimeHours={leadTimeHours}
          />
        </div>

        {/* Panel 4: AtmosArbiter Dynamic Blend (Our Solution) */}
        <div className="flex flex-col h-[380px] ring-2 ring-emerald-500/50 rounded-xl shadow-xl shadow-emerald-950/20">
          <MeteorologicalMap
            scenario={scenario}
            modelKey="atmos"
            modelLabel="4. AtmosArbiter Blended Output"
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            isMini={true}
            leadTimeHours={leadTimeHours}
          />
        </div>

      </div>

    </div>
  );
}
