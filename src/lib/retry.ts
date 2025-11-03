/**
 * Retry Utility with Exponential Backoff
 * Provides flexible retry logic for any async operation
 */

import { logger, createScopedLogger } from './logger';

/**
 * Retry options
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** Initial delay between retries in milliseconds */
    initialDelay?: number;
    /** Maximum delay between retries in milliseconds */
    maxDelay?: number;
    /** Backoff multiplier for exponential backoff */
    backoffMultiplier?: number;
    /** Whether to retry on this error */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    /** Custom error message prefix */
    errorPrefix?: string;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: () => true,
    errorPrefix: ''
};

/**
 * Retry result
 */
export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: unknown;
    attempts: number;
    totalDelay: number;
}

/**
 * Execute async function with retry logic
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000
 *   }
 * );
 *
 * if (!result.success) {
 *   console.error('Failed after retries:', result.error);
 * } else {
 *   console.log('Success:', result.result);
 * }
 * ```
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const scopedLogger = createScopedLogger(
        config.errorPrefix || 'Retry'
    );

    let totalDelay = 0;
    let lastError: unknown;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
            scopedLogger.debug(`Attempt ${attempt}/${config.maxRetries}`);
            const result = await fn();

            scopedLogger.debug(`Success on attempt ${attempt}`, {
                attempts: attempt,
                totalDelay
            });

            return {
                success: true,
                result,
                attempts: attempt,
                totalDelay
            };
        } catch (error) {
            lastError = error;

            // Check if we should retry
            if (!config.shouldRetry(error, attempt)) {
                scopedLogger.warn(
                    `Not retrying based on shouldRetry predicate`,
                    error
                );
                return {
                    success: false,
                    error,
                    attempts: attempt,
                    totalDelay
                };
            }

            // Check if we've exhausted retries
            if (attempt === config.maxRetries) {
                scopedLogger.error(
                    `Failed after ${config.maxRetries} attempts`,
                    error
                );
                return {
                    success: false,
                    error,
                    attempts: attempt,
                    totalDelay
                };
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                config.initialDelay *
                Math.pow(config.backoffMultiplier, attempt - 1),
                config.maxDelay
            );

            totalDelay += delay;

            scopedLogger.warn(
                `Attempt ${attempt} failed, retrying in ${delay}ms`,
                {
                    error:
                        error instanceof Error ? error.message : String(error)
                }
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    return {
        success: false,
        error: lastError,
        attempts: config.maxRetries,
        totalDelay
    };
}

/**
 * Retry with throwing on failure
 * Similar to withRetry but throws instead of returning result
 */
export async function withRetryThrow<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const result = await withRetry(fn, options);

    if (!result.success) {
        throw result.error;
    }

    return result.result as T;
}

/**
 * Check if error is retryable (not permanent)
 */
export function isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    // Network errors
    if (
        error.message.includes('Network') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT')
    ) {
        return true;
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return true;
    }

    // Server errors (5xx)
    if (error.message.includes('500') || error.message.includes('502')) {
        return true;
    }

    return false;
}

/**
 * Create a retry predicate for HTTP status codes
 */
export function createHttpRetryPredicate(
    retryableStatuses: number[] = [408, 429, 500, 502, 503, 504]
) {
    return (error: unknown): boolean => {
        if (error instanceof Error) {
            const statusMatch = error.message.match(/(\d{3})/);
            if (statusMatch) {
                const status = parseInt(statusMatch[1], 10);
                return retryableStatuses.includes(status);
            }
            return isRetryableError(error);
        }
        return false;
    };
}