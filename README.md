# 🚇 TransitPulse: Public Transport Ridership Analysis Dashboard

[![Live Dashboard](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://public-transport-dashboard.vercel.app/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://public-transport-dashboard.vercel.app/api/health)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://public-transport-dashboard.vercel.app/)

An end-to-end, production-ready public transport analysis dashboard engineered with **Python (FastAPI, Pandas, Matplotlib)** and **React (Vite, Tailwind CSS, Recharts)**, pre-configured for **Google Colab** compatibility and deployed live on **Vercel**.

🔗 **Live Production URL:** [https://public-transport-dashboard.vercel.app/](https://public-transport-dashboard.vercel.app/)  
🔗 **API Health Endpoint:** [https://public-transport-dashboard.vercel.app/api/health](https://public-transport-dashboard.vercel.app/api/health)

---

## 🚀 Live Demo & Architecture Overview

Access the live cloud dashboard anytime at:  
👉 **[https://public-transport-dashboard.vercel.app/](https://public-transport-dashboard.vercel.app/)**

```
public-transport-analysis/
├── api/                          # Vercel Serverless Python Backend (FastAPI)
│   ├── index.py                  # FastAPI entry point & API routes
│   ├── data_processor.py         # Pandas aggregations, Excel/CSV exports & Matplotlib plot generator
│   └── data_generator.py         # 10,000 synthetic transit record generator
├── data/
│   ├── ridership.csv             # Raw dataset (10,000 records)
│   ├── ridership_report.xlsx     # Multi-sheet Excel workbook (Summary, Routes, Stations, Day-of-Week)
│   └── database.db               # SQLite database with indexed tables
├── notebooks/                    # Jupyter & Google Colab Compatibility
│   └── ridership_eda.ipynb       # Statistical EDA using Pandas & Matplotlib
├── frontend/                     # React (Vite) + Tailwind CSS (Dark Mode)
│   ├── src/
│   │   ├── components/
│   │   │   ├── StatsCards.jsx    # 4 KPI cards (Total, Busiest Route, Peak Hr, Daily Growth)
│   │   │   ├── ChartsSection.jsx # Interactive Line, Bar, Day-of-Week & Donut charts
│   │   │   ├── MatplotlibModal.jsx # View/Download backend Matplotlib analytical plots
│   │   │   └── FilterBar.jsx     # Route ID & Date Range filters + CSV/Excel export
│   │   ├── pages/
│   │   │   └── Dashboard.jsx     # Responsive Dark Mode layout (Mobile, Tablet, Desktop)
│   │   ├── api.js                # Axios client with Vite dev proxy
│   │   ├── index.css             # Tailwind setup
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   └── project_report.md         # Detailed methodology, statistical models, and limitations
├── vercel.json                   # Zero-config Vercel deployment specification
├── requirements.txt              # Serverless Python dependencies
└── README.md
```

---

## 🛠️ Technologies Required & Included

| Layer | Tools & Technologies |
| :--- | :--- |
| **Data Engine & Analysis** | Python 3.10+, Pandas, NumPy, SQLite |
| **Statistical Notebooks** | Jupyter Notebook, Google Colab (`notebooks/ridership_eda.ipynb`) |
| **Data Exports & Storage** | CSV, Multi-Sheet Excel (`openpyxl`), SQLite (`database.db`) |
| **Visualizations (Server)** | Matplotlib (Headless dark-mode plots rendered to Base64) |
| **Backend API** | FastAPI, Uvicorn, Pydantic |
| **Frontend UI** | React 18, Vite, Tailwind CSS (Dark Mode), Lucide Icons |
| **Client-Side Charts** | Recharts (Responsive Line, Area, Bar, and Donut SVG charts) |
| **Deployment Target** | Vercel Serverless (Free Tier Compatible, zero-config) |

---

## ⚡ Quick Start: Local Development

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Clone and Setup Backend
```bash
# Navigate to project directory
cd public-transport-analysis

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Regenerate 10,000 synthetic records, SQLite DB, and Excel summary
python api/data_generator.py

# Launch FastAPI backend server (runs on http://127.0.0.1:8000)
uvicorn api.index:app --reload --port 8000
```
Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser to inspect interactive OpenAPI/Swagger documentation.

### 3. Setup and Launch Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the live dashboard. Vite proxies API requests to the Python server running on port 8000.

---

## 📓 Jupyter Notebook & Google Colab Usage

The notebook is located at [`notebooks/ridership_eda.ipynb`](notebooks/ridership_eda.ipynb).

### Running Locally:
```bash
source venv/bin/activate
pip install jupyter
jupyter notebook notebooks/ridership_eda.ipynb
```

### Running on Google Colab:
1. Open [Google Colab](https://colab.research.google.com/).
2. Select **Upload** and upload `notebooks/ridership_eda.ipynb`.
3. In Colab's left sidebar (Files icon 📁), upload `data/ridership.csv` or simply run Cell 1 — it automatically creates the synthetic dataset if the file is not yet present.
4. Run all cells (`Runtime -> Run all`) to generate statistical summaries, 24-hour traffic charts, route rankings, and export `ridership_report_colab.xlsx`.

---

## ☁️ Deploying to Vercel (Free Version & Default Settings)

This repository is optimized for Vercel's free hobby tier with **zero paid add-ons required**.

### Option A: Via GitHub (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete public transport ridership dashboard"
   git remote add origin https://github.com/<your-username>/public-transport-analysis.git
   git push -u origin main
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Keep **all default settings**:
   - **Framework Preset:** Vite (or Other)
   - **Root Directory:** `./`
   - **Build Command:** `cd frontend && npm install && npm run build` (detected from `vercel.json`)
   - **Output Directory:** `frontend/dist` (detected from `vercel.json`)
4. Click **Deploy**. Vercel will:
   - Build and bundle the React frontend.
   - Deploy `api/index.py` as an asynchronous Python Serverless Function using `requirements.txt`.
   - Route `/api/*` to Python and all other routes to the React SPA.

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔄 Deployment Reliability & Best Practices

### 1. Build Multiple Deployments Simultaneously
- Every Git branch pushed to GitHub automatically generates an isolated **Vercel Preview Deployment URL** without interfering with production or waiting in queues.
- Developers can inspect branch-specific data filters and UI revisions before merging.

### 2. Prevent Frontend-Backend Mismatches
- **Unified Versioning:** Both `package.json` and `api/index.py` declare version `1.0.0`.
- **Health Check Endpoint:** The frontend queries `/api/health` at runtime to ensure the backend is connected and the dataset record count is verified.
- **Atomic Rollouts:** Vercel deploys frontend assets and serverless functions atomically; a new revision only serves traffic once both client bundles and Python runtimes are healthy.

---

## 📊 Core Features Summary

1. **4 Responsive Stats KPI Cards:**
   - **Total Passengers** with peak percentage share and total logged trips.
   - **Busiest Route** with route ID, line name, and demand volume.
   - **Peak Traffic Window** with passenger density metrics.
   - **Average Daily Growth** with dynamic trend indicators.
2. **Interactive Charting Suite:**
   - **Time Series Line & Area Charts:** Daily volume, 7-day moving averages, and peak-split toggles.
   - **Peak vs Off-Peak Comparison:** Bar chart comparing volume and trip density.
   - **Weekly Heatmap / Bar Distribution:** Day-of-the-week stacked commuter volume.
   - **Route Share Donut Chart:** Visual breakdown of route ridership market share.
   - **Top 5 Routes & Stations:** Animated progress bars ranking demand hotspots.
3. **Server-Side Matplotlib Visualizations:**
   - Modal viewer offering 3 high-resolution 150 DPI dark-mode analytical charts rendered directly by Python.
   - One-click PNG download for research reports.
4. **Data Exports:**
   - One-click filtered **CSV** and **Excel** (`.xlsx`) downloads.

---

## 📄 License & Attribution
Designed and built for public transit performance analysis, transport planning, and smart city infrastructure optimization.
