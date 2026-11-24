import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export function getRedisClient(): Redis | null {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  if (!url) return null;

  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 1500,
    });

    globalForRedis.redisClient.on("error", () => {
      // Redis optional fallback: do not crash app when Redis is unreachable
    });
  }

  return globalForRedis.redisClient;
}

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const client = getRedisClient();
  if (!client) {
    return fetcher();
  }

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    return fetcher();
  }

  const fresh = await fetcher();
  try {
    await client.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch {
    // ignore cache write errors
  }
  return fresh;
}

export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  const client = getRedisClient();
  if (!client || keys.length === 0) return;

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    await client.del(...keys);
  } catch {
    // ignore cache invalidation errors
  }
}
