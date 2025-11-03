/**
 * PayPal Payment Monitoring & Analytics
 * Tracks payment events, metrics, and failures for monitoring and debugging
 */

import { createScopedLogger } from '@/lib/logger';

const logger = createScopedLogger('PayPal Monitoring');

/**
 * Payment event types for tracking
 */
export enum PaymentEventType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_APPROVED = 'ORDER_APPROVED',
    ORDER_CAPTURED = 'ORDER_CAPTURED',
    ORDER_FAILED = 'ORDER_FAILED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    PAYMENT_ERROR = 'PAYMENT_ERROR',
    API_CALL_SUCCESS = 'API_CALL_SUCCESS',
    API_CALL_FAILED = 'API_CALL_FAILED',
}

/**
 * Payment metrics aggregator
 */
interface PaymentMetrics {
    totalOrders: number;
    successfulPayments: number;
    failedPayments: number;
    averagePaymentAmount: number;
    averageProcessingTime: number;
    errorsByType: Record<string, number>;
    retryCount: number;
}

/**
 * In-memory metrics store (replace with proper DB/analytics service in production)
 */
let metricsStore: PaymentMetrics = {
    totalOrders: 0,
    successfulPayments: 0,
    failedPayments: 0,
    averagePaymentAmount: 0,
    averageProcessingTime: 0,
    errorsByType: {},
    retryCount: 0,
};

/**
 * Track a payment event
 */
export function trackPaymentEvent(
    eventType: PaymentEventType,
    data: {
        orderId?: string;
        amount?: number;
        customerId?: string;
        errorType?: string;
        processingTime?: number;
        context?: Record<string, any>;
    }
): void {
    const timestamp = new Date().toISOString();

    logger.info(`Payment Event: ${eventType}`, {
        timestamp,
        orderId: data.orderId,
        amount: data.amount,
        customerId: data.customerId,
        errorType: data.errorType,
        processingTime: data.processingTime,
    });

    // Update metrics
    updateMetrics(eventType, data);

    // In production, send to external monitoring service (e.g., DataDog, New Relic, Sentry)
    // Example: sendToMonitoringService({ eventType, timestamp, data });
}

/**
 * Update in-memory metrics
 */
function updateMetrics(
    eventType: PaymentEventType,
    data: Record<string, any>
): void {
    switch (eventType) {
        case PaymentEventType.ORDER_CREATED:
            metricsStore.totalOrders++;
            if (data.amount) {
                metricsStore.averagePaymentAmount =
                    (metricsStore.averagePaymentAmount * (metricsStore.totalOrders - 1) +
                        data.amount) /
                    metricsStore.totalOrders;
            }
            break;

        case PaymentEventType.ORDER_CAPTURED:
            metricsStore.successfulPayments++;
            if (data.processingTime) {
                metricsStore.averageProcessingTime =
                    (metricsStore.averageProcessingTime * (metricsStore.successfulPayments - 1) +
                        data.processingTime) /
                    metricsStore.successfulPayments;
            }
            break;

        case PaymentEventType.ORDER_FAILED:
        case PaymentEventType.PAYMENT_ERROR:
            metricsStore.failedPayments++;
            if (data.errorType) {
                metricsStore.errorsByType[data.errorType] =
                    (metricsStore.errorsByType[data.errorType] || 0) + 1;
            }
            break;

        case PaymentEventType.API_CALL_FAILED:
            if (data.errorType) {
                metricsStore.errorsByType[data.errorType] =
                    (metricsStore.errorsByType[data.errorType] || 0) + 1;
            }
            break;
    }
}

/**
 * Get current metrics snapshot
 */
export function getMetricsSnapshot(): PaymentMetrics {
    return { ...metricsStore };
}

/**
 * Get payment success rate
 */
export function getSuccessRate(): number {
    if (metricsStore.totalOrders === 0) return 0;
    return (metricsStore.successfulPayments / metricsStore.totalOrders) * 100;
}

/**
 * Get payment failure rate
 */
export function getFailureRate(): number {
    if (metricsStore.totalOrders === 0) return 0;
    return (metricsStore.failedPayments / metricsStore.totalOrders) * 100;
}

/**
 * Get most common error types
 */
export function getMostCommonErrors(limit: number = 5): Array<[string, number]> {
    return Object.entries(metricsStore.errorsByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

/**
 * Log monitoring summary (useful for debugging and monitoring)
 */
export function logMonitoringSummary(): void {
    const successRate = getSuccessRate();
    const failureRate = getFailureRate();
    const commonErrors = getMostCommonErrors();

    logger.info('Payment Monitoring Summary', {
        totalOrders: metricsStore.totalOrders,
        successfulPayments: metricsStore.successfulPayments,
        failedPayments: metricsStore.failedPayments,
        successRate: `${successRate.toFixed(2)}%`,
        failureRate: `${failureRate.toFixed(2)}%`,
        averagePaymentAmount: `${metricsStore.averagePaymentAmount.toFixed(3)} OMR`,
        averageProcessingTime: `${metricsStore.averageProcessingTime.toFixed(0)}ms`,
        retryCount: metricsStore.retryCount,
        mostCommonErrors: commonErrors,
    });
}

/**
 * Reset metrics (useful for testing)
 */
export function resetMetrics(): void {
    metricsStore = {
        totalOrders: 0,
        successfulPayments: 0,
        failedPayments: 0,
        averagePaymentAmount: 0,
        averageProcessingTime: 0,
        errorsByType: {},
        retryCount: 0,
    };
    logger.info('Metrics reset');
}

/**
 * Track API call with retry logic
 */
export function trackApiCall(
    endpoint: string,
    success: boolean,
    data?: {
        duration?: number;
        status?: number;
        errorType?: string;
        retries?: number;
    }
): void {
    const eventType = success
        ? PaymentEventType.API_CALL_SUCCESS
        : PaymentEventType.API_CALL_FAILED;

    logger.info(`PayPal API Call: ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`, {
        duration: data?.duration,
        status: data?.status,
        errorType: data?.errorType,
        retries: data?.retries,
    });

    if (!success && data?.retries) {
        metricsStore.retryCount += data.retries;
    }
}

/**
 * Alert on critical issues (to be integrated with alerting service)
 */
export function alertOnCriticalIssue(
    issue: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
): void {
    logger.error(`CRITICAL ALERT [${severity.toUpperCase()}]: ${issue}`, context);

    // In production, integrate with alerting service:
    // - PagerDuty for critical issues
    // - Slack/Teams notifications
    // - Email alerts
    // - Example: sendAlert({ issue, severity, context, timestamp: new Date() });
}

/**
 * Check if payment metrics indicate issues
 */
export function checkMetricsHealth(): Array<string> {
    const issues: string[] = [];

    if (metricsStore.totalOrders > 0) {
        const failureRate = getFailureRate();
        if (failureRate > 5) {
            issues.push(
                `High failure rate: ${failureRate.toFixed(2)}% (threshold: 5%)`
            );
        }
    }

    if (metricsStore.averageProcessingTime > 5000) {
        issues.push(
            `High average processing time: ${metricsStore.averageProcessingTime.toFixed(0)}ms (threshold: 5000ms)`
        );
    }

    const criticalErrors = Object.entries(metricsStore.errorsByType)
        .filter(([, count]) => count > 5)
        .map(([errorType]) => errorType);

    if (criticalErrors.length > 0) {
        issues.push(
            `Repeated errors detected: ${criticalErrors.join(', ')}`
        );
    }

    return issues;
}