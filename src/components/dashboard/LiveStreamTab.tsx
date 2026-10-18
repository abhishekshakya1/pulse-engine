"use client";

import React, { useState } from "react";
import { Terminal, Search, Filter, RefreshCw, Radio } from "lucide-react";

interface TelemetryLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latency: number;
  timestamp: string;
  ip?: string;
}

interface LiveStreamTabProps {
  logs: TelemetryLog[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function LiveStreamTab({ logs, onRefresh, isLoading }: LiveStreamTabProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "2XX" | "4XX" | "5XX">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    // 1. Status Filter
    if (statusFilter === "2XX" && (log.statusCode < 200 || log.statusCode >= 300)) return false;
    if (statusFilter === "4XX" && (log.statusCode < 400 || log.statusCode >= 500)) return false;
    if (statusFilter === "5XX" && log.statusCode < 500) return false;

    // 2. Search Query (endpoint or method)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return log.endpoint.toLowerCase().includes(q) || log.method.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-4 transition-colors">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by endpoint (e.g. /checkout)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>

        {/* Status Filter Pills & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("2XX")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "2XX"
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              2xx Success
            </button>
            <button
              onClick={() => setStatusFilter("4XX")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "4XX"
                  ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              4xx Warn
            </button>
            <button
              onClick={() => setStatusFilter("5XX")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "5XX"
                  ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              5xx Error
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Refresh stream"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* TERMINAL LOG CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden font-mono text-xs transition-colors">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Live Telemetry Tail</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Streaming
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">Showing {filteredLogs.length} events</span>
        </div>

        {/* Log Stream Rows */}
        <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600 font-sans">
              No telemetry events match your filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const is2xx = log.statusCode >= 200 && log.statusCode < 300;
              const is4xx = log.statusCode >= 400 && log.statusCode < 500;
              const is5xx = log.statusCode >= 500;

              return (
                <div
                  key={log.id}
                  className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-4 text-[11px]"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Timestamp */}
                    <span className="text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Method */}
                    <span
                      className={`font-extrabold shrink-0 w-12 ${
                        log.method === "GET"
                          ? "text-blue-600 dark:text-blue-400"
                          : log.method === "POST"
                          ? "text-indigo-600 dark:text-purple-400"
                          : log.method === "DELETE"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {log.method}
                    </span>

                    {/* Endpoint */}
                    <span className="text-slate-800 dark:text-slate-200 truncate flex-1 font-semibold">
                      {log.endpoint}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Status Code Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        is2xx
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                          : is4xx
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                      }`}
                    >
                      {log.statusCode}
                    </span>

                    {/* Latency */}
                    <span
                      className={`w-16 text-right font-medium ${
                        log.latency < 200
                          ? "text-slate-500 dark:text-slate-400"
                          : log.latency < 1000
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-rose-600 dark:text-rose-400 font-bold"
                      }`}
                    >
                      {log.latency}ms
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
