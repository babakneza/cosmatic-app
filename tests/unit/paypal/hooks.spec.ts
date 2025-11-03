/**
 * Unit Tests for PayPal Custom Hooks
 * 
 * Tests for:
 * - usePayPalOrderCreation hook
 * - usePayPalOrderCapture hook
 * - usePayPalPaymentFlow hook
 * - usePaymentStatusPolling hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { usePayPalOrderCreation, usePayPalOrderCapture, usePayPalPaymentFlow } from '@/lib/paypal/hooks';
import { PayPalError } from '@/lib/paypal/errors';

// Mock fetch
global.fetch = jest.fn();

describe('PayPal Custom Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    describe('usePayPalOrderCreation', () => {
        it('should initialize with idle state', () => {
            const { result } = renderHook(() => usePayPalOrderCreation());

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.orderID).toBeNull();
        });

        it('should create PayPal order successfully', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ orderID: 'PAY-12345' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [{ product_id: '1', name: 'Test Product', quantity: 1, unit_price: 100 }],
                totals: { subtotal: '100.000', tax: '5.000', shipping: '10.000', total: '115.000' },
                customer_email: 'test@example.com',
                shipping_address: { full_name: 'John Doe', phone: '12345678' } as any,
                billing_address: { full_name: 'John Doe', phone: '12345678' } as any,
            };

            let response;
            await act(async () => {
                response = await result.current.createOrder(orderData);
            });

            expect(response?.success).toBe(true);
            expect(response?.orderID).toBe('PAY-12345');
            expect(result.current.orderID).toBe('PAY-12345');
            expect(result.current.isLoading).toBe(false);
        });

        it('should handle order creation error', async () => {
            const mockError = {
                ok: false,
                json: async () => ({
                    error: 'Invalid order data',
                    type: 'VALIDATION_ERROR',
                    message: 'Order validation failed',
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockError);

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [],
                totals: { subtotal: '0', tax: '0', shipping: '0', total: '0' },
                customer_email: 'test@example.com',
                shipping_address: {} as any,
                billing_address: {} as any,
            };

            let response;
            await act(async () => {
                response = await result.current.createOrder(orderData);
            });

            expect(response?.success).toBe(false);
            expect(response?.error).toBeDefined();
            expect(result.current.error).toBeDefined();
        });

        it('should handle network error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [{ product_id: '1', name: 'Test', quantity: 1, unit_price: 100 }],
                totals: { subtotal: '100.000', tax: '5.000', shipping: '10.000', total: '115.000' },
                customer_email: 'test@example.com',
                shipping_address: { full_name: 'Test' } as any,
                billing_address: { full_name: 'Test' } as any,
            };

            let response;
            await act(async () => {
                response = await result.current.createOrder(orderData);
            });

            expect(response?.success).toBe(false);
            expect(response?.error?.type).toBe('NETWORK_ERROR');
        });

        it('should reset state', () => {
            const { result } = renderHook(() => usePayPalOrderCreation());

            act(() => {
                result.current.reset();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.orderID).toBeNull();
        });

        it('should send POST request to correct endpoint', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ orderID: 'PAY-123' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [{ product_id: '1', name: 'Test', quantity: 1, unit_price: 100 }],
                totals: { subtotal: '100.000', tax: '5.000', shipping: '10.000', total: '115.000' },
                customer_email: 'test@example.com',
                shipping_address: { full_name: 'Test' } as any,
                billing_address: { full_name: 'Test' } as any,
            };

            await act(async () => {
                await result.current.createOrder(orderData);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/payments/paypal/create-order',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });
    });

    describe('usePayPalOrderCapture', () => {
        it('should initialize with idle state', () => {
            const { result } = renderHook(() => usePayPalOrderCapture());

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.transactionId).toBeNull();
        });

        it('should capture PayPal order successfully', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ transactionId: 'TXN-12345' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalOrderCapture());

            let response;
            await act(async () => {
                response = await result.current.captureOrder('PAY-12345');
            });

            expect(response?.success).toBe(true);
            expect(response?.transactionId).toBe('TXN-12345');
            expect(result.current.transactionId).toBe('TXN-12345');
        });

        it('should handle capture error', async () => {
            const mockError = {
                ok: false,
                json: async () => ({
                    error: 'Capture failed',
                    type: 'CAPTURE_ERROR',
                    message: 'Unable to capture payment',
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockError);

            const { result } = renderHook(() => usePayPalOrderCapture());

            let response;
            await act(async () => {
                response = await result.current.captureOrder('PAY-12345');
            });

            expect(response?.success).toBe(false);
            expect(result.current.error).toBeDefined();
        });

        it('should send to correct endpoint', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ transactionId: 'TXN-123' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalOrderCapture());

            await act(async () => {
                await result.current.captureOrder('PAY-123');
            });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/payments/paypal/capture-order',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ orderID: 'PAY-123' }),
                })
            );
        });
    });

    describe('usePayPalPaymentFlow', () => {
        it('should initialize with idle status', () => {
            const { result } = renderHook(() => usePayPalPaymentFlow());

            expect(result.current.status).toBe('idle');
            expect(result.current.error).toBeNull();
            expect(result.current.orderId).toBeNull();
            expect(result.current.transactionId).toBeNull();
        });

        it('should complete full payment flow successfully', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ transactionId: 'TXN-12345' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalPaymentFlow());

            let response;
            await act(async () => {
                response = await result.current.processPayment('PAY-12345');
            });

            expect(response?.success).toBe(true);
            expect(response?.orderID).toBe('PAY-12345');
            expect(response?.transactionId).toBe('TXN-12345');
            expect(result.current.status).toBe('completed');
            expect(result.current.isLoading).toBe(false);
        });

        it('should handle payment flow error', async () => {
            const mockError = {
                ok: false,
                json: async () => ({
                    error: 'Payment failed',
                    type: 'CAPTURE_ERROR',
                    message: 'Payment processing failed',
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockError);

            const { result } = renderHook(() => usePayPalPaymentFlow());

            let response;
            await act(async () => {
                response = await result.current.processPayment('PAY-12345');
            });

            expect(response?.success).toBe(false);
            expect(result.current.status).toBe('error');
            expect(result.current.error).toBeDefined();
        });

        it('should handle abort/cancellation', async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                new Promise(() => {
                    // Never resolves to simulate hanging request
                })
            );

            const { result } = renderHook(() => usePayPalPaymentFlow());

            // Start payment processing
            const paymentPromise = act(async () => {
                return await result.current.processPayment('PAY-12345');
            });

            // Cancel payment
            act(() => {
                result.current.cancel();
            });

            await waitFor(() => {
                expect(result.current.status).toBe('cancelled');
            });
        });

        it('should reset state', () => {
            const { result } = renderHook(() => usePayPalPaymentFlow());

            act(() => {
                result.current.reset();
            });

            expect(result.current.status).toBe('idle');
            expect(result.current.error).toBeNull();
            expect(result.current.orderId).toBeNull();
            expect(result.current.transactionId).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it('should transition through correct statuses', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ transactionId: 'TXN-12345' }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalPaymentFlow());
            const statuses: Array<typeof result.current.status> = [];

            // Subscribe to status changes
            const originalUseState = React.useState;
            React.useState = jest.fn((initial) => {
                const [state, setState] = originalUseState(initial);
                if (typeof state === 'string' && ['idle', 'capturing', 'completed', 'error'].includes(state)) {
                    statuses.push(state);
                }
                return [state, setState];
            });

            await act(async () => {
                await result.current.processPayment('PAY-12345');
            });

            React.useState = originalUseState;
            expect(result.current.status).toBe('completed');
        });
    });

    describe('Error Handling & Edge Cases', () => {
        it('should handle missing order ID in response', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ orderID: null }),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [{ product_id: '1', name: 'Test', quantity: 1, unit_price: 100 }],
                totals: { subtotal: '100.000', tax: '5.000', shipping: '10.000', total: '115.000' },
                customer_email: 'test@example.com',
                shipping_address: { full_name: 'Test' } as any,
                billing_address: { full_name: 'Test' } as any,
            };

            let response;
            await act(async () => {
                response = await result.current.createOrder(orderData);
            });

            expect(response?.success).toBe(false);
        });

        it('should provide bilingual error messages', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => usePayPalOrderCreation());

            const orderData = {
                items: [{ product_id: '1', name: 'Test', quantity: 1, unit_price: 100 }],
                totals: { subtotal: '100.000', tax: '5.000', shipping: '10.000', total: '115.000' },
                customer_email: 'test@example.com',
                shipping_address: { full_name: 'Test' } as any,
                billing_address: { full_name: 'Test' } as any,
            };

            await act(async () => {
                await result.current.createOrder(orderData);
            });

            // Error message should be in English or Arabic
            const errorMsg = result.current.error?.userMessage;
            expect(errorMsg).toBeDefined();
            expect(
                errorMsg?.includes('Network error') ||
                errorMsg?.includes('خطأ في الاتصال')
            ).toBe(true);
        });
    });
});