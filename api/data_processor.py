import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for serverless / thread-safety
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CSV_PATH = os.path.join(DATA_DIR, "ridership.csv")

ROUTE_NAMES = {
    "R-101": "Red Line Metro",
    "R-102": "Blue Suburban Line",
    "R-103": "Green Express",
    "R-104": "Downtown Shuttle",
    "R-105": "Cross-City 500",
    "R-106": "Airport Direct",
    "R-107": "Waterfront Tram",
    "R-108": "University Loop",
    "R-109": "Tech Corridor Express",
    "R-110": "Night Owl Bus",
}

STATION_NAMES = {
    "S-01": "Central Grand Station",
    "S-02": "Financial District",
    "S-03": "Tech Park North",
    "S-04": "Civic Center",
    "S-05": "University Campus",
    "S-06": "International Airport",
    "S-07": "Waterfront Pier",
    "S-08": "Suburban Junction",
    "S-09": "West End Terminal",
    "S-10": "Market Square",
    "S-11": "Hospital Medical Center",
    "S-12": "Convention Center",
    "S-13": "Arts & Museum District",
    "S-14": "Eastside Plaza",
    "S-15": "Harbor View",
    "S-16": "Sports Stadium",
    "S-17": "Innovation Hub",
    "S-18": "North Gate Center",
    "S-19": "River Park",
    "S-20": "Highland Heights",
}

