import { prisma } from "@/lib/prisma";
import { dispatchMultiChannelAlert } from "./alertService";
import { logger } from "@/lib/logger";
import { Severity, IncidentStatus } from "@prisma/client";

export interface AnomalyCheckInput {
  organizationId: string;
  organizationName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latency: number;
}

/**
 * 1. AUTOMATED INCIDENT DETECTOR & DEDUPLICATOR
 * Evaluates events, creates incidents, and dispatches multi-channel alerts!
 */
export async function evaluateAndTriggerIncident(event: AnomalyCheckInput) {
  const { organizationId, organizationName, endpoint, method, statusCode, latency } = event;

  // Determine Severity and Title
  let severity: Severity | null = null;
  let title = "";
  let description = "";

  if (statusCode >= 500) {
    severity = Severity.CRITICAL;
    title = `Critical 500 Spike on ${endpoint}`;
    description = `Endpoint ${method} ${endpoint} failed with HTTP ${statusCode} and response latency ${latency}ms.`;
  } else if (latency > 1500) {
    severity = Severity.HIGH;
    title = `High Latency Degradation on ${endpoint}`;
    description = `Endpoint ${method} ${endpoint} response time degraded to ${latency}ms (Threshold: 1500ms).`;
  }

  // If no anomaly threshold breached, skip
  if (!severity) {
    return { triggered: false, reason: "Normal event, no anomaly detected." };
  }

  // Deduplication Check: Check if an unresolved incident already exists for this endpoint
  const existingIncident = await prisma.incident.findFirst({
    where: {
      organizationId,
      status: { in: [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING] },
      title: { contains: endpoint },
    },
  });

  if (existingIncident) {
    logger.info(
      { event: "INCIDENT_DEDUPLICATED", incidentId: existingIncident.id, endpoint },
      `Active incident (${existingIncident.id}) already open for ${endpoint}. Alert muted to prevent spam.`
    );
    return {
      triggered: false,
      reason: "Deduplicated: Active incident already open.",
      incidentId: existingIncident.id,
    };
  }

  // Create new incident in Neon Database
  const newIncident = await prisma.incident.create({
    data: {
      organizationId,
      title,
      description,
      severity,
      status: IncidentStatus.OPEN,
    },
  });

  logger.warn(
    { incidentId: newIncident.id, endpoint, severity },
    `[INCIDENT_TRIGGERED] New ${severity} incident created for ${endpoint}`
  );

  // Dispatch multi-channel alerts with verified organizationId
  dispatchMultiChannelAlert({
    incidentId: newIncident.id,
    organizationId: newIncident.organizationId,
    title: newIncident.title,
    severity: newIncident.severity as any,
    endpoint,
    statusCode,
    latency,
  }).catch((err) => {
    logger.error({ err, incidentId: newIncident.id }, "Alert dispatch failed");
  });

  return {
    triggered: true,
    incident: newIncident,
  };
}

/**
 * 2. LIST INCIDENTS FOR DASHBOARD
 */
export async function getOrganizationIncidents(
  organizationId: string,
  statusFilter?: IncidentStatus
) {
  const whereClause: any = { organizationId };
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  return await prisma.incident.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/**
 * 3. RESOLVE INCIDENT
 * Marks incident as resolved with timestamp
 */
export async function resolveIncident(
  incidentId: string,
  organizationId: string
) {
  return await prisma.incident.update({
    where: {
      id: incidentId,
      organizationId, // Security: Ensure tenant owns this incident
    },
    data: {
      status: IncidentStatus.RESOLVED,
      resolvedAt: new Date(),
    },
  });
}
