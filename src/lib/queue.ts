import { redis } from "./redis";
import { logger } from "./logger";

// The Queue Name in Redis Memory
export const TELEMETRY_QUEUE_KEY = "pe:queue:telemetry";

export interface QueuedTelemetryEvent {
  id: string;
  organizationId: string;
  organizationName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latency: number;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * 1. PRODUCER: Enqueue Telemetry Event
 * Pushes event into Redis memory queue in < 3ms
 */
export async function enqueueTelemetryEvent(
  event: QueuedTelemetryEvent
): Promise<boolean> {
  try {
    const payload = JSON.stringify(event);
    await redis.lpush(TELEMETRY_QUEUE_KEY, payload);
    return true;
  } catch (error) {
    logger.error({ err: error }, "[QUEUE_ENQUEUE_ERROR] Failed to push to Redis queue");
    return false;
  }
}

/**
 * 2. CONSUMER: Dequeue Batch of Events
 */
export async function dequeueTelemetryBatch(
  batchSize: number = 50
): Promise<QueuedTelemetryEvent[]> {
  try {
    const length = await redis.llen(TELEMETRY_QUEUE_KEY);
    if (length === 0) {
      return [];
    }

    const itemsToFetch = Math.min(length, batchSize);

    // Redis Pipeline: 1 network request me multiple RPOP
    const pipeline = redis.pipeline();
    for (let i = 0; i < itemsToFetch; i++) {
      pipeline.rpop(TELEMETRY_QUEUE_KEY);
    }

    const results = await pipeline.exec();
    const batch: QueuedTelemetryEvent[] = [];

    for (const item of results) {
      if (item) {
        // Agar Upstash ne already object bana diya hai toh direct push karo:
        if (typeof item === "object") {
          batch.push(item as QueuedTelemetryEvent);
        } else if (typeof item === "string") {
          // Agar raw string aayi toh parse karo:
          try {
            batch.push(JSON.parse(item));
          } catch {
            // Skip invalid
          }
        }
      }
    }

    return batch;
  } catch (error) {
    logger.error({ err: error }, "[QUEUE_DEQUEUE_ERROR] Failed to drain Redis queue");
    return [];
  }
}


/**
 * 3. MONITOR: Get current Queue Length
 * Helps track how many events are buffered waiting for worker processing
 */
export async function getQueueLength(): Promise<number> {
  try {
    return await redis.llen(TELEMETRY_QUEUE_KEY);
  } catch {
    return 0;
  }
}
