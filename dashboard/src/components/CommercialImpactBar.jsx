import React from 'react';
import { Sprout, Zap, ShieldCheck, Clock4 } from 'lucide-react';

export default function CommercialImpactBar({ scenario }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs shadow-xs gap-2 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
      
      <div className="flex items-center gap-2.5 px-3 py-1 flex-1 min-w-0">
        <div className="p-1 bg-emerald-50 rounded shrink-0">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <span className="text-slate-500 font-medium truncate">Agri Value</span>
        <span className="font-bold text-emerald-700 font-mono ml-auto">₹13,331 Cr</span>
      </div>
      
      <div className="flex items-center gap-2.5 px-3 py-1 flex-1 min-w-0">
        <div className="p-1 bg-amber-50 rounded shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <span className="text-slate-500 font-medium truncate">Grid Savings</span>
        <span className="font-bold text-amber-700 font-mono ml-auto">₹25L/100MW</span>
      </div>
      
      <div className="flex items-center gap-2.5 px-3 py-1 flex-1 min-w-0">
        <div className="p-1 bg-blue-50 rounded shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className="text-slate-500 font-medium truncate">Claims SLA</span>
        <span className="font-bold text-blue-700 font-mono ml-auto">30d → 48h</span>
      </div>
      
      <div className="flex items-center gap-2.5 px-3 py-1 flex-1 min-w-0">
        <div className="p-1 bg-indigo-50 rounded shrink-0">
          <Clock4 className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <span className="text-slate-500 font-medium truncate">Recon Latency</span>
        <span className="font-bold text-indigo-700 font-mono ml-auto">&lt; 45s</span>
      </div>
      
    </div>
  );
}
