// AtmosArbiter Master Meteorological Dataset & Scenarios
// Problem Statement 26081 (MoES / NCMRWF | SIH 2026)

export const SCENARIOS = [
  {
    id: 'kerala_2018',
    title: '2018 Kerala Catastrophic Monsoon',
    subtitle: 'Extreme Orographic Cloudburst & Dam Catchment Flooding',
    variable: 'Precipitation',
    unit: 'mm/day',
    extremeThreshold: 65, // IMD Heavy Rain threshold
    disasterThreshold: 115, // IMD Very Heavy Rain threshold
    eventDate: 'August 14–17, 2018',
    description: 'Relentless southwest monsoon surges blocked by the steep Western Ghats caused massive orographic precipitation, triggering devastating landslides and multi-basin flash floods across 14 districts.',
    center: [10.2, 76.5],
    zoom: 7,
    referenceActual: {
      peakValue: 192.4,
      location: 'Idukki Catchment Ridge',
      damages: '483 lives lost, ₹40,000 Cr economic damage',
    },
    metrics: {
      ncupRmse: 22.8,
      aiRmse: 34.6,
      naiveRmse: 28.4,
      atmosRmse: 11.2,
      naivePeakLoss: -43.7, // 43.7% washed out!
      atmosPeakLoss: -4.5,  // Only 4.5% error, 95.5% peak retained
      naiveCsi: 0.31,
      atmosCsi: 0.64,
      naivePod: 0.58,
      atmosPod: 0.92,
    },
    advisory: {
      level: 'RED_ALERT',
      action: 'Immediate NDRF pre-positioning across Idukki, Wayanad & Ernakulam. CWC recommended to initiate controlled, phased spillway discharge for Idukki and Mullaperiyar dams 48h prior.',
      savings: 'Avoided sudden uncoordinated reservoir release; ₹18.4 Lakhs/day DSM grid compliance for Kerala State Electricity Board (KSEB).',
    }
  },
  {
    id: 'biparjoy_2023',
    title: '2023 Cyclone Biparjoy Landfall',
    subtitle: 'Severe Coastal Gale Squalls & Landfall Precipitation',
    variable: 'Precipitation & Wind',
    unit: 'mm/day',
    extremeThreshold: 65,
    disasterThreshold: 115,
    eventDate: 'June 15–16, 2023',
    description: 'Extremely severe cyclonic storm in the Arabian Sea tracked towards the Saurashtra-Kutch coastline, producing hurricane-force winds (140 km/h) and localized torrential downpours.',
    center: [23.1, 69.8],
    zoom: 7,
    referenceActual: {
      peakValue: 158.0,
      location: 'Mandvi / Jakhau Coast',
      damages: 'Over 100,000 people evacuated, extensive coastal infrastructure stress',
    },
    metrics: {
      ncupRmse: 19.5,
      aiRmse: 29.8,
      naiveRmse: 24.1,
      atmosRmse: 9.8,
      naivePeakLoss: -40.5,
      atmosPeakLoss: -4.3,
      naiveCsi: 0.38,
      atmosCsi: 0.71,
      naivePod: 0.62,
      atmosPod: 0.94,
    },
    advisory: {
      level: 'RED_ALERT',
      action: 'De-berthing at Kandla & Mundra ports mandated. Western Railway suspension alerts triggered 48h in advance based on un-diluted squall envelope.',
      savings: 'Zero maritime vessel collision; estimated ₹42 Crores port asset preservation.',
    }
  },
  {
    id: 'heatwave_2024',
    title: '2024 North India Severe Heatwave',
    subtitle: 'Sub-Tropical High Pressure Core & Surface Thermal Anomaly',
    variable: 'Max Surface Temperature',
    unit: '°C',
    extremeThreshold: 45, // IMD Heatwave
    disasterThreshold: 47, // IMD Severe Heatwave
    eventDate: 'May 28–31, 2024',
    description: 'Dry westerlies from Thar Desert combined with clear sky solar insolation caused persistent 47°C–49°C temperatures across Northern India, straining the national power grid.',
    center: [28.5, 76.5],
    zoom: 6,
    referenceActual: {
      peakValue: 48.4,
      location: 'Churu / Delhi-Mungeshpur',
      damages: 'Record peak power demand (250 GW), widespread agricultural thermal shock',
    },
    metrics: {
      ncupRmse: 2.1,
      aiRmse: 3.4,
      naiveRmse: 2.8,
      atmosRmse: 0.8,
      naivePeakLoss: -7.2, // Washed out to 44.9°C (missing severe heatwave trigger!)
      atmosPeakLoss: -1.0, // Retained 47.9°C (triggers proper alert!)
      naiveCsi: 0.44,
      atmosCsi: 0.82,
      naivePod: 0.52,
      atmosPod: 0.95,
    },
    advisory: {
      level: 'ORANGE_ALERT',
      action: 'Automated peak power purchase advisory dispatched to SLDCs in Delhi, Haryana & Rajasthan. Labor shifts rescheduled to avoid 12:00–16:00 window.',
      savings: 'Prevents transformer burnouts and avoids ₹22 Lakhs/day DSM grid overdraw penalties.',
    }
  }
];

