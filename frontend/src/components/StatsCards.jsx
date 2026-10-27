import React from 'react';
import { Users, TrendingUp, Clock, Compass, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCards({ kpis, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-[#1F2937] rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-[#1F2937] rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[#1F2937] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const {
    total_passengers = 0,
    busiest_route = { id: 'N/A', name: 'N/A', passengers: 0 },
    peak_hour = 'N/A',
    avg_daily_growth = 0,
    peak_percentage = 0,
    avg_passengers_per_trip = 0,
    total_records = 0
  } = kpis || {};

  const isGrowthPositive = avg_daily_growth >= 0;

  const cards = [
    {
      title: 'Total Passengers',
      value: Number(total_passengers).toLocaleString(),
      subtext: `${peak_percentage}% during peak rush hours`,
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      badge: `${Number(total_records).toLocaleString()} Trips`,
      badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
    },
    {
      title: 'Busiest Transit Route',
      value: busiest_route?.id !== 'N/A' ? busiest_route?.id : 'None',
      subtext: busiest_route?.name || 'No route data',
      detail: `${Number(busiest_route?.passengers || 0).toLocaleString()} riders`,
      icon: Compass,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Highest Demand',
      badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
    },
    {
      title: 'Peak Traffic Window',
      value: peak_hour,
      subtext: `Avg ${avg_passengers_per_trip} pax / vehicle run`,
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Critical Congestion',
      badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
    },
    {
      title: 'Avg. Daily Growth',
      value: `${isGrowthPositive ? '+' : ''}${avg_daily_growth}%`,
      subtext: 'Day-over-day passenger velocity',
      icon: TrendingUp,
      iconColor: isGrowthPositive ? 'text-indigo-400' : 'text-rose-400',
      iconBg: isGrowthPositive ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20',
      growthIndicator: isGrowthPositive ? ArrowUpRight : ArrowDownRight,
      badge: isGrowthPositive ? 'Expanding' : 'Contracting',
      badgeColor: isGrowthPositive ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/30' : 'bg-rose-900/40 text-rose-300 border-rose-700/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const GrowthIcon = card.growthIndicator;
        return (
          <div
            key={idx}
            className="group relative bg-[#111827] border border-[#1F2937] hover:border-blue-500/40 rounded-xl p-5 md:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-lg border ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </h3>
              {GrowthIcon && (
                <GrowthIcon className={`w-5 h-5 ${isGrowthPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
              )}
            </div>

            <p className="text-xs text-gray-400 truncate mb-3">
              {card.subtext}
              {card.detail && (
                <span className="text-gray-300 font-medium"> • {card.detail}</span>
              )}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]/70">
              <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-400" />
                Live metrics
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
