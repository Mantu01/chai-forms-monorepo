import Redis from "ioredis";
import {env} from '../../env'

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  if (!redis) {
    try {
      redis = new Redis( {
        host:env.REDIS_HOST,
        password:env.REDIS_PASSWORD,
        port:env.REDIS_PORT,
        username:env.REDIS_USERNAME,
        lazyConnect: true,
        enableOfflineQueue: false,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
      });

      redis.on("error", (err) => {
        // Log but don't crash – Redis is optional
        console.warn("[Redis] Connection error:", err.message);
        redis = null;
      });
    } catch {
      redis = null;
    }
  }

  return redis;
}

/**
 * Optional Redis wrapper. All methods silently return null/undefined when Redis
 * is unavailable instead of throwing, so the app keeps running without Redis.
 */
const optionalRedis = {
  async get(key: string): Promise<string | null> {
    try {
      const client = getRedis();
      if (!client) return null;
      return await client.get(key);
    } catch {
      return null;
    }
  },

  async setex(key: string, ttl: number, value: string): Promise<void> {
    try {
      const client = getRedis();
      if (!client) return;
      await client.setex(key, ttl, value);
    } catch {
      // ignore
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedis();
      if (!client) return;
      await client.del(key);
    } catch {
      // ignore
    }
  },

  async keys(pattern: string): Promise<string[]> {
    try {
      const client = getRedis();
      if (!client) return [];
      return await client.keys(pattern);
    } catch {
      return [];
    }
  },
};

export default optionalRedis;
