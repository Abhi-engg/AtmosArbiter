import React from 'react';
import { X, Layers, Cpu, Database, Server, Shield, CheckCircle2 } from 'lucide-react';
import { TECHNICAL_PILLARS } from '../data/meteorologicalData';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">
                AtmosArbiter — CTO Architecture & Two-Tier Strategy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Scientific Innovations, PyTorch Architecture & NCMRWF Enterprise Path
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Two Tier Strategy Box (Judge Defense Q1) */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-400" />
                The Two-Tier Strategy (Hackathon Prototype vs. NCMRWF Production)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Judge Defense Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-900/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Tier 1: Working Hackathon MVP (Live Today)
                </div>
                <ul className="text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Data Feeds:</strong> GFS 0.25° GRIB2 + IMD Gridded Observations + SRTM DEM.</li>
                  <li><strong>Core Engine:</strong> PyTorch Res-SE U-Net + PeakGuard Pinball Quantile Loss.</li>
                  <li><strong>Serving & UI:</strong> Fast React/Tailwind Dashboard + Local In-Memory Tensor Cache.</li>
                  <li><strong>Proof:</strong> Demonstrates the core scientific arbitration without massive supercomputer overhead.</li>
                </ul>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-900/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  Tier 2: MoES / NCMRWF Target Production
                </div>
                <ul className="text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Direct Feeds:</strong> NCUM 12km (HPC NetCDF4) + NEPS-G (23 Ensembles) + GraphCast.</li>
                  <li><strong>Compute Cluster:</strong> NVIDIA TensorRT FP16 on Triton Server (&lt; 45s national run).</li>
                  <li><strong>Egress:</strong> Automated GeoTIFF push to ISRO Bhuvan &amp; SDMA REST Webhooks.</li>
                  <li><strong>Downstream Value:</strong> Does not replace NCUM supercomputing runs; maximizes existing HPC ROI!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5 Core Pillars Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              The 5 Scientific Pillars of AtmosArbiter:
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TECHNICAL_PILLARS.map((pillar, idx) => (
                <div key={pillar.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-300 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white text-sm">{pillar.name}</span>
                      <span className="font-mono text-cyan-400 text-[11px]">({pillar.tech})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 self-start sm:self-auto">
                      {pillar.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed pl-7">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
}
