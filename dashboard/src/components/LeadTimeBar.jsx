import React from 'react';
import { Clock, ShieldAlert, Cpu, Database, ChevronRight, Zap } from 'lucide-react';
import { LEAD_TIME_PROFILES } from '../data/meteorologicalData';

export default function LeadTimeBar({ selectedLeadTime, setSelectedLeadTime }) {
  const currentProfile = LEAD_TIME_PROFILES.find(p => p.hours === selectedLeadTime) || LEAD_TIME_PROFILES[0];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Lead Time Selector */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>ChronoShift Horizon:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {LEAD_TIME_PROFILES.map((profile) => {
              const active = profile.hours === selectedLeadTime;
              return (
                <button
                  key={profile.hours}
                  onClick={() => setSelectedLeadTime(profile.hours)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {profile.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Weight Gauge */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end bg-slate-950/70 px-4 py-2 rounded-lg border border-slate-800">
          
          {/* AI vs NWP Dynamic Allocation */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">AI Model Weight:</span>
              <span className="font-mono font-bold text-amber-400">
                {(currentProfile.aiWeightBase * 100).toFixed(0)}%
              </span>
            </div>

            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-400 h-full transition-all duration-300" 
                style={{ width: `${currentProfile.aiWeightBase * 100}%` }}
              />
              <div 
                className="bg-cyan-400 h-full transition-all duration-300" 
                style={{ width: `${currentProfile.nwpWeightBase * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Physical NWP Weight:</span>
              <span className="font-mono font-bold text-cyan-400">
                {(currentProfile.nwpWeightBase * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Operational Rule Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">|</span>
            <span className="text-slate-400 font-medium">
              {currentProfile.hours <= 48 ? (
                <span className="text-amber-300 flex items-center gap-1">
                  ⚡ AI Steering Fast Dominant (t &le; 48h)
                </span>
              ) : (
                <span className="text-cyan-300 flex items-center gap-1">
                  🛡️ Physical Hydrodynamics Enforced (t &ge; 72h)
                </span>
              )}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
