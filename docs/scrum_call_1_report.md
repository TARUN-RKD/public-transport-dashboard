# Scrum Call 1: Technical Planning & Initial Development
**Project Name:** Public Transport Ridership Analysis Dashboard (`TransitPulse`)  
**Sprint Cycle:** Sprint 1 — Foundation, Data Architecture & Initial Pipeline  
**Document Type:** Formal Technical Planning & Status Report  
**Date:** October 28, 2026  
**Status:** Approved & Initial Milestones Completed  

---

## 1. Objective of the Scrum Meeting
The primary objective of Scrum Call 1 was to review the core problem statement, establish the technical and architectural implementation approach, decompose the project into discrete engineering tasks with role allocations, verify local and cloud development environments, and assess initial implementation progress while resolving early technical blockers.

---

## 2. Review of Problem Statement & Expected Project Outcomes

### 2.1 Problem Statement
Municipal transit authorities and transport planners struggle with fragmented, delayed ridership data, making it difficult to detect peak congestion spikes, identify underperforming routes, and dynamically balance fleet allocation. The goal is to build an end-to-end, real-time responsive analytics system that ingests historical and synthetic transit telemetry, generates automated aggregations, and delivers actionable visual intelligence to transit operators.

### 2.2 Expected Project Outcomes
1. **Synthetic Telemetry Pipeline:** A deterministic generator producing 10,000 realistic transit activity records spanning a 365-day calendar cycle with dual-peak commuter windows.
2. **High-Performance Analytics Backend:** A Python FastAPI server providing sub-50ms REST API endpoints for time-series trend analysis, peak vs. off-peak categorization, and route/station demand rankings.
3. **Multi-Format Data Storage & Reports:** Automated exports in raw CSV, multi-sheet formatted Excel (`.xlsx`), and SQLite (`database.db`) with B-tree query indexes.
4. **Responsive "Dark Mode" Frontend Dashboard:** A responsive React (Vite) interface styled with Tailwind CSS, offering 4 KPI cards, interactive SVG charts (Recharts), dynamic date/route filters, and a server-side Matplotlib modal viewer.
5. **Zero-Config Cloud Deployment:** Continuous deployment on the Vercel Free Tier using unified frontend-backend synchronization.

---

## 3. Finalized Technical Approach & Architecture

### 3.1 Architectural Decision Record (ADR)
- **Monorepo Structure:** Selected a consolidated monorepo housing both the Python serverless backend (`api/`) and the React client (`frontend/`). This avoids CORS discrepancies in production and enables synchronized versioning.
- **Backend Framework:** FastAPI was selected over Flask/Django for native asynchronous request handling, automatic OpenAPI/Swagger generation, and seamless compatibility with Vercel's Python runtime (`@vercel/python`).
- **Data Manipulation Engine:** Pandas was chosen for vectorized aggregations, multi-condition time-series grouping, and direct Excel sheet generation via `openpyxl`.
- **Plotting Strategy:** Dual-layer visualization:
  - **Client-Side:** Recharts for dynamic, responsive, animated user interaction.
  - **Server-Side:** Matplotlib configured with the non-interactive `Agg` backend to produce 150 DPI dark-mode PNG charts encoded in Base64 for publication-grade reporting.
- **Frontend Stack:** React 18 with Vite for ultra-fast HMR and small bundle footprint, styled with Tailwind CSS in dark mode.

### 3.2 Dataset Specifications & Schema
The dataset records transit events with the following standardized schema:

| Column Name | Data Type | Constraints & Values | Purpose |
| :--- | :--- | :--- | :--- |
| `timestamp` | `ISO-8601 String` | `YYYY-MM-DD HH:MM:SS` | 365-day temporal tracking |
| `route_id` | `String` | `R-101` to `R-110` (10 Corridors) | Correlating transit line performance |
| `station_id` | `String` | `S-01` to `S-20` (20 Terminals) | Identifying bottleneck passenger hubs |
| `passenger_count` | `Integer` | Value $\ge 5$ (weighted by route & peak) | Commuter load metric |
| `is_peak` | `Integer (Binary)`| `1` (Peak) or `0` (Off-Peak) | Binary classification for rush hours |

*Peak definition: Weekdays (Monday–Friday) between 07:00–09:59 (Morning Peak) and 17:00–19:59 (Evening Peak).*

---

## 4. Work Breakdown Structure (WBS) & Task Allocation

```
Public Transport Analysis
├── Sprint 1.1: Data Engineering & Pipeline
├── Sprint 1.2: Backend API & Aggregations
├── Sprint 1.3: Frontend UI & Interactive Visualizations
├── Sprint 1.4: Server-Side Visualizations & Reporting
└── Sprint 1.5: Deployment, CI/CD & Documentation
```

### 4.1 Detailed Task Allocation Matrix