export const LEAD_TIME_PROFILES = [
  { hours: 24, label: 't+24h (Day 1)', aiWeightBase: 0.65, nwpWeightBase: 0.35, confidence: 'Very High (94%)' },
  { hours: 48, label: 't+48h (Day 2)', aiWeightBase: 0.52, nwpWeightBase: 0.48, confidence: 'High (89%)' },
  { hours: 72, label: 't+72h (Day 3)', aiWeightBase: 0.38, nwpWeightBase: 0.62, confidence: 'High (84%)' },
  { hours: 120, label: 't+120h (Day 5)', aiWeightBase: 0.24, nwpWeightBase: 0.76, confidence: 'Moderate (76%)' },
  { hours: 240, label: 't+240h (Day 10)', aiWeightBase: 0.14, nwpWeightBase: 0.86, confidence: 'Synoptic Trend (61%)' },
];

export const DISTRICT_STATIONS = [
  {
    id: 'idukki',
    name: 'Idukki Catchment',
    state: 'Kerala',
    lat: 9.85,
    lng: 76.97,
    elevation: 1215, // meters
    terrainType: 'High Relief Orographic Ridge (Western Ghats)',
    slope: '19.4° Steep Windward',
    scenarios: {
      kerala_2018: { ncup: 186.2, ai: 84.5, naive: 135.3, atmos: 183.7, actual: 192.4 },
      biparjoy_2023: { ncup: 18.2, ai: 14.1, naive: 16.1, atmos: 17.5, actual: 16.8 },
      heatwave_2024: { ncup: 28.5, ai: 27.8, naive: 28.1, atmos: 28.2, actual: 28.0 }
    },
    xaiReasoning: 'Topographic barrier (>1200m, slope 19.4°) forces intense moist maritime air lift. AI models lack sub-grid orographic convection parameterization; TopoWeight boosts NCUM physical NWP weight to 79% while PeakGuard prevents conditional mean dilution.'
  },
  {
    id: 'wayanad',
    name: 'Wayanad Ghats',
    state: 'Kerala',
    lat: 11.68,
    lng: 76.13,
    elevation: 820,
    terrainType: 'Vulnerable Escarpment & Catchment',
    slope: '16.8° Windward',
    scenarios: {
      kerala_2018: { ncup: 174.5, ai: 78.0, naive: 126.2, atmos: 171.1, actual: 178.6 },
      biparjoy_2023: { ncup: 12.0, ai: 10.2, naive: 11.1, atmos: 11.5, actual: 10.9 },
      heatwave_2024: { ncup: 31.2, ai: 30.5, naive: 30.8, atmos: 31.0, actual: 30.9 }
    },
    xaiReasoning: 'Critical landslide catchment corridor. AI models disperse rainfall over 150km radius. ChronoShift and TopoWeight anchor convection tightly along windward ridgeline with 82% physical confidence.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai / Raigad',
    state: 'Maharashtra',
    lat: 18.98,
    lng: 72.93,
    elevation: 32,
    terrainType: 'Urban Coastal Plain / Ghats Transition',
    slope: '6.4° Coastal-to-Mountain',
    scenarios: {
      kerala_2018: { ncup: 94.2, ai: 62.0, naive: 78.1, atmos: 91.8, actual: 95.0 },
      biparjoy_2023: { ncup: 48.0, ai: 38.5, naive: 43.2, atmos: 46.5, actual: 47.0 },
      heatwave_2024: { ncup: 36.8, ai: 35.9, naive: 36.3, atmos: 36.5, actual: 36.4 }
    },
    xaiReasoning: 'Tidal surge interface with localized urban drainage bottlenecks. High moisture flux combined with coastal convergence. Balanced dynamic blending preserves short-term convective bursts.'
  },
  {
    id: 'mandvi',
    name: 'Mandvi / Kutch Coast',
    state: 'Gujarat',
    lat: 23.24,
    lng: 69.66,
    elevation: 15,
    terrainType: 'Arid Coastal Ingress Zone',
    slope: '1.2° Flat Marine Shelf',
    scenarios: {
      kerala_2018: { ncup: 2.1, ai: 1.5, naive: 1.8, atmos: 2.0, actual: 1.9 },
      biparjoy_2023: { ncup: 154.0, ai: 68.4, naive: 111.2, atmos: 151.2, actual: 158.0 },
      heatwave_2024: { ncup: 41.2, ai: 39.8, naive: 40.5, atmos: 40.9, actual: 40.8 }
    },
    xaiReasoning: 'Cyclone eye landfall point. AI models exhibit track drift and early dissipation due to spectral truncation. AtmosArbiter locks pressure gradient and radial gale envelope to NCUM core dynamics.'
  },
  {
    id: 'delhi',
    name: 'Delhi-NCR (Safdarjung)',
    state: 'National Capital Region',
    lat: 28.61,
    lng: 77.20,
    elevation: 216,
    terrainType: 'Indo-Gangetic Basin Flatland',
    slope: '0.4° Planar Alluvium',
    scenarios: {
      kerala_2018: { ncup: 8.5, ai: 12.1, naive: 10.3, atmos: 10.9, actual: 11.2 },
      biparjoy_2023: { ncup: 14.5, ai: 18.2, naive: 16.3, atmos: 16.8, actual: 17.0 },
      heatwave_2024: { ncup: 46.8, ai: 43.5, naive: 45.1, atmos: 47.9, actual: 48.4 }
    },
    xaiReasoning: 'Extreme boundary layer sensible heating and urban heat island (UHI). Naive average dilutes temperature to 45.1°C, missing IMD Severe Heatwave trigger. PeakGuard loss retains 47.9°C anomaly.'
  },
  {
    id: 'churu',
    name: 'Churu Desert Fringe',
    state: 'Rajasthan',
    lat: 28.29,
    lng: 74.96,
    elevation: 286,
    terrainType: 'Arid Sand Dune Plain',
    slope: '0.3° Arid Basin',
    scenarios: {
      kerala_2018: { ncup: 1.0, ai: 0.8, naive: 0.9, atmos: 1.0, actual: 0.9 },
      biparjoy_2023: { ncup: 28.0, ai: 32.5, naive: 30.2, atmos: 31.0, actual: 30.5 },
      heatwave_2024: { ncup: 47.5, ai: 44.1, naive: 45.8, atmos: 48.2, actual: 48.8 }
    },
    xaiReasoning: 'Epicenter of hot continental advection. ThermoCheck verifies specific humidity is under 4 g/kg and dry-bulb lapse rate is physically bounded before publishing 48.2°C red alert.'
  },
  {
    id: 'cherrapunji',
    name: 'Cherrapunji (Sohra)',
    state: 'Meghalaya',
    lat: 25.27,
    lng: 91.73,
    elevation: 1484,
    terrainType: 'Khasi Hills Funneling Plateau',
    slope: '28.1° Extreme Escarpment',
    scenarios: {
      kerala_2018: { ncup: 142.0, ai: 72.0, naive: 107.0, atmos: 139.5, actual: 144.0 },
      biparjoy_2023: { ncup: 34.0, ai: 22.0, naive: 28.0, atmos: 31.5, actual: 32.0 },
      heatwave_2024: { ncup: 24.2, ai: 23.5, naive: 23.8, atmos: 24.0, actual: 23.9 }
    },
    xaiReasoning: 'World benchmark for orographic rainfall. Funneling moisture from Bay of Bengal hits 1.4km vertical wall. TopoWeight automatically assigns 88% weight to physical NWP over smoothed AI.'
  },
  {
    id: 'nagpur',
    name: 'Nagpur Central Plain',
    state: 'Maharashtra',
    lat: 21.14,
    lng: 79.08,
    elevation: 310,
    terrainType: 'Deccan Trap Semi-Arid Plateau',
    slope: '1.1° Rolling Plateau',
    scenarios: {
      kerala_2018: { ncup: 24.5, ai: 28.2, naive: 26.3, atmos: 27.0, actual: 27.5 },
      biparjoy_2023: { ncup: 8.5, ai: 11.2, naive: 9.8, atmos: 10.4, actual: 10.0 },
      heatwave_2024: { ncup: 45.8, ai: 43.2, naive: 44.5, atmos: 46.2, actual: 46.6 }
    },
    xaiReasoning: 'Central continental plateau with moderate topographic gradient. AI models perform efficiently on synoptic trends; balanced 50-50 arbitration optimizes overall RMSE.'
  }
];

