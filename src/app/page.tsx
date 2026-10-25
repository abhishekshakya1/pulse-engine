"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Menu,
  X,
  ShieldAlert,
  BrainCircuit,
  Zap,
  BarChart3,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Flame,
  Clock,
  CheckCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Loader2,
  Cpu,
  Layers,
  Server,
  Lock
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
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getSessionAction } from "@/app/actions/authActions";
import { diagnoseDemoIncidentAction } from "@/app/actions/aiActions";

interface DemoLog {
  id: string;
  time: string;
  method: string;
  route: string;
  status: number;
  latency: number;
  message: string;
}

function getLiveTimeSlots(): string[] {
  const now = new Date();
  const slots: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 5 * 60 * 1000);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
  }
  return slots;
}

function getLiveLogTime(secondsAgo: number): string {
  const d = new Date(Date.now() - secondsAgo * 1000);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function generateDemoChart(status: "HEALTHY" | "CRITICAL" | "DEGRADED", times: string[]) {
  if (status === "HEALTHY") {
    return [
      { time: times[0], requests: 120, latency: 45 },
      { time: times[1], requests: 145, latency: 48 },
      { time: times[2], requests: 190, latency: 52 },
      { time: times[3], requests: 210, latency: 46 },
      { time: times[4], requests: 240, latency: 50 },
      { time: times[5], requests: 310, latency: 49 },
      { time: times[6], requests: 290, latency: 51 },
    ];
  } else if (status === "CRITICAL") {
    return [
      { time: times[0], requests: 120, latency: 45 },
      { time: times[1], requests: 145, latency: 48 },
      { time: times[2], requests: 210, latency: 52 },
      { time: times[3], requests: 480, latency: 310 },
      { time: times[4], requests: 920, latency: 1240 },
      { time: times[5], requests: 1450, latency: 2890 },
      { time: times[6], requests: 1680, latency: 3450 },
    ];
  } else {
    return [
      { time: times[0], requests: 120, latency: 45 },
      { time: times[1], requests: 140, latency: 50 },
      { time: times[2], requests: 160, latency: 120 },
      { time: times[3], requests: 180, latency: 450 },
      { time: times[4], requests: 210, latency: 980 },
      { time: times[5], requests: 240, latency: 1850 },
      { time: times[6], requests: 230, latency: 2200 },
    ];
  }
}

function generateDemoLogs(status: "HEALTHY" | "CRITICAL" | "DEGRADED"): DemoLog[] {
  if (status === "HEALTHY") {
    return [
      { id: "1", time: getLiveLogTime(40), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 42, message: "transaction_authorized" },
      { id: "2", time: getLiveLogTime(32), method: "GET", route: "/api/v1/products/featured", status: 200, latency: 28, message: "cache_hit_edge" },
      { id: "3", time: getLiveLogTime(24), method: "POST", route: "/api/v1/auth/session", status: 200, latency: 35, message: "jwt_signed_valid" },
      { id: "4", time: getLiveLogTime(14), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 48, message: "stripe_charge_ok" },
      { id: "5", time: getLiveLogTime(5), method: "GET", route: "/api/v1/health", status: 200, latency: 12, message: "all_workers_healthy" },
    ];
  } else if (status === "CRITICAL") {
    return [
      { id: "c1", time: getLiveLogTime(45), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 45, message: "authorized" },
      { id: "c2", time: getLiveLogTime(30), method: "POST", route: "/api/v1/checkout/pay", status: 500, latency: 1240, message: "DB_CONN_TIMEOUT" },
      { id: "c3", time: getLiveLogTime(20), method: "POST", route: "/api/v1/checkout/pay", status: 500, latency: 2890, message: "FATAL: pool exhausted (max 100)" },
      { id: "c4", time: getLiveLogTime(10), method: "POST", route: "/api/v1/checkout/pay", status: 500, latency: 3450, message: "CIRCUIT_BREAKER_TRIGGERED" },
      { id: "c5", time: getLiveLogTime(2), method: "GET", route: "/api/v1/health", status: 503, latency: 980, message: "unhealthy: downstream db" },
    ];
  } else {
    return [
      { id: "s1", time: getLiveLogTime(40), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 120, message: "gateway_slow_ack" },
      { id: "s2", time: getLiveLogTime(30), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 980, message: "tls_handshake_wait" },
      { id: "s3", time: getLiveLogTime(20), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 2450, message: "upstream_queue_contention" },
      { id: "s4", time: getLiveLogTime(12), method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 3240, message: "P99_THRESHOLD_EXCEEDED" },
      { id: "s5", time: getLiveLogTime(3), method: "POST", route: "/api/v1/checkout/pay", status: 504, latency: 4000, message: "GATEWAY_TIMEOUT" },
    ];
  }
}

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://engine-lovat-beta.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);
  const [session, setSession] = useState<any>(null);

  // Demo Sandbox Interactive State
  const [demoStatus, setDemoStatus] = useState<"HEALTHY" | "CRITICAL" | "DEGRADED">("HEALTHY");
  const [demoLogs, setDemoLogs] = useState<DemoLog[]>([
    { id: "1", time: "12:00:00", method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 42, message: "transaction_authorized" },
    { id: "2", time: "12:00:08", method: "GET", route: "/api/v1/products/featured", status: 200, latency: 28, message: "cache_hit_edge" },
    { id: "3", time: "12:00:15", method: "POST", route: "/api/v1/auth/session", status: 200, latency: 35, message: "jwt_signed_valid" },
    { id: "4", time: "12:00:22", method: "POST", route: "/api/v1/checkout/pay", status: 200, latency: 48, message: "stripe_charge_ok" },
    { id: "5", time: "12:00:30", method: "GET", route: "/api/v1/health", status: 200, latency: 12, message: "all_workers_healthy" },
  ]);
  const [demoCopiedCmd, setDemoCopiedCmd] = useState(false);
  const [aiDiagnosing, setAiDiagnosing] = useState(false);
  const [aiDiagnosed, setAiDiagnosed] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    rca: string;
    blastRadius: string;
    confidence: number;
    remediationCmd: string;
    provider: string;
  } | null>(null);

  const [demoChartData, setDemoChartData] = useState<Array<{ time: string; requests: number; latency: number }>>([
    { time: "12:00", requests: 120, latency: 45 },
    { time: "12:05", requests: 145, latency: 48 },
    { time: "12:10", requests: 190, latency: 52 },
    { time: "12:15", requests: 210, latency: 46 },
    { time: "12:20", requests: 240, latency: 50 },
    { time: "12:25", requests: 310, latency: 49 },
    { time: "12:30", requests: 290, latency: 51 },
  ]);

  // Client-side hydration sync for live local time
  useEffect(() => {
    const times = getLiveTimeSlots();
    setDemoChartData(generateDemoChart("HEALTHY", times));
    setDemoLogs(generateDemoLogs("HEALTHY"));
  }, []);

  useEffect(() => {
    getSessionAction()
      .then((res) => {
        if (res?.success && res.data) {
          setSession(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const copyQuickstart = () => {
    navigator.clipboard.writeText(`curl -X POST ${baseUrl}/api/v1/ingest \\
  -H "x-api-key: pe_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint":"/api/v1/checkout","method":"POST","statusCode":200,"latency":42}'`);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const copyDemoCommand = (cmdText: string) => {
    navigator.clipboard.writeText(cmdText);
    setDemoCopiedCmd(true);
    setTimeout(() => setDemoCopiedCmd(false), 2000);
  };

  const triggerDemoHealthy = () => {
    const times = getLiveTimeSlots();
    setDemoStatus("HEALTHY");
    setDemoLogs(generateDemoLogs("HEALTHY"));
    setAiDiagnosed(false);
    setAiDiagnosis(null);
    setDemoChartData(generateDemoChart("HEALTHY", times));
  };

  const triggerDemo500Crash = () => {
    const times = getLiveTimeSlots();
    setDemoStatus("CRITICAL");
    setDemoLogs(generateDemoLogs("CRITICAL"));
    setAiDiagnosed(false);
    setAiDiagnosis(null);
    setDemoChartData(generateDemoChart("CRITICAL", times));
  };

  const triggerDemoLatencySpike = () => {
    const times = getLiveTimeSlots();
    setDemoStatus("DEGRADED");
    setDemoLogs(generateDemoLogs("DEGRADED"));
    setAiDiagnosed(false);
    setAiDiagnosis(null);
    setDemoChartData(generateDemoChart("DEGRADED", times));
  };

  const handleRunAiDiagnosis = async () => {
    setAiDiagnosing(true);
    try {
      const scenario = demoStatus === "CRITICAL" ? "CRITICAL_500" : "LATENCY_SPIKE";
      const res = await diagnoseDemoIncidentAction({
        scenario,
        logs: demoLogs,
      });

      if (res?.success && res.data) {
        setAiDiagnosis(res.data);
        setAiDiagnosed(true);
      }
    } catch (err) {
      console.error("AI Demo Diagnosis error:", err);
    } finally {
      setAiDiagnosing(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  PulseEngine
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  AI SRE
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Architecture
            </a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              Live Demo
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5" />}
            </button>

            {(session?.userId || session?.email) ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {session.organizationName || session.email}
                </span>
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
              {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
              >
                <span>Features</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
              >
                <span>Architecture</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition text-indigo-600 dark:text-indigo-400"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Live Demo Sandbox
                </span>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
              >
                <span>Pricing</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              {(session?.userId || session?.email) ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-md shadow-indigo-600/25 transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 dark:bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Powered by Google Gemini 3.8 Flash & Redis High-Throughput Queue</span>
            <ChevronRight className="w-3 h-3 text-indigo-400" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6 text-slate-900 dark:text-white">
            Autonomous{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              AI SRE Copilot
            </span>{" "}
            & Telemetry Streaming
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Ingest distributed traces, logs, and metrics with <span className="font-semibold text-slate-900 dark:text-white">&lt;3ms latency</span> via Upstash Redis. Detect anomalies autonomously, dispatch Discord/Slack alerts, and let Gemini 3.8 Flash write root cause triage and remediation commands in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={(session?.userId || session?.email) ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {(session?.userId || session?.email) ? "Open Live Dashboard" : "Start Monitoring Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-base border border-slate-200 dark:border-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Try Live Interactive Demo
            </a>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-800 overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">quickstart-ingestion.sh - 3-Line Drop-in SDK</span>
              </div>
              <button
                onClick={copyQuickstart}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-slate-950/90">
              <div className="text-slate-500"># Send telemetry from Express, Next.js, Python, or Go microservices</div>
              <div className="text-cyan-400 font-semibold mt-1">
                curl -X POST {baseUrl}/api/v1/ingest \\
              </div>
              <div className="text-slate-300 pl-4">
                -H <span className="text-emerald-400">&quot;x-api-key: pe_live_your_api_key_here&quot;</span> \\
              </div>
              <div className="text-slate-300 pl-4">
                -H <span className="text-emerald-400">&quot;Content-Type: application/json&quot;</span> \\
              </div>
              <div className="text-slate-300 pl-4">
                -d <span className="text-amber-300">&apos;&#123;&quot;endpoint&quot;:&quot;/api/v1/checkout&quot;,&quot;method&quot;:&quot;POST&quot;,&quot;statusCode&quot;:200,&quot;latency&quot;:42&#125;&apos;</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-400 font-bold">200 OK</span> (Queue Ingestion: 2.14ms)
                </span>
                <span className="text-slate-400">Buffer: Upstash Redis LPUSH / Worker Batch Neon DB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE DEMO SANDBOX (WITH RECHARTS, LIVE LOGS & GEMINI 3.8 FLASH) */}
      <section id="demo" className="py-20 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive SRE Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Test Autonomous SRE Diagnosis in Real-Time
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              Simulate real-world traffic anomalies below. Watch live charts update, stream telemetry logs, and click to trigger Gemini 3.8 Flash for autonomous root-cause analysis.
            </p>

            {/* Scenario Triggers */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={triggerDemoHealthy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  demoStatus === "HEALTHY"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Normal Baseline Traffic (200 OK)
              </button>

              <button
                onClick={triggerDemo500Crash}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  demoStatus === "CRITICAL"
                    ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30"
                    : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                }`}
              >
                <Flame className="w-4 h-4" />
                Simulate 500 Outage (Critical)
              </button>

              <button
                onClick={triggerDemoLatencySpike}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  demoStatus === "DEGRADED"
                    ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/30"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                }`}
              >
                <Clock className="w-4 h-4" />
                Simulate Latency Spike (3.2s)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT COLUMN: LIVE CHART + LIVE SRE TERMINAL LOGS */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Recharts Live Curve */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      Live Throughput & Latency Curve
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Interactive simulated telemetry stream</p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      demoStatus === "HEALTHY"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : demoStatus === "DEGRADED"
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse"
                    }`}
                  >
                    {demoStatus}
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="demoEmerald" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={demoStatus === "CRITICAL" ? "#F43F5E" : demoStatus === "DEGRADED" ? "#F59E0B" : "#10B981"} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={demoStatus === "CRITICAL" ? "#F43F5E" : demoStatus === "DEGRADED" ? "#F59E0B" : "#10B981"} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#090d16", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#ffffff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke={demoStatus === "CRITICAL" ? "#F43F5E" : demoStatus === "DEGRADED" ? "#F59E0B" : "#10B981"}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#demoEmerald)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 font-mono text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Target: <strong className="text-slate-800 dark:text-slate-200">/api/v1/checkout/pay</strong></span>
                  <span>P99 Latency: <strong className="text-slate-800 dark:text-slate-200">{demoChartData[demoChartData.length - 1]?.latency ?? 45}ms</strong></span>
                </div>
              </div>

              {/* Card 2: Live SRE Terminal Log Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg text-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      edge-node-01:/var/log/telemetry.stream
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Live Buffer (5 events)
                  </span>
                </div>

                <div className="font-mono text-xs space-y-2 overflow-x-auto max-h-48 scrollbar-thin">
                  {demoLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 px-2 rounded transition-colors">
                      <div className="flex items-center gap-2">
                        <span suppressHydrationWarning className="text-slate-500 text-[11px]">[{log.time}]</span>
                        <span className="font-bold text-cyan-400">{log.method}</span>
                        <span className="text-slate-300">{log.route}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            log.status >= 500
                              ? "bg-rose-950 text-rose-400 border border-rose-800"
                              : log.status >= 400
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-slate-400 text-[11px]">{log.latency}ms</span>
                        <span className="text-slate-500 text-[10px] hidden sm:inline">({log.message})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GEMINI 3.8 FLASH AUTONOMOUS SRE COPILOT */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gemini 3.8 Flash AI SRE</h4>
                      <p className="text-[11px] text-slate-500">Autonomous Root Cause Analysis</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Live Copilot
                  </span>
                </div>

                {demoStatus === "HEALTHY" ? (
                  <div className="py-14 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">All Systems Operational</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Telemetry latency &lt;50ms. Zero anomalies detected. Click &quot;Simulate 500 Outage&quot; or &quot;Latency Spike&quot; above to test autonomous AI triage!
                    </p>
                  </div>
                ) : !aiDiagnosed && !aiDiagnosing ? (
                  /* ANOMALY DETECTED: INTERACTIVE DIAGNOSE CTA */
                  <div className="py-10 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                      Anomaly Detected: Incident #PE-9402
                    </div>

                    <h5 className="text-base font-bold text-slate-900 dark:text-white">
                      {demoStatus === "CRITICAL"
                        ? "Critical Outage: 5xx Error Spike on /checkout"
                        : "Degraded SLA: P99 Latency Threshold Exceeded"}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Unusual pattern detected across streaming telemetry buffer. Run Gemini 3.8 Flash to analyze logs and suggest a verified patch.
                    </p>

                    <button
                      onClick={handleRunAiDiagnosis}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      ⚡ Diagnose Incident with Gemini 3.8 Flash
                    </button>
                  </div>
                ) : aiDiagnosing ? (
                  /* LIVE SCANNER / DIAGNOSING EFFECT */
                  <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-md">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        Gemini 3.8 Flash Analyzing Telemetry...
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                        Correlating 50+ telemetry events, stack traces & connection pool saturation...
                      </p>
                    </div>
                  </div>
                ) : (
                  /* GEMINI 3.8 FLASH REAL AI RCA RESULT */
                  <div className="space-y-3.5 text-xs animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {aiDiagnosis?.provider || "Gemini 3.8 Flash AI Copilot"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {aiDiagnosis?.confidence || 98}% Confidence
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300">
                      <strong>Root Cause (RCA):</strong> {aiDiagnosis?.rca}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Blast Radius & Impact:</div>
                      <div>{aiDiagnosis?.blastRadius}</div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        <span>Actionable Remediation Command:</span>
                        <button
                          onClick={() => copyDemoCommand(aiDiagnosis?.remediationCmd || "kubectl rollout undo deployment/checkout-api")}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          {demoCopiedCmd ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {demoCopiedCmd ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                        <code>{aiDiagnosis?.remediationCmd}</code>
                      </div>
                    </div>

                    <button
                      onClick={handleRunAiDiagnosis}
                      className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 pt-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Re-run AI Analysis
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Ready to monitor your stack?</span>
                <Link
                  href={(session?.userId || session?.email) ? "/dashboard" : "/register"}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {(session?.userId || session?.email) ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES GRID */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
              Engineered for Production Scale
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything engineering teams need to monitor, triage, and resolve incidents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                High-Throughput Redis Queue
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Buffered LPUSH/RPOP pipeline with batch processing to prevent Neon PostgreSQL connection saturation under spiky loads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                4 Golden Signals Dashboard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track Latency, Traffic, Error Rates, and Saturation with Recharts interactive visual graphs and 5-second live telemetry refresh.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Gemini 3.8 Flash AI SRE
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Autonomous root-cause analysis correlated with stack traces and telemetry history. Generates ready-to-execute kubectl and shell commands.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Multi-Channel Alerts
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero-drop incident alerts dispatched to Discord, Slack webhooks, and automated email notifications with deduplication and severity routing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURE DIAGRAM SECTION */}
      <section id="architecture" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
              Resilient Edge-to-Core Architecture
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How PulseEngine processes 100k+ events/sec without breaking Neon DB connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-mono text-indigo-500 font-bold mb-1">STEP 01</div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Edge Ingest API</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lightweight HTTP POST endpoint with API Key authentication & Upstash Redis token bucket rate limiting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-mono text-indigo-500 font-bold mb-1">STEP 02</div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Redis Buffer Queue</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Events pushed into high-throughput queue via LPUSH, decoupling high incoming writes from database disk I/O.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-mono text-indigo-500 font-bold mb-1">STEP 03</div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Async Batch Worker</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daemon worker consumes batches of 500 events and executes efficient single Prisma bulk inserts into Neon PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-mono text-indigo-500 font-bold mb-1">STEP 04</div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Copilot & Alerts</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anomaly detectors trigger Google Gemini 3.8 Flash for instant root cause triage and dispatch alerts to Discord/Slack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
              Simple, Predictable Pricing
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Start free, upgrade as your infrastructure scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE TIER */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Free Starter</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-sm font-semibold text-slate-500">/ forever</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Perfect for side projects and individual developers.</p>

                <ul className="mt-8 space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 10,000 Ingested Events / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 3 AI SRE Root-Cause Diagnoses / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 24-Hour Telemetry Retention
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> Discord & Slack Webhook Alerts
                  </li>
                </ul>
              </div>

              <Link
                href={(session?.userId || session?.email) ? "/dashboard" : "/register"}
                className="mt-8 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs text-center border border-slate-200 dark:border-slate-700 transition"
              >
                {(session?.userId || session?.email) ? "Go to Dashboard" : "Get Started Free"}
              </Link>
            </div>

            {/* PRO TIER */}
            <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 relative flex flex-col justify-between">
              <div className="absolute top-4 right-4 text-[10px] uppercase font-extrabold tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-indigo-200 tracking-wider">Production Pro</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$49</span>
                  <span className="text-sm font-semibold text-indigo-200">/ month</span>
                </div>
                <p className="text-xs text-indigo-100 mt-2">For high-traffic platforms and engineering teams.</p>

                <ul className="mt-8 space-y-3 text-xs font-medium text-white/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300" /> 1,000,000 Ingested Events / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300" /> Unlimited 24/7 Gemini 3.8 Flash AI SRE
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300" /> 30-Day Long-term Telemetry Retention
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300" /> Instant Multi-Channel Alerts & Custom SLA
                  </li>
                </ul>
              </div>

              <Link
                href={(session?.userId || session?.email) ? "/dashboard?tab=billing" : "/register"}
                className="mt-8 w-full py-3 rounded-xl bg-white text-indigo-600 hover:bg-slate-100 font-bold text-xs text-center shadow-lg transition"
              >
                Upgrade to Pro (Polar.sh)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900 dark:text-white">PulseEngine</span>
            <span>&copy; {new Date().getFullYear()} PulseEngine Inc. Production Observability.</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-slate-900 dark:hover:text-white transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Live Demo</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
