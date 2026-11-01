# ⚡ PulseEngine

<div align="center">

  **Enterprise-Grade B2B Multi-Tenant Observability, Telemetry Streaming & Autonomous AI SRE Copilot Platform**  
  *Inspired by Datadog, Sentry, and Better Stack — Engineered with Next.js 16 (Turbopack), Upstash Redis, Neon Serverless PostgreSQL, and Google Gemini AI.*

  <br />

  [![Live Demo on Vercel](https://img.shields.io/badge/Live_Demo-Vercel_Edge-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://engine-lovat-beta.vercel.app)
  [![Cloud Container on Render](https://img.shields.io/badge/Docker_Container-Render_Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://pulseengine-docker.onrender.com)
  [![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abhishekshakya1/engine)

  <br />

  ![Next.js 16](https://img.shields.io/badge/Next.js_16-App_Router-black?style=flat-square&logo=next.js)
  ![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)
  ![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-00E599?style=flat-square&logo=postgresql&logoColor=black)
  ![Upstash Redis](https://img.shields.io/badge/Redis-Upstash_Serverless-DC382D?style=flat-square&logo=redis&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/AI_Copilot-Gemini_3.8_Flash-8E75C2?style=flat-square&logo=google&logoColor=white)
  ![Prisma 6](https://img.shields.io/badge/ORM-Prisma_6.19-2D3748?style=flat-square&logo=prisma)
  ![Polar.sh](https://img.shields.io/badge/Billing-Polar.sh_SaaS-0052FF?style=flat-square)
  ![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Alpine-2496ED?style=flat-square&logo=docker&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## 📑 Table of Contents

- [🌟 Executive Overview](#-executive-overview)
- [🌐 Live Deployment Links](#-live-deployment-links)
- [🏗️ High-Level System Architecture](#️-high-level-system-architecture)
- [✨ Core Capabilities & Features](#-core-capabilities--features)
- [🖥️ Interactive Platform Showcase](#️-interactive-platform-showcase)
- [🛠️ 30-Second Quickstart SDK Integration](#️-30-second-quickstart-sdk-integration)
- [📂 Full Project Directory Structure](#-full-project-directory-structure)
- [🔌 REST API & Ingestion Specification](#-rest-api--ingestion-specification)
- [⚙️ Environment Variables Reference](#️-environment-variables-reference)
- [🐳 Dual-Cloud & Docker Deployment](#-dual-cloud--docker-deployment)
- [📦 Technology Stack Matrix](#-technology-stack-matrix)
- [🚀 Local Development Setup](#-local-development-setup)
- [🛡️ Security, Reliability & Compliance](#️-security-reliability--compliance)
- [📄 License & Author](#-license--author)

---

## 🌟 Executive Overview

**PulseEngine** is an autonomous, cloud-native Site Reliability Engineering (SRE) and distributed observability platform built for modern microservice architectures, high-throughput APIs, and mission-critical cloud backends.

Traditional APMs (Application Performance Monitoring) introduce notable runtime latency overhead, complex vendor lock-ins, and overwhelming alerts. PulseEngine solves this through a **three-tier decoupled architecture**:

1. **0ms Client Impact**: Non-blocking asynchronous telemetry middleware captures exact latencies after response completion (`res.on("finish")`).
2. **Sub-3ms Redis Ingestion Buffer**: Edge requests are acknowledged with `202 Accepted` in `<3ms` via Upstash Redis pipelines, shielding primary transactional databases from I/O spikes.
3. **Autonomous AI SRE Copilot (Google Gemini 3.8 Flash)**: Anomaly detectors automatically identify 5xx error storms, calculate blast radius, run instant Root-Cause Analysis (RCA), and generate copy-pasteable terminal remediation commands.

---

## 🌐 Live Deployment Links

| Deployment Channel | Hosting Provider | Architecture | Live URL |
| :--- | :--- | :--- | :--- |
| **Primary Production** | **Vercel Edge** | Serverless Next.js 16 App Router | [https://engine-lovat-beta.vercel.app](https://engine-lovat-beta.vercel.app) |
| **Containerized Cloud** | **Render.com** | Dedicated Alpine Linux Container | [https://pulseengine-docker.onrender.com](https://pulseengine-docker.onrender.com) |
| **Source Code** | **GitHub** | Git Version Control (`main` branch) | [https://github.com/abhishekshakya1/engine](https://github.com/abhishekshakya1/engine) |

---

## 🏗️ High-Level System Architecture

```
                                  [ Client Microservices ]
                   (Express.js / Next.js / Python FastAPI / Go / Java)
                                             │
                        Non-blocking Asynchronous POST Telemetry
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │     PulseEngine Ingestion Gateway   │
                          │        (/api/v1/ingest - 202)       │
                          └──────────────────┬──────────────────┘
                                             │
                        Push to In-Memory Buffer in < 3ms
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │   Upstash Serverless Redis Queue    │
                          │       (Rate Limiter + Buffer)       │
                          └──────────────────┬──────────────────┘
                                             │
                        High-Speed Bulk Micro-Batch Drain (SQL)
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │     Neon Serverless PostgreSQL      │
                          │   (Multi-Tenant Relational Store)   │
                          └──────────────────┬──────────────────┘
                                             │
                  ┌──────────────────────────┴──────────────────────────┐
                  │                                                     │
                  ▼                                                     ▼
    ┌───────────────────────────┐                         ┌───────────────────────────┐
    │    Real-Time Dashboard    │                         │  Autonomous SRE Incident  │
    │  - 4 Golden Signals       │                         │         Detector          │
    │  - Time-series Recharts   │                         └─────────────┬─────────────┘
    │  - Live Telemetry Stream  │                                       │
    └───────────────────────────┘                     Status >= 500 or Latency > 1500ms
                                                                        │
                                                      ┌─────────────────┴─────────────────┐
                                                      │                                   │
                                                      ▼                                   ▼
                                        ┌───────────────────────────┐       ┌───────────────────────────┐
                                        │  Google Gemini AI Copilot │       │   Multi-Channel Alerts    │
                                        │  - Root-Cause Analysis    │       │  - Discord Rich Embeds    │
                                        │  - 1-Click CLI Hotfix     │       │  - Slack Block Kit (Pro)  │
                                        └───────────────────────────┘       └───────────────────────────┘
```

---

## ✨ Core Capabilities & Features

### ⚡ 1. High-Throughput Telemetry Ingestion Pipeline
- **Zero Latency Impact**: Drop-in client middleware hooks into `res.on("finish")`, consuming 0ms of user request cycle.
- **Microsecond Redis Buffer**: Ingestion Gateway acknowledges payloads in `< 3ms` via Upstash Redis REST pipelines.
- **Sliding-Window Rate Limiting**: Built-in tenant-level rate protection (100 req/min on Free, 1,000 req/min on Pro) preventing noisy-neighbor DDoS risks.
- **Bulk SQL Batching**: Background workers flush telemetry batches using Prisma bulk insert transactions, cutting database connection overhead by over 90%.

### 🤖 2. Autonomous AI SRE Copilot (Google Gemini 3.8 Flash)
- **Automated Root-Cause Analysis (RCA)**: Deep-inspects error patterns, status codes, and microservice route traces to identify failure modes (DB pool starvation, unhandled exceptions, memory leaks).
- **Blast Radius Calculation**: Determines affected endpoints and downstream services during degraded states.
- **1-Click Terminal Hotfixes**: Synthesizes exact, executable CLI hotfixes (`kubectl rollout restart`, connection pool adjustments, configuration patches).

### 📊 3. 4 Golden Signals & Real-Time Telemetry Tail
- **KPI Metrics**: Live tracking of Throughput (Total Requests), Latency Percentiles (Avg, P95, P99), Error Rate (%), and Active Incident counters.
- **Interactive Recharts Visualization**: Dual-gradient time-series charts rendering traffic volume vs. response-time curves over 24-hour rolling windows.
- **Live Stream Viewer**: Tail every incoming request live with categorized HTTP status pills (`2xx`, `4xx`, `5xx`), sub-millisecond latencies, and route search filters.
- **Responsive 2-Line Mobile Layout**: Endpoints remain 100% visible and readable on smartphones without truncation.

### 🚨 4. Multi-Tenant Discord & Slack Alert Routing
- **Zero-Code Webhook Configuration**: Direct UI configuration for Discord and Slack webhooks within tenant settings (no server restarts or `.env` edits required).
- **Tier-Gated Multi-Channel Dispatch**: Free tier receives rich Discord Incident Embeds; Pro tier unlocks simultaneous Slack Block Kit interactive alert cards.
- **Anti-Spam Incident Deduplication**: Groups identical error storms into unified incident threads to prevent notification fatigue.

### 💳 5. B2B SaaS Billing & Quota Lifecycle
- **Polar.sh Integration**: Hosted checkout session generation, automated subscription provisioning, and customer portal management.
- **Tier Quota Governance**: Free Starter (10,000 events/month, 3 AI RCA/month) and Production Pro ($49/month, 500,000 events/month, unlimited Gemini AI Copilot).
- **Branded Welcome Emails**: Automated transactional HTML welcome delivery via Nodemailer Gmail SMTP upon upgrade.

---

## 🖥️ Interactive Platform Showcase

<div align="center">
  <p><em>Real-world production screenshots captured live from the deployed platform.</em></p>
</div>

### 📊 1. Real-Time Telemetry & 4 Golden Signals Dashboard
> **Live Monitoring View**: Tracks real-time throughput volume, rolling 24-hour latency curves, error rate SLAs, and an instant request stream with sub-millisecond precision.

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="PulseEngine Telemetry & Golden Signals Dashboard" width="100%" style="border-radius: 14px; border: 1px solid #334155; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);" />
</div>

- **4 Golden Signals**: Real-time KPI cards for **Total Ingested Events** (with dynamic quota consumption bar & remaining counter), **Average Latency**, **Error Rate %**, and **Active Incidents**.
- **Dual-Axis Recharts Analytics**: Real-time hourly throughput volume (Green) plotted against response-time curves (Indigo).
- **Recent Telemetry Feed**: Instant inspection of request methods (`GET`, `POST`, `DELETE`), endpoints, latency (`ms`), and categorized status pills (`200`, `401`, `500`).

<br />

---

### 🤖 2. Autonomous Google Gemini 3.8 Flash AI SRE Diagnosis
> **Autonomous Incident Triage**: Triggered automatically when 5xx error thresholds or latency SLA violations occur, eliminating manual on-call investigative overhead.

<div align="center">
  <img src="public/screenshots/ai-diagnosis.jpg" alt="Autonomous Gemini AI SRE Diagnosis Modal" width="90%" style="border-radius: 14px; border: 1px solid #334155; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);" />
</div>

- **Root-Cause Analysis (RCA)**: Pinpoints upstream database pool exhaustion, connection timeouts, or unhandled exceptions.
- **Blast Radius & Business Impact**: Identifies downstream microservices and percentage of end-users impacted by degraded endpoints.
- **1-Click Remediation**: Synthesizes exact copy-pasteable terminal commands to restore service health in seconds.

<br />

---

### 🚀 3. Interactive Landing Page & Live SRE Architecture Sandbox
> **Developer Experience & Live Simulation**: Experience traffic anomalies, live curve spikes, and Gemini AI diagnosis before connecting production services.

<div align="center">
  <img src="public/screenshots/landing.jpg" alt="PulseEngine Public Landing Page and SRE Sandbox" width="85%" style="border-radius: 14px; border: 1px solid #334155; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);" />
</div>

- **Interactive Anomaly Simulator**: Simulate baseline 200 OK traffic, sudden 500 Outages, or 3.2s Latency Spikes with live chart updates.
- **3-Line SDK Quickstart**: Drop-in cURL and language-specific middleware snippets for instant integration.
- **Decoupled Architecture**: High-speed Redis queue buffer, asynchronous bulk batch workers, and transparent B2B SaaS pricing.

---

## 🛠️ 30-Second Quickstart SDK Integration

Connect any distributed service to PulseEngine in under 30 seconds with zero third-party SDK dependencies.

### 1. Node.js (Express.js)
Place in your `server.js` or `app.js` right after `express.json()` and `cors()`:
```javascript
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    // Non-blocking fire-and-forget ingestion (0ms impact on user response)
    fetch("https://engine-lovat-beta.vercel.app/api/v1/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "pe_live_your_tenant_api_key_here",
      },
      body: JSON.stringify({
        endpoint: (req.originalUrl || req.url || req.path).split("?")[0],
        method: req.method,
        statusCode: res.statusCode,
        latency: Date.now() - start,
      }),
    }).catch(() => {});
  });

  next();
});
```

### 2. Next.js (App Router Middleware)
Create or append to `src/middleware.ts`:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  fetch("https://engine-lovat-beta.vercel.app/api/v1/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "pe_live_your_tenant_api_key_here",
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
```

### 3. Python (FastAPI & Starlette)
Add in your `main.py`:
```python
import time, requests
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def pulse_telemetry_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)

    try:
        requests.post(
            "https://engine-lovat-beta.vercel.app/api/v1/ingest",
            headers={"x-api-key": "pe_live_your_tenant_api_key_here"},
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

    return response
```

### 4. Universal cURL / Go / Java / Rust / C#
```bash
curl -X POST https://engine-lovat-beta.vercel.app/api/v1/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: pe_live_your_tenant_api_key_here" \
  -d '{
    "endpoint": "/api/v1/orders",
    "method": "POST",
    "statusCode": 200,
    "latency": 38
  }'
```

---

## 📂 Full Project Directory Structure

```
engine/
├── .github/                         # Continuous Integration workflows
├── prisma/
│   ├── migrations/                  # Neon PostgreSQL migration history
│   ├── prisma.config.ts             # Prisma v6 binary configuration
│   └── schema.prisma                # Relational schema (Tenant, User, Telemetry, Incidents)
├── public/
│   └── .gitkeep                     # Public assets directory
├── src/
│   ├── app/
│   │   ├── actions/                 # Next.js Server Actions (Stateless RPC)
│   │   │   ├── aiActions.ts         # Google Gemini 3.8 Flash triage triggers
│   │   │   ├── alertActions.ts      # Discord & Slack webhook test & dispatch
│   │   │   ├── authActions.ts       # Authentication, session tokens & logout
│   │   │   ├── billingActions.ts    # Polar.sh checkout & subscription portal
│   │   │   ├── incidentActions.ts   # Incident resolution & audit logging
│   │   │   └── telemetryActions.ts  # Batch metric retrieval & queue drains
│   │   ├── api/                     # High-performance HTTP Route Handlers
│   │   │   ├── auth/
│   │   │   │   ├── callback/google/ # OAuth 2.0 Google token exchange
│   │   │   │   └── google/          # Google 1-click SSO initiation
│   │   │   ├── v1/
│   │   │   │   └── ingest/          # <3ms Telemetry Ingestion Gateway
│   │   │   └── webhooks/
│   │   │       └── polar/           # Polar.sh payment webhook handler
│   │   ├── dashboard/               # Tenant SRE Dashboard (Protected route)
│   │   │   └── page.tsx             # Tab container with URL query synchronization
│   │   ├── login/                   # User sign-in page with password visibility toggle
│   │   ├── register/                # Multi-tenant registration & onboarding
│   │   ├── globals.css              # Obsidian design system & Tailwind v4 tokens
│   │   ├── icon.svg                 # Brand-unified Electric Zap Favicon
│   │   ├── layout.tsx               # Root theme provider & toast context
│   │   └── page.tsx                 # Public marketing page & interactive sandbox
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AiDiagnosisModal.tsx # Gemini AI SRE Copilot diagnostic drawer
│   │   │   ├── billingTab.tsx       # Polar subscription & webhook integrations
│   │   │   ├── IncidentsTab.tsx     # Incident management & triage filter
│   │   │   ├── LiveStreamTab.tsx    # Real-time request tail with 2-line mobile format
│   │   │   ├── Navbar.tsx           # Dashboard header with 1-tap Home button
│   │   │   ├── OverviewTab.tsx      # Golden signals, Recharts & recent events
│   │   │   └── QuickstartTab.tsx    # Multi-language SDK snippets generator
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx    # Next-themes dark/light context
│   │   │   └── ThemeToggle.tsx      # Sun/Moon theme switcher button
│   │   └── ui/
│   │       └── Toast.tsx            # Non-blocking animated toast notification
│   ├── lib/
│   │   ├── ai.ts                    # Google Gemini 3.8 Flash API client
│   │   ├── auth.ts                  # Stateless HMAC-SHA256 JWT utilities
│   │   ├── logger.ts                # Pino structured logging
│   │   ├── polar.ts                 # Polar.sh SDK client & product IDs
│   │   ├── prisma.ts                # PrismaClient singleton with pooled connections
│   │   ├── queue.ts                 # Upstash Redis LPUSH / RPOPLPUSH buffer queue
│   │   └── redis.ts                 # Upstash Redis REST client singleton
│   ├── services/
│   │   ├── aiService.ts             # Gemini prompt engineering & RCA synthesizer
│   │   ├── alertService.ts          # Discord Embed & Slack Block Kit dispatchers
│   │   ├── apiKeyService.ts         # Cryptographic tenant API key generators
│   │   ├── billingService.ts        # Quota enforcement & tier verification
│   │   ├── emailService.ts          # Nodemailer Gmail SMTP welcome dispatcher
│   │   ├── incidentService.ts       # Deduplicated incident creator & resolver
│   │   └── telemetryService.ts      # Statistical aggregator for 4 Golden Signals
│   └── workers/
│       └── telemetryWorker.ts       # Asynchronous micro-batch SQL drain worker
├── Dockerfile                       # Multi-stage Node 22 Alpine Linux container
├── docker-compose.yml               # Local container orchestration file
├── next.config.ts                   # Turbopack & standalone output configuration
├── package.json                     # Project manifest and scripts
├── tailwind.config.ts               # Tailwind v4 configuration
└── tsconfig.json                    # Strict TypeScript 5 configuration
```

---

## 🔌 REST API & Ingestion Specification

### 1. Ingest Telemetry Event
```http
POST /api/v1/ingest
Content-Type: application/json
x-api-key: pe_live_your_api_key_here
```

**Request Body:**
```json
{
  "endpoint": "/api/v1/checkout",
  "method": "POST",
  "statusCode": 200,
  "latency": 45
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "status": "QUEUED",
  "durationMs": 2.14
}
```

### 2. Supported HTTP Endpoints Summary

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ingest` | `x-api-key` header | High-speed telemetry ingestion gateway (`<3ms` buffer) |
| `GET` | `/api/auth/google` | Public | Initiates Google OAuth 2.0 Single Sign-On |
| `GET` | `/api/auth/callback/google` | OAuth code | Google OAuth token exchange & user provisioning |
| `POST` | `/api/webhooks/polar` | Polar webhook secret | Subscription upgrade webhook for Polar.sh Pro tier |
| `POST` | `/dashboard` (RPC) | Session JWT Cookie | Server Actions for stats, AI triage, and alerts |

---

## ⚙️ Environment Variables Reference

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

| Key | Required | Description | Example / Source |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | ✅ | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-pooler.neon.tech/pulseengine?sslmode=require` |
| `JWT_SECRET` | ✅ | Cryptographic secret for signing session tokens | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Root URL for OAuth redirects & SDK generators | `https://engine-lovat-beta.vercel.app` |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Serverless Redis REST endpoint | `https://sample-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| ✅ | Upstash Serverless Redis REST token | `your_upstash_redis_rest_token_here` |
| `GEMINI_API_KEY` | ✅ | Google Gemini 3.8 Flash API key | Google AI Studio (`AIzaSy...`) |
| `GOOGLE_CLIENT_ID` | 🟡 | Google OAuth 2.0 Client ID for 1-click SSO | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | 🟡 | Google OAuth 2.0 Client Secret | Google Cloud Console |
| `POLAR_ACCESS_TOKEN` | 🟡 | Polar.sh Developer API token | Polar.sh Developer Settings |
| `POLAR_PRO_PRODUCT_ID` | 🟡 | Polar.sh Pro Plan product UUID | Polar.sh Products |
| `POLAR_SERVER` | 🟡 | Polar API environment (`sandbox` or `production`) | `sandbox` |
| `GMAIL_USER` | 🟡 | Gmail address for transactional SMTP delivery | `your-service@gmail.com` |
| `GMAIL_APP_PASSWORD` | 🟡 | Google 16-character App Password | Google Account > Security |

---

## 🐳 Dual-Cloud & Docker Deployment

PulseEngine supports dual-cloud execution out of the box:

### Target 1: Vercel (Edge Serverless)
Next.js 16 automatically builds natively into serverless functions on Vercel without vendor lock-in.

### Target 2: Render / AWS / Kubernetes (Docker Alpine)
A multi-stage `Dockerfile` builds an ultra-lean **180MB container** on Node 22 LTS Alpine Linux:

```bash
# Build standalone container image
docker build -t pulseengine .

# Run container on port 3000
docker run -p 3000:3000 --env-file .env pulseengine
```

### Run with Docker Compose:
```bash
docker compose up --build
```

---

## 📦 Technology Stack Matrix

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org) | Server Components, Server Actions & Turbopack build engine |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org) | End-to-end type safety across database, API, and UI |
| **Primary Database** | [Neon Serverless PostgreSQL](https://neon.tech) | Autoscaling relational data store with connection pooling |
| **ORM** | [Prisma 6](https://www.prisma.io) | Type-safe schema migrations and bulk SQL operations |
| **Buffer & Rate Limiter** | [Upstash Serverless Redis](https://upstash.com) | Sub-3ms memory queue (`LPUSH`) & sliding-window rate limiter |
| **AI SRE Engine** | [Google Gemini 3.8 Flash](https://aistudio.google.com) | Autonomous Root-Cause Analysis (RCA) & CLI remediation hotfixes |
| **Monetization & Billing** | [Polar.sh](https://polar.sh) | SaaS checkout sessions, recurring subscriptions & webhooks |
| **Transactional Email** | [Nodemailer](https://nodemailer.com) (Gmail SMTP) | Branded HTML welcome notifications upon plan upgrades |
| **Data Visualization** | [Recharts 3](https://recharts.org) | Responsive SVG time-series throughput & latency analytics |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com) + Lucide | Obsidian developer theme with responsive mobile layout |
| **Containerization** | [Docker](https://www.docker.com) | Multi-stage Alpine Linux image with unprivileged `nextjs` user |

---

## 🚀 Local Development Setup

Follow these steps to run PulseEngine locally:

### 1. Prerequisites
- **Node.js**: `>= 20.0.0` (Node 22 LTS recommended)
- **Git** installed on your system
- A free account on [Neon.tech](https://neon.tech) and [Upstash.com](https://upstash.com)

### 2. Clone Repository
```bash
git clone https://github.com/abhishekshakya1/engine.git
cd engine
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
# Populate DATABASE_URL, JWT_SECRET, UPSTASH_REDIS_*, GEMINI_API_KEY
```

### 5. Initialize Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to open the platform!

---

## 🛡️ Security, Reliability & Compliance

- **Zero Secret Commits**: Complete `.gitignore` coverage ensuring no `.env` credentials are ever exposed in Git.
- **Stateless Cryptographic Sessions**: Authentication is verified via HMAC-SHA256 signed JWT cookies with `SameSite=Lax` and `HttpOnly` protection.
- **Unprivileged Container Execution**: Docker containers run under system user `nextjs:nodejs` (UID 1001), preventing root escape vulnerabilities.
- **Fail-Safe Ingestion**: Ingestion failures in monitored microservices are wrapped in `.catch(() => {})` handlers, ensuring monitored applications never crash even during upstream network partitions.

---

## 📄 License & Author

Distributed under the **MIT License**. See the [`LICENSE`](LICENSE) file for complete details.

**Crafted with ❤️ by Abhishek Kumar Shakya**  
- **GitHub**: [@abhishekshakya1](https://github.com/abhishekshakya1)  
- **Project Repository**: [github.com/abhishekshakya1/engine](https://github.com/abhishekshakya1/engine)  
- **Live Platform**: [engine-lovat-beta.vercel.app](https://engine-lovat-beta.vercel.app)

---

<div align="center">
  <sub>Built for Site Reliability Engineers, DevOps teams, and high-velocity microservice platforms.</sub>
</div>
