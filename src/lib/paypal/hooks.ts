/**
 * PayPal Custom React Hooks
 * 
 * Provides hooks for managing PayPal payment state, including:
 * - Order creation with loading and error states
 * - Order capture with transaction tracking
 * - Payment status management
 * - Error handling with user-friendly messages
 */

import React, { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { CreatePayPalOrderRequest } from './create-order';
import { PayPalError, PayPalErrorType } from './errors';

/**
 * Payment status states
 */
export type PaymentStatus = 'idle' | 'creating' | 'created' | 'approving' | 'capturing' | 'completed' | 'error' | 'cancelled';

/**
 * Payment result
 */
export interface PaymentResult {
    success: boolean;
    orderID?: string;
    transactionId?: string;
    message?: string;
    error?: PayPalError;
}

/**
 * Hook for creating PayPal orders
 * 
 * @example
 * const { createOrder, isLoading, error, orderID } = usePayPalOrderCreation();
 * 
 * const handleOrderCreation = async (orderData) => {
 *   const result = await createOrder(orderData);
 *   if (result.success) {
 *     console.log('Order created:', result.orderID);
 *   }
 * };
 */
export function usePayPalOrderCreation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<PayPalError | null>(null);
    const [orderID, setOrderID] = useState<string | null>(null);
    const locale = useLocale() as 'ar' | 'en';

    const createOrder = useCallback(
        async (orderData: CreatePayPalOrderRequest): Promise<PaymentResult> => {
            try {
                setIsLoading(true);
                setError(null);

                // Call backend endpoint to create PayPal order
                const response = await fetch('/api/payments/paypal/create-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const paypalError = new PayPalError(
                        errorData.error || 'Failed to create PayPal order',
                        errorData.type || PayPalErrorType.API_ERROR,
                        errorData.message || 'Unable to process payment. Please try again.'
                    );
                    setError(paypalError);
                    return { success: false, error: paypalError };
                }

                const data = await response.json();
                const newOrderID = data.orderID;

                if (!newOrderID) {
                    const paypalError = new PayPalError(
                        'No order ID returned',
                        PayPalErrorType.API_ERROR,
                        'Payment system returned invalid response.'
                    );
                    setError(paypalError);
                    return { success: false, error: paypalError };
                }

                setOrderID(newOrderID);
                console.log('[PayPal Hook] Order created:', newOrderID);

                return {
                    success: true,
                    orderID: newOrderID,
                };
            } catch (err: any) {
                console.error('[PayPal Hook] Error creating order:', err);
                const paypalError = new PayPalError(
                    err.message || 'Unknown error',
                    PayPalErrorType.NETWORK_ERROR,
                    locale === 'ar'
                        ? 'حدث خطأ في الاتصال. يرجى المحاولة مجددًا.'
                        : 'Network error occurred. Please try again.'
                );
                setError(paypalError);
                return { success: false, error: paypalError };
            } finally {
                setIsLoading(false);
            }
        },
        [locale]
    );

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setOrderID(null);
    }, []);

    return {
        createOrder,
        isLoading,
        error,
        orderID,
        reset,
    };
}

/**
 * Hook for capturing PayPal orders
 * 
 * @example
 * const { captureOrder, isLoading, error } = usePayPalOrderCapture();
 * 
 * const handleCapture = async (paypalOrderId) => {
 *   const result = await captureOrder(paypalOrderId);
 *   if (result.success) {
 *     console.log('Payment captured:', result.transactionId);
 *   }
 * };
 */
export function usePayPalOrderCapture() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<PayPalError | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const locale = useLocale() as 'ar' | 'en';

    const captureOrder = useCallback(
        async (orderID: string): Promise<PaymentResult> => {
            try {
                setIsLoading(true);
                setError(null);

                // Call backend endpoint to capture PayPal order
                const response = await fetch('/api/payments/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderID }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const paypalError = new PayPalError(
                        errorData.error || 'Failed to capture payment',
                        errorData.type || PayPalErrorType.CAPTURE_ERROR,
                        errorData.message || 'Payment capture failed. Please try again.'
                    );
                    setError(paypalError);
                    return { success: false, error: paypalError };
                }

                const data = await response.json();
                const newTransactionId = data.transactionId;

                if (!newTransactionId) {
                    const paypalError = new PayPalError(
                        'No transaction ID returned',
                        PayPalErrorType.CAPTURE_ERROR,
                        'Payment was processed but confirmation failed.'
                    );
                    setError(paypalError);
                    return { success: false, error: paypalError };
                }

                setTransactionId(newTransactionId);
                console.log('[PayPal Hook] Order captured:', newTransactionId);

                return {
                    success: true,
                    transactionId: newTransactionId,
                };
            } catch (err: any) {
                console.error('[PayPal Hook] Error capturing order:', err);
                const paypalError = new PayPalError(
                    err.message || 'Unknown error',
                    PayPalErrorType.NETWORK_ERROR,
                    locale === 'ar'
                        ? 'حدث خطأ في الاتصال. يرجى المحاولة مجددًا.'
                        : 'Network error occurred. Please try again.'
                );
                setError(paypalError);
                return { success: false, error: paypalError };
            } finally {
                setIsLoading(false);
            }
        },
        [locale]
    );

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setTransactionId(null);
    }, []);

    return {
        captureOrder,
        isLoading,
        error,
        transactionId,
        reset,
    };
}

