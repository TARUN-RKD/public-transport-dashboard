import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses Vite proxy in dev & relative path on Vercel deployment
  timeout: 30000,
});

export const fetchRoutes = async () => {
  const res = await api.get('/api/routes');
  return res.data;
};

export const fetchKpis = async (params) => {
  const res = await api.get('/api/kpis', { params });
  return res.data;
};

export const fetchPeakVsOffpeak = async (params) => {
  const res = await api.get('/api/peak-vs-offpeak', { params });
  return res.data;
};

export const fetchTopRoutes = async (params) => {
  const res = await api.get('/api/top-routes', { params });
  return res.data;
};

export const fetchTopStations = async (params) => {
  const res = await api.get('/api/top-stations', { params });
  return res.data;
};

export const fetchTimeSeries = async (params) => {
  const res = await api.get('/api/time-series', { params });
  return res.data;
};

export const fetchHourlyTrends = async (params) => {
  const res = await api.get('/api/hourly-trends', { params });
  return res.data;
};

export const fetchDayOfWeek = async (params) => {
  const res = await api.get('/api/day-of-week', { params });
  return res.data;
};

export const fetchRouteDistribution = async (params) => {
  const res = await api.get('/api/route-distribution', { params });
  return res.data;
};

export const fetchAnalyticsPlots = async (params) => {
  const res = await api.get('/api/analytics-plots', { params });
  return res.data;
};

export const getExportCsvUrl = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `/api/export/csv${query ? `?${query}` : ''}`;
};

export const getExportExcelUrl = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `/api/export/excel${query ? `?${query}` : ''}`;
};

export default api;
