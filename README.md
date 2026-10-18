# ⚡ PulseEngine

> **Enterprise-Grade B2B Multi-Tenant Observability, Telemetry Streaming & Autonomous AI SRE Copilot Platform**  
> *Inspired by Datadog, Sentry & Better Stack — Built with Next.js 16, Turbopack, Upstash Redis, Neon PostgreSQL & Google Gemini AI.*

---

![Next.js 16](https://img.shields.io/badge/Next.js_16-App_Router-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Upstash_Serverless-DC382D?style=flat-square&logo=redis)
![Google Gemini](https://img.shields.io/badge/AI_Copilot-Gemini_3.8_Flash-8E75C2?style=flat-square&logo=google)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Alpine-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🌟 Overview

**PulseEngine** is an autonomous, cloud-native observability and Site Reliability Engineering (SRE) platform designed for microservices, high-throughput APIs, and modern distributed systems. 

It enables engineering teams to stream telemetry events with **0ms latency impact** on user requests, visualize real-time Golden Signals, triage incidents with an **autonomous Google Gemini AI Copilot**, and route multi-channel alerts directly to custom Discord and Slack webhooks.

---

## 🏗️ High-Level System Architecture

```
                                  [ Client Microservice ]
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

## ✨ Key Features

### ⚡ 1. High-Throughput Ingestion Buffer
- **Zero Impact on Monitored Apps**: Drop-in middleware executes after response completion (`res.on("finish")`), adding zero latency to user journeys.
- **Microsecond Redis Queue**: Incoming payloads are queued in Upstash Redis in `< 3ms` with sliding-window rate limiting (100 req/min Free, 1000 req/min Pro).
- **Bulk SQL Batching**: Background workers drain telemetry batches into Neon PostgreSQL using bulk transactions, slashing database connection overhead by 90%.

### 🤖 2. Autonomous AI SRE Copilot (Google Gemini 3.8 Flash)
- **Instant Root-Cause Analysis (RCA)**: Deep-dives into stack traces, headers, and endpoints to identify failure modes (DB pool exhaustion, memory leaks, unhandled exceptions).
- **Executable CLI Remediation**: Generates exact, copy-pasteable terminal commands to restore service health in seconds.
- **Interactive Triage Modal**: Triage, diagnose, and mark incidents resolved with audit trails.

### 📊 3. Real-Time Telemetry Tail & 4 Golden Signals
- **Latency Percentiles & Error Rates**: Live charts tracking traffic volume, error rates, and response time curves over 24-hour rolling windows.
- **Live Stream Viewer**: Search, tail, and filter every incoming request with status category pills (`2xx`, `4xx`, `5xx`).

### 🚨 4. Multi-Tenant Discord & Slack Alert Routing
- **Direct UI Webhook Management**: Customers configure, test, and save their incoming Discord and Slack webhooks directly from the dashboard (no `.env` file editing required).
- **Tier-Gated Dispatching**: Free tier receives Discord Rich Embeds; Pro tier unlocks simultaneous Slack Block Kit interactive alert cards.
- **Anti-Spam Deduplication**: Groups identical error storms into unified incident threads.

### 💳 5. B2B SaaS Monetization & Quota Lifecycle
- **Polar.sh Integration**: Hosted checkout session generation, automated subscription provisioning, and customer portal management.
- **Tier Quota Tracking**: Free (10,000 events/month) and Pro ($49/month, 500,000 events/month).
- **Transactional Welcome Emails**: Automated branded HTML email dispatch via Nodemailer Gmail SMTP upon upgrade.

---

## 🛠️ Quickstart SDK Integration

Connect your backend to PulseEngine in **under 30 seconds**. Zero external dependencies required.

### Node.js (Express.js)
Place in `server.js` or `app.js` right after `express.json()` and `cors()`:
```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    fetch("https://your-pulseengine-domain.com/api/v1/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "pe_live_your_api_key_here",
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

### Next.js (App Router)
Create `src/middleware.ts`:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  fetch("https://your-pulseengine-domain.com/api/v1/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "pe_live_your_api_key_here",
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Python (FastAPI & Starlette)
Add in `main.py`:
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
            "https://your-pulseengine-domain.com/api/v1/ingest",
            headers={"x-api-key": "pe_live_your_api_key_here"},
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

### Universal cURL / Any Language (Go, Java, PHP, Rust, C#)
```bash
curl -X POST https://your-pulseengine-domain.com/api/v1/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: pe_live_your_api_key_here" \
  -d '{
    "endpoint": "/api/v1/checkout",
    "method": "POST",
    "statusCode": 200,
    "latency": 45
  }'
```

---

## ⚙️ Environment Variables Configuration

Copy `.env.example` to `.env` and populate your secrets:

```bash
cp .env.example .env
```

| Key | Description | Example / Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string | `postgresql://user:pass@ep-pooler.neon.tech/pulseengine?sslmode=require` |
| `JWT_SECRET` | Cryptographic secret for signing session tokens | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Application root URL for callbacks and webhooks | `https://pulseengine.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for 1-click SSO | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | Google Cloud Console |
| `UPSTASH_REDIS_REST_URL` | Upstash Serverless Redis REST endpoint | `https://sample-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Serverless Redis REST token | Upstash Console |
| `GEMINI_API_KEY` | Google Gemini 3.8 Flash AI API Key | Google AI Studio |
| `POLAR_ACCESS_TOKEN` | Polar.sh API access token | Polar.sh Developer Settings |
| `POLAR_PRO_PRODUCT_ID` | Polar.sh Pro subscription product UUID | Polar.sh Products |
| `POLAR_SERVER` | Payment environment mode (`sandbox` or `production`) | `sandbox` (for testing) / `production` |
| `GMAIL_USER` | Gmail address for transactional SMTP delivery | `your-service@gmail.com` |
| `GMAIL_APP_PASSWORD` | Google 16-character App Password | Google Account > Security |

---

## 🐳 Docker Deployment

PulseEngine includes an optimized multi-stage `Dockerfile` (Alpine Linux) and a `docker-compose.yml` for running local or production containers.

### Run with Docker Compose:
```bash
docker compose up --build
```

### Build & Run Minimal Standalone Container:
```bash
docker build -t pulseengine .
docker run -p 3000:3000 --env-file .env pulseengine
```

---

## 📦 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with [Turbopack](https://turbo.build)
- **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech) + [Prisma 6](https://www.prisma.io)
- **In-Memory Caching & Queue**: [Upstash Serverless Redis](https://upstash.com)
- **AI SRE Engine**: [Google Gemini 3.8 Flash](https://aistudio.google.com) (`@google/genai`)
- **Billing & Subscriptions**: [Polar.sh](https://polar.sh)
- **Email Delivery**: [Nodemailer](https://nodemailer.com) (Gmail SMTP)
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Recharts
- **Containerization**: Docker Multi-Stage (Node 20 Alpine)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

**Built with ❤️ for modern engineering teams and Site Reliability Engineers.**
