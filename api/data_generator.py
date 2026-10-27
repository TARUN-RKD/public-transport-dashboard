import os
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

ROUTES = [
    {"id": "R-101", "name": "Red Line Metro", "base_weight": 1.4},
    {"id": "R-102", "name": "Blue Suburban Line", "base_weight": 1.25},
    {"id": "R-103", "name": "Green Express", "base_weight": 1.1},
    {"id": "R-104", "name": "Downtown Shuttle", "base_weight": 1.0},
    {"id": "R-105", "name": "Cross-City 500", "base_weight": 0.95},
    {"id": "R-106", "name": "Airport Direct", "base_weight": 1.15},
    {"id": "R-107", "name": "Waterfront Tram", "base_weight": 0.8},
    {"id": "R-108", "name": "University Loop", "base_weight": 0.9},
    {"id": "R-109", "name": "Tech Corridor Express", "base_weight": 1.3},
    {"id": "R-110", "name": "Night Owl Bus", "base_weight": 0.45},
]

STATIONS = [
    {"id": "S-01", "name": "Central Grand Station", "weight": 1.5},
    {"id": "S-02", "name": "Financial District", "weight": 1.4},
    {"id": "S-03", "name": "Tech Park North", "weight": 1.35},
    {"id": "S-04", "name": "Civic Center", "weight": 1.2},
    {"id": "S-05", "name": "University Campus", "weight": 1.1},
    {"id": "S-06", "name": "International Airport", "weight": 1.3},
    {"id": "S-07", "name": "Waterfront Pier", "weight": 0.9},
    {"id": "S-08", "name": "Suburban Junction", "weight": 1.05},
    {"id": "S-09", "name": "West End Terminal", "weight": 0.95},
    {"id": "S-10", "name": "Market Square", "weight": 1.15},
    {"id": "S-11", "name": "Hospital Medical Center", "weight": 1.0},
    {"id": "S-12", "name": "Convention Center", "weight": 0.85},
    {"id": "S-13", "name": "Arts & Museum District", "weight": 0.8},
    {"id": "S-14", "name": "Eastside Plaza", "weight": 0.9},
    {"id": "S-15", "name": "Harbor View", "weight": 0.75},
    {"id": "S-16", "name": "Sports Stadium", "weight": 0.85},
    {"id": "S-17", "name": "Innovation Hub", "weight": 1.1},
    {"id": "S-18", "name": "North Gate Center", "weight": 0.9},
    {"id": "S-19", "name": "River Park", "weight": 0.7},
    {"id": "S-20", "name": "Highland Heights", "weight": 0.65},
]

