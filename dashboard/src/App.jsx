import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadTimeBar from './components/LeadTimeBar';
import ModelComparisonQuad from './components/ModelComparisonQuad';
import MapboxMeteorologicalMap from './components/MapboxMeteorologicalMap';
import ClearCastInspector from './components/ClearCastInspector';
import CommercialImpactBar from './components/CommercialImpactBar';
import ThermoCheckModal from './components/ThermoCheckModal';
import ArchitectureModal from './components/ArchitectureModal';
import { SCENARIOS, DISTRICT_STATIONS } from './data/meteorologicalData';
import { BookOpen, ShieldCheck, CloudRain, Thermometer, Wind } from 'lucide-react';

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [selectedLeadTime, setSelectedLeadTime] = useState(24);
  const [viewMode, setViewMode] = useState('quad'); // Quad view by default so judges see all 4 models immediately!
  const [activeParameter, setActiveParameter] = useState('rain'); // 'rain' | 'temp' | 'wind'
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_STATIONS[0]);
  const [focusModelKey, setFocusModelKey] = useState('atmos');

  const [isThermoCheckOpen, setIsThermoCheckOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        
        {/* IMD-Style Meteorological Parameter & Scenario Control Strip (Matches IMD Data Service Portal) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          
          {/* Parameter Switcher (Rainfall / Temperature / Wind) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pr-1">Parameter:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setActiveParameter('rain')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'rain'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                Rainfall (mm)
              </button>

              <button
                onClick={() => setActiveParameter('temp')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'temp'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                Temperature (°C)
              </button>

              <button
                onClick={() => setActiveParameter('wind')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'wind'
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                Wind (km/h)
              </button>
            </div>
          </div>

          {/* Quick Architecture and Physics Modals */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-300"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Two-Tier Architecture</span>
            </button>

            <button
              onClick={() => setIsThermoCheckOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-emerald-300"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Physics Audit</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Mode */}
        {viewMode === 'quad' ? (
          /* QUAD VIEW: 4 Synchronized Mapbox GL Panels */
          <div className="space-y-4">
            <ModelComparisonQuad
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
              activeParameter={activeParameter}
            />

            <ClearCastInspector
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
            />
          </div>
        ) : (
          /* FOCUS VIEW: Large Mapbox GL Map + Inspector */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Large Interactive Mapbox Map (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 px-2">Layer:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'atmos', label: 'AtmosArbiter Blend' },
                    { key: 'naive', label: 'Naive Average' },
                    { key: 'ncup', label: 'Physical NWP' },
                    { key: 'ai', label: 'GraphCast AI' },
                  ].map((layer) => (
                    <button
                      key={layer.key}
                      onClick={() => setFocusModelKey(layer.key)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                        focusModelKey === layer.key
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[530px]">
                <MapboxMeteorologicalMap
                  scenario={activeScenario}
                  modelKey={focusModelKey}
                  modelLabel={
                    focusModelKey === 'atmos' ? 'AtmosArbiter Dynamically Blended Output' :
                    focusModelKey === 'naive' ? 'Naive Arithmetic Mean' :
                    focusModelKey === 'ncup' ? 'NCUM Physical NWP' : 'GraphCast AI Foundation'
                  }
                  selectedDistrict={selectedDistrict}
                  onSelectDistrict={setSelectedDistrict}
                  activeParameter={activeParameter}
                  isMini={false}
                  leadTimeHours={selectedLeadTime}
                />
              </div>
            </div>

            {/* Right: Point Inspector (5 cols) */}
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

        {/* 4. Commercial Feasibility & Socio-Economic ROI */}
        <CommercialImpactBar scenario={activeScenario} />

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-400 font-mono mt-6">
        AtmosArbiter • Ministry of Earth Sciences (MoES) / NCMRWF • Team MidNightCrew
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
