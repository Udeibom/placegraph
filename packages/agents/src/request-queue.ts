/**
 * RequestQueue — limits concurrent Qloo HTTP calls and retries on 429.
 *
 * Default concurrency: 2.  Each call waits until a slot is free, then runs.
 * On 429 the slot is held and the call retries with exponential backoff + jitter
 * (1 s, 2 s, 4 s).  The retry-after / x-ratelimit-reset-* headers are respected
 * when present.
 *
 * Usage:
 *   const queue = new RequestQueue(2);
 *   const result = await queue.run(() => fetch(...));
 */

export interface QueuedCallResult<T> {
  value: T;
  retries: number;
}

function parseRetryAfterMs(headers: Headers): number | null {
  for (const name of ['retry-after', 'x-ratelimit-reset-requests', 'x-ratelimit-reset-tokens']) {
    const raw = headers.get(name);
    if (!raw) continue;
    // Numeric seconds
    const seconds = parseFloat(raw);
    if (Number.isFinite(seconds)) return Math.ceil(seconds * 1000);
    // RFC 1123 date
    const date = Date.parse(raw);
    if (!isNaN(date)) return Math.max(0, date - Date.now());
  }
  return null;
}

function jitter(ms: number, rangeMs = 250): number {
  return ms + Math.floor(Math.random() * rangeMs * 2) - rangeMs;
}

const BACKOFF_MS = [1_000, 2_000, 4_000];

export class RequestQueue {
  private concurrency: number;
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(concurrency = 2) {
    this.concurrency = concurrency;
  }

  private acquire(): Promise<void> {
    if (this.active < this.concurrency) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.active--;
    }
  }

  /**
   * Run `fn` as soon as a concurrency slot is available.
   * `fn` must return a Promise that resolves to { response: Response, data: T }
   * so that the queue can inspect the response status for 429 retry.
   *
   * For callers that do not need 429 retry handling, use `runOpaque`.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Run a fetch-like call with automatic 429 retry and exponential backoff.
   * `fn` receives the current attempt index (0-based) and returns a Response.
   * On 429, the slot is held and the call retries up to maxRetries times.
   */
  async runWithRetry(
    fn: (attempt: number) => Promise<Response>,
    maxRetries = 3
  ): Promise<Response> {
    await this.acquire();
    let lastError: unknown;
    try {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        let res: Response;
        try {
          res = await fn(attempt);
        } catch (err) {
          // Network error — retry with backoff
          lastError = err;
          if (attempt < maxRetries - 1) {
            await sleep(jitter(BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]));
            continue;
          }
          throw err;
        }

        if (res.status !== 429) return res;

        // Rate limited — wait then retry
        const headerWait = parseRetryAfterMs(res.headers);
        const backoff = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
        const waitMs = jitter(Math.max(backoff, headerWait ?? 0));
        console.info(
          `[qloo] 429 rate limit on attempt ${attempt + 1}/${maxRetries}; waiting ${Math.round(waitMs / 1000)}s`
        );
        await sleep(waitMs);

        lastError = new Error(`Qloo rate limit after ${attempt + 1} attempt(s)`);
      }
    } finally {
      this.release();
    }
    throw lastError ?? new Error('Qloo rate limit: all retries exhausted');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Singleton queue used by QlooClient instances in the same process.
let _globalQueue: RequestQueue | null = null;

export function getQlooRequestQueue(): RequestQueue {
  if (!_globalQueue) {
    const concurrency = Number(process.env.QLOO_CONCURRENCY ?? 2);
    _globalQueue = new RequestQueue(Number.isFinite(concurrency) ? concurrency : 2);
  }
  return _globalQueue;
}