def generate_ridership_data(num_records: int = 10000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    start_date = datetime(2026, 1, 1, 0, 0, 0)
    total_seconds_in_year = 365 * 24 * 3600
    
    random_seconds = np.random.randint(0, total_seconds_in_year, size=num_records)
    random_seconds.sort()
    
    timestamps = [start_date + timedelta(seconds=int(s)) for s in random_seconds]
    
    route_ids = [r["id"] for r in ROUTES]
    route_probs = np.array([r["base_weight"] for r in ROUTES])
    route_probs = route_probs / route_probs.sum()
    chosen_routes = np.random.choice(route_ids, size=num_records, p=route_probs)
    
    station_ids = [s["id"] for s in STATIONS]
    station_probs = np.array([s["weight"] for s in STATIONS])
    station_probs = station_probs / station_probs.sum()
    chosen_stations = np.random.choice(station_ids, size=num_records, p=station_probs)
    
    is_peak_list = []
    passenger_counts = []
    
    route_weight_map = {r["id"]: r["base_weight"] for r in ROUTES}
    station_weight_map = {s["id"]: s["weight"] for s in STATIONS}
    
    for ts, r_id, s_id in zip(timestamps, chosen_routes, chosen_stations):
        hour = ts.hour
        weekday = ts.weekday()  # 0=Monday, 6=Sunday
        
        # Peak: Weekdays (Mon-Fri) during 7:00-9:59 (morning) and 17:00-19:59 (evening)
        is_weekday = weekday < 5
        is_morning_peak = 7 <= hour <= 9
        is_evening_peak = 17 <= hour <= 19
        peak = 1 if (is_weekday and (is_morning_peak or is_evening_peak)) else 0
        is_peak_list.append(peak)
        
        # Base count determined by peak, route, station, and random variability
        base_passengers = 35.0
        if peak == 1:
            multiplier = 2.4 + np.random.uniform(0.1, 0.6)
        elif 10 <= hour <= 16:
            multiplier = 1.3 + np.random.uniform(0.0, 0.3)
        elif hour >= 22 or hour <= 5:
            multiplier = 0.4 + np.random.uniform(0.0, 0.2)
        else:
            multiplier = 1.0 + np.random.uniform(0.0, 0.2)
            
        r_mult = route_weight_map.get(r_id, 1.0)
        s_mult = station_weight_map.get(s_id, 1.0)
        
        count = int(base_passengers * multiplier * r_mult * s_mult + np.random.normal(0, 10))
        count = max(5, count)  # minimum 5 passengers
        passenger_counts.append(count)
        
    df = pd.DataFrame({
        "timestamp": [ts.strftime("%Y-%m-%d %H:%M:%S") for ts in timestamps],
        "route_id": chosen_routes,
        "station_id": chosen_stations,
        "passenger_count": passenger_counts,
        "is_peak": is_peak_list
    })
    
    # Save CSV
    csv_path = os.path.join(DATA_DIR, "ridership.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} records in {csv_path}")
    
    # Save SQLite database
    db_path = os.path.join(DATA_DIR, "database.db")
    with sqlite3.connect(db_path) as conn:
        df.to_sql("ridership", conn, if_exists="replace", index=False)
        # Create useful indexes for fast lookups
        cursor = conn.cursor()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_route_id ON ridership(route_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON ridership(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_station_id ON ridership(station_id)")
        conn.commit()
    print(f"Stored SQLite database in {db_path}")
    
    # Generate Processed Excel Report
    excel_path = os.path.join(DATA_DIR, "ridership_report.xlsx")
    generate_excel_summary(df, excel_path)
    
    return df

def generate_excel_summary(df: pd.DataFrame, excel_path: str):
    df_temp = df.copy()
    df_temp["dt"] = pd.to_datetime(df_temp["timestamp"])
    df_temp["date"] = df_temp["dt"].dt.date
    df_temp["hour"] = df_temp["dt"].dt.hour
    df_temp["day_name"] = df_temp["dt"].dt.day_name()
    
    # Sheet 1: High Level KPI Summary
    total_passengers = int(df_temp["passenger_count"].sum())
    total_trips = len(df_temp)
    avg_per_trip = round(float(df_temp["passenger_count"].mean()), 2)
    peak_count = int(df_temp[df_temp["is_peak"] == 1]["passenger_count"].sum())
    offpeak_count = int(df_temp[df_temp["is_peak"] == 0]["passenger_count"].sum())
    peak_pct = round((peak_count / total_passengers) * 100, 2)
    
    kpi_summary = pd.DataFrame([
        {"Metric": "Total Passenger Volume", "Value": f"{total_passengers:,}"},
        {"Metric": "Total Recorded Trips", "Value": f"{total_trips:,}"},
        {"Metric": "Average Passengers / Trip", "Value": f"{avg_per_trip}"},
        {"Metric": "Peak Hours Passengers", "Value": f"{peak_count:,} ({peak_pct}%)"},
        {"Metric": "Off-Peak Passengers", "Value": f"{offpeak_count:,} ({100-peak_pct:.2f}%)"},
        {"Metric": "Data Coverage Start", "Value": str(df_temp["dt"].min())},
        {"Metric": "Data Coverage End", "Value": str(df_temp["dt"].max())},
    ])
    
    # Sheet 2: Route Performance
    route_perf = df_temp.groupby("route_id").agg(
        total_passengers=("passenger_count", "sum"),
        trip_count=("passenger_count", "count"),
        avg_passengers=("passenger_count", "mean"),
        peak_passengers=("passenger_count", lambda x: df_temp.loc[x.index][df_temp.loc[x.index, "is_peak"] == 1]["passenger_count"].sum())
    ).reset_index().sort_values(by="total_passengers", ascending=False)
    route_perf["avg_passengers"] = route_perf["avg_passengers"].round(1)
    
    # Sheet 3: Top Stations
    station_perf = df_temp.groupby("station_id").agg(
        total_passengers=("passenger_count", "sum"),
        trip_count=("passenger_count", "count"),
        avg_passengers=("passenger_count", "mean")
    ).reset_index().sort_values(by="total_passengers", ascending=False)
    station_perf["avg_passengers"] = station_perf["avg_passengers"].round(1)
    
    # Sheet 4: Day of Week & Peak Analysis
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_summary = df_temp.groupby(["day_name", "is_peak"]).agg(
        passengers=("passenger_count", "sum"),
        records=("passenger_count", "count")
    ).reset_index()
    day_summary["day_name"] = pd.Categorical(day_summary["day_name"], categories=day_order, ordered=True)
    day_summary = day_summary.sort_values(by=["day_name", "is_peak"])
    
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        kpi_summary.to_excel(writer, sheet_name="KPI_Overview", index=False)
        route_perf.to_excel(writer, sheet_name="Route_Performance", index=False)
        station_perf.to_excel(writer, sheet_name="Station_Performance", index=False)
        day_summary.to_excel(writer, sheet_name="Day_and_Peak_Analysis", index=False)
        
    print(f"Generated multi-sheet Excel summary in {excel_path}")

if __name__ == "__main__":
    generate_ridership_data(10000)
