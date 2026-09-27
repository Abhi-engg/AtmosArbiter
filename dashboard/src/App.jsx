import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadTimeBar from './components/LeadTimeBar';
import ModelComparisonQuad from './components/ModelComparisonQuad';
import MeteorologicalMap from './components/MeteorologicalMap';
import MapboxMeteorologicalMap from './components/MapboxMeteorologicalMap';
import WPGoMap from './components/WPGoMap';
import ClearCastInspector from './components/ClearCastInspector';
import CommercialImpactBar from './components/CommercialImpactBar';
import ThermoCheckModal from './components/ThermoCheckModal';
import ArchitectureModal from './components/ArchitectureModal';
import { SCENARIOS, DISTRICT_STATIONS } from './data/meteorologicalData';
import { BookOpen, ShieldCheck, MapPin } from 'lucide-react';

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [selectedLeadTime, setSelectedLeadTime] = useState(24);
  const [viewMode, setViewMode] = useState('focus');
  const [mapEngine, setMapEngine] = useState('wpgmza'); // Default to WP Go Maps everywhere!
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

      {/* 2. ChronoShift Lead Time Scrubber */}
      <LeadTimeBar
        selectedLeadTime={selectedLeadTime}
        setSelectedLeadTime={setSelectedLeadTime}
      />

      {/* 3. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        
        {/* Compact Scenario Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {activeScenario.eventDate}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {activeScenario.title}
            </span>
            <span className="hidden md:inline text-xs text-slate-500 font-mono">
              • Observed Peak: {activeScenario.referenceActual.peakValue} {activeScenario.unit} ({activeScenario.referenceActual.location})
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-300"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Architecture</span>
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
          /* QUAD VIEW: 4 Synchronized Maps */
          <div className="space-y-4">
            <ModelComparisonQuad
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
              mapEngine={mapEngine}
            />

            <ClearCastInspector
              scenario={activeScenario}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              leadTimeHours={selectedLeadTime}
            />
          </div>
        ) : (
          /* FOCUS VIEW: Large Map + Inspector */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Large Interactive Map (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                {/* Engine Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500 uppercase pl-1">Engine:</span>
                  <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      onClick={() => setMapEngine('wpgmza')}
                      className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded transition cursor-pointer ${
                        mapEngine === 'wpgmza'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      WP Go Maps
                    </button>
                    <button
                      onClick={() => setMapEngine('mapbox')}
                      className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded transition cursor-pointer ${
                        mapEngine === 'mapbox'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Mapbox GL
                    </button>
                    <button
                      onClick={() => setMapEngine('canvas')}
                      className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded transition cursor-pointer ${
                        mapEngine === 'canvas'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Canvas
                    </button>
                  </div>
                </div>

                {/* Layer Selector */}
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
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
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

              <div className="h-[520px]">
                {mapEngine === 'wpgmza' ? (
                  <WPGoMap
                    modelKey={focusModelKey}
                    modelLabel={
                      focusModelKey === 'atmos' ? 'AtmosArbiter Dynamically Blended Output (WP Go Maps)' :
                      focusModelKey === 'naive' ? 'Naive Arithmetic Mean (WP Go Maps)' :
                      focusModelKey === 'ncup' ? 'NCUM Physical NWP (WP Go Maps)' : 'GraphCast AI Foundation (WP Go Maps)'
                    }
                    scenario={activeScenario}
                    isMini={false}
                  />
                ) : mapEngine === 'mapbox' ? (
                  <MapboxMeteorologicalMap
                    scenario={activeScenario}
                    modelKey={focusModelKey}
                    modelLabel={
                      focusModelKey === 'atmos' ? 'AtmosArbiter Dynamically Blended Output (Mapbox GL)' :
                      focusModelKey === 'naive' ? 'Naive Arithmetic Mean' :
                      focusModelKey === 'ncup' ? 'NCUM Physical NWP' : 'GraphCast AI Foundation'
                    }
                    selectedDistrict={selectedDistrict}
                    onSelectDistrict={setSelectedDistrict}
                    isMini={false}
                    leadTimeHours={selectedLeadTime}
                  />
                ) : (
                  <MeteorologicalMap
                    scenario={activeScenario}
                    modelKey={focusModelKey}
                    modelLabel={
                      focusModelKey === 'atmos' ? 'AtmosArbiter Dynamically Blended Output (Canvas)' :
                      focusModelKey === 'naive' ? 'Naive Arithmetic Mean' :
                      focusModelKey === 'ncup' ? 'NCUM Physical NWP' : 'GraphCast AI Foundation'
                    }
                    selectedDistrict={selectedDistrict}
                    onSelectDistrict={setSelectedDistrict}
                    isMini={false}
                    leadTimeHours={selectedLeadTime}
                  />
                )}
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

      {/* Clean Light Footer */}
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
