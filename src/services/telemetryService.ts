import { prisma } from "@/lib/prisma";

export interface TelemetryStats {
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  activeIncidents: number;
}

export interface ChartPoint {
  time: string;
  requests: number;
  avgLatency: number;
  errors: number;
}

export interface StreamFilterOptions {
  limit?: number;
  search?: string;
  statusCategory?: "ALL" | "2xx" | "4xx" | "5xx";
}

/**
 * 1. THE 4 GOLDEN SIGNALS
 * Aggregates high-level metrics for the Overview Cards
 */
export async function getOrganizationStats(
  organizationId: string,
  hours: number = 24
): Promise<TelemetryStats> {
  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Run 4 queries concurrently in parallel
  const [totalRequests, latencyAgg, errorCount, activeIncidents] =
    await Promise.all([
      // Signal 1: Total requests
      prisma.telemetryEvent.count({
        where: {
          organizationId,
          timestamp: { gte: sinceDate },
        },
      }),

      // Signal 2: Average latency in ms
      prisma.telemetryEvent.aggregate({
        _avg: { latency: true },
        where: {
          organizationId,
          timestamp: { gte: sinceDate },
        },
      }),

      // Signal 3: Failed requests (Status >= 400)
      prisma.telemetryEvent.count({
        where: {
          organizationId,
          statusCode: { gte: 400 },
          timestamp: { gte: sinceDate },
        },
      }),

      // Signal 4: Open Incidents
      prisma.incident.count({
        where: {
          organizationId,
          status: "OPEN",
        },
      }),
    ]);

  const avgLatency = Math.round(latencyAgg._avg.latency || 0);
  const errorRate =
    totalRequests > 0
      ? Number(((errorCount / totalRequests) * 100).toFixed(2))
      : 0;

  return {
    totalRequests,
    avgLatency,
    errorRate,
    activeIncidents,
  };
}

/**
 * 2. TIME-SERIES BUCKETING FOR RECHARTS
 * Generates continuous 24-hour time slots with baseline zeros,
 * ensuring the chart always renders gracefully even on fresh accounts!
 */
export async function getTimeSeriesChartData(
  organizationId: string,
  hours: number = 24
): Promise<ChartPoint[]> {
  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  // 1. Pre-populate chronological hourly buckets for the time window
  const buckets: Record<
    string,
    { count: number; totalLatency: number; errors: number }
  > = {};

  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourLabel = `${d.getHours().toString().padStart(2, "0")}:00`;
    if (!buckets[hourLabel]) {
      buckets[hourLabel] = { count: 0, totalLatency: 0, errors: 0 };
    }
  }

  // 2. Fetch lightweight event projections for fast processing
  const events = await prisma.telemetryEvent.findMany({
    where: {
      organizationId,
      timestamp: { gte: sinceDate },
    },
    select: {
      latency: true,
      statusCode: true,
      timestamp: true,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  // 3. Aggregate real events into matching hour buckets
  for (const event of events) {
    const date = new Date(event.timestamp);
    const hourLabel = `${date.getHours().toString().padStart(2, "0")}:00`;

    if (buckets[hourLabel]) {
      buckets[hourLabel].count += 1;
      buckets[hourLabel].totalLatency += event.latency;
      if (event.statusCode >= 400) {
        buckets[hourLabel].errors += 1;
      }
    }
  }

  // 4. Convert map to sorted array of chart points
  return Object.entries(buckets).map(([time, data]) => ({
    time,
    requests: data.count,
    avgLatency: data.count > 0 ? Math.round(data.totalLatency / data.count) : 0,
    errors: data.errors,
  }));
}

/**
 * 3. LIVE LOG STREAM TAILING
 * Fetches recent 50 logs with search and status-code filters
 */
export async function getRecentTelemetryStream(
  organizationId: string,
  options: StreamFilterOptions = {}
) {
  const { limit = 50, search, statusCategory = "ALL" } = options;

  // Build dynamic Prisma filter
  const whereClause: any = { organizationId };

  // Search by endpoint name
  if (search && search.trim() !== "") {
    whereClause.endpoint = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  // Filter by HTTP status category
  if (statusCategory === "2xx") {
    whereClause.statusCode = { gte: 200, lte: 299 };
  } else if (statusCategory === "4xx") {
    whereClause.statusCode = { gte: 400, lte: 499 };
  } else if (statusCategory === "5xx") {
    whereClause.statusCode = { gte: 500, lte: 599 };
  }

  return await prisma.telemetryEvent.findMany({
    where: whereClause,
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
