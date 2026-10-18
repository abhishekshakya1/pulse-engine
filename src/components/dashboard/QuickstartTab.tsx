"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, Code2, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface QuickstartTabProps {
  apiKey: string;
  onSendTestEvent?: () => void;
  isLoading?: boolean;
}

export function QuickstartTab({ apiKey, onSendTestEvent, isLoading }: QuickstartTabProps) {
  const [selectedLang, setSelectedLang] = useState<"express" | "nextjs" | "python" | "curl">("express");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const activeKey = apiKey || "pe_live_dev_8f7b2c9a1e3d4";

  function handleCopyKey() {
    navigator.clipboard.writeText(activeKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  // SNIPPETS WITH EXACT PLACEMENT RULES FOR ALL TECH STACKS
  const snippets = {
    express: `// =========================================================================
// ⚡ PULSEENGINE TELEMETRY - EXPRESS.JS (Node.js)
// =========================================================================
// 👉 FILE: server.js or app.js
// 👉 PLACEMENT: Add AFTER 'express.json()' & 'cors()', but BEFORE your API routes!
// 👉 ZERO DEPENDENCIES: Uses native Node.js 18+ fetch. No npm install needed.

app.use((req, res, next) => {
  const start = Date.now();
  
  // Captures exact latency and final status code when response finishes
  res.on("finish", () => {
    // Non-blocking fire-and-forget ingestion (0ms impact on user response)
    fetch("${baseUrl}/api/v1/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "${activeKey}",
      },
      body: JSON.stringify({
        endpoint: (req.originalUrl || req.url || req.path).split("?")[0],
        method: req.method,
        statusCode: res.statusCode,
        latency: Date.now() - start,
      }),
    }).catch(() => {});
  });

  // Passes control to the next middleware or route handler (Mandatory in Express)
  next();
});`,

    nextjs: `// =========================================================================
// ⚡ PULSEENGINE TELEMETRY - NEXT.JS APP ROUTER
// =========================================================================
// 👉 FILE: src/middleware.ts (or root 'middleware.ts')
// 👉 PLACEMENT: Next.js automatically executes this on every incoming request.
// 👉 RUNTIME: Fully compatible with Edge Runtime & Node.js Server Runtime.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  // Async non-blocking telemetry stream to PulseEngine
  fetch("${baseUrl}/api/v1/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${activeKey}",
    },
    body: JSON.stringify({
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      latency: Date.now() - start,
    }),
  }).catch(() => {});

  return response;
}

// Config matcher: Exclude static assets (_next, favicon, images) from tracking
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`,

    python: `# =========================================================================
# ⚡ PULSEENGINE TELEMETRY - PYTHON (FastAPI & Starlette)
# =========================================================================
# 👉 FILE: main.py
# 👉 PLACEMENT: Add right after 'app = FastAPI()' and BEFORE any @app.get / @app.post routes!

import time
import requests
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def pulse_telemetry_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)

    # Fire-and-forget telemetry stream
    try:
        requests.post(
            "${baseUrl}/api/v1/ingest",
            headers={"x-api-key": "${activeKey}"},
            json={
                "endpoint": request.url.path,
                "method": request.method,
                "statusCode": response.status_code,
                "latency": duration_ms
            },
            timeout=0.1
        )
    except Exception:
        pass

    return response`,

    curl: `# =========================================================================
# ⚡ PULSEENGINE TELEMETRY - UNIVERSAL HTTP INGESTION (Any Language)
# =========================================================================
# 👉 Go (Golang), Java (Spring Boot), PHP (Laravel), C# (.NET), Rust, Ruby:
# Send an asynchronous HTTP POST request to /api/v1/ingest with your API key:

curl -X POST ${baseUrl}/api/v1/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeKey}" \\
  -d '{
    "endpoint": "/api/v1/checkout",
    "method": "POST",
    "statusCode": 200,
    "latency": 45
  }'`,
  };

  const currentSnippet = snippets[selectedLang];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* API KEY PREVIEW CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Your Ingestion API Key
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authenticate incoming telemetry streams with this secret key. Pre-filled in all code snippets below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <code className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            {activeKey}
          </code>
          <button
            onClick={handleCopyKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey ? "Copied!" : "Copy Key"}
          </button>
        </div>
      </div>

      {/* SNIPPETS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors">
        {/* Language Switcher Tabs */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            <button
              onClick={() => setSelectedLang("express")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLang === "express"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Express.js
            </button>
            <button
              onClick={() => setSelectedLang("nextjs")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLang === "nextjs"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Next.js
            </button>
            <button
              onClick={() => setSelectedLang("python")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLang === "python"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Python (FastAPI)
            </button>
            <button
              onClick={() => setSelectedLang("curl")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLang === "curl"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              cURL (Terminal)
            </button>
          </div>

          <button
            onClick={() => handleCopyCode(currentSnippet)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedCode ? "Copied Code!" : "Copy Snippet"}
          </button>
        </div>

        {/* Code Display Box */}
        <div className="p-6 bg-slate-950 overflow-x-auto text-slate-100">
          <pre className="font-mono text-xs leading-relaxed whitespace-pre text-slate-200">
            {currentSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