/**
 * Hook for managing full PayPal payment flow
 * 
 * Combines order creation and capture into a single hook for simplified payment handling
 * 
 * @example
 * const { status, error, processPayment, reset } = usePayPalPaymentFlow();
 * 
 * const handleApprove = async (data) => {
 *   const result = await processPayment(data.orderID);
 *   if (result.success) {
 *     // Handle successful payment
 *   }
 * };
 */
export function usePayPalPaymentFlow() {
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [error, setError] = useState<PayPalError | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const locale = useLocale() as 'ar' | 'en';
    const abortControllerRef = useRef<AbortController | null>(null);

    const processPayment = useCallback(
        async (paypalOrderID: string): Promise<PaymentResult> => {
            try {
                // Cancel any previous requests
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                setStatus('capturing');
                setError(null);

                // Capture the PayPal order
                const response = await fetch('/api/payments/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderID: paypalOrderID }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const paypalError = new PayPalError(
                        errorData.error || 'Payment capture failed',
                        errorData.type || PayPalErrorType.CAPTURE_ERROR,
                        errorData.message || 'We could not process your payment. Please try again.'
                    );
                    setError(paypalError);
                    setStatus('error');
                    return { success: false, error: paypalError };
                }

                const data = await response.json();
                const txnId = data.transactionId;

                if (!txnId) {
                    const paypalError = new PayPalError(
                        'Invalid capture response',
                        PayPalErrorType.CAPTURE_ERROR,
                        'Payment confirmation failed. Please contact support.'
                    );
                    setError(paypalError);
                    setStatus('error');
                    return { success: false, error: paypalError };
                }

                setOrderId(paypalOrderID);
                setTransactionId(txnId);
                setStatus('completed');

                console.log('[PayPal Hook] Payment flow completed:', {
                    orderId: paypalOrderID,
                    transactionId: txnId,
                });

                return {
                    success: true,
                    orderID: paypalOrderID,
                    transactionId: txnId,
                };
            } catch (err: any) {
                // Ignore abort errors (expected when cancelling)
                if (err.name === 'AbortError') {
                    console.log('[PayPal Hook] Payment processing cancelled');
                    setStatus('cancelled');
                    return { success: false, message: 'Payment cancelled' };
                }

                console.error('[PayPal Hook] Error processing payment:', err);
                const paypalError = new PayPalError(
                    err.message || 'Unknown error',
                    PayPalErrorType.NETWORK_ERROR,
                    locale === 'ar'
                        ? 'حدث خطأ في الاتصال. يرجى المحاولة مجددًا.'
                        : 'Network error occurred. Please try again.'
                );
                setError(paypalError);
                setStatus('error');
                return { success: false, error: paypalError };
            }
        },
        [locale]
    );

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
        setOrderId(null);
        setTransactionId(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setStatus('cancelled');
    }, []);

    return {
        status,
        error,
        orderId,
        transactionId,
        processPayment,
        reset,
        cancel,
        isLoading: status === 'creating' || status === 'capturing',
    };
}

/**
 * Hook for payment status polling
 * 
 * Polls payment status from the server periodically
 * Useful for monitoring payment processing in real-time
 */
export function usePaymentStatusPolling(
    orderId: string | null,
    enabled: boolean = false,
    intervalMs: number = 2000
) {
    const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const pollStatus = useCallback(async () => {
        if (!orderId) return;

        try {
            const response = await fetch(`/api/orders/${orderId}/payment-status`);
            if (!response.ok) {
                throw new Error('Failed to fetch payment status');
            }

            const data = await response.json();
            setStatus(data.status);

            if (data.status === 'completed' || data.status === 'failed') {
                // Stop polling when status is terminal
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }

            setError(null);
        } catch (err: any) {
            console.error('[PayPal Hook] Error polling status:', err);
            setError(err.message);
        }
    }, [orderId]);

    // Start polling when enabled
    const startPolling = useCallback(() => {
        if (!enabled || !orderId || intervalRef.current) {
            return;
        }

        // Poll immediately on start
        pollStatus();

        // Then set up interval
        intervalRef.current = setInterval(pollStatus, intervalMs);
    }, [enabled, orderId, pollStatus, intervalMs]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    React.useEffect(() => {
        if (enabled) {
            startPolling();
        }
        return () => {
            stopPolling();
        };
    }, [enabled, startPolling, stopPolling]);

    return {
        status,
        error,
        isPolling: !!intervalRef.current,
        startPolling,
        stopPolling,
    };
}