import React from 'react';
import { Filter, Calendar, FileSpreadsheet, FileText, BarChart2, RotateCcw } from 'lucide-react';
import { getExportCsvUrl, getExportExcelUrl } from '../api';

export default function FilterBar({
  routes = [],
  selectedRoute = 'ALL',
  onRouteChange,
  startDate = '',
  endDate = '',
  onDateChange,
  onReset,
  onOpenPlots,
  hasActiveFilters = false
}) {
  const exportParams = {
    route_id: selectedRoute,
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {})
  };

  const setPreset = (preset) => {
    if (preset === 'ALL') {
      onDateChange('', '');
    } else if (preset === 'Q1') {
      onDateChange('2026-01-01', '2026-03-31');
    } else if (preset === 'Q2') {
      onDateChange('2026-04-01', '2026-06-30');
    } else if (preset === 'Q3') {
      onDateChange('2026-07-01', '2026-09-30');
    } else if (preset === 'Q4') {
      onDateChange('2026-10-01', '2026-12-31');
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 md:p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Route Selector */}
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-[#1F2937] rounded-lg px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <label className="text-gray-400 font-medium whitespace-nowrap">Route:</label>
            <select
              value={selectedRoute}
              onChange={(e) => onRouteChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#111827] text-white">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-[#1F2937] rounded-lg px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-gray-400 font-medium">Dates:</span>
            <input
              type="date"
              value={startDate}
              min="2026-01-01"
              max="2026-12-31"
              onChange={(e) => onDateChange(e.target.value, endDate)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              min="2026-01-01"
              max="2026-12-31"
              onChange={(e) => onDateChange(startDate, e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            />
          </div>

          {/* Quick Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-[#0B0F19] border border-[#1F2937] rounded-lg p-1 text-[11px]">
            <button
              onClick={() => setPreset('ALL')}
              className={`px-2 py-1 rounded transition-colors ${!startDate && !endDate ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Full Year
            </button>
            <button
              onClick={() => setPreset('Q1')}
              className={`px-2 py-1 rounded transition-colors ${startDate === '2026-01-01' && endDate === '2026-03-31' ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Q1
            </button>
            <button
              onClick={() => setPreset('Q2')}
              className={`px-2 py-1 rounded transition-colors ${startDate === '2026-04-01' && endDate === '2026-06-30' ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Q2
            </button>
            <button
              onClick={() => setPreset('Q3')}
              className={`px-2 py-1 rounded transition-colors ${startDate === '2026-07-01' && endDate === '2026-09-30' ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Q3
            </button>
            <button
              onClick={() => setPreset('Q4')}
              className={`px-2 py-1 rounded transition-colors ${startDate === '2026-10-01' && endDate === '2026-12-31' ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Q4
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-800/40 rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Action Buttons: Matplotlib figures & CSV/Excel export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPlots}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            Matplotlib Plots
          </button>

          <a
            href={getExportCsvUrl(exportParams)}
            download="filtered_ridership.csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1F2937] hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition-all"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            Export CSV
          </a>

          <a
            href={getExportExcelUrl(exportParams)}
            download="filtered_ridership.xlsx"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1F2937] hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Excel
          </a>
        </div>
      </div>
    </div>
  );
}
