# AtmosArbiter — Full System Architecture Diagram
### PS 26081 | MoES / NCMRWF | SIH 2026

> This is the **System Architecture** — shows all layers, storage, compute, APIs, security, monitoring, and consumers.
> It is **distinct from the pipeline workflow** which only shows Stage 1 → 6 data flow.

---

## System Architecture (Mermaid — Copy into mermaid.live)

```mermaid
flowchart TB

    %% ─────────────────────────────────────────
    %% EXTERNAL DATA SOURCES
    %% ─────────────────────────────────────────
    subgraph EXT["🌐 EXTERNAL DATA SOURCES"]
        direction LR
        NCUM["NCUM + NEPS-G\nNCMRWF HPC\nNetCDF4 / 00Z·12Z"]
        GFS["GFS\nNOAA/NCEP\nGRIB2 / 00Z·12Z"]
        GC["GraphCast\nGoogle DeepMind\nZarr / 00Z·12Z"]
        IMD_OBS["IMD Observations\nAWS Point Data\n& 0.25° Gridded"]
        STATIC["Static Priors\nDEM · Land-Sea Mask\nSlope · Coast Distance"]
    end

    %% ─────────────────────────────────────────
    %% INGESTION LAYER
    %% ─────────────────────────────────────────
    subgraph INGEST["⬇️  INGESTION LAYER  (CPU Workers — Containerized)"]
        direction LR
        SCHED["Scheduler\nCelery + Redis\n00Z / 12Z Trigger"]
        PARSER["Format Parsers\ncfgrib · eccodes\nNetCDF4 · h5py"]
        DASK["Out-of-Core Engine\nXarray + Dask\nChunked 4D Tensors"]
        RESAMP["Spatial Resampler\nBilinear Re-grid\n→ 0.25° Domain"]
        MASK["Dynamic Dropout\nMissing Feed Detector\nWeight Re-normalizer"]
    end

    %% ─────────────────────────────────────────
    %% STORAGE LAYER
    %% ─────────────────────────────────────────
    subgraph STORE["🗄️  STORAGE LAYER"]
        direction TB

        subgraph RAWSTORE["Raw Input Store"]
            ZARR_RAW["Zarr Object Store\n/raw/{model}/{date}\nNetCDF · GRIB2 chunks"]
        end

        subgraph PROCSTORE["Processed Tensor Store"]
            ZARR_PROC["Zarr Object Store\n/processed/grid_0p25\nAligned 4D Tensors"]
        end

        subgraph OUTSTORE["Output Store"]
            ZARR_OUT["Zarr / NetCDF4\n/output/{date}\nBlended Forecast"]
            GEOTIFF["GeoTIFF COG Store\n/tiles/{date}\nfor ISRO Bhuvan"]
        end

        subgraph METADB["Metadata & Audit DB"]
            PG["PostgreSQL\nforecast_runs\nphysics_checks\nmodel_skill_scores\nretraining_events"]
        end

        subgraph CACHE["Cache & Queue"]
            REDIS["Redis\nTask Queue\nSkill Score Cache\nSession State"]
        end
    end

    %% ─────────────────────────────────────────
    %% GPU INFERENCE CLUSTER
    %% ─────────────────────────────────────────
    subgraph GPU["🧠  GPU INFERENCE CLUSTER  (NVIDIA A10G / L4)"]
        direction TB

        subgraph NEURAL["AtmosArbiter Neural Core (PyTorch 2.x)"]
            direction LR
            TW["TopoWeight Engine\nRes-SE U-Net\n+ DEM Priors"]
            CS["ChronoShift Layer\nMulti-Head Cross-Attention\nt+24h → t+240h"]
            AH["Arbitration Head\nSoftmax\nW_m(x,y,t)"]
        end

        subgraph PEAKGUARD["PeakGuard Loss Module"]
            PG_DET["Extreme Detector\nCAPE > threshold\nHigh Moisture"]
            PG_LOSS["Asymmetric Quantile\nLoss τ=0.98\n10× under-pred penalty"]
        end

        subgraph THERMOCHECK["ThermoCheck Gate (MetPy)"]
            TC1["Saturation\nq ≤ q_sat"]
            TC2["Hydrostatic\n∂p/∂z = -ρg"]
            TC3["Precipitation ≥ 0"]
            TC_DEC{"> 1% cells\nfail?"}
            TC_FALL["NCUM Pixel\nFallback"]
            TC_ACC["Accept\nForecast"]
        end

        subgraph SERVING_GPU["TensorRT Serving Engine"]
            TRT["TensorRT FP16\n< 45s full national run"]
            TRITON["Triton Inference Server\nDynamic Batching\nConcurrent Models"]
        end
    end

    %% ─────────────────────────────────────────
    %% API & SECURITY LAYER
    %% ─────────────────────────────────────────
    subgraph API_LAYER["🔐  API & SECURITY LAYER"]
        direction LR
        AUTH["Auth Service\nJWT · API Key\nRBAC"]
        GW["API Gateway\nRate Limiter\nRequest Router"]
        FASTAPI["FastAPI\nAsync REST\nOpenAPI Docs"]
        SHAP_SVC["SHAP Service\nFeature Attribution\nper District"]
        ALERT_SVC["Alert Engine\n48–72h Extreme\nEvent Publisher"]
    end

    %% ─────────────────────────────────────────
    %% MONITORING LAYER
    %% ─────────────────────────────────────────
    subgraph MONITOR["📊  MONITORING & OBSERVABILITY"]
        direction LR
        LOG["Structured Logs\nPipeline Steps\nError Traces"]
        METRICS["Metrics\nLatency · CSI · POD\nPhysics Violation Rate"]
        HEALTH["Health Checks\nModel Feed Status\nGPU Utilization"]
        AUDIT["Audit Trail\nEvery Blend Decision\nFallback Events"]
    end

    %% ─────────────────────────────────────────
    %% CONSUMER CLIENTS
    %% ─────────────────────────────────────────
    subgraph CLIENTS["👥  CONSUMER CLIENTS"]
        direction LR
        CLEARCAST["ClearCast XAI\nReact + MapLibre GL\nForecaster Dashboard"]
        SDMA_CLIENT["SDMA Portal\nREST API Consumer\nExtreme Alerts"]
        BHUVAN["ISRO Bhuvan\nGeoTIFF Tile Feed\nPublic Visualization"]
        MEGHDOOT["Meghdoot App\nFarmer Advisories\nBlock-Level Guidance"]
        PMFBY_CLIENT["PMFBY / InsurTech\nAudit Trail API\nClaim Verification"]
    end

    %% ─────────────────────────────────────────
    %% CONTINUOUS LEARNING SUBSYSTEM
    %% ─────────────────────────────────────────
    subgraph RETRAIN["🔄  CONTINUOUS LEARNING SUBSYSTEM"]
        direction LR
        IMD_FEED["IMD 24h\nObservations\nGround Truth"]
        DELTA["Delta Engine\nForecast vs Observed\nSkill Score Compute"]
        WINDOW["30-Day Rolling\nTraining Window\nData Curator"]
        TRAINER["Weekly Retrainer\nPyTorch Fine-tune\non GPU Cluster"]
        MODEL_REG["Model Registry\nVersioned Weights\nRollback Support"]
    end

    %% ─────────────────────────────────────────
    %% CONNECTIONS — External → Ingestion
    %% ─────────────────────────────────────────
    NCUM & GFS & GC --> SCHED
    IMD_OBS --> SCHED
    STATIC --> PARSER
    SCHED --> PARSER --> DASK --> RESAMP --> MASK

    %% Ingestion → Storage
    MASK --> ZARR_RAW
    RESAMP --> ZARR_PROC
    SCHED --> REDIS

    %% Storage → GPU
    ZARR_PROC --> TW & CS
    STATIC --> TW
    REDIS --> SCHED

    %% Neural flow
    TW & CS --> AH
    AH --> PG_DET --> PG_LOSS

    %% Physics gate
    PG_LOSS --> TC1 & TC2 & TC3
    TC1 & TC2 & TC3 --> TC_DEC
    TC_DEC -->|Yes| TC_FALL
    TC_DEC -->|No| TC_ACC
    TC_ACC --> TRT
    TC_FALL --> TRT

    %% GPU → Storage
    TRT --> TRITON
    TRITON --> ZARR_OUT
    TRITON --> GEOTIFF

    %% Storage → API
    ZARR_OUT --> FASTAPI
    GEOTIFF --> FASTAPI

    %% API Layer internal
    AUTH --> GW --> FASTAPI
    FASTAPI --> SHAP_SVC
    FASTAPI --> ALERT_SVC

    %% API → PostgreSQL (audit)
    FASTAPI --> PG
    TC_DEC --> PG
    TRITON --> PG

    %% API → Clients
    SHAP_SVC --> CLEARCAST
    FASTAPI --> SDMA_CLIENT
    GEOTIFF --> BHUVAN
    ALERT_SVC --> MEGHDOOT & SDMA_CLIENT & PMFBY_CLIENT
    FASTAPI --> PMFBY_CLIENT

    %% Monitoring
    FASTAPI --> LOG & METRICS & AUDIT
    TRITON --> METRICS & HEALTH
    SCHED --> HEALTH

    %% Continuous Learning
    IMD_OBS --> IMD_FEED
    IMD_FEED --> DELTA
    ZARR_OUT --> DELTA
    DELTA --> WINDOW --> TRAINER
    PG --> TRAINER
    TRAINER --> MODEL_REG
    MODEL_REG --> TW & CS & AH

    %% Style
    classDef ext fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    classDef ingest fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef store fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef gpu fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    classDef api fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef client fill:#f0fdf4,stroke:#22c55e,color:#14532d
    classDef monitor fill:#fff7ed,stroke:#f97316,color:#7c2d12
    classDef retrain fill:#fdf4ff,stroke:#a855f7,color:#581c87

    class NCUM,GFS,GC,IMD_OBS,STATIC ext
    class SCHED,PARSER,DASK,RESAMP,MASK ingest
    class ZARR_RAW,ZARR_PROC,ZARR_OUT,GEOTIFF,PG,REDIS store
    class TW,CS,AH,PG_DET,PG_LOSS,TC1,TC2,TC3,TC_DEC,TC_FALL,TC_ACC,TRT,TRITON gpu
    class AUTH,GW,FASTAPI,SHAP_SVC,ALERT_SVC api
    class CLEARCAST,SDMA_CLIENT,BHUVAN,MEGHDOOT,PMFBY_CLIENT client
    class LOG,METRICS,HEALTH,AUDIT monitor
    class IMD_FEED,DELTA,WINDOW,TRAINER,MODEL_REG retrain
```