class DataProcessor:
    def __init__(self, csv_path: str = CSV_PATH):
        self.csv_path = csv_path
        self._raw_df = None
        self._load_cache()

    def _load_cache(self):
        if os.path.exists(self.csv_path):
            df = pd.read_csv(self.csv_path)
            df["datetime"] = pd.to_datetime(df["timestamp"])
            df["date"] = df["datetime"].dt.date
            df["hour"] = df["datetime"].dt.hour
            df["day_name"] = df["datetime"].dt.day_name()
            df["route_name"] = df["route_id"].map(ROUTE_NAMES).fillna(df["route_id"])
            df["station_name"] = df["station_id"].map(STATION_NAMES).fillna(df["station_id"])
            self._raw_df = df
        else:
            self._raw_df = pd.DataFrame()

    def filter_data(self, route_id: str = None, start_date: str = None, end_date: str = None) -> pd.DataFrame:
        if self._raw_df is None or self._raw_df.empty:
            self._load_cache()
            if self._raw_df is None or self._raw_df.empty:
                return pd.DataFrame()

        df = self._raw_df.copy()

        if route_id and route_id != "ALL":
            df = df[df["route_id"] == route_id]

        if start_date:
            try:
                start_dt = pd.to_datetime(start_date)
                df = df[df["datetime"] >= start_dt]
            except Exception:
                pass

        if end_date:
            try:
                end_dt = pd.to_datetime(end_date) + pd.Timedelta(days=1)
                df = df[df["datetime"] < end_dt]
            except Exception:
                pass

        return df

    def get_kpis(self, df: pd.DataFrame) -> dict:
        if df.empty:
            return {
                "total_passengers": 0,
                "busiest_route": {"id": "N/A", "name": "N/A", "passengers": 0},
                "peak_hour": "N/A",
                "avg_daily_growth": 0.0,
                "total_records": 0,
                "peak_percentage": 0.0,
                "offpeak_percentage": 0.0,
                "avg_passengers_per_trip": 0.0
            }

        total_passengers = int(df["passenger_count"].sum())
        total_records = len(df)
        avg_passengers = round(float(df["passenger_count"].mean()), 1)

        # Busiest Route
        route_totals = df.groupby(["route_id", "route_name"])["passenger_count"].sum().reset_index()
        busiest = route_totals.sort_values(by="passenger_count", ascending=False).iloc[0]
        busiest_route = {
            "id": busiest["route_id"],
            "name": busiest["route_name"],
            "passengers": int(busiest["passenger_count"])
        }

        # Peak Hour
        hour_totals = df.groupby("hour")["passenger_count"].sum()
        peak_h = int(hour_totals.idxmax())
        peak_hour_str = f"{peak_h:02d}:00 - {(peak_h + 1) % 24:02d}:00"

        # Peak vs Off-Peak split
        peak_passengers = int(df[df["is_peak"] == 1]["passenger_count"].sum())
        peak_pct = round((peak_passengers / total_passengers * 100), 1) if total_passengers > 0 else 0.0
        offpeak_pct = round(100.0 - peak_pct, 1)

        # Daily growth calculation
        daily_passengers = df.groupby("date")["passenger_count"].sum().sort_index()
        if len(daily_passengers) > 1:
            growth_rates = daily_passengers.pct_change().dropna()
            # Clip extreme single-day outliers for representative average
            avg_growth = float(np.mean(np.clip(growth_rates.values, -0.5, 0.5)) * 100)
            avg_daily_growth = round(avg_growth, 2)
        else:
            avg_daily_growth = 0.0

        return {
            "total_passengers": total_passengers,
            "busiest_route": busiest_route,
            "peak_hour": peak_hour_str,
            "avg_daily_growth": avg_daily_growth,
            "total_records": total_records,
            "peak_percentage": peak_pct,
            "offpeak_percentage": offpeak_pct,
            "avg_passengers_per_trip": avg_passengers
        }

    def get_peak_vs_offpeak(self, df: pd.DataFrame) -> dict:
        if df.empty:
            return {"categories": [], "data": []}

        agg = df.groupby("is_peak").agg(
            total_passengers=("passenger_count", "sum"),
            avg_passengers=("passenger_count", "mean"),
            trips=("passenger_count", "count")
        ).reset_index()

        peak_row = agg[agg["is_peak"] == 1]
        offpeak_row = agg[agg["is_peak"] == 0]

        return [
            {
                "category": "Peak Hours",
                "is_peak": 1,
                "total_passengers": int(peak_row["total_passengers"].iloc[0]) if not peak_row.empty else 0,
                "avg_passengers": round(float(peak_row["avg_passengers"].iloc[0]), 1) if not peak_row.empty else 0.0,
                "trip_count": int(peak_row["trips"].iloc[0]) if not peak_row.empty else 0
            },
            {
                "category": "Off-Peak Hours",
                "is_peak": 0,
                "total_passengers": int(offpeak_row["total_passengers"].iloc[0]) if not offpeak_row.empty else 0,
                "avg_passengers": round(float(offpeak_row["avg_passengers"].iloc[0]), 1) if not offpeak_row.empty else 0.0,
                "trip_count": int(offpeak_row["trips"].iloc[0]) if not offpeak_row.empty else 0
            }
        ]

    def get_top_routes(self, df: pd.DataFrame, limit: int = 5) -> list:
        if df.empty:
            return []
        grouped = df.groupby(["route_id", "route_name"]).agg(
            total_passengers=("passenger_count", "sum"),
            avg_passengers=("passenger_count", "mean"),
            trips=("passenger_count", "count")
        ).reset_index().sort_values(by="total_passengers", ascending=False).head(limit)

        return [
            {
                "route_id": row["route_id"],
                "route_name": row["route_name"],
                "total_passengers": int(row["total_passengers"]),
                "avg_passengers": round(float(row["avg_passengers"]), 1),
                "trips": int(row["trips"])
            }
            for _, row in grouped.iterrows()
        ]

    def get_top_stations(self, df: pd.DataFrame, limit: int = 5) -> list:
        if df.empty:
            return []
        grouped = df.groupby(["station_id", "station_name"]).agg(
            total_passengers=("passenger_count", "sum"),
            avg_passengers=("passenger_count", "mean"),
            trips=("passenger_count", "count")
        ).reset_index().sort_values(by="total_passengers", ascending=False).head(limit)

        return [
            {
                "station_id": row["station_id"],
                "station_name": row["station_name"],
                "total_passengers": int(row["total_passengers"]),
                "avg_passengers": round(float(row["avg_passengers"]), 1),
                "trips": int(row["trips"])
            }
            for _, row in grouped.iterrows()
        ]

    def get_time_series(self, df: pd.DataFrame, freq: str = "D") -> list:
        if df.empty:
            return []

        # If data spans multiple months, aggregate daily, weekly or monthly depending on range
        ts_df = df.copy()
        ts_df["period"] = ts_df["datetime"].dt.to_period(freq).dt.to_timestamp()
        grouped = ts_df.groupby("period").agg(
            passengers=("passenger_count", "sum"),
            trips=("passenger_count", "count"),
            peak_passengers=("passenger_count", lambda x: ts_df.loc[x.index][ts_df.loc[x.index, "is_peak"] == 1]["passenger_count"].sum()),
            offpeak_passengers=("passenger_count", lambda x: ts_df.loc[x.index][ts_df.loc[x.index, "is_peak"] == 0]["passenger_count"].sum())
        ).reset_index()

        # Rolling 7-period moving average
        grouped["rolling_avg"] = grouped["passengers"].rolling(window=7, min_periods=1).mean().round(1)

        result = []
        for _, row in grouped.iterrows():
            result.append({
                "date": row["period"].strftime("%Y-%m-%d"),
                "passengers": int(row["passengers"]),
                "trips": int(row["trips"]),
                "peak_passengers": int(row["peak_passengers"]),
                "offpeak_passengers": int(row["offpeak_passengers"]),
                "rolling_avg": float(row["rolling_avg"])
            })
        return result

    def get_hourly_trends(self, df: pd.DataFrame) -> list:
        if df.empty:
            return []
        grouped = df.groupby("hour").agg(
            total_passengers=("passenger_count", "sum"),
            avg_passengers=("passenger_count", "mean"),
            trips=("passenger_count", "count")
        ).reindex(range(24), fill_value=0).reset_index()

        return [
            {
                "hour": int(row["hour"]),
                "label": f"{int(row['hour']):02d}:00",
                "total_passengers": int(row["total_passengers"]),
                "avg_passengers": round(float(row["avg_passengers"]), 1),
                "is_peak_window": 1 if (7 <= row["hour"] <= 9 or 17 <= row["hour"] <= 19) else 0
            }
            for _, row in grouped.iterrows()
        ]

    def get_day_of_week_trends(self, df: pd.DataFrame) -> list:
        if df.empty:
            return []
        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        grouped = df.groupby(["day_name", "is_peak"])["passenger_count"].sum().unstack(fill_value=0).reindex(day_order, fill_value=0)
        
        result = []
        for day in day_order:
            peak_val = int(grouped.loc[day, 1]) if 1 in grouped.columns and day in grouped.index else 0
            offpeak_val = int(grouped.loc[day, 0]) if 0 in grouped.columns and day in grouped.index else 0
            result.append({
                "day": day,
                "short_day": day[:3],
                "peak": peak_val,
                "offpeak": offpeak_val,
                "total": peak_val + offpeak_val
            })
        return result

    def get_route_distribution(self, df: pd.DataFrame) -> list:
        if df.empty:
            return []
        grouped = df.groupby(["route_id", "route_name"])["passenger_count"].sum().reset_index()
        total_p = grouped["passenger_count"].sum()
        grouped["percentage"] = (grouped["passenger_count"] / total_p * 100).round(1)
        grouped = grouped.sort_values(by="passenger_count", ascending=False)

        colors = [
            "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899",
            "#06B6D4", "#F97316", "#14B8A6", "#6366F1", "#84CC16"
        ]

        result = []
        for idx, row in grouped.iterrows():
            result.append({
                "route_id": row["route_id"],
                "name": row["route_name"],
                "value": int(row["passenger_count"]),
                "percentage": float(row["percentage"]),
                "color": colors[len(result) % len(colors)]
            })
        return result

    def get_all_routes(self) -> list:
        routes = [{"id": "ALL", "name": "All Routes"}]
        for r_id, r_name in ROUTE_NAMES.items():
            routes.append({"id": r_id, "name": f"{r_id} - {r_name}"})
        return routes

    def generate_matplotlib_figures(self, df: pd.DataFrame) -> dict:
        """
        Renders Dark Mode Matplotlib plots as base64-encoded PNG strings.
        Perfect for scientific reporting and dashboard modal display.
        """
        if df.empty:
            return {}

        plt.style.use("dark_background")
        bg_color = "#0B0F19"
        card_bg = "#111827"
        text_color = "#F3F4F6"
        accent_blue = "#3B82F6"
        accent_emerald = "#10B981"
        accent_purple = "#8B5CF6"
        accent_amber = "#F59E0B"
        grid_color = "#1F2937"

        plots = {}

        # 1. Hourly Trend Analysis with Shaded Peak Bands
        fig, ax = plt.subplots(figsize=(10, 4.8), dpi=150)
        fig.patch.set_facecolor(bg_color)
        ax.set_facecolor(card_bg)

        hourly = df.groupby("hour")["passenger_count"].sum().reindex(range(24), fill_value=0)
        ax.plot(hourly.index, hourly.values, color=accent_blue, marker="o", linewidth=2.5, markersize=5, label="Hourly Volume")
        ax.fill_between(hourly.index, hourly.values, color=accent_blue, alpha=0.15)

        # Highlight Peak Hours
        ax.axvspan(7, 9.9, color=accent_amber, alpha=0.18, label="Morning Peak (7-10 AM)")
        ax.axvspan(17, 19.9, color="#EF4444", alpha=0.18, label="Evening Peak (5-8 PM)")

        ax.set_title("Hourly Ridership Dynamics & Peak Hour Windows", fontsize=13, fontweight="bold", color=text_color, pad=12)
        ax.set_xlabel("Hour of Day (24-Hour Military Format)", fontsize=10, color="#9CA3AF")
        ax.set_ylabel("Total Passengers", fontsize=10, color="#9CA3AF")
        ax.set_xticks(range(0, 24, 2))
        ax.set_xticklabels([f"{h:02d}:00" for h in range(0, 24, 2)], color="#D1D5DB")
        ax.tick_params(colors="#9CA3AF")
        ax.grid(True, linestyle="--", alpha=0.4, color=grid_color)
        ax.legend(frameon=True, facecolor=card_bg, edgecolor=grid_color, fontsize=9)
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", facecolor=bg_color, bbox_inches="tight")
        buf.seek(0)
        plots["hourly_curve"] = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)

        # 2. Peak vs Off-Peak Distribution by Day of Week
        fig, ax = plt.subplots(figsize=(10, 4.8), dpi=150)
        fig.patch.set_facecolor(bg_color)
        ax.set_facecolor(card_bg)

        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_df = df.groupby(["day_name", "is_peak"])["passenger_count"].sum().unstack(fill_value=0).reindex(day_order, fill_value=0)

        x = np.arange(len(day_order))
        width = 0.38

        ax.bar(x - width/2, dow_df[1], width, label="Peak Hours", color=accent_amber, edgecolor="none", alpha=0.9)
        ax.bar(x + width/2, dow_df[0], width, label="Off-Peak Hours", color=accent_emerald, edgecolor="none", alpha=0.9)

        ax.set_title("Peak vs Off-Peak Passenger Volume by Day of Week", fontsize=13, fontweight="bold", color=text_color, pad=12)
        ax.set_ylabel("Passenger Volume", fontsize=10, color="#9CA3AF")
        ax.set_xticks(x)
        ax.set_xticklabels(day_order, fontsize=10, color="#D1D5DB")
        ax.tick_params(colors="#9CA3AF")
        ax.grid(True, linestyle="--", alpha=0.4, color=grid_color, axis="y")
        ax.legend(frameon=True, facecolor=card_bg, edgecolor=grid_color, fontsize=9)
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", facecolor=bg_color, bbox_inches="tight")
        buf.seek(0)
        plots["peak_vs_offpeak"] = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)

        # 3. Route Ridership Ranking (Horizontal Bar)
        fig, ax = plt.subplots(figsize=(10, 5.2), dpi=150)
        fig.patch.set_facecolor(bg_color)
        ax.set_facecolor(card_bg)

        route_totals = df.groupby("route_name")["passenger_count"].sum().sort_values(ascending=True)
        colors_bar = plt.cm.plasma(np.linspace(0.3, 0.85, len(route_totals)))

        bars = ax.barh(route_totals.index, route_totals.values, color=colors_bar, height=0.65)
        for bar in bars:
            val = bar.get_width()
            ax.text(val + (route_totals.max() * 0.01), bar.get_y() + bar.get_height()/2,
                    f"{int(val):,}", va="center", ha="left", color="#E5E7EB", fontsize=8.5, fontweight="bold")

        ax.set_title("Comparative Transit Route Volume Ranking", fontsize=13, fontweight="bold", color=text_color, pad=12)
        ax.set_xlabel("Cumulative Passengers", fontsize=10, color="#9CA3AF")
        ax.set_xlim(0, route_totals.max() * 1.15)
        ax.tick_params(colors="#9CA3AF")
        ax.grid(True, linestyle="--", alpha=0.3, color=grid_color, axis="x")
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", facecolor=bg_color, bbox_inches="tight")
        buf.seek(0)
        plots["route_ranking"] = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)

        return plots

    def export_csv(self, df: pd.DataFrame) -> bytes:
        return df.to_csv(index=False).encode("utf-8")

    def export_excel(self, df: pd.DataFrame) -> bytes:
        buf = io.BytesIO()
        with pd.ExcelWriter(buf, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="Filtered_Ridership", index=False)
            
            # Add summary sheet
            summary = pd.DataFrame([
                {"Metric": "Total Records", "Value": len(df)},
                {"Metric": "Total Passengers", "Value": int(df["passenger_count"].sum()) if not df.empty else 0},
                {"Metric": "Average per Trip", "Value": round(float(df["passenger_count"].mean()), 2) if not df.empty else 0},
            ])
            summary.to_excel(writer, sheet_name="Summary_KPIs", index=False)
        buf.seek(0)
        return buf.getvalue()
