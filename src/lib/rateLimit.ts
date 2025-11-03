/**
 * @fileOverview API Rate Limiting Utility
 * 
 * Provides flexible rate limiting for API requests to prevent abuse, manage quota,
 * and protect backend services from overload. Features include:
 * 
 * - **Token Bucket Algorithm**: Flexible rate limiting with burst capacity
 * - **Per-Endpoint Configuration**: Different limits for different API endpoints
 * - **Client/User Tracking**: Rate limit by IP, user ID, or custom keys
 * - **Distributed-Ready**: Designed for both single-instance and multi-instance setups
 * - **Monitoring**: Detailed metrics about rate limit status
 * - **Queue Management**: Optional request queuing when limits exceeded
 * 
 * Uses token bucket algorithm where each request consumes tokens, and tokens
 * are replenished over time at a fixed rate. Requests can proceed if sufficient
 * tokens are available, enabling burst traffic while maintaining long-term limits.
 * 
 * @module lib/rateLimit
 * @requires ./logger - For structured logging
 * 
 * @example
 * // Basic usage - create a rate limiter
 * const limiter = new RateLimiter({
 *   requestsPerSecond: 10,
 *   burst: 20
 * });
 * 
 * // Check if request is allowed
 * if (!limiter.isAllowed('user-123')) {
 *   return res.status(429).json({ error: 'Too many requests' });
 * }
 * 
 * // Multiple rate limiters for different endpoints
 * const productLimiter = new RateLimiter({
 *   requestsPerSecond: 100,
 *   burst: 200,
 *   windowSize: 60000
 * });
 * 
 * const checkoutLimiter = new RateLimiter({
 *   requestsPerSecond: 1,
 *   burst: 2,
 *   windowSize: 10000
 * });
 */

import { createScopedLogger } from './logger';

/**
 * Rate limit configuration options
 * @internal
 */
export interface RateLimitConfig {
    /** Requests allowed per second (tokens per second) */
    requestsPerSecond: number;
    /** Burst capacity (maximum tokens available) */
    burst: number;
    /** Time window in milliseconds for rate limit calculation (default: 1000) */
    windowSize?: number;
    /** Whether to queue requests or reject them (default: false - reject) */
    queueRequests?: boolean;
    /** Maximum queue length when queueRequests is true (default: 100) */
    maxQueueLength?: number;
    /** Cleanup interval for inactive keys in milliseconds (default: 300000 = 5min) */
    cleanupInterval?: number;
}

/**
 * Rate limit status for a key
 * @internal
 */
interface TokenBucket {
    tokens: number;
    lastRefillTime: number;
    requestCount: number;
    rejectedCount: number;
    queue: Array<() => void>;
}

/**
 * Rate limit statistics
 */
export interface RateLimitStats {
    /** Number of keys currently tracked */
    activeKeys: number;
    /** Total requests allowed */
    allowedRequests: number;
    /** Total requests rejected */
    rejectedRequests: number;
    /** Current tokens available (for the queried key) */
    tokensAvailable?: number;
    /** Time until next token is available (for the queried key) */
    timeToNextToken?: number;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
    requestsPerSecond: 10,
    burst: 20,
    windowSize: 1000,
    queueRequests: false,
    maxQueueLength: 100,
    cleanupInterval: 300000
};

const logger = createScopedLogger('RateLimit');

/**
 * Rate Limiter using Token Bucket Algorithm
 * 
 * Implements efficient rate limiting for API endpoints. Each unique key
 * (e.g., user ID, IP address) gets its own token bucket. Tokens are
 * replenished at a fixed rate (requestsPerSecond). Requests consume
 * one token; they succeed if tokens available, otherwise fail or queue.
 * 
 * @example
 * ```typescript
 * // Create rate limiter for product search (100 req/sec with burst to 200)
 * const limiter = new RateLimiter({
 *   requestsPerSecond: 100,
 *   burst: 200,
 *   windowSize: 1000
 * });
 * 
 * // Check if request from user is allowed
 * const userId = 'user-123';
 * if (limiter.isAllowed(userId)) {
 *   // Process request
 *   await fetchProducts();
 * } else {
 *   // Return 429 Too Many Requests
 *   res.status(429).send('Rate limit exceeded');
 * }
 * 
 * // Get stats for monitoring
 * const stats = limiter.getStats(userId);
 * console.log(`User has ${stats.tokensAvailable} tokens available`);
 * 
 * // Reset a specific user (admin action)
 * limiter.reset(userId);
 * ```
 * 
 * @remarks
 * - Token bucket algorithm is fair and allows burst traffic
 * - Each key is independent; one user hitting limits doesn't affect others
 * - Uses client-side tracking only (no backend state required)
 * - Best for per-user/per-IP rate limiting in microservices
 * - For cluster deployments, consider Redis-backed rate limiting instead
 * - Cleanup runs periodically to free memory from inactive keys
 * 
 * @performance
 * - O(1) time complexity for isAllowed() check
 * - Memory grows with unique keys, cleaned up periodically
 * - Suitable for thousands of concurrent users
 */
