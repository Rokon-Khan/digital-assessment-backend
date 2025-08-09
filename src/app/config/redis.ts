import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis;

export function initRedis(url: string): Redis {
  redis = new Redis(url);
  redis.on("connect", () => logger.info("Redis connected"));
  redis.on("error", (err) => logger.error({ err }, "Redis error"));
  return redis;
}

export function getRedis(): Redis {
  if (!redis) throw new Error("Redis not initialized");
  return redis;
}
