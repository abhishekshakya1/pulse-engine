"use client";

import React from "react";
import {
  Activity,
  Zap,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface OverviewTabProps {
  stats: {
    totalRequests: number;
    avgLatency: number;
    errorRate: number;
    activeIncidents: number;
  };
  monthlyQuota: number;
  eventsCount?: number;
  plan: string;
  chartData: Array<{ time: string; requests: number; latency: number }>;
  recentLogs: Array<{
    id: string;
    method: string;
    endpoint: string;
    statusCode: number;
    latency: number;
    timestamp: string;
  }>;
  onNavigateTab: (tabId: string) => void;
}

export function OverviewTab({
  stats,
  monthlyQuota,
  eventsCount,
  plan,
  chartData,
  recentLogs,
  onNavigateTab,
}: OverviewTabProps) {
  const consumedEvents =
    eventsCount !== undefined && eventsCount > 0
      ? eventsCount
      : stats.totalRequests;
  const maxQuota = monthlyQuota || (plan === "PRO" ? 500000 : 10000);
  const rawQuotaPercent = (consumedEvents / maxQuota) * 100;

  const quotaDisplay =
    consumedEvents === 0
      ? "0%"
      : rawQuotaPercent < 0.1
      ? "< 0.1%"
      : rawQuotaPercent < 1
      ? `${rawQuotaPercent.toFixed(1)}%`
      : `${Math.min(100, Math.round(rawQuotaPercent))}%`;

  const progressBarWidth =
    consumedEvents > 0 ? Math.max(3, Math.min(100, rawQuotaPercent)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 4 GOLDEN SIGNALS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ingested Events */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {consumedEvents.toLocaleString()}
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {plan} Plan
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Quota: <strong className="text-slate-900 dark:text-white">{quotaDisplay}</strong></span>
                <span>{maxQuota >= 1000 ? `${(maxQuota / 1000).toLocaleString()}k` : maxQuota} max</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressBarWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{consumedEvents.toLocaleString()} consumed</span>
                <span>{Math.max(0, maxQuota - consumedEvents).toLocaleString()} remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Average Latency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Latency</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.avgLatency} <span className="text-base font-normal text-slate-500 dark:text-slate-400">ms</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  stats.avgLatency < 200
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    : stats.avgLatency < 500
                    ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                    : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                }`}
              >
                {stats.avgLatency < 200 ? "Optimal (<200ms)" : "Degraded"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Error Rate % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Error Rate</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.errorRate}%
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  stats.errorRate < 2
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                }`}
              >
                {stats.errorRate < 2 ? "Healthy SLA" : "SLA Violation"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Incidents */}
        <div
          onClick={() => onNavigateTab("incidents")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Incidents</span>
            <div
              className={`p-2 rounded-xl border ${
                stats.activeIncidents > 0
                  ? "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
              <span>{stats.activeIncidents}</span>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  stats.activeIncidents === 0
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                }`}
              >
                {stats.activeIncidents === 0 ? "All Systems Operational" : "Action Required"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECHARTS TIME-SERIES VISUAL ANALYTICS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Throughput & Latency Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time hourly telemetry distribution</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Requests
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Latency (ms)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#ffffff",
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldGrad)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#indigoGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. RECENT TELEMETRY LOG PREVIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Ingestion Events</h3>
          <button
            onClick={() => onNavigateTab("stream")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition"
          >
            Live Stream View <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[11px]">
                <th className="pb-3 pr-6 font-semibold uppercase">TIME</th>
                <th className="pb-3 pr-6 font-semibold uppercase">METHOD</th>
                <th className="pb-3 pr-6 font-semibold uppercase">ENDPOINT</th>
                <th className="pb-3 pr-6 font-semibold uppercase">STATUS</th>
                <th className="pb-3 font-semibold uppercase text-right">LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {recentLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 pr-6 text-slate-400 dark:text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 pr-6 font-bold text-slate-800 dark:text-slate-200">{log.method}</td>
                  <td className="py-3 pr-6 text-slate-700 dark:text-slate-300 font-semibold min-w-[160px]">{log.endpoint}</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.statusCode < 300
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                          : log.statusCode < 500
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium whitespace-nowrap">{log.latency}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
