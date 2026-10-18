import { prisma } from "@/lib/prisma";
import { dequeueTelemetryBatch, getQueueLength } from "@/lib/queue";
import { logger } from "@/lib/logger";

export interface BatchProcessingResult {
  processed: number;
  remainingInQueue: number;
  durationMs: number;
}

/**
 * Drains up to `batchSize` events from Redis queue and flushes them
 * into Neon PostgreSQL in a single high-speed bulk transaction!
 */
export async function processTelemetryBatch(
  batchSize: number = 50
): Promise<BatchProcessingResult> {
  const start = performance.now();

  // 1. Pop batch from Redis memory queue
  const batch = await dequeueTelemetryBatch(batchSize);

  if (batch.length === 0) {
    const remaining = await getQueueLength();
    return {
      processed: 0,
      remainingInQueue: remaining,
      durationMs: Math.round(performance.now() - start),
    };
  }

  // 2. High-Speed Bulk Write to Neon PostgreSQL
  // Formats objects for Prisma createMany
  const dbRecords = batch.map((item) => ({
    id: item.id,
    organizationId: item.organizationId,
    endpoint: item.endpoint,
    method: item.method,
    statusCode: item.statusCode,
    latency: item.latency,
    ip: item.ip,
    userAgent: item.userAgent,
    timestamp: new Date(item.timestamp),
  }));

  // Execute bulk insert (Single SQL transaction!)
  await prisma.telemetryEvent.createMany({
    data: dbRecords,
    skipDuplicates: true,
  });

  // 3. Batch Increment Organization Usage Counters
  // Groups counts by organizationId so we do minimum updates
  const orgCounts: Record<string, number> = {};
  for (const item of batch) {
    orgCounts[item.organizationId] = (orgCounts[item.organizationId] || 0) + 1;
  }

  // Update org counters concurrently
  await Promise.all(
    Object.entries(orgCounts).map(([orgId, count]) =>
      prisma.organization.update({
        where: { id: orgId },
        data: { eventsCount: { increment: count } },
      })
    )
  );

  const durationMs = Math.round(performance.now() - start);
  const remainingInQueue = await getQueueLength();

  logger.info(
    { count: batch.length, duration: `${durationMs}ms`, remainingInQueue },
    `[WORKER_BATCH_FLUSHED] Processed ${batch.length} telemetry logs in ${durationMs}ms! (${remainingInQueue} left in queue)`
  );

  return {
    processed: batch.length,
    remainingInQueue,
    durationMs,
  };
}
