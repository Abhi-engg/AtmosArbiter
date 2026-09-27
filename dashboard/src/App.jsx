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
import { BookOpen, ShieldCheck, CloudRain, Thermometer, Wind, Compass } from 'lucide-react';

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [selectedLeadTime, setSelectedLeadTime] = useState(24);
  const [viewMode, setViewMode] = useState('quad');
  const [activeParameter, setActiveParameter] = useState('rain');
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_STATIONS[0]);
  const [focusModelKey, setFocusModelKey] = useState('atmos');

  const [isThermoCheckOpen, setIsThermoCheckOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
            background-size: 200% 200%;
          }
        `}
      </style>
      
      <Navbar
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <LeadTimeBar
        selectedLeadTime={selectedLeadTime}
        setSelectedLeadTime={setSelectedLeadTime}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setActiveParameter('rain')}
                title="Rainfall"
                className={`p-1.5 md:px-2.5 md:py-1 text-xs rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'rain'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CloudRain className="w-4 h-4" />
                <span className="hidden md:inline">Rainfall</span>
              </button>

              <button
                onClick={() => setActiveParameter('temp')}
                title="Temperature"
                className={`p-1.5 md:px-2.5 md:py-1 text-xs rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'temp'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                <span className="hidden md:inline">Temp</span>
              </button>

              <button
                onClick={() => setActiveParameter('wind')}
                title="Wind"
                className={`p-1.5 md:px-2.5 md:py-1 text-xs rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'wind'
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wind className="w-4 h-4" />
                <span className="hidden md:inline">Wind</span>
              </button>

              <button
                onClick={() => setActiveParameter('weights')}
                title="Weight Maps"
                className={`p-1.5 md:px-2.5 md:py-1 text-xs rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeParameter === 'weights'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden md:inline">Weights</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              title="Two-Tier Architecture"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer border border-slate-300"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => setIsThermoCheckOpen(true)}
              title="Physics Audit"
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer border border-emerald-300"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Compact Scenario Event Summary Strip */}
        <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs">
          <span className="font-semibold text-slate-800">{activeScenario.name}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">{activeScenario.date || 'Multiple Dates'}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Peak: {activeScenario.peakValue || activeScenario.peakRainfall || 'N/A'}</span>
          <span className="text-slate-300">|</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            activeScenario.severity === 'Extreme' ? 'bg-rose-100 text-rose-700' :
            activeScenario.severity === 'Severe' ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {activeScenario.severity || 'High Impact'}
          </span>
        </div>

        {viewMode === 'quad' ? (
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <div className="lg:col-span-8 flex flex-col space-y-2.5">
              <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                {[
                  { key: 'atmos', label: 'AtmosArbiter' },
                  { key: 'naive', label: 'Naive Mean' },
                  { key: 'ncup', label: 'NCUM' },
                  { key: 'ai', label: 'GraphCast' },
                ].map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => setFocusModelKey(layer.key)}
                    className={`px-3 py-1 text-xs rounded-lg transition cursor-pointer whitespace-nowrap ${
                      focusModelKey === layer.key
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>

              <div className="h-[530px] p-[2px] rounded-xl bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-gradient-x shadow-sm">
                <div className="h-full w-full rounded-[10px] overflow-hidden bg-white">
                  <MapboxMeteorologicalMap
                    scenario={activeScenario}
                    modelKey={focusModelKey}
                    modelLabel={
                      focusModelKey === 'atmos' ? 'AtmosArbiter Blend' :
                      focusModelKey === 'naive' ? 'Naive Mean' :
                      focusModelKey === 'ncup' ? 'NCUM Physical' : 'GraphCast AI'
                    }
                    selectedDistrict={selectedDistrict}
                    onSelectDistrict={setSelectedDistrict}
                    activeParameter={activeParameter}
                    isMini={false}
                    leadTimeHours={selectedLeadTime}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ClearCastInspector
                scenario={activeScenario}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
                leadTimeHours={selectedLeadTime}
              />
            </div>

          </div>
        )}

        <CommercialImpactBar scenario={activeScenario} />

      </main>

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400 mt-4">
        AtmosArbiter · MoES/NCMRWF · MidNightCrew
      </footer>

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
