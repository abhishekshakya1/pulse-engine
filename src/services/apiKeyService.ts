import { prisma } from "@/lib/prisma";
import { redis, freeRateLimiter, proRateLimiter } from "@/lib/redis";
import { UnauthorizedError, TooManyRequestsError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const CACHE_TTL_SECONDS = 300; // 5 minutes cache

export interface AuthenticatedApiKey {
  keyId: string;
  organizationId: string;
  organizationName: string;
  name: string;
  plan: string;
}

/**
 * Validates an API Key using Cache-Aside (Redis RAM -> Neon DB)
 * and enforces Dynamic Sliding-Window Rate Limiting based on Plan Tier (FREE vs PRO).
 */
export async function validateApiKeyAndRateLimit(rawApiKey?: string): Promise<AuthenticatedApiKey> {
  if (!rawApiKey) {
    throw new UnauthorizedError("API Key is missing. Pass x-api-key header.");
  }

  const cacheKey = `apikey:${rawApiKey}`;

  // 1. Check Redis RAM Cache with safe de-serialization
  let rawCached = await redis.get<any>(cacheKey);
  let cachedData: AuthenticatedApiKey | null = null;

  if (rawCached) {
    if (typeof rawCached === "object") {
      cachedData = rawCached as AuthenticatedApiKey;
    } else if (typeof rawCached === "string") {
      try {
        cachedData = JSON.parse(rawCached);
      } catch {
        cachedData = null;
      }
    }
  }

  if (!cachedData || !cachedData.organizationId || !cachedData.organizationName) {
    // 2. Cache Miss: Query Neon PostgreSQL
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: rawApiKey },
      include: {
        organization: {
          select: { id: true, name: true, plan: true },
        },
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedError("Invalid API Key.");
    }

    cachedData = {
      keyId: apiKeyRecord.id,
      organizationId: apiKeyRecord.organizationId,
      organizationName: apiKeyRecord.organization.name,
      name: apiKeyRecord.name,
      plan: apiKeyRecord.organization.plan,
    };

    // Store in Redis Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(cachedData), { ex: CACHE_TTL_SECONDS });
    logger.info({ organizationId: cachedData.organizationId }, "API Key cached in Redis RAM");
  }

  // Dynamic Rate Limiting Based on Plan: FREE = 60 req/min | PRO = 1,000 req/min
  const limiter = cachedData.plan === "PRO" ? proRateLimiter : freeRateLimiter;
  const rateLimitKey = `ratelimit:${cachedData.organizationId}`;

  const { success, limit } = await limiter.limit(rateLimitKey);

  if (!success) {
    logger.warn(
      { organizationId: cachedData.organizationId, plan: cachedData.plan, limit },
      "Rate limit exceeded for organization"
    );
    throw new TooManyRequestsError(
      `Rate limit exceeded (${limit} req/min on ${cachedData.plan} tier). Upgrade to PRO for higher limits.`
    );
  }

  return cachedData;
}

// Backward compatibility alias for ingest route
export const validateApiKey = validateApiKeyAndRateLimit;