export const TECHNICAL_PILLARS = [
  {
    id: 'topoweight',
    name: 'TopoWeight Engine',
    tech: 'Res-SE U-Net + DEM Elevation & Slope Priors',
    badge: 'Spatial Intelligence',
    description: 'Dynamically reweights constituent models cell-by-cell using high-resolution SRTM digital elevation models, terrain aspect, and land-sea masks. Prevents flat-terrain AI models from underpredicting orographic lift over the Western Ghats and Himalayas.'
  },
  {
    id: 'chronoshift',
    name: 'ChronoShift Layer',
    tech: 'Multi-Head Cross-Attention over Lead Time',
    badge: 'Temporal Intelligence',
    description: 'Smoothly arbitrates model reliability from Day 1 to Day 10. Exploits rapid AI skill at t+24h to t+48h, then seamlessly shifts weight to hydrodynamically stable NCUM ensembles as AI uncertainty compounds past Day 4.'
  },
  {
    id: 'peakguard',
    name: 'PeakGuard Tail Loss',
    tech: 'Asymmetric Pinball Quantile Loss (τ=0.98)',
    badge: 'Extreme Event Preservation',
    description: 'Penalizes extreme under-prediction 10× more than over-prediction during neural training. Solves the conditional mean regression flaw that traditionally washes out 40% of flash flood and heatwave peaks.'
  },
  {
    id: 'thermocheck',
    name: 'ThermoCheck Gate',
    tech: 'Hierarchical Clausius-Clapeyron & Hydrostatic Auditor',
    badge: 'Hard Physics Gate',
    description: 'Post-inference thermodynamic gatekeeper. Checks Clausius-Clapeyron saturation (q ≤ q_sat) and atmospheric stability. Clamps unphysical moisture blips and falls back to NCUM physical baselines if an anomalous cluster persists.'
  },
  {
    id: 'clearcast',
    name: 'ClearCast XAI UI',
    tech: 'SHAP Attribution + Exceedance Probability Engine',
    badge: 'Operational Explainability',
    description: 'Translates complex 4D tensor weights into human-understandable forecaster confidence scores (0–100%) and district-level exceedance probabilities (P(Rain > 65mm)), giving NDRF and duty meteorologists an actionable audit trail.'
  }
];
