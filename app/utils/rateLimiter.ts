export class RateLimiter {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) {
      const retryAfterSec = Math.ceil((this.windowMs - (now - this.timestamps[0])) / 1000);
      return { allowed: false, retryAfterSec };
    }
    this.timestamps.push(now);
    return { allowed: true, retryAfterSec: 0 };
  }

  remaining(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.limit - this.timestamps.length);
  }
}

// Shared instances — mirrors the backend limits
export const orderLimiter = new RateLimiter(30);   // 30 req/min
export const klineLimiter = new RateLimiter(20);   // 20 req/min
export const globalLimiter = new RateLimiter(100); // 100 req/min
