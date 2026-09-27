import React from 'react';
import { Sprout, Zap, ShieldCheck, Clock4 } from 'lucide-react';

export default function CommercialImpactBar({ scenario }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
      
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Card 1: Agriculture */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Agriculture (NCAER)</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-base font-bold text-emerald-700 font-mono">₹13,331 Cr/yr</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Protected smallholder crop value.
            </p>
          </div>
        </div>

        {/* Card 2: Clean Energy */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Grid Reliability (CERC)</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-base font-bold text-amber-700 font-mono">₹15–25 L/100MW</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Saved in deviation penalties.
            </p>
          </div>
        </div>

        {/* Card 3: Crop Insurance */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Parametric Claims</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-base font-bold text-blue-700 font-mono">30d → 48 Hours</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Automated grid audit settlement.
            </p>
          </div>
        </div>

        {/* Card 4: Operational Speedup */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Duty Reconciliation</span>
            <Clock4 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-base font-bold text-indigo-700 font-mono">90 min → &lt; 45s</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Operational latency on GPU.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
