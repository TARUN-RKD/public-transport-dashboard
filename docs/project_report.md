# Public Transport Ridership Analysis: Project & Methodology Report

## 1. Executive Summary
The **Public Transport Ridership Analysis Dashboard** is an end-to-end analytics platform engineered to evaluate urban transit demand, identify bottleneck time windows, assess route distribution efficiency, and model peak versus off-peak commuter behavior. The platform pairs a high-performance **Python FastAPI** backend powered by **Pandas** and **Matplotlib** with a modern, dark-mode **React (Vite) + Tailwind CSS** frontend utilizing **Recharts** for interactive visual discovery.

- **Live Deployment:** [https://public-transport-dashboard.vercel.app/](https://public-transport-dashboard.vercel.app/)
- **API Health Endpoint:** [https://public-transport-dashboard.vercel.app/api/health](https://public-transport-dashboard.vercel.app/api/health)
- **GitHub Repository:** [https://github.com/TARUN-RKD/public-transport-dashboard](https://github.com/TARUN-RKD/public-transport-dashboard)

---

## 2. Dataset Architecture & Synthetic Generation Methodology
The dataset comprises **10,000 transit activity events** generated via `api/data_generator.py` spanning a 365-day calendar cycle (January 1, 2026 to December 31, 2026).

### 2.1 Core Schema
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `ISO-8601 String` | Exact date and time of the transit event (`YYYY-MM-DD HH:MM:SS`) |
| `route_id` | `Categorical String` | Transit corridor identifier (`R-101` through `R-110`) |
| `station_id` | `Categorical String` | Terminal or station identifier (`S-01` through `S-20`) |
| `passenger_count` | `Integer` | Boarded passenger count for the individual vehicle trip run (min 5) |
| `is_peak` | `Integer (Binary)` | Boolean indicator: `1` for rush hours, `0` for off-peak |

### 2.2 Transit Networks & Weightings
- **Routes (10 Lines):** R-101 (Red Line Metro), R-102 (Blue Suburban Line), R-103 (Green Express), R-104 (Downtown Shuttle), R-105 (Cross-City 500), R-106 (Airport Direct), R-107 (Waterfront Tram), R-108 (University Loop), R-109 (Tech Corridor Express), R-110 (Night Owl Bus).
- **Stations (20 Nodes):** Key hubs including Central Grand Station, Financial District, Tech Park North, International Airport, and University Campus.

---

## 3. Mathematical & Statistical Formulations

### 3.1 Peak Window Operational Definition
A transit run is tagged as `is_peak = 1` if and only if:
$$\text{Weekday} \in \{\text{Mon}, \text{Tue}, \text{Wed}, \text{Thu}, \text{Fri}\} \quad \land \quad \text{Hour} \in [7, 9] \cup [17, 19]$$
All weekend trips and non-rush hour weekday trips default to `is_peak = 0`.

### 3.2 Volume Generation Multiplier
Passenger count $P$ is modeled as a function of the base vehicle capacity ($C_{\text{base}} = 35$), time-of-day multiplier $M(t)$, route weight $W_r$, station weight $W_s$, and Gaussian noise $\epsilon \sim \mathcal{N}(0, 10)$:
$$P = \max\left(5, \; \lfloor C_{\text{base}} \times M(t) \times W_r \times W_s + \epsilon \rfloor\right)$$
Where $M(t)$ peaks at $2.4 - 3.0$ during rush hours, remains at $1.3 - 1.6$ during mid-day, and falls to $0.4 - 0.6$ during late-night cycles.

### 3.3 Average Day-over-Day Growth Rate
Daily aggregate volume $V_d = \sum_{i \in \text{Day } d} P_i$. The percentage growth $G_d$ between consecutive days is:
$$G_d = \frac{V_d - V_{d-1}}{V_{d-1}} \times 100$$
To prevent extreme volatility from single-day weekend dips skewing annual projections, $G_d$ is bounded within $[-50\%, +50\%]$ before computing the harmonic/trimmed mean:
$$\overline{G} = \frac{1}{N - 1} \sum_{d=2}^N \text{clip}(G_d, -50, 50)$$

### 3.4 7-Day Moving Trendline
For time-series smoothing:
$$\text{SMA}_7(d) = \frac{1}{7} \sum_{k=0}^{6} V_{d-k}$$

---

## 4. Multi-Layer Storage Architecture
1. **Raw CSV (`data/ridership.csv`):** Standard exchange format for Pandas and Jupyter environments.
2. **Processed Excel Workbook (`data/ridership_report.xlsx`):** Formatted with 4 analytical sheets:
   - `KPI_Overview`: High-level total passenger count, peak distribution %, and time bounds.
   - `Route_Performance`: Line-by-line demand metrics and average passenger density.
   - `Station_Performance`: Terminal boarding rankings.
   - `Day_and_Peak_Analysis`: Cross-tabulated day-of-week and peak intensity metrics.
3. **Embedded SQLite Database (`data/database.db`):** Indexed by `route_id`, `station_id`, and `timestamp` for zero-latency SQL analytics fallback.

---

## 5. Technology Stack & Architectural Decision Record (ADR)
- **Backend API:** FastAPI (Asynchronous Python framework chosen for OpenAPI documentation, native Pydantic validation, and Vercel serverless integration).
- **Analytical Engine:** Pandas for aggregations and vectorized slicing.
- **Server-Side Plotting:** Matplotlib (configured with `Agg` headless backend for thread-safe rendering into base64 PNG data streams).
- **Frontend Architecture:** React (Vite) Single Page Application configured with Tailwind CSS (Dark Mode).
- **Visualization:** Recharts SVG components for responsive, animated dashboards.
- **Deployment Platform:** Vercel free tier with zero-configuration serverless functions under `/api/*`.

---

## 6. Coverage Limitations & Assumptions
1. **Synthetic Nature:** While demand models incorporate realistic peak-hour distributions, external real-world shocks (e.g., severe weather storms, unplanned track outages, public holidays) are modeled via random stochastic noise rather than exogenous meteorological feeds.
2. **Directional Flow:** Boardings are aggregated at station nodes without individualized origin-destination (OD) fare-card matrix tracking.
3. **Single Fleet Capacity Assumption:** Passenger counts represent individual recorded vehicle runs rather than multi-car train compositions.
