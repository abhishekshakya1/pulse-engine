import crypto from "crypto";
import { apiHandler } from "@/lib/asyncHandler";
import { ValidationError } from "@/lib/errors";
import { validateApiKey } from "@/services/apiKeyService";
import { enqueueTelemetryEvent, QueuedTelemetryEvent } from "@/lib/queue";
import { evaluateAndTriggerIncident } from "@/services/incidentService";
import { logger } from "@/lib/logger";

interface IngestPayload {
  endpoint: string;
  method: string;
  statusCode: number;
  latency: number;
  ip?: string;
  userAgent?: string;
}

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

export const POST = apiHandler(async (req: Request) => {
  // 1. Extract API Key from headers
  const rawApiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // 2. Validate Tenant via Redis Rate Limiter & Cache
  const tenant = await validateApiKey(rawApiKey);

  // 3. Parse JSON Body
  let body: Partial<IngestPayload>;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Malformed JSON payload in request body.");
  }

  const { endpoint, method, statusCode, latency, ip, userAgent } = body;

  // 4. Input Validations
  if (!endpoint || typeof endpoint !== "string") {
    throw new ValidationError("Field 'endpoint' is required and must be a string.");
  }

  const normalizedMethod = (method || "GET").toUpperCase();
  if (!ALLOWED_METHODS.includes(normalizedMethod)) {
    throw new ValidationError(
      `Invalid HTTP method '${method}'. Allowed: ${ALLOWED_METHODS.join(", ")}`
    );
  }

  if (typeof statusCode !== "number" || statusCode < 100 || statusCode > 599) {
    throw new ValidationError(
      "Field 'statusCode' is required and must be a valid HTTP code (100-599)."
    );
  }

  if (typeof latency !== "number" || latency < 0) {
    throw new ValidationError(
      "Field 'latency' is required and must be a non-negative number in ms."
    );
  }

  // 5. ⚡ HIGH-THROUGHPUT ASYNC BUFFER: Push to Redis Queue in < 3ms!
  const eventId = `evt_${crypto.randomBytes(12).toString("hex")}`;
  const timestamp = new Date().toISOString();

  const queuedEvent: QueuedTelemetryEvent = {
    id: eventId,
    organizationId: tenant.organizationId,
    organizationName: tenant.organizationName,
    endpoint: endpoint.trim(),
    method: normalizedMethod,
    statusCode,
    latency: Math.round(latency),
    ip: ip || req.headers.get("x-forwarded-for") || undefined,
    userAgent: userAgent || req.headers.get("user-agent") || undefined,
    timestamp,
  };

  await enqueueTelemetryEvent(queuedEvent);

  // 6. 🚨 AUTOMATED ANOMALY DETECTION HOOK (Non-blocking background)
  // If 500 error or latency spike (>1500ms) occurs, evaluate incident & dispatch alert!
  if (statusCode >= 500 || latency > 1500) {
    evaluateAndTriggerIncident({
      organizationId: tenant.organizationId,
      organizationName: tenant.organizationName,
      endpoint: endpoint.trim(),
      method: normalizedMethod,
      statusCode,
      latency: Math.round(latency),
    }).catch((err) => {
      logger.error({ err, organizationId: tenant.organizationId, endpoint }, "Incident evaluation failed");
    });
  }

  // 7. Return Lightning Fast Response (HTTP 202 Accepted)
  return {
    eventId,
    status: "queued",
    organization: tenant.organizationName,
    recordedAt: timestamp,
    latency: `${queuedEvent.latency}ms`,
  };
}, 202);
