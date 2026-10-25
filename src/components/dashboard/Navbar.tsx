"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ExternalLink,
  LogOut,
  RefreshCw,
  Radio,
  User as UserIcon,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface NavbarProps {
  organization: {
    name: string;
    plan: "FREE" | "PRO";
    slug: string;
  } | null;
  user: {
    email: string;
    role: string;
  } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function Navbar({
  organization,
  user,
  activeTab,
  setActiveTab,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  onLogout,
}: NavbarProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "incidents", label: "Incidents" },
    { id: "stream", label: "Live Stream" },
    { id: "quickstart", label: "Quickstart SDK" },
    { id: "billing", label: "Billing & Integrations" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* LEFT: Logo & Tenant Organization Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2 group cursor-pointer text-left"
              title="PulseEngine Dashboard Overview"
            >
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white hidden sm:inline-block">
                PulseEngine
              </span>
            </button>
            <Link
              href="/"
              className="hidden lg:inline-flex p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              title="Visit Public Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

            {organization && (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[90px] sm:max-w-[140px] md:max-w-[180px] truncate">
                  {organization.name}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${
                    organization.plan === "PRO"
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {organization.plan}
                </span>
              </div>
            )}
          </div>

          {/* CENTER: Desktop Navigation Tabs (Unified & Non-redundant) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* RIGHT: Status Badges, Utilities & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Pipeline Status Badge */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
              title="Continuous streaming buffer active on /api/v1/ingest"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Pipeline Live</span>
            </div>

            {/* Live Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                autoRefresh
                  ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
              title="Toggle 5s Auto-refresh"
            >
              <Radio className={`w-3 h-3 ${autoRefresh ? "text-indigo-500 animate-pulse" : "text-slate-400"}`} />
              <span>{autoRefresh ? "Live 5s" : "Paused"}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => onRefresh()}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* User Profile Pill & Sign Out */}
            {user && (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                    {user.email}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => onLogout()}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION BAR (Horizontal Scrolling Glass Pill Bar) */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto gap-1 text-xs no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
