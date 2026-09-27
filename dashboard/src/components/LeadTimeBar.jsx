import React from 'react';
import { Clock } from 'lucide-react';
import { LEAD_TIME_PROFILES } from '../data/meteorologicalData';

export default function LeadTimeBar({ selectedLeadTime, setSelectedLeadTime }) {
  const currentProfile = LEAD_TIME_PROFILES.find(p => p.hours === selectedLeadTime) || LEAD_TIME_PROFILES[0];

  return (
    <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-1.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left: Lead Time Selector & Confidence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Horizon:</span>
          </div>

          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {LEAD_TIME_PROFILES.map((profile) => {
              const active = profile.hours === selectedLeadTime;
              const shortLabel = profile.label.split(' ')[0]; // E.g., 't+24h'
              
              return (
                <button
                  key={profile.hours}
                  onClick={() => setSelectedLeadTime(profile.hours)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>

          {/* Confidence Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500">
            <div className={`w-1.5 h-1.5 rounded-full ${currentProfile.aiWeightBase > 0.5 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span>Conf: {Math.round(Math.max(currentProfile.aiWeightBase, currentProfile.nwpWeightBase) * 100)}%</span>
          </div>
        </div>

        {/* Right: Dynamic Weight Allocation (Minimal) */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm"></div>
            <span className="font-bold text-amber-700">
              {(currentProfile.aiWeightBase * 100).toFixed(0)}%
            </span>
          </div>

          <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="bg-amber-500 h-full transition-all duration-300" 
              style={{ width: `${currentProfile.aiWeightBase * 100}%` }}
            />
            <div 
              className="bg-blue-600 h-full transition-all duration-300" 
              style={{ width: `${currentProfile.nwpWeightBase * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
            <span className="font-bold text-blue-700">
              {(currentProfile.nwpWeightBase * 100).toFixed(0)}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
