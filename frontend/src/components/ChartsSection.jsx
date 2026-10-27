import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, PieChart as PieIcon, Layers, MapPin, Zap } from 'lucide-react';

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899',
  '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#84CC16'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-gray-700 shadow-xl rounded-lg p-3 text-xs text-gray-200">
        <p className="font-semibold text-white mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-gray-300">{item.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {Number(item.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsSection({
  timeSeriesData = [],
  peakOffpeakData = [],
  dayOfWeekData = [],
  routeDistData = [],
  topRoutesData = [],
  topStationsData = [],
  loading = false
}) {
  const [timeSeriesView, setTimeSeriesView] = useState('passengers'); // 'passengers' | 'split' | 'rolling'

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 h-80 animate-pulse">
            <div className="h-5 bg-[#1F2937] rounded w-1/3 mb-4"></div>
            <div className="h-60 bg-[#1F2937]/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Row 1: Time Series Trend & Peak vs Off-Peak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Time Series Line Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Ridership Trends Over Time</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Daily passenger progression and moving average trends
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#0B0F19] border border-[#1F2937] rounded-lg p-1 self-start sm:self-auto">
              <button
                onClick={() => setTimeSeriesView('passengers')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  timeSeriesView === 'passengers'
                    ? 'bg-blue-600 text-white font-medium shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Total Volume
              </button>
              <button
                onClick={() => setTimeSeriesView('split')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  timeSeriesView === 'split'
                    ? 'bg-blue-600 text-white font-medium shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Peak Split
              </button>
              <button
                onClick={() => setTimeSeriesView('rolling')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  timeSeriesView === 'rolling'
                    ? 'bg-blue-600 text-white font-medium shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                7-Day Moving Avg
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timeSeriesView === 'split' ? (
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOffpeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} minTickGap={30} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="peak_passengers" name="Peak Hours" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPeak)" />
                  <Area type="monotone" dataKey="offpeak_passengers" name="Off-Peak Hours" stroke="#10B981" fillOpacity={1} fill="url(#colorOffpeak)" />
                </AreaChart>
              ) : (
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} minTickGap={30} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="passengers"
                    name="Daily Passengers"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#3B82F6' }}
                  />
                  {timeSeriesView === 'rolling' && (
                    <Line
                      type="monotone"
                      dataKey="rolling_avg"
                      name="7-Day Rolling Trend"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Peak vs Off-Peak Comparison (4 cols) */}
        <div className="lg:col-span-4 bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Peak vs Off-Peak</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Volume & vehicle trip intensity comparison
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakOffpeakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="category" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_passengers" name="Total Riders" radius={[6, 6, 0, 0]}>
                    {peakOffpeakData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.is_peak === 1 ? '#F59E0B' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1F2937] mt-3">
            {peakOffpeakData.map((item, idx) => (
              <div key={idx} className="bg-[#0B0F19] rounded-lg p-3 border border-[#1F2937]">
                <span className="text-[11px] text-gray-400 block font-medium">
                  {item.category} Avg / Trip
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {item.avg_passengers} <span className="text-xs font-normal text-gray-400">pax</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {item.trip_count.toLocaleString()} runs recorded
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Busiest Days of Week & Route Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3. Busiest Days of the Week (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Busiest Days of the Week</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Stacked breakdown of peak commuting vs regular off-peak travel
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="short_day" stroke="#6B7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="peak" name="Peak Hours" stackId="a" fill="#F59E0B" />
                <Bar dataKey="offpeak" name="Off-Peak Hours" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Route Share Distribution (Donut Chart - 5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Route Distribution</h3>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Market share of transit ridership across lines
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={routeDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {routeDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${Number(val).toLocaleString()} pax (${item.payload.percentage}%)`,
                      item.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Route Legend List */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3 border-t border-[#1F2937] max-h-24 overflow-y-auto">
            {routeDistData.slice(0, 6).map((route, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }}></span>
                <span className="text-gray-300 truncate font-medium">{route.name}</span>
                <span className="text-gray-400 ml-auto font-mono text-[11px]">{route.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top 5 Routes & Top 5 Stations High-Demand Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 High-Demand Routes */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Top 5 High-Demand Routes
              </h4>
            </div>
            <span className="text-xs text-gray-400">Ranked by total riders</span>
          </div>

          <div className="space-y-3">
            {topRoutesData.map((route, idx) => {
              const maxVal = topRoutesData[0]?.total_passengers || 1;
              const pct = Math.round((route.total_passengers / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-200">
                      #{idx + 1} {route.route_name} <span className="text-gray-400 font-normal">({route.route_id})</span>
                    </span>
                    <span className="font-mono text-blue-400 font-bold">
                      {route.total_passengers.toLocaleString()} pax
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 High-Demand Stations */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Top 5 High-Demand Stations
              </h4>
            </div>
            <span className="text-xs text-gray-400">Ranked by boarding volume</span>
          </div>

          <div className="space-y-3">
            {topStationsData.map((station, idx) => {
              const maxVal = topStationsData[0]?.total_passengers || 1;
              const pct = Math.round((station.total_passengers / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-200">
                      #{idx + 1} {station.station_name} <span className="text-gray-400 font-normal">({station.station_id})</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {station.total_passengers.toLocaleString()} pax
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
