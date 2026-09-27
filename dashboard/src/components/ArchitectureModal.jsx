import React from 'react';
import { X, Layers, Server } from 'lucide-react';
import { TECHNICAL_PILLARS } from '../data/meteorologicalData';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">
                AtmosArbiter — System Architecture
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Two-Tier Strategy &amp; Core Pipeline Modules
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Two Tier Strategy Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                Two-Tier Operational Scoping
              </span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                Verified Scope
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Tier 1: Prototype Engine (Active)
                </div>
                <ul className="text-slate-600 space-y-1 list-disc list-inside leading-relaxed">
                  <li>GFS 0.25° GRIB2 + IMD Gridded Observations + SRTM DEM.</li>
                  <li>PyTorch Res-SE U-Net + PeakGuard Pinball Quantile Loss.</li>
                  <li>In-memory 0.25° dynamic arbitration inference.</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Tier 2: Enterprise Target (Production)
                </div>
                <ul className="text-slate-600 space-y-1 list-disc list-inside leading-relaxed">
                  <li>NCUM 12km (HPC NetCDF4) + NEPS-G (23 Ensembles) + GraphCast.</li>
                  <li>TensorRT FP16 on Triton Server (&lt; 45s national run).</li>
                  <li>Automated GeoTIFF push to ISRO Bhuvan &amp; SDMA Webhooks.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5 Core Pillars Breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Core Engineered Components:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {TECHNICAL_PILLARS.map((pillar, idx) => (
                <div key={pillar.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center font-mono font-bold text-slate-700 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{pillar.name}</span>
                      <span className="font-mono text-blue-700 text-[11px]">({pillar.tech})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 self-start sm:self-auto font-medium">
                      {pillar.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug pl-6">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
