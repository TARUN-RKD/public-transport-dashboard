import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';

export default function MatplotlibModal({ isOpen, onClose, plots = {}, loading = false, onRefresh }) {
  const [activeTab, setActiveTab] = useState('hourly_curve');

  if (!isOpen) return null;

  const plotTabs = [
    { key: 'hourly_curve', label: '24-Hour Profile & Peak Window' },
    { key: 'peak_vs_offpeak', label: 'Weekly Peak vs Off-Peak' },
    { key: 'route_ranking', label: 'Route Volume Ranking' },
  ];

  const currentBase64 = plots[activeTab];

  const downloadCurrentPlot = () => {
    if (!currentBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${currentBase64}`;
    link.download = `matplotlib_${activeTab}_analytics.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] bg-[#0B0F19]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Server-Side Matplotlib Analytics
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Python Backend
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                High-resolution publication figures generated on-demand via Pandas & Matplotlib
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Regenerate Figures"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F2937] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F2937] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#1F2937] bg-[#111827] overflow-x-auto">
          {plotTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plot Display Canvas */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[350px] bg-[#070A11]">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Rendering Matplotlib vector buffers...</p>
            </div>
          ) : currentBase64 ? (
            <div className="relative group w-full flex justify-center">
              <img
                src={`data:image/png;base64,${currentBase64}`}
                alt="Matplotlib analytical figure"
                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-[#1F2937] shadow-xl"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No analytical figure available for this filter subset.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1F2937] bg-[#0B0F19]">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Rendered at 150 DPI in dark mode
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadCurrentPlot}
              disabled={!currentBase64}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-all duration-150"
            >
              <Download className="w-4 h-4" />
              Download High-Res PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
