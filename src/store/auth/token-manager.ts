/**
 * Token Manager - Handles token expiration and refresh scheduling
 * Extracted from main auth store for better code organization
 */

import { createScopedLogger } from '@/lib/logger';

const logger = createScopedLogger('TokenManager');

/** Token refresh buffer (3 minutes before actual expiration) */
export const TOKEN_REFRESH_BUFFER_MS = 3 * 60 * 1000;

/** Global token refresh timer ID */
let tokenRefreshTimerId: NodeJS.Timeout | null = null;

/**
 * Calculate token expiration time
 */
export function calculateTokenExpiration(expiresInSeconds: number): number {
    return Date.now() + expiresInSeconds * 1000;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(
    tokenExpiresAt: number | null,
    bufferMs: number = TOKEN_REFRESH_BUFFER_MS
): boolean {
    if (!tokenExpiresAt) {
        return true;
    }

    const timeUntilExpiry = tokenExpiresAt - Date.now();
    return timeUntilExpiry <= bufferMs;
}

/**
 * Get time remaining until token expiry
 */
export function getTokenTimeRemaining(
    tokenExpiresAt: number | null
): number {
    if (!tokenExpiresAt) {
        return 0;
    }

    return Math.max(0, tokenExpiresAt - Date.now());
}

/**
 * Clear token refresh timer
 */
export function clearTokenRefreshTimer(): void {
    if (tokenRefreshTimerId) {
        clearTimeout(tokenRefreshTimerId);
        tokenRefreshTimerId = null;
        logger.debug('Token refresh timer cleared');
    }
}

/**
 * Schedule token refresh
 * @param expiresInSeconds Token expiration time in seconds
 * @param onRefresh Callback to execute when token should be refreshed
 */
export function scheduleTokenRefresh(
    expiresInSeconds: number,
    onRefresh: () => void
): void {
    // Clear existing timer
    clearTokenRefreshTimer();

    // Calculate when to refresh (TOKEN_REFRESH_BUFFER_MS before expiration)
    const refreshAtMs = expiresInSeconds * 1000 - TOKEN_REFRESH_BUFFER_MS;
    const delayMs = Math.max(1000, refreshAtMs); // Minimum 1 second

    logger.debug('Scheduling token refresh', {
        expiresInSeconds,
        delayMs,
        bufferMs: TOKEN_REFRESH_BUFFER_MS
    });

    tokenRefreshTimerId = setTimeout(() => {
        logger.info('Token refresh timer triggered, refreshing token...');
        onRefresh();
    }, delayMs);
}

/**
 * Get token refresh timer status
 */
export function getTokenRefreshTimerStatus(): {
    active: boolean;
    timerId: NodeJS.Timeout | null;
} {
    return {
        active: tokenRefreshTimerId !== null,
        timerId: tokenRefreshTimerId
    };
}