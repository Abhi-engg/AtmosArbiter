import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, X, Check, Flame, Zap } from 'lucide-react';

export default function ThermoCheckModal({ isOpen, onClose }) {
  const [simulationState, setSimulationState] = useState('nominal');

  if (!isOpen) return null;

  const triggerHallucinationTest = () => {
    setSimulationState('hallucination_detected');
    setTimeout(() => {
      setSimulationState('resolved');
    }, 1800);
  };

  const resetTest = () => {
    setSimulationState('nominal');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">
                ThermoCheck Gate — Physical Constraints
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clausius-Clapeyron Saturation &amp; NCUM Fallback Engine
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Scientific Formulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-blue-700 font-bold block mb-1">Clausius-Clapeyron Saturation:</span>
              <code className="text-slate-700 text-[11px]">
                e_sat(T) = 6.112 &times; exp(17.67T / (T + 243.5))
              </code>
              <div className="text-[10px] text-slate-500 mt-1">Constraint: Specific humidity q &le; q_sat</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-blue-700 font-bold block mb-1">Hydrostatic Balance:</span>
              <code className="text-slate-700 text-[11px]">
                &part;p / &part;z = -&rho;g
              </code>
              <div className="text-[10px] text-slate-500 mt-1">Constraint: Vertical stability enforced</div>
            </div>
          </div>

          {/* Audit Metrics Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Physical Check</th>
                  <th className="p-3">Rule</th>
                  <th className="p-3">Violations</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-3 font-medium text-slate-900">Moisture Saturation</td>
                  <td className="p-3 text-slate-500">q &le; q_sat</td>
                  <td className="p-3">
                    {simulationState === 'hallucination_detected' ? (
                      <span className="text-rose-600 font-bold">12 unphysical cells</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">0 cells (0.00%)</span>
                    )}
                  </td>
                  <td className="p-3">
                    {simulationState === 'hallucination_detected' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                        CLAMPING APPLIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        VALIDATED
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Hydrostatic Gradient</td>
                  <td className="p-3 text-slate-500">&part;p / &part;z &le; 0</td>
                  <td className="p-3 text-emerald-700 font-bold">0 cells (0.00%)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      VALIDATED
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Rainfall Non-Negativity</td>
                  <td className="p-3 text-slate-500">Rain &ge; 0.0 mm</td>
                  <td className="p-3 text-emerald-700 font-bold">0 cells</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      VALIDATED
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">NCUM Pixel Fallback</td>
                  <td className="p-3 text-slate-500">Cluster &gt; 9 cells</td>
                  <td className="p-3">
                    {simulationState === 'resolved' ? (
                      <span className="text-amber-700 font-bold">1 cluster</span>
                    ) : (
                      <span className="text-slate-500">0 clusters</span>
                    )}
                  </td>
                  <td className="p-3">
                    {simulationState === 'resolved' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                        FALLBACK ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                        IDLE
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Interactive Stress Test */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Live Thermodynamic Stress Test:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulate unphysical AI forecast hallucination (45°C + 95% RH)
                </p>
              </div>

              {simulationState === 'nominal' ? (
                <button
                  onClick={triggerHallucinationTest}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Inject Blip
                </button>
              ) : (
                <button
                  onClick={resetTest}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {simulationState === 'hallucination_detected' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>VIOLATION DETECTED:</strong> Moisture exceeds Clausius-Clapeyron saturation curve. Clamping applied.
                </span>
              </div>
            )}

            {simulationState === 'resolved' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>PROTECTION VERIFIED:</strong> Persistent anomaly snapped back to physical NCUM baseline.
                </span>
              </div>
            )}
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
