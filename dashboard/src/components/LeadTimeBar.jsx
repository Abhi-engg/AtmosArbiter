import React from 'react';
import { Clock, Zap, Database } from 'lucide-react';
import { LEAD_TIME_PROFILES } from '../data/meteorologicalData';

export default function LeadTimeBar({ selectedLeadTime, setSelectedLeadTime }) {
  const currentProfile = LEAD_TIME_PROFILES.find(p => p.hours === selectedLeadTime) || LEAD_TIME_PROFILES[0];

  return (
    <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left: Lead Time Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Horizon:</span>
          </div>

          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {LEAD_TIME_PROFILES.map((profile) => {
              const active = profile.hours === selectedLeadTime;
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
                  {profile.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Weight Allocation */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">AI Model:</span>
            <span className="font-bold text-amber-700">
              {(currentProfile.aiWeightBase * 100).toFixed(0)}%
            </span>
          </div>

          <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden flex">
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
            <span className="text-slate-500">Physical NWP:</span>
            <span className="font-bold text-blue-700">
              {(currentProfile.nwpWeightBase * 100).toFixed(0)}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
