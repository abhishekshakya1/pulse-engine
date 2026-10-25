"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Info,
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

interface AiDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onDiagnose: (incidentId: string) => void;
  onResolve: (incidentId: string) => void;
  isLoading: boolean;
  error?: string | null;
  onUpgrade?: () => void;
}

// Helper to format bold **text** in strings
function renderTextWithBold(text: string) {
  const parts = text.split(/(\s*\*\*.*?\*\*\s*)/g);
  return parts.map((part, i) => {
    const trimmed = part.trim();
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {trimmed.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function AiDiagnosisModal({
  isOpen,
  onClose,
  incident,
  onDiagnose,
  onResolve,
  isLoading,
  error,
  onUpgrade,
}: AiDiagnosisModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !incident) return null;

  // Extract bash command from diagnosis if present
  const bashMatch = incident.aiDiagnosis?.match(/\x60\x60\x60(?:bash|sh|sql)?\n([\s\S]*?)\x60\x60\x60/);
  const commandToCopy = bashMatch ? bashMatch[1].trim() : "";

  function handleCopy() {
    if (commandToCopy) {
      navigator.clipboard.writeText(commandToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const severityColor =
    incident.severity === "CRITICAL"
      ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60"
      : incident.severity === "HIGH"
      ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60"
      : "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60";

  // Parse structured sections
  const renderDiagnosisSections = (markdown: string) => {
    // Split by markdown headers
    const rawSections = markdown.split(/(?=### )/);

    return rawSections.map((section, sIdx) => {
      const lines = section.trim().split("\n");
      const firstLine = lines[0] || "";
      const isHeader = firstLine.startsWith("###");
      const title = isHeader ? firstLine.replace(/###/g, "").trim() : "";
      const bodyLines = isHeader ? lines.slice(1) : lines;

      // Check if this section contains code block
      const sectionText = bodyLines.join("\n");
      const codeMatch = sectionText.match(/\x60\x60\x60(?:bash|sh|sql)?\n([\s\S]*?)\x60\x60\x60/);
      const codeContent = codeMatch ? codeMatch[1].trim() : null;

      // Lines without code block
      const nonCodeLines = sectionText
        .replace(/\x60\x60\x60(?:bash|sh|sql)?[\s\S]*?\x60\x60\x60/g, "")
        .split("\n")
        .filter((l) => l.trim().length > 0);

      return (
        <div
          key={sIdx}
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          {title && (
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {title}
            </h4>
          )}

          {/* Render bullet points, steps, and paragraphs */}
          <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {nonCodeLines.map((line, lIdx) => {
              const trimmed = line.trim();

              // Bullet points
              if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                const bulletContent = trimmed.slice(2);
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1 py-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="flex-1">{renderTextWithBold(bulletContent)}</span>
                  </div>
                );
              }

              // Numbered steps
              const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (stepMatch) {
                const stepNum = stepMatch[1];
                const stepText = stepMatch[2];
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-3 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 my-1"
                  >
                    <span className="flex items-center justify-center h-5 w-5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-800">
                      {stepNum}
                    </span>
                    <span className="flex-1 text-slate-800 dark:text-slate-200">
                      {renderTextWithBold(stepText)}
                    </span>
                  </div>
                );
              }

              // Normal text
              return <p key={lIdx}>{renderTextWithBold(trimmed)}</p>;
            })}
          </div>

          {/* Render Code Block if present */}
          {codeContent && (
            <div className="relative mt-3 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2 mb-2 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <Terminal className="h-3.5 w-3.5" /> Actionable CLI Remediation
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-emerald-400 whitespace-pre overflow-x-auto py-1 font-mono selection:bg-emerald-950 selection:text-white">
                {codeContent}
              </pre>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${severityColor}`}>
                  {incident.severity}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    incident.status === "OPEN"
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60"
                  }`}
                >
                  {incident.status}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {new Date(incident.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {incident.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
          {/* Incident Overview Card */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs flex items-start gap-2.5">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block text-[10px] mb-0.5">
                Telemetry Signature
              </span>
              <p className="text-slate-700 dark:text-slate-300">{incident.description}</p>
            </div>
          </div>

          {/* QUOTA ERROR BANNER (403 Free Tier Limit) */}
          {error && (
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/70 dark:to-amber-950/70 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <span>Free Tier Limit Reached</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                {typeof error === "object" && error !== null ? (error as any).message || JSON.stringify(error) : error}
              </p>
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade to PRO ($49/mo) for Unlimited Diagnoses →
                </button>
              )}
            </div>
          )}

          {/* AI DIAGNOSIS SECTION */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                Google Gemini 3.8 Flash is analyzing telemetry traces...
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Correlating status codes, baseline latencies, and blast radius.
              </p>
            </div>
          ) : incident.aiDiagnosis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Gemini Autonomous SRE Diagnosis
                </span>
                {commandToCopy && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied Command!" : "Copy Fix Command"}
                  </button>
                )}
              </div>

              {/* Structured Section Cards */}
              <div className="space-y-4">
                {renderDiagnosisSections(incident.aiDiagnosis)}
              </div>
            </div>
          ) : !error ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <ShieldAlert className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                No AI Diagnosis generated for this incident yet.
              </p>
              <button
                onClick={() => onDiagnose(incident.id)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Diagnose with Gemini 3.8 Flash
              </button>
            </div>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            {!incident.aiDiagnosis && !error && (
              <button
                onClick={() => onDiagnose(incident.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isLoading ? "Analyzing..." : "Run AI Diagnosis"}
              </button>
            )}

            {incident.status === "OPEN" && (
              <button
                onClick={() => {
                  onResolve(incident.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