---

## Architecture Layers Explained

### Layer 1 — External Data Sources (Blue)
All 5 input feeds with correct formats. NCUM + NEPS-G (23-member) in same box.

### Layer 2 — Ingestion Layer (Green)
CPU-bound workers. Celery schedules at 00Z/12Z. Dynamic Dropout handles missing feeds. All out-of-core via Xarray + Dask.

### Layer 3 — Storage Layer (Yellow) ← **THE MISSING PIECE**
| Store | What It Holds |
| :--- | :--- |
| **Zarr Raw** | Raw NetCDF4/GRIB2 chunks per model per date |
| **Zarr Processed** | Aligned 0.25° 4D tensors ready for GPU |
| **Zarr/NetCDF4 Output** | Final blended forecast per cycle |
| **GeoTIFF COG Store** | Cloud-Optimized GeoTIFFs for ISRO Bhuvan tiles |
| **PostgreSQL** | forecast_runs, physics_checks, model_skill_scores, retraining_events |
| **Redis** | Task queue + skill score cache + session state |

### Layer 4 — GPU Inference Cluster (Purple)
AtmosArbiter neural core + PeakGuard + ThermoCheck + TensorRT/Triton. All GPU-bound.

### Layer 5 — API & Security Layer (Red)
JWT/API Key auth → API Gateway → FastAPI. SHAP service + Alert engine as separate services.

