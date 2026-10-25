"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { IncidentsTab } from "@/components/dashboard/IncidentsTab";
import { LiveStreamTab } from "@/components/dashboard/LiveStreamTab";
import { QuickstartTab } from "@/components/dashboard/QuickstartTab";
import { BillingTab } from "@/components/dashboard/billingTab";
import { AiDiagnosisModal } from "@/components/dashboard/AiDiagnosisModal";
import { useToast } from "@/components/ui/Toast";

import { getSessionAction, logoutAction } from "@/app/actions/authActions";
import {
  getDashboardBatchAction,
  flushTelemetryQueueAction,
} from "@/app/actions/telemetryActions";
import { resolveIncidentAction } from "@/app/actions/incidentActions";
import { diagnoseIncidentAction } from "@/app/actions/aiActions";
import {
  createCheckoutSessionAction,
  getBillingStatusAction,
  upgradeToProAction,
} from "@/app/actions/billingActions";

function DashboardContent() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["overview", "incidents", "stream", "quickstart", "billing"];

  const [activeTab, setActiveTabState] = useState(() => {
    return tabParam && validTabs.includes(tabParam) ? tabParam : "overview";
  });

  // Sync tab if URL changes (e.g. browser back/forward or landing page CTA)
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auth & Org State
  const [sessionUser, setSessionUser] = useState<{
    email: string;
    role: string;
  } | null>(null);

  const [organization, setOrganization] = useState<{
    id: string;
    name: string;
    plan: "FREE" | "PRO";
    slug: string;
    monthlyQuota: number;
    eventsCount: number;
    discordWebhookUrl?: string;
    slackWebhookUrl?: string;
  } | null>(null);

  const [apiKey, setApiKey] = useState<string>("pe_live_loading_key");

  // Telemetry & Incidents State
  const [stats, setStats] = useState({
    totalRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    activeIncidents: 0,
  });

  const [chartData, setChartData] = useState<Array<{ time: string; requests: number; latency: number }>>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  // AI Modal State
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 1. Initial Load & Auth Guard via Unified Batch Action
  const loadData = useCallback(async () => {
    try {
      const sessionRes = await getSessionAction();
      if (!sessionRes || !sessionRes.success || !sessionRes.data) {
        router.push("/login");
        return;
      }

      const session = sessionRes.data;
      setSessionUser({
        email: session.email,
        role: session.role || "ADMIN",
      });

      // Unified Parallel Batch Query (1 Single Network Roundtrip)
      const [batchRes, billingRes] = await Promise.all([
        getDashboardBatchAction(24),
        getBillingStatusAction(),
      ]);

      if (batchRes?.success && batchRes.data) {
        const { stats: s, chart: c, logs: l, incidents: inc } = batchRes.data;
        if (s) setStats(s);
        if (c && Array.isArray(c)) {
          setChartData(
            c.map((p: any) => ({
              time: p.time,
              requests: p.requests,
              latency: p.avgLatency ?? p.latency ?? 0,
            }))
          );
        }
        if (l && Array.isArray(l)) setRecentLogs(l);
        if (inc && Array.isArray(inc)) setIncidents(inc);
      }

      if (billingRes?.success && billingRes.data) {
        const orgData = (billingRes.data as any).data || billingRes.data;
        if (orgData) {
          setOrganization({
            id: orgData.id,
            name: orgData.name,
            plan: orgData.plan || "FREE",
            slug: orgData.slug || "org",
            monthlyQuota: orgData.monthlyQuota || 10000,
            eventsCount: orgData.eventsCount || 0,
            discordWebhookUrl: orgData.discordWebhookUrl || "",
            slackWebhookUrl: orgData.slackWebhookUrl || "",
          });
          if (orgData.apiKey) {
            setApiKey(orgData.apiKey);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const billingHandledRef = React.useRef(false);
  // Check for Polar checkout return (?billing=success)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("billing=success") &&
      !billingHandledRef.current
    ) {
      billingHandledRef.current = true;
      upgradeToProAction().then(() => {
        window.history.replaceState({}, "", "/dashboard");
        loadData();
      });
    }
  }, [loadData]);


  // 2. High-Performance Auto-Refresh (Single Request + Tab Visibility Pause)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      // Pause if browser tab is not active to prevent unnecessary queries
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const batchRes = await getDashboardBatchAction(24);
        if (batchRes?.success && batchRes.data) {
          const { stats: s, chart: c, logs: l, incidents: inc } = batchRes.data;
          if (s) setStats(s);
          if (c && Array.isArray(c)) {
            setChartData(
              c.map((p: any) => ({
                time: p.time,
                requests: p.requests,
                latency: p.avgLatency ?? p.latency ?? 0,
              }))
            );
          }
          if (l && Array.isArray(l)) setRecentLogs(l);
          if (inc && Array.isArray(inc)) setIncidents(inc);
        }
      } catch (err) {
        console.error("Background refresh error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handlers
  const handleLogout = async () => {
    toast.info("Signing Out", "Ending active session safely...");
    await logoutAction();
    router.push("/login?status=logged_out");
  };

  const handleOpenDiagnosis = (incident: any) => {
    setAiError(null);
    setSelectedIncident(incident);
    setAiModalOpen(true);
  };

  const handleDiagnose = async (incidentId: string) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await diagnoseIncidentAction(incidentId);
      if (res?.success && res.data) {
        const diagnosed = (res as any)?.data?.data || (res as any)?.data;
        if (diagnosed) {
          setSelectedIncident(diagnosed);
          setIncidents((prev) =>
            prev.map((i) => (i.id === incidentId ? diagnosed : i))
          );
        }
      } else {
        const rawError = (res as any)?.error;
        const errorMsg =
          typeof rawError === "object" && rawError !== null
            ? rawError.message || rawError.code || "Failed to generate AI diagnosis."
            : typeof rawError === "string"
            ? rawError
            : "Failed to generate AI diagnosis.";
        setAiError(errorMsg);
      }
    } catch (err: any) {
      console.error("AI diagnosis error:", err);
      setAiError(err?.message || "An unexpected error occurred during AI diagnosis.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolve = async (incidentId: string) => {
    try {
      const res = await resolveIncidentAction(incidentId);
      if (res?.success) {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId ? { ...i, status: "RESOLVED" as const, resolvedAt: new Date().toISOString() } : i
          )
        );
        if (selectedIncident?.id === incidentId) {
          setSelectedIncident((prev: any) => ({ ...prev, status: "RESOLVED" }));
        }
        toast.success("Incident Resolved", "Issue marked as resolved by on-call engineer.");
      } else {
        toast.error("Resolution Failed", res?.error?.message || "Failed to resolve incident.");
      }
    } catch (err) {
      console.error("Resolve incident error:", err);
      toast.error("Error", "Failed to resolve incident.");
    }
  };

  const handleUpgradeToPro = async () => {
    try {
      toast.info("Polar.sh Checkout", "Redirecting to hosted subscription checkout...");
      const res = await createCheckoutSessionAction();
      const checkoutData = (res as any)?.data?.data || (res as any)?.data;
      const checkoutUrl = checkoutData?.url || checkoutData?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error("Polar checkout trigger failed:", err);
      toast.error("Checkout Error", "Failed to initialize Polar checkout session.");
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">
            Connecting to PulseEngine Telemetry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        organization={organization}
        user={sessionUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onRefresh={loadData}
        onLogout={handleLogout}
      />

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            monthlyQuota={organization?.monthlyQuota || 10000}
            plan={organization?.plan || "FREE"}
            chartData={chartData}
            recentLogs={recentLogs}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "incidents" && (
          <IncidentsTab
            incidents={incidents}
            onOpenDiagnosis={handleOpenDiagnosis}
            onResolveIncident={handleResolve}
            isLoading={false}
          />
        )}

        {activeTab === "stream" && (
          <LiveStreamTab
            logs={recentLogs}
            onRefresh={loadData}
            isLoading={false}
          />
        )}

        {activeTab === "quickstart" && (
          <QuickstartTab
            apiKey={apiKey}
            isLoading={false}
          />
        )}

        {activeTab === "billing" && (
          <BillingTab
            plan={organization?.plan || "FREE"}
            monthlyQuota={organization?.monthlyQuota || 10000}
            eventsCount={organization?.eventsCount || 0}
            apiKey={apiKey}
            discordWebhookUrl={organization?.discordWebhookUrl}
            slackWebhookUrl={organization?.slackWebhookUrl}
            onUpgradeToPro={handleUpgradeToPro}
            onRefresh={loadData}
            isLoading={false}
          />
        )}
      </main>

      {/* Gemini 3.8 Flash AI RCA Modal */}
      <AiDiagnosisModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        incident={selectedIncident}
        onDiagnose={handleDiagnose}
        onResolve={handleResolve}
        isLoading={aiLoading}
        error={aiError}
        onUpgrade={() => {
          setAiModalOpen(false);
          setActiveTab("billing");
        }}
      />
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">
            Connecting to PulseEngine Telemetry...
          </span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
