export class RateLimiter {
  private cache: Map<string, { count: number; timestamp: number }>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.cache = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const record = this.cache.get(ip);

    if (!record) {
      this.cache.set(ip, { count: 1, timestamp: now });
      return true;
    }

    // Reset window if it has passed
    if (now - record.timestamp > this.windowMs) {
      this.cache.set(ip, { count: 1, timestamp: now });
      return true;
    }

    // Block if over max requests
    if (record.count >= this.maxRequests) {
      return false;
    }

    // Increment count
    record.count += 1;
    this.cache.set(ip, record);
    return true;
  }
}

// Singleton instances for specific routes
export const formSubmitLimiter = new RateLimiter(60000, 5); // 5 submissions per minute per IP
export const loginLimiter = new RateLimiter(60000, 10); // 10 login attempts per minute per IP
