import React from 'react';
import WPGoMap from './WPGoMap';
import MeteorologicalMap from './MeteorologicalMap';

export default function ModelComparisonQuad({ scenario, selectedDistrict, onSelectDistrict, leadTimeHours, mapEngine = 'wpgmza' }) {
  return (
    <div className="space-y-4">
      
      {/* 4-Panel Synchronized Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Panel 1: Physical NWP */}
        <div className="flex flex-col h-[350px]">
          {mapEngine === 'wpgmza' ? (
            <WPGoMap
              modelKey="ncup"
              modelLabel="Physical NWP (NCUM)"
              scenario={scenario}
              isMini={true}
            />
          ) : (
            <MeteorologicalMap
              scenario={scenario}
              modelKey="ncup"
              modelLabel="Physical NWP (NCUM)"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          )}
        </div>

        {/* Panel 2: AI Model */}
        <div className="flex flex-col h-[350px]">
          {mapEngine === 'wpgmza' ? (
            <WPGoMap
              modelKey="ai"
              modelLabel="AI Foundation (GraphCast)"
              scenario={scenario}
              isMini={true}
            />
          ) : (
            <MeteorologicalMap
              scenario={scenario}
              modelKey="ai"
              modelLabel="AI Foundation (GraphCast)"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          )}
        </div>

        {/* Panel 3: Naive Average */}
        <div className="flex flex-col h-[350px] ring-1 ring-rose-300 rounded-xl">
          {mapEngine === 'wpgmza' ? (
            <WPGoMap
              modelKey="naive"
              modelLabel="Naive Ensemble Average"
              scenario={scenario}
              isMini={true}
            />
          ) : (
            <MeteorologicalMap
              scenario={scenario}
              modelKey="naive"
              modelLabel="Naive Ensemble Average"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          )}
        </div>

        {/* Panel 4: AtmosArbiter */}
        <div className="flex flex-col h-[350px] ring-2 ring-emerald-500 rounded-xl shadow-sm">
          {mapEngine === 'wpgmza' ? (
            <WPGoMap
              modelKey="atmos"
              modelLabel="AtmosArbiter Dynamic Blend"
              scenario={scenario}
              isMini={true}
            />
          ) : (
            <MeteorologicalMap
              scenario={scenario}
              modelKey="atmos"
              modelLabel="AtmosArbiter Dynamic Blend"
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              isMini={true}
              leadTimeHours={leadTimeHours}
            />
          )}
        </div>

      </div>

    </div>
  );
}