export class RateLimiter {
    private config: Required<RateLimitConfig>;
    private buckets: Map<string, TokenBucket> = new Map();
    private totalAllowed: number = 0;
    private totalRejected: number = 0;
    private cleanupTimer?: NodeJS.Timeout;

    constructor(config: RateLimitConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanup();
    }

    /**
     * Check if a request is allowed for the given key
     * 
     * Updates token bucket, returns true if request is allowed.
     * If queueRequests is enabled and limit exceeded, queues the request
     * and returns true (caller should await the returned promise).
     * 
     * @param key - Unique identifier (user ID, IP address, etc.)
     * @returns true if request is immediately allowed, false if rejected
     * 
     * @example
     * ```typescript
     * if (limiter.isAllowed('192.168.1.1')) {
     *   // Rate limit allows request
     *   await processRequest();
     * } else {
     *   // Request exceeds rate limit
     *   return httpResponse(429, 'Too many requests');
     * }
     * ```
     */
    isAllowed(key: string): boolean {
        this.refillBucket(key);
        const bucket = this.buckets.get(key)!;

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            bucket.requestCount += 1;
            this.totalAllowed += 1;

            logger.debug(`Rate limit allowed for ${key}`, {
                tokensRemaining: bucket.tokens,
                totalAllowed: this.totalAllowed
            });

            return true;
        }

        bucket.rejectedCount += 1;
        this.totalRejected += 1;

        logger.warn(`Rate limit exceeded for ${key}`, {
            tokensAvailable: bucket.tokens,
            rejectedCount: bucket.rejectedCount,
            totalRejected: this.totalRejected
        });

