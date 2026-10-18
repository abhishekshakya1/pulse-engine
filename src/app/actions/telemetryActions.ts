"use server";

import { actionHandler } from "@/lib/asyncHandler";
import { UnauthorizedError } from "@/lib/errors";
import { getCurrentSession } from "@/lib/auth";
import {
  getOrganizationStats,
  getTimeSeriesChartData,
  getRecentTelemetryStream,
  StreamFilterOptions,
} from "@/services/telemetryService";
import { getOrganizationIncidents } from "@/services/incidentService";
import { processTelemetryBatch } from "@/workers/telemetryWorker";
import { getQueueLength } from "@/lib/queue";
import { logger } from "@/lib/logger";

/**
 * UNIFIED DASHBOARD BATCH ACTION (Senior Architecture Optimization)
 * Fetches Stats + Chart + Live Stream + Incidents in a SINGLE parallel server request!
 * Reduces polling network requests by 75% and stops log flooding.
 */
export const getDashboardBatchAction = actionHandler(
  async (hours: number = 24) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in to view telemetry.");
    }

    // 1. Auto-drain Redis buffer queue into Neon PostgreSQL
    try {
      await processTelemetryBatch(100);
    } catch (workerErr) {
      logger.warn({ err: workerErr }, "Background telemetry buffer auto-drain warning");
    }

    // 2. Fetch fresh parallel telemetry snapshot
    const [stats, chart, logs, incidents] = await Promise.all([
      getOrganizationStats(session.organizationId, hours),
      getTimeSeriesChartData(session.organizationId, hours),
      getRecentTelemetryStream(session.organizationId),
      getOrganizationIncidents(session.organizationId),
    ]);

    return {
      stats,
      chart,
      logs,
      incidents,
    };
  }
);

/**
 * 1. GET 4 GOLDEN SIGNALS (Overview Stats)
 */
export const getTelemetryStatsAction = actionHandler(
  async (hours: number = 24) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in to view telemetry.");
    }

    const stats = await getOrganizationStats(session.organizationId, hours);
    return stats;
  }
);

/**
 * 2. GET TIME-SERIES CHART DATA (Recharts)
 */
export const getChartDataAction = actionHandler(
  async (hours: number = 24) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in to view charts.");
    }

    const chartPoints = await getTimeSeriesChartData(
      session.organizationId,
      hours
    );
    return chartPoints;
  }
);

/**
 * 3. GET RECENT TELEMETRY STREAM (Live Logs Table)
 */
export const getLiveStreamAction = actionHandler(
  async (options?: StreamFilterOptions) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in to view live logs.");
    }

    const logs = await getRecentTelemetryStream(
      session.organizationId,
      options
    );
    return logs;
  }
);

/**
 * 4. FLUSH TELEMETRY QUEUE ACTION (Worker Trigger)
 */
export const flushTelemetryQueueAction = actionHandler(async (batchSize: number = 50) => {
  const result = await processTelemetryBatch(batchSize);
  return result;
});

/**
 * 5. GET BUFFER QUEUE LENGTH ACTION
 */
export const getQueueStatusAction = actionHandler(async () => {
  const length = await getQueueLength();
  return { queueLength: length };
});
