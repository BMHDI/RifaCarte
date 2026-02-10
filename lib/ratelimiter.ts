import { RateLimitRecord } from '@/types/types';

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Simple in-memory rate limiter
 * @param key string - usually IP or user identifier
 * @param maxCalls number - max requests in the time window
 * @param windowMs number - time window in milliseconds
 * @returns boolean - true if allowed, false if limit exceeded
 */
export function rateLimit(key: string, maxCalls = 5, windowMs = 10_000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, lastCall: now };

  // reset count if window passed
  if (now - record.lastCall > windowMs) {
    record.count = 0;
    record.lastCall = now;
  }

  record.count++;
  record.lastCall = now;
  rateLimitMap.set(key, record);

  return record.count <= maxCalls;
}
