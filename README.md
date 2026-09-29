# AtmosArbiter — Hybrid AI–NWP Multi-Model Forecast Blending System
### Smart India Hackathon (SIH) 2026 | Problem Statement ID: 26081

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Disaster%20Management-red.svg)]()
[![Ministry](https://img.shields.io/badge/Ministry-MoES%20%2F%20NCMRWF-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

> **"From The Consensus Delusion to Regime-Aware Dynamic Arbitration."**  
> An intelligent, physics-constrained spatio-temporal deep learning arbitration engine that dynamically blends physical NWP models (NCUM, GFS) and AI foundation models (GraphCast) while strictly preserving extreme disaster signals.

---

## 📌 Problem Statement Overview (PS 26081)
*   **Ministry:** Ministry of Earth Sciences (MoES)
*   **Department:** National Centre for Medium Range Weather Forecasting (NCMRWF)
*   **The Operational Flaw:** Operational meteorologists rely on multiple disparate models, but traditional ensemble averaging simply averages them together. This mathematically smooths out severe weather peaks (cloudbursts, flash floods, heatwaves), diluting actionable early-warning alerts.
*   **Our Solution:** **AtmosArbiter** evaluates past performance and dynamically assigns weights to each model based on local topography, season, and lead time—constrained by hard atmospheric physics.

---

## 🧠 The 5 Core Scientific Pillars

| Module | Real Technique / Scientific Anchor | Functional Role |
| :--- | :--- | :--- |
| **TopoWeight Engine** | `Res-SE U-Net` with DEM & Topo Priors | Dynamically trusts physical NWP models over mountainous terrain (Western Ghats/Himalayas) and AI over flat plains. |
| **ChronoShift Layer** | `Multi-Head Cross-Attention` over Lead Time | Smoothly shifts trust from fast AI models early (Day 1–2) to physical dynamical models at medium range (Day 5–10). |
| **PeakGuard Loss** | `Asymmetric Pinball Quantile Loss` ($\tau=0.98$) | Penalizes extreme under-prediction $10\times$ more than over-prediction, preserving localized disaster peaks. |
| **ThermoCheck Gate** | `Hierarchical Post-Output Physics Auditor` | Hard thermodynamic gate enforcing saturation ($q \le q_{sat}$), hydrostatic balance, and precipitation $\ge 0$ with automated pixel fallback. |
| **ClearCast XAI UI** | `SHAP Attribution & Confidence Maps` | Delivers transparent, district-level model attribution and probabilistic risk bounds to duty meteorologists. |

---

## 🏗️ System Architecture & Scalability

AtmosArbiter is engineered with a **Two-Tier Strategy**:
*   **🟢 Tier 1 (Working Hackathon Prototype / MVP):** Operates on public GFS 0.25° GRIB2 + IMD gridded observations, demonstrating the TopoWeight spatial U-Net, PeakGuard loss, ThermoCheck physics clipping, and dual-field uncertainty output via FastAPI and a React/MapLibre dashboard.
*   **🔵 Tier 2 (MoES / NCMRWF Target Production Scale):** Plugs into NCMRWF HPC clusters (*Pratyush/Mihir*), ingests NCUM 12km and 23-member NEPS-G ensembles, accelerated by NVIDIA TensorRT (<45s latency) with an automated MLflow Model Registry and continuous learning feedback loop.

---

## 📁 Repository Documentation Index

| File | Description |
| :--- | :--- |
| **[`RESEARCH_AND_REFERENCES.md`](RESEARCH_AND_REFERENCES.md)** | **Master Scientific Compendium:** Complete peer-reviewed literature, MoES/WMO citations, mathematical formulations, and operational data sources. |
| **[`FULL_PROJECT_CONTEXT.md`](FULL_PROJECT_CONTEXT.md)** | **Single Source of Truth:** Full project context, research synthesis, mathematical foundations, and viva defense strategies. |
| **[`slide_content_crisp.md`](slide_content_crisp.md)** | Copy-paste ready, concise bullets formatted for presentation slides (Slides 1–6). |
| **[`SIH_Presentation_Deck.md`](SIH_Presentation_Deck.md)** | Comprehensive master presentation deck with complete narrative prose, citations, and Mermaid Mind Map. |
| **[`System_Architecture_Diagram.md`](System_Architecture_Diagram.md)** | Full 8-layer Mermaid system architecture code and architectural specification. |
| **[`CTO_Architecture_Review.md`](CTO_Architecture_Review.md)** | 25-section CTO audit and review based on the `agent.md` architectural framework. |
| **[`context.md`](context.md)** | Core meteorological context, mathematical innovations, and literature inspirations. |
| **[`PS_26081_Research_and_Pitch.md`](PS_26081_Research_and_Pitch.md)** | Initial literature survey, problem statement breakdown, and pitch narrative. |

---

## 🎯 Quantitative Verification Targets

| Metric | Target Threshold | Operational Baseline |
| :--- | :--- | :--- |
| **Forecast Error Reduction (RMSE)** | $\ge 15\text{–}20\%$ Improvement | vs. Raw Individual NCUM / GFS / AI models |
| **Extreme Event Detection (CSI / POD)** | $\text{CSI} \ge 0.45, \text{POD} \ge 0.85$ | Heavy rainfall ($>65\text{ mm}$), Heatwaves ($>45^\circ\text{C}$) |
| **Extreme Peak Retention** | $\ge 90\%$ Tail Retention | 95th–99.5th Percentile Extreme Tail vs. IMD Gauges |
| **Atmospheric Violation Rate** | $< 1\%$ Across Generated Grid | Clausius-Clapeyron & Hydrostatic Verification |
| **Operational Latency** | $< 45\text{ seconds}$ | Full 10-day national run on NVIDIA GPU |

---

## 👥 Team: MidNightCrew
*   **Hackathon:** Smart India Hackathon (SIH) 2026
*   **Problem Statement:** PS 26081 (MoES / NCMRWF)
*   **Theme:** Disaster Management
