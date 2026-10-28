import os
import io
from typing import Optional
from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

# Handle relative import depending on execution mode (direct vs package/Vercel)
try:
    from api.data_processor import DataProcessor
except ImportError:
    from data_processor import DataProcessor

app = FastAPI(
    title="Public Transport Ridership Analysis API",
    description="FastAPI Backend for Public Transit Analytics, KPIs, and Visualizations",
    version="1.0.0"
)

# Enable CORS for local dev and Vercel preview/production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load local .env file securely if present (ignored by git)
env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_file):
    try:
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip())
    except Exception:
        pass

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
API_KEY = os.getenv("API_KEY", "")

processor = DataProcessor()

@app.get("/api/health")
def health_check():
    df = processor.filter_data()
    return {
        "status": "healthy",
        "dataset_records": len(df),
        "engine": "FastAPI + Pandas",
        "environment": ENVIRONMENT,
        "auth_configured": bool(API_KEY)
    }

@app.get("/api/routes")
def get_routes():
    return processor.get_all_routes()

@app.get("/api/kpis")
def get_kpis(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_kpis(df)

@app.get("/api/peak-vs-offpeak")
def get_peak_vs_offpeak(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_peak_vs_offpeak(df)

@app.get("/api/top-routes")
def get_top_routes(
    limit: int = Query(5, ge=1, le=10),
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_top_routes(df, limit=limit)

@app.get("/api/top-stations")
def get_top_stations(
    limit: int = Query(5, ge=1, le=20),
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_top_stations(df, limit=limit)

@app.get("/api/time-series")
def get_time_series(
    freq: str = Query("D"),
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_time_series(df, freq=freq)

@app.get("/api/hourly-trends")
def get_hourly_trends(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_hourly_trends(df)

@app.get("/api/day-of-week")
def get_day_of_week(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_day_of_week_trends(df)

@app.get("/api/route-distribution")
def get_route_distribution(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    return processor.get_route_distribution(df)

@app.get("/api/analytics-plots")
def get_analytics_plots(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    plots = processor.generate_matplotlib_figures(df)
    return plots

@app.get("/api/export/csv")
def export_csv(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    csv_bytes = processor.export_csv(df)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="filtered_ridership.csv"'}
    )

@app.get("/api/export/excel")
def export_excel(
    route_id: Optional[str] = Query("ALL"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    df = processor.filter_data(route_id, start_date, end_date)
    excel_bytes = processor.export_excel(df)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="filtered_ridership.xlsx"'}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