| Module | Task ID | Description | Assigned Role | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Data Layer** | `DAT-01` | Build `data_generator.py` for 10,000 synthetic transit events | Data Engineer | **Completed** |
| **Data Layer** | `DAT-02` | Implement SQLite database generator with B-tree indices | Database Engineer | **Completed** |
| **Data Layer** | `DAT-03` | Implement multi-sheet Excel generator (`ridership_report.xlsx`) | Data Analyst | **Completed** |
| **Backend** | `API-01` | Create `data_processor.py` for Pandas aggregations & moving averages | Backend Engineer | **Completed** |
| **Backend** | `API-02` | Build FastAPI endpoints in `index.py` (`/kpis`, `/routes`, `/time-series`, etc.) | Backend Engineer | **Completed** |
| **Backend** | `API-03` | Implement streaming endpoints for CSV & Excel binary downloads | Backend Engineer | **Completed** |
| **Visualization**| `VIS-01` | Implement server-side headless Matplotlib dark-mode plot generator | Data Visualization Specialist | **Completed** |
| **Visualization**| `VIS-02` | Build Jupyter / Google Colab EDA Notebook (`ridership_eda.ipynb`) | Data Analyst | **Completed** |
| **Frontend** | `UI-01` | Configure React + Vite + Tailwind CSS Dark Mode boilerplate | Frontend Engineer | **Completed** |
| **Frontend** | `UI-02` | Build 4 responsive KPI `StatsCards.jsx` | Frontend Engineer | **Completed** |
| **Frontend** | `UI-03` | Build `ChartsSection.jsx` with Recharts (Line, Area, Bar, Donut) | Frontend Engineer | **Completed** |
| **Frontend** | `UI-04` | Build `FilterBar.jsx` with route selector, date picker & presets | Frontend Engineer | **Completed** |
| **Frontend** | `UI-05` | Build `MatplotlibModal.jsx` for viewing/downloading high-res plots | Frontend Engineer | **Completed** |
| **DevOps** | `OPS-01` | Configure `vercel.json` and build scripts for zero-config free-tier deploy | DevOps Engineer | **Completed** |
| **DevOps** | `OPS-02` | Initialize Git repository, commit files, and push to GitHub | DevOps Engineer | **Completed** |
| **Governance**| `DOC-01` | Prepare comprehensive `project_report.md` and `README.md` | Technical Writer | **Completed** |

---

## 5. Development Environment & Resource Verification

All development dependencies and system runtimes were audited and verified:

1. **Local System Runtimes:**
   - **OS:** macOS Darwin (Apple Silicon arm64)
   - **Python Environment:** Python 3.14.6 in isolated virtual environment (`venv`)
   - **Node.js Environment:** v26.10.0 with npm 11.19.1
   - **Version Control:** Git 2.55.0 authenticated with GitHub OAuth token
2. **Backend Library Audit:**
   - `fastapi` (v0.162.0), `uvicorn` (v0.54.0), `pandas` (v3.1.0), `numpy` (v2.5.4), `matplotlib` (v3.11.2), `openpyxl` (v3.1.5).
3. **Frontend Dependency Audit:**
   - `react` / `react-dom` (v18.3.1), `vite` (v5.4.21), `tailwindcss` (v3.4.14), `recharts` (v2.13.0), `lucide-react` (v0.453.0), `axios` (v1.7.7).
4. **Vercel Cloud Compatibility:**
   - Verified that root `vercel.json` properly declares `buildCommand`, `outputDirectory`, and serverless Python rewrites without requiring paid add-ons.

---

## 6. Initial Implementation Progress & Technical Blockers

### 6.1 Progress Summary
- **Data Tier:** Successfully generated `data/ridership.csv` (10,000 rows, 352 KB), `data/database.db` (928 KB SQLite DB), and `data/ridership_report.xlsx` (4 analytical worksheets).
- **Backend Tier:** Implemented all 12 REST API endpoints. Verified sub-millisecond local execution and verified data serialization.
- **Frontend Tier:** Built responsive Single Page Application with zero compile warnings; verified full build cycle in 1.34s generating minified production bundle in `frontend/dist`.
- **Version Control:** Code committed and pushed to GitHub repository [`TARUN-RKD/public-transport-dashboard`](https://github.com/TARUN-RKD/public-transport-dashboard).

### 6.2 Identified Technical Blockers & Implemented Mitigations

| Identified Blocker | Impact | Mitigation Strategy / Solution Implemented |
| :--- | :--- | :--- |
| **Matplotlib GUI crash in headless serverless runtime** | Server crashes when rendering figures inside FastAPI/Vercel functions | Explicitly forced `matplotlib.use("Agg")` non-interactive backend before any imports; plots rendered to in-memory `io.BytesIO` streams. |
| **Frontend-Backend route collisions on Vercel** | SPA router intercepts `/api/*` calls causing 404 errors | Configured explicit rewrite rules in `vercel.json` routing all `/api/(.*)` paths strictly to `api/index.py` prior to the SPA static fallback. |
| **Vite Dev proxy CORS during local development** | API calls blocked when running frontend on port 5173 and backend on port 8000 | Configured `server.proxy` in `vite.config.js` to transparently route `/api` requests to `http://127.0.0.1:8000`. |
| **Single-day outlier volatility in growth rate calculations** | Random low-volume holiday/weekend drops cause erratic daily growth spikes | Implemented a bounded clip function $[-50\%, +50\%]$ within Pandas before calculating the harmonic daily growth average. |

---

## 7. Next Steps & Sign-Off
1. Complete live staging deployment on Vercel.
2. Conduct user acceptance testing (UAT) on mobile, tablet, and desktop viewports.
3. Validate Google Colab notebook cell execution on external GPU/TPU runtimes.
4. Prepare for **Scrum Call 2: Feature Validation, Performance Benchmarking & Production Handoff**.