        return false;
    }

    /**
     * Try to allow request with queueing support
     * 
     * When queueRequests is enabled, returns a promise that resolves
     * when either: (1) tokens available now, or (2) tokens replenished.
     * If queue is full, promise rejects immediately.
     * 
     * @param key - Unique identifier
     * @returns Promise that resolves when request can proceed
     * @throws Error if queue is full
     * 
     * @example
     * ```typescript
     * try {
     *   await limiter.allowWithQueue('user-123');
     *   // Now safe to process request
     *   await expensiveOperation();
     * } catch (err) {
     *   if (err.message.includes('Queue full')) {
     *     return httpResponse(503, 'Service busy');
     *   }
     * }
     * ```
     */
    async allowWithQueue(key: string): Promise<void> {
        if (this.isAllowed(key)) {
            return Promise.resolve();
        }

        if (!this.config.queueRequests) {
            return Promise.reject(
                new Error(`Rate limit exceeded for ${key}`)
            );
        }

        const bucket = this.ensureBucket(key);

        if (bucket.queue.length >= this.config.maxQueueLength) {
            logger.error(`Queue full for ${key}`, {
                queueLength: bucket.queue.length,
                maxLength: this.config.maxQueueLength
            });
            throw new Error(
                `Rate limit queue full for ${key} ` +
                `(${bucket.queue.length}/${this.config.maxQueueLength})`
            );
        }

        return new Promise((resolve) => {
            bucket.queue.push(resolve);
            this.processQueue(key);
        });
    }

    /**
     * Get current rate limit statistics for a key
     * 
     * Returns detailed information about token availability, request
     * counts, and time until next token replenishment.
     * 
     * @param key - Unique identifier to get stats for
     * @returns Statistics object with current state
     * 
     * @example
     * ```typescript
     * const stats = limiter.getStats('user-123');
     * 
     * if (stats.tokensAvailable! === 0) {
     *   const waitMs = stats.timeToNextToken || 0;
     *   console.log(`Rate limited. Wait ${waitMs}ms for next token`);
     * }
     * ```
     */
    getStats(key?: string): RateLimitStats {
        const stats: RateLimitStats = {
            activeKeys: this.buckets.size,
            allowedRequests: this.totalAllowed,
            rejectedRequests: this.totalRejected
        };

        if (key) {
            const bucket = this.buckets.get(key);
            if (bucket) {
                stats.tokensAvailable = Math.floor(bucket.tokens);
                const timeSinceRefill = Date.now() - bucket.lastRefillTime;
                const refillRate =
                    (this.config.requestsPerSecond * this.config.windowSize) / 1000;
                const nextTokenTime = Math.max(
                    0,
                    (1 - bucket.tokens) / (refillRate / this.config.windowSize)
                );
                stats.timeToNextToken = Math.ceil(nextTokenTime);
            }
        }

        return stats;
    }

    /**
     * Reset rate limit for a specific key
     * 
     * Clears tokens, counters, and queue for the given key.
     * Useful for admin operations or after user unblocks.
     * 
     * @param key - Unique identifier to reset
     * 
     * @example
     * ```typescript
     * // Admin resets rate limit for user who hit quota by mistake
     * app.post('/admin/reset-rate-limit/:userId', (req, res) => {
     *   limiter.reset(req.params.userId);
     *   res.json({ message: 'Rate limit reset' });
     * });
     * ```
     */
    reset(key: string): void {
        this.buckets.delete(key);
        logger.info(`Rate limit reset for ${key}`);
    }

    /**
     * Reset all rate limiters
     * 
     * Clears all tracked keys, tokens, and statistics.
     * Useful for testing or emergency reset.
     */
    resetAll(): void {
        this.buckets.clear();
        this.totalAllowed = 0;
        this.totalRejected = 0;
        logger.warn('All rate limiters reset');
    }

    /**
     * Refill tokens in bucket based on elapsed time
     * @internal
     */
    private refillBucket(key: string): void {
        const bucket = this.ensureBucket(key);
        const now = Date.now();
        const timePassed = now - bucket.lastRefillTime;

        // Calculate tokens to add based on time passed
        const tokensPerMs =
            this.config.requestsPerSecond / this.config.windowSize;
        const tokensToAdd = timePassed * tokensPerMs;

        bucket.tokens = Math.min(
            this.config.burst,
            bucket.tokens + tokensToAdd
        );
        bucket.lastRefillTime = now;
    }

    /**
     * Ensure bucket exists for key, create if needed
     * @internal
     */
    private ensureBucket(key: string): TokenBucket {
        if (!this.buckets.has(key)) {
            this.buckets.set(key, {
                tokens: this.config.burst,
                lastRefillTime: Date.now(),
                requestCount: 0,
                rejectedCount: 0,
                queue: []
            });

            logger.debug(`Created new rate limit bucket for ${key}`, {
                initialTokens: this.config.burst,
                activeKeys: this.buckets.size
            });
        }

        return this.buckets.get(key)!;
    }

    /**
     * Process queued requests when tokens become available
     * @internal
     */
    private processQueue(key: string): void {
        const bucket = this.buckets.get(key);
        if (!bucket || bucket.queue.length === 0) {
            return;
        }

        // Check if we can process any queued requests
        const timerId = setInterval(() => {
            this.refillBucket(key);

            while (bucket.tokens >= 1 && bucket.queue.length > 0) {
                bucket.tokens -= 1;
                bucket.requestCount += 1;
                this.totalAllowed += 1;

                const callback = bucket.queue.shift();
                callback?.();

                logger.debug(`Processed queued request for ${key}`, {
                    queueRemaining: bucket.queue.length,
                    tokensRemaining: bucket.tokens
                });
            }

            if (bucket.queue.length === 0) {
                clearInterval(timerId);
            }
        }, 10); // Check every 10ms for queued requests
    }

    /**
     * Start periodic cleanup of inactive keys
     * @internal
     */
    private startCleanup(): void {
        this.cleanupTimer = setInterval(() => {
            const now = Date.now();
            let cleaned = 0;

            for (const [key, bucket] of this.buckets.entries()) {
                // Remove if no activity for cleanup interval
                if (
                    bucket.requestCount === 0 &&
                    now - bucket.lastRefillTime > this.config.cleanupInterval
                ) {
                    this.buckets.delete(key);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                logger.debug(`Cleaned up ${cleaned} inactive rate limit buckets`, {
                    remainingBuckets: this.buckets.size
                });
            }
        }, this.config.cleanupInterval);
    }

    /**
     * Destroy the rate limiter and cleanup timers
     * Call this when rate limiter is no longer needed (e.g., app shutdown)
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.buckets.clear();
        logger.debug('Rate limiter destroyed');
    }
}

/**
 * Create predefined rate limiters for common use cases
 * 
 * @example
 * ```typescript
 * // Product search - high throughput, burst-friendly
 * const searchLimiter = createRateLimiters().search;
 * 
 * // Checkout - strict limits, no bursts
 * const checkoutLimiter = createRateLimiters().checkout;
 * 
 * // API general - moderate limits
 * const apiLimiter = createRateLimiters().api;
 * ```
 */
export function createRateLimiters() {
    return {
        /**
         * Product search - 100 req/sec with burst to 200
         * Allows rapid browsing and filtering
         */
        search: new RateLimiter({
            requestsPerSecond: 100,
            burst: 200,
            windowSize: 1000
        }),

        /**
         * Checkout process - 1 req/sec, small burst
         * Prevents checkout abuse and accidental double-submits
         */
        checkout: new RateLimiter({
            requestsPerSecond: 1,
            burst: 2,
            windowSize: 10000
        }),

        /**
         * General API - 50 req/sec with moderate burst
         * For typical API operations like list, filter
         */
        api: new RateLimiter({
            requestsPerSecond: 50,
            burst: 100,
            windowSize: 1000
        }),

        /**
         * Authentication - 5 attempts per minute
         * Prevents brute force login attacks
         */
        auth: new RateLimiter({
            requestsPerSecond: 5 / 60,
            burst: 3,
            windowSize: 60000
        }),

        /**
         * Customer data - 10 req/sec
         * For customer profile, address, wishlist operations
         */
        customer: new RateLimiter({
            requestsPerSecond: 10,
            burst: 20,
            windowSize: 1000
        })
    };
}