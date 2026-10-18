"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Zap,
  ShieldCheck,
  Check,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Layers,
  Building2,
  Mail,
  Bell,
  Activity,
  Cpu,
  Server,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Radio,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { saveAlertWebhooksAction, testAlertWebhookAction } from "@/app/actions/alertActions";

interface BillingTabProps {
  plan: string;
  monthlyQuota: number;
  eventsCount: number;
  apiKey: string;
  discordWebhookUrl?: string;
  slackWebhookUrl?: string;
  onUpgradeToPro: () => void;
  onRefresh?: () => Promise<void>;
  isLoading: boolean;
}

export function BillingTab({
  plan,
  monthlyQuota,
  eventsCount,
  apiKey,
  discordWebhookUrl,
  slackWebhookUrl,
  onUpgradeToPro,
  onRefresh,
  isLoading,
}: BillingTabProps) {
  const toast = useToast();

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhook state
  const [discordUrl, setDiscordUrl] = useState(discordWebhookUrl || "");
  const [slackUrl, setSlackUrl] = useState(slackWebhookUrl || "");
  const [savingDiscord, setSavingDiscord] = useState(false);
  const [savingSlack, setSavingSlack] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);

  useEffect(() => {
    if (discordWebhookUrl !== undefined) setDiscordUrl(discordWebhookUrl);
  }, [discordWebhookUrl]);

  useEffect(() => {
    if (slackWebhookUrl !== undefined) setSlackUrl(slackWebhookUrl);
  }, [slackWebhookUrl]);

  const activeKey = apiKey || "pe_live_dev_8f7b2c9a1e3d4";
  const isPro = plan === "PRO";
  const maxQuota = monthlyQuota || (isPro ? 500000 : 10000);
  const consumed = eventsCount || 0;
  const remaining = Math.max(0, maxQuota - consumed);

  // Exact math: handles sub-0.1% without showing confusing 0% when events exist
  const rawQuotaPercent = (consumed / maxQuota) * 100;
  const displayQuotaPercent =
    consumed === 0
      ? "0%"
      : rawQuotaPercent < 0.1
      ? "< 0.1%"
      : rawQuotaPercent < 1
      ? `${rawQuotaPercent.toFixed(1)}%`
      : `${Math.min(100, Math.round(rawQuotaPercent))}%`;

  const visualBarWidth = consumed > 0 ? Math.max(3, Math.min(100, rawQuotaPercent)) : 0;

  function handleCopyKey() {
    navigator.clipboard.writeText(activeKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  // --- DISCORD HANDLERS ---
  async function handleSaveDiscord() {
    setSavingDiscord(true);
    try {
      const res = await saveAlertWebhooksAction({ discordWebhookUrl: discordUrl });
      if (res.success) {
        toast.success("Discord Webhook Saved", "Incident alerts will now stream to your Discord channel.");
        if (res.data?.discordWebhookUrl !== undefined) {
          setDiscordUrl(res.data.discordWebhookUrl || "");
        }
        await onRefresh?.();
      } else {
        toast.error("Save Failed", res.error?.message || "Invalid Discord Webhook URL.");
      }
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to save Discord webhook.");
    } finally {
      setSavingDiscord(false);
    }
  }

  async function handleTestDiscord() {
    if (!discordUrl && !discordWebhookUrl) {
      toast.warning("Webhook Required", "Please enter and save your Discord webhook URL first.");
      return;
    }
    setTestingDiscord(true);
    try {
      if (discordUrl !== discordWebhookUrl) {
        await saveAlertWebhooksAction({ discordWebhookUrl: discordUrl });
      }
      const res = await testAlertWebhookAction("discord");
      if (res.success) {
        toast.success("Test Alert Delivered!", "Check your Discord channel for the confirmation embed.");
      } else {
        toast.error("Discord Test Failed", res.error?.message || "Discord rejected the webhook.");
      }
    } catch (err: any) {
      toast.error("Test Failed", err.message || "Failed to send test ping.");
    } finally {
      setTestingDiscord(false);
    }
  }

  // --- SLACK HANDLERS ---
  async function handleSaveSlack() {
    if (!isPro) {
      toast.warning("PRO Exclusive", "Slack Block Kit alerting requires a PRO subscription.");
      return;
    }
    setSavingSlack(true);
    try {
      const res = await saveAlertWebhooksAction({ slackWebhookUrl: slackUrl });
      if (res.success) {
        toast.success("Slack Webhook Saved", "Interactive Block Kit alerts will stream to your Slack channel.");
        if (res.data?.slackWebhookUrl !== undefined) {
          setSlackUrl(res.data.slackWebhookUrl || "");
        }
        await onRefresh?.();
      } else {
        toast.error("Save Failed", res.error?.message || "Invalid Slack Webhook URL.");
      }
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to save Slack webhook.");
    } finally {
      setSavingSlack(false);
    }
  }

  async function handleTestSlack() {
    if (!isPro) {
      toast.warning("PRO Exclusive", "Upgrade to PRO to unlock Slack integration.");
      return;
    }
    if (!slackUrl && !slackWebhookUrl) {
      toast.warning("Webhook Required", "Please enter and save your Slack webhook URL first.");
      return;
    }
    setTestingSlack(true);
    try {
      if (slackUrl !== slackWebhookUrl) {
        await saveAlertWebhooksAction({ slackWebhookUrl: slackUrl });
      }
      const res = await testAlertWebhookAction("slack");
      if (res.success) {
        toast.success("Test Alert Delivered!", "Check your Slack channel for the Block Kit confirmation alert.");
      } else {
        toast.error("Slack Test Failed", res.error?.message || "Slack rejected the webhook.");
      }
    } catch (err: any) {
      toast.error("Test Failed", err.message || "Failed to send test ping.");
    } finally {
      setTestingSlack(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* 1. HEADER SECTION */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Subscription, Quotas & Integrations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization's subscription plan, real-time alert webhooks, and microservice API credentials.
        </p>
      </div>

      {/* 2. UNIFIED PLAN & USAGE HERO CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* LEFT: Current Plan Details & Action Buttons (5 Columns) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Tier
                </span>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1.5 ${
                    isPro
                      ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/60 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isPro ? "bg-indigo-500 animate-pulse" : "bg-slate-400"}`} />
                  {isPro ? "PRO Plan Active" : "FREE Starter Plan"}
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isPro ? "$49" : "$0"}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">/ month</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {isPro
                  ? "Enterprise-grade high-throughput ingestion buffer with unlimited Gemini AI SRE triage, Slack alerts, and Gmail notifications."
                  : "Standard developer sandbox for prototyping and small side-projects with 10k monthly event buffer."}
              </p>
            </div>

            {/* Plan Lifecycle Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap items-center gap-3">
              {!isPro ? (
                <button
                  onClick={onUpgradeToPro}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to PRO ($49/mo)
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <ShieldCheck className="h-4 w-4" />
                    Polar.sh Subscription Active
                  </div>
                  <a
                    href="https://sandbox.polar.sh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Manage Subscription</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Quota Progress & Consumption Breakdown (7 Columns) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monthly Telemetry Consumption
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {displayQuotaPercent} Used
                </span>
              </div>

              {/* Progress Bar with Gradient and Glow */}
              <div className="mt-5 space-y-2">
                <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${visualBarWidth}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>
                    <strong className="text-slate-900 dark:text-white font-bold">{consumed.toLocaleString()}</strong> events consumed
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white font-bold">{remaining.toLocaleString()}</strong> remaining
                  </span>
                </div>
              </div>

              {/* Key Entitlement Specifications */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Monthly Limit</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                    {maxQuota.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">buffer events</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Throughput</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                    {isPro ? "1,000" : "60"}
                  </span>
                  <span className="text-[10px] text-slate-400">req / minute burst</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">AI SRE Copilot</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                    {isPro ? "Unlimited" : "3 / mo"}
                  </span>
                  <span className="text-[10px] text-slate-400">Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Billing period: Monthly automated rollover</span>
              <span>Quota resets in 13 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-CHANNEL ALERTING INTEGRATIONS (DISCORD & SLACK WEBHOOKS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Incident Alert Channels (Discord & Slack)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure your team's incoming webhooks so PulseEngine delivers automated incident embeds directly to your channels.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span>Autonomous SRE Dispatcher</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DISCORD WEBHOOK INTEGRATION */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Discord Webhook</h4>
                    <span className="text-[10px] text-slate-400">Rich embeds with latency & status codes</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  Free & Pro
                </span>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 font-mono">
                  Discord Incoming Webhook URL
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/12345/abcdef..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Discord Channel Settings ➔ Integrations ➔ Webhooks ➔ Copy Webhook URL.
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={testingDiscord || savingDiscord}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {testingDiscord ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Send Test Ping</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDiscord}
                disabled={savingDiscord || testingDiscord}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {savingDiscord ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>Save Webhook</span>
              </button>
            </div>
          </div>

          {/* SLACK WEBHOOK INTEGRATION */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
            isPro
              ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              : "border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-950/20 opacity-90"
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Slack Webhook {!isPro && <Lock className="h-3 w-3 text-slate-400" />}
                    </h4>
                    <span className="text-[10px] text-slate-400">Interactive Block Kit cards & triage headers</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isPro
                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}>
                  PRO Feature
                </span>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 font-mono">
                  Slack Incoming Webhook URL
                </label>
                <input
                  type="url"
                  disabled={!isPro}
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  placeholder={isPro ? "https://hooks.slack.com/services/T00/B00/..." : "Upgrade to PRO to unlock Slack Block Kit alerts"}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-mono transition shadow-inner ${
                    isPro
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                      : "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isPro
                    ? "Slack App Incoming Webhooks ➔ Add New Webhook to Channel."
                    : "Slack Block Kit multi-channel dispatch is reserved for Professional SRE subscribers."}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
              {isPro ? (
                <>
                  <button
                    type="button"
                    onClick={handleTestSlack}
                    disabled={testingSlack || savingSlack}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                  >
                    {testingSlack ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Send Test Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSlack}
                    disabled={savingSlack || testingSlack}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {savingSlack ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Webhook</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onUpgradeToPro}
                  className="w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-100 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade to PRO to Unlock Slack Alerts
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PLATFORM CAPABILITIES GRID */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Included Platform Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">High-Speed Ingestion</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Upstash Redis buffer queue + batch worker delivering sub-5ms ingestion latency on /api/v1/ingest.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Gemini 3.8 Flash AI</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Automated Root-Cause Analysis, blast radius calculation, and 1-click executable CLI commands.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit">
              <Bell className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Multi-Channel Alerts</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Slack Block Kit interactive cards, Discord SRE embeds, and Gmail SMTP real-time notifications.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Enterprise Isolation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Multi-tenant cryptographic workspace segregation with dedicated API keys and 99.9% uptime.
            </p>
          </div>
        </div>
      </div>

      {/* 5. PRODUCTION INGESTION API KEYS MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Production Ingestion API Key
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Authorize incoming telemetry streams by passing this token in the <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-xs">x-api-key</code> header of your services.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 shadow-inner">
              <span className="tracking-wider">
                {showKey ? activeKey : "••••••••••••••••••••••••••••••••••••••••"}
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={handleCopyKey}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
