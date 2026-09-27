import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadTimeBar from './components/LeadTimeBar';
import ModelComparisonQuad from './components/ModelComparisonQuad';
import MeteorologicalMap from './components/MeteorologicalMap';
import ClearCastInspector from './components/ClearCastInspector';
import CommercialImpactBar from './components/CommercialImpactBar';
import ThermoCheckModal from './components/ThermoCheckModal';
import ArchitectureModal from './components/ArchitectureModal';
import { SCENARIOS, DISTRICT_STATIONS } from './data/meteorologicalData';
import { BookOpen, Layers, ShieldCheck, Activity, ChevronRight, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [selectedLeadTime, setSelectedLeadTime] = useState(24);
  const [viewMode, setViewMode] = useState('quad'); // 'quad' or 'focus'
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_STATIONS[0]);
  const [focusModelKey, setFocusModelKey] = useState('atmos'); // for focus mode layer toggle

  // Modals
  const [isThermoCheckOpen, setIsThermoCheckOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenThermoCheck={() => setIsThermoCheckOpen(true)}
      />

      {/* 2. ChronoShift Lead Time Dynamic Scrubber */}
      <LeadTimeBar
        selectedLeadTime={selectedLeadTime}
        setSelectedLeadTime={setSelectedLeadTime}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Top Scenario Banner with Live Context & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE HISTORICAL BENCHMARK
              </span>
              <span className="text-xs text-slate-400 font-mono">{activeScenario.eventDate}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {activeScenario.title}: {activeScenario.subtitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {activeScenario.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-700 shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>CTO Two-Tier Architecture</span>
            </button>

            <button
              onClick={() => setIsThermoCheckOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-indigo-700/60 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Audit Physics</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Mode */}
        {viewMode === 'quad' ? (
          /* QUAD-SYNC VIEW: Displays all 4 models side-by-side */
          <div className="space-y-6">
            <ModelComparisonQuad
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
            />

            {/* In-Depth Point Inspector */}
            <ClearCastInspector
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
            />
          </div>
        ) : (
          /* FOCUS & XAI VIEW: Large interactive map + side inspector */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Large Interactive Map (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              {/* Layer Switcher Buttons for Focus Mode */}
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 px-2">Active Map Layer:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'atmos', label: 'AtmosArbiter Blend', color: 'emerald' },
                    { key: 'naive', label: 'Naive Average (Flawed)', color: 'rose' },
                    { key: 'ncup', label: 'Physical NWP', color: 'cyan' },
                    { key: 'ai', label: 'GraphCast AI', color: 'amber' },
                  ].map((layer) => (
                    <button
                      key={layer.key}
                      onClick={() => setFocusModelKey(layer.key)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                        focusModelKey === layer.key
                          ? 'bg-slate-800 text-white shadow border border-slate-700 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                      }`}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full-Size Canvas Map */}
              <div className="h-[520px]">
                <MeteorologicalMap
                  scenario={activeScenario}
                  modelKey={focusModelKey}
                  modelLabel={
                    focusModelKey === 'atmos' ? 'AtmosArbiter Dynamically Arbitrated Output' :
                    focusModelKey === 'naive' ? 'Naive Arithmetic Average (Spectral Smearing Flaw)' :
                    focusModelKey === 'ncup' ? 'NCUM 12km Physical NWP Model' : 'GraphCast AI Foundation Model'
                  }
                  selectedDistrict={selectedDistrict}
                  onSelectDistrict={setSelectedDistrict}
                  isMini={false}
                  leadTimeHours={selectedLeadTime}
                />
              </div>
            </div>

            {/* Right: Detailed District XAI Inspector (5 cols) */}
            <div className="lg:col-span-5">
              <ClearCastInspector
                scenario={activeScenario}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
                leadTimeHours={selectedLeadTime}
              />
            </div>

          </div>
        )}

        {/* 4. Commercial Feasibility & Socio-Economic ROI (Slide 5 Master Content) */}
        <CommercialImpactBar scenario={activeScenario} />

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-mono mt-8">
        AtmosArbiter • SIH 2026 Problem Statement ID: 26081 • Ministry of Earth Sciences (MoES) / NCMRWF • Team MidNightCrew
      </footer>

      {/* Modals */}
      <ThermoCheckModal
        isOpen={isThermoCheckOpen}
        onClose={() => setIsThermoCheckOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

    </div>
  );
}
