import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRoutes,
  fetchKpis,
  fetchPeakVsOffpeak,
  fetchTopRoutes,
  fetchTopStations,
  fetchTimeSeries,
  fetchDayOfWeek,
  fetchRouteDistribution,
  fetchAnalyticsPlots
} from '../api';
import StatsCards from '../components/StatsCards';
import ChartsSection from '../components/ChartsSection';
import FilterBar from '../components/FilterBar';
import MatplotlibModal from '../components/MatplotlibModal';
import { Train, RefreshCw, AlertCircle, Database, ShieldCheck, Github } from 'lucide-react';

export default function Dashboard() {
  const [routes, setRoutes] = useState([{ id: 'ALL', name: 'All Routes' }]);
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dashboard Data State
  const [kpis, setKpis] = useState(null);
  const [peakOffpeak, setPeakOffpeak] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState([]);
  const [routeDist, setRouteDist] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [topStations, setTopStations] = useState([]);
  const [matplotlibPlots, setMatplotlibPlots] = useState({});

  // Loading & Modal State
  const [loading, setLoading] = useState(true);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Initial load of route list
  useEffect(() => {
    fetchRoutes()
      .then((data) => setRoutes(data))
      .catch((err) => console.warn('Could not load routes list:', err));
  }, []);

  // Fetch all dashboard analytics
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = {
      route_id: selectedRoute,
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    };

    try {
      const [
        kpiRes,
        peakOffRes,
        timeSeriesRes,
        dowRes,
        distRes,
        topRRes,
        topSRes
      ] = await Promise.all([
        fetchKpis(params),
        fetchPeakVsOffpeak(params),
        fetchTimeSeries(params),
        fetchDayOfWeek(params),
        fetchRouteDistribution(params),
        fetchTopRoutes({ ...params, limit: 5 }),
        fetchTopStations({ ...params, limit: 5 }),
      ]);

      setKpis(kpiRes);
      setPeakOffpeak(peakOffRes);
      setTimeSeries(timeSeriesRes);
      setDayOfWeek(dowRes);
      setRouteDist(distRes);
      setTopRoutes(topRRes);
      setTopStations(topSRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch analytics from the backend API. Please make sure the Python server is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, startDate, endDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load Matplotlib plots lazily when modal is triggered
  const loadMatplotlibPlots = async () => {
    setPlotsLoading(true);
    const params = {
      route_id: selectedRoute,
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    };

    try {
      const data = await fetchAnalyticsPlots(params);
      setMatplotlibPlots(data);
    } catch (err) {
      console.error('Failed to generate matplotlib plots:', err);
    } finally {
      setPlotsLoading(false);
    }
  };

  const handleOpenPlots = () => {
    setIsModalOpen(true);
    if (!Object.keys(matplotlibPlots).length) {
      loadMatplotlibPlots();
    }
  };

  const handleResetFilters = () => {
    setSelectedRoute('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedRoute !== 'ALL' || Boolean(startDate) || Boolean(endDate);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#1F2937] bg-[#111827]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">TransitPulse</h1>
                <a
                  href="https://public-transport-dashboard.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-500/30 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live on Vercel
                </a>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Public Transport Ridership & Demand Analysis Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-[#0B0F19] border border-[#1F2937] px-3 py-1.5 rounded-lg">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>10,000 Synthetic Records</span>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              title="Refresh Data"
              className="p-2 bg-[#1F2937] hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center gap-3 text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Connection Alert</p>
              <p className="text-xs text-rose-300">{error}</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <FilterBar
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteChange={setSelectedRoute}
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          onReset={handleResetFilters}
          onOpenPlots={handleOpenPlots}
          hasActiveFilters={hasActiveFilters}
        />

        {/* 4 Stats Cards */}
        <StatsCards kpis={kpis} loading={loading} />

        {/* Interactive Charts & Deep-Dive Breakdown */}
        <ChartsSection
          timeSeriesData={timeSeries}
          peakOffpeakData={peakOffpeak}
          dayOfWeekData={dayOfWeek}
          routeDistData={routeDist}
          topRoutesData={topRoutes}
          topStationsData={topStations}
          loading={loading}
        />
      </main>

      {/* Server-Side Matplotlib Modal */}
      <MatplotlibModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plots={matplotlibPlots}
        loading={plotsLoading}
        onRefresh={loadMatplotlibPlots}
      />

      {/* Clean Dark Mode Footer */}
      <footer className="border-t border-[#1F2937] bg-[#070A11] py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Built with FastAPI, Pandas, Matplotlib, Recharts & Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://public-transport-dashboard.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              public-transport-dashboard.vercel.app
            </a>
            <span>•</span>
            <span className="text-gray-400">Jupyter / Colab Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