### Layer 6 — Monitoring (Orange)
Structured logs, latency/CSI/POD metrics, GPU health, full audit trail.

### Layer 7 — Consumer Clients (Light Green)
5 distinct clients with different data contracts (REST/GeoTIFF/XAI).

### Layer 8 — Continuous Learning Subsystem (Purple)
IMD observations → Delta computation → 30-day rolling window → Weekly GPU retrain → Model Registry with rollback.

---

## Key Differences vs. Workflow Diagram

| Workflow Diagram | System Architecture Diagram |
| :--- | :--- |
| Shows Stage 1 → 2 → 3 → 4 → 5 → 6 (data flow only) | Shows all 8 system layers with their infrastructure |
| No storage shown | 5 distinct storage systems (Zarr ×3, PostgreSQL, Redis) |
| No database | PostgreSQL with 4 tables for audit + skill tracking |
| No API Gateway or Auth | JWT + RBAC + Rate Limiter + Gateway |
| No monitoring | Logs, Metrics, Health, Audit Trail |
| No client separation | 5 distinct consumer clients with different contracts |
| No model versioning | Model Registry with rollback support |
| Single Celery mention | Ingestion layer with Scheduler, Parser, Dask, Resampler, Mask |
| No Dynamic Dropout visible | Explicit Dynamic Dropout node in Ingestion Layer |
| Feedback loop vague | Full Continuous Learning Subsystem with Delta Engine + Window Curator |
