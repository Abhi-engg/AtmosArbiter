import React from 'react';
import { Sprout, Zap, ShieldCheck, Clock4, Building2, ExternalLink } from 'lucide-react';

export default function CommercialImpactBar({ scenario }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Quantifiable Impact & B2G / B2B Commercial Feasibility
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Mission Mausam (₹2,000 Cr) & Socio-Economic ROI
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
          MoES / NCMRWF Mandate Alignment
        </span>
      </div>

      {/* 4 Quantified ROI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Card 1: Agriculture (NCAER) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Agriculture (NCAER)</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-emerald-400 font-mono">₹13,331 Cr/yr</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Protected farm income through accurate sowing, fertilizer & harvest advisories.
            </p>
          </div>
        </div>

        {/* Card 2: Renewable Energy (CERC DSM) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Clean Energy (CERC DSM)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-amber-400 font-mono">₹15–25 L/100MW</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Annual savings per solar/wind plant in avoided grid-deviation penalties.
            </p>
          </div>
        </div>

        {/* Card 3: Crop Insurance (PMFBY) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Crop Insurance (PMFBY)</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-cyan-400 font-mono">30 Days → 48 Hours</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Instant parametric claim settlement using immutable 0.25° gridded audit logs.
            </p>
          </div>
        </div>

        {/* Card 4: Forecaster Productivity */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Operational Synthesis</span>
            <Clock4 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-indigo-400 font-mono">90 min → &lt; 45s</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              ~1,000+ hours saved annually across IMD & NCMRWF duty shifts.
            </p>
          </div>
        </div>

      </div>

      {/* Scenario-Specific Early Warning Advisory Footer */}
      <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white">Active Advisory for {scenario.title}: </span>
          <span className="text-slate-300">{scenario.advisory.action}</span>
        </div>
        <div className="shrink-0 font-mono text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1 rounded border border-emerald-800/60">
          💰 {scenario.advisory.savings}
        </div>
      </div>

    </div>
  );
}
