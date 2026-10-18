"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Filter,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "RESOLVED";
  aiDiagnosis: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface IncidentsTabProps {
  incidents: Incident[];
  onOpenDiagnosis: (incident: Incident) => void;
  onResolveIncident: (incidentId: string) => void;
  isLoading: boolean;
}

export function IncidentsTab({
  incidents,
  onOpenDiagnosis,
  onResolveIncident,
  isLoading,
}: IncidentsTabProps) {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === "OPEN") return inc.status === "OPEN";
    if (filter === "RESOLVED") return inc.status === "RESOLVED";
    return true;
  });

  const openCount = incidents.filter((i) => i.status === "OPEN").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Incident Commander</h2>
            {openCount > 0 && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                {openCount} ACTION REQUIRED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous anomaly detection, anti-spam deduplication, and Google Gemini 3.8 Flash SRE Root-Cause triage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">


          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "ALL"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            All ({incidents.length})
          </button>
          <button
            onClick={() => setFilter("OPEN")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "OPEN"
                ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "RESOLVED"
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Resolved ({incidents.length - openCount})
          </button>
          </div>
        </div>
      </div>

      {/* INCIDENTS LIST */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-8 space-y-4 transition-colors">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Incidents in this view</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              All production systems are operating smoothly within latency and error SLAs.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Autonomous SLA Monitoring Active • Alerts trigger automatically on 5xx errors</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const isCritical = incident.severity === "CRITICAL";
            const isOpen = incident.status === "OPEN";

            return (
              <div
                key={incident.id}
                className={`bg-white dark:bg-slate-900 border shadow-sm rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOpen
                    ? isCritical
                      ? "border-rose-200 dark:border-rose-900/60 hover:shadow-md"
                      : "border-amber-200 dark:border-amber-900/60 hover:shadow-md"
                    : "border-slate-200 dark:border-slate-800 opacity-80"
                }`}
              >
                {/* LEFT: Incident Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isCritical
                          ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      {incident.severity}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOpen
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60"
                      }`}
                    >
                      {incident.status}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {incident.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl line-clamp-1 font-mono">
                    {incident.description}
                  </p>
                </div>

                {/* RIGHT: Action Buttons */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {/* AI Diagnose Button */}
                  <button
                    onClick={() => onOpenDiagnosis(incident)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    {incident.aiDiagnosis ? "View AI Diagnosis" : "Diagnose with AI"}
                  </button>

                  {/* Resolve Button */}
                  {isOpen && (
                    <button
                      onClick={() => onResolveIncident(incident.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
