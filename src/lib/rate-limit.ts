import { getRedisClient } from "./redis";

const memoryHits = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis) {
    try {
      if (redis.status === "wait") {
        await redis.connect();
      }
      const count = await redis.incr(`rl:${key}`);
      if (count === 1) {
        await redis.expire(`rl:${key}`, windowSeconds);
      }
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
      };
    } catch {
      // Fallback to in-memory limiter if Redis is unavailable
    }
  }

  const now = Date.now();
  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: Math.max(0, limit - 1) };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  };
}

export function resetMemoryRateLimiterForTests(): void {
  memoryHits.clear();
}
