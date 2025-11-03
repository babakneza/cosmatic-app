'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CartItem } from '@/types';

interface PayPalButtonProps {
    cartItems: CartItem[];
    totals: {
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
    };
    customerId: string | number;
    customer_email: string;
    shipping_address: any;
    billing_address: any;
    access_token: string;
    onSuccess: (transactionId: string, orderData: any) => void;
    onError: (error: string) => void;
    onCancel?: () => void;
    locale: 'ar' | 'en';
    isLoading?: boolean;
}

export default function PayPalButton({
    cartItems,
    totals,
    customerId,
    customer_email,
    shipping_address,
    billing_address,
    access_token,
    onSuccess,
    onError,
    onCancel,
    locale,
    isLoading = false,
}: PayPalButtonProps) {
    const t = useTranslations();
    const containerRef = useRef<HTMLDivElement>(null);
    const [sdkLoading, setSdkLoading] = useState(true);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paypalEmail, setPaypalEmail] = useState<string>(customer_email);
    const [showEmailInput, setShowEmailInput] = useState(true);
    const [emailError, setEmailError] = useState<string>('');

    // Load PayPal SDK on mount
    useEffect(() => {
        const loadPayPalSDK = async () => {
            try {
                // Check if SDK is already loaded
                if (window.paypal?.Buttons) {
                    console.log('[PayPalButton] PayPal SDK already loaded');
                    setSdkLoading(false);
                    setSdkLoaded(true);
                    return;
                }

                const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
                console.log('[PayPalButton] Client ID configured:', !!clientId);
                if (!clientId) {
                    throw new Error('PayPal Client ID is not configured');
                }

                // Load PayPal SDK
                // NOTE: Using USD currency because PayPal Sandbox does not support OMR
                // The OMR to USD conversion happens in the backend (create-order API)
                console.log('[PayPalButton] Loading PayPal SDK...');
                const script = document.createElement('script');
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&locale=${locale === 'ar' ? 'ar_EG' : 'en_US'
                    }&intent=capture&components=buttons`;
                script.async = true;

                script.onload = () => {
                    console.log('[PayPalButton] PayPal SDK loaded successfully');
                    setSdkLoading(false);
                    setSdkLoaded(true);
                };

                script.onerror = (error) => {
                    console.error('[PayPalButton] Failed to load PayPal SDK:', error);
                    onError(t('checkout.paypal_error'));
                    setSdkLoading(false);
                };

                document.head.appendChild(script);
            } catch (error: any) {
                console.error('[PayPalButton] Error loading SDK:', error);
                onError(error.message || t('checkout.paypal_error'));
                setSdkLoading(false);
            }
        };

        loadPayPalSDK();
    }, [locale, onError, t]);

    const validateEmail = (email: string): boolean => {
        return email.trim().length > 0;
    };

    const handleEmailSubmit = () => {
        const trimmedEmail = paypalEmail.trim();

        if (!trimmedEmail) {
            setEmailError(t('checkout.paypal_email_required'));
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setEmailError('Invalid input');
            return;
        }

        setEmailError('');
        setShowEmailInput(false);
    };

    // Render buttons when SDK is loaded AND container ref is available AND email form is submitted
    useEffect(() => {
        if (!sdkLoaded || showEmailInput) return;

        const renderButtons = () => {
            console.log('[PayPalButton] renderButtons called, window.paypal:', !!window.paypal?.Buttons, 'containerRef:', !!containerRef.current);
            if (!window.paypal?.Buttons || !containerRef.current) {
                console.warn('[PayPalButton] Cannot render - missing paypal SDK or container, retrying...');
                setTimeout(renderButtons, 100);
                return;
            }

            // Clear any existing buttons
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }

            const paypalButtons = window.paypal.Buttons({
                async createOrder(data: any, actions: any) {
                    try {
                        console.log('[PayPalButton] Creating PayPal order...');
                        setProcessing(true);

                        const orderPayload = {
                            items: cartItems.map((item) => ({
                                product_id: item.product.id,
                                name: item.product.name,
                                quantity: item.quantity,
                                unit_price: item.product.sale_price || item.product.price,
                            })),
                            totals,
                            customer_email: paypalEmail,
                            shipping_address,
                            billing_address,
                        };

                        console.log('[PayPalButton] Order payload:', orderPayload);

                        // Call backend to create PayPal order
                        const response = await fetch('/api/payments/paypal/create-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(orderPayload),
                        });

                        console.log('[PayPalButton] API response status:', response.status);
                        const orderData = await response.json();
                        console.log('[PayPalButton] API response data:', orderData);

                        if (!response.ok) {
                            throw new Error(orderData.error || t('checkout.paypal_error'));
                        }

                        return orderData.orderID;
                    } catch (error: any) {
                        console.error('[PayPalButton] Error creating order:', error);
                        throw error;
                    } finally {
                        setProcessing(false);
                    }
                },

                async onApprove(data: any, actions: any) {
                    try {
                        setProcessing(true);

                        // Validate customerId before sending request
                        // Accept both string and number types, convert to string if needed
                        if (!customerId || (typeof customerId !== 'string' && typeof customerId !== 'number')) {
                            console.error('[PayPalButton] Invalid customerId:', customerId, 'type:', typeof customerId);
                            throw new Error('Customer ID is not available. Please make sure you are logged in.');
                        }

                        // Convert customerId to string if it's a number
                        const customerIdStr = String(customerId);
                        console.log('[PayPalButton] Capturing with customerId:', customerIdStr);

                        // Call backend to capture PayPal order
                        const response = await fetch('/api/payments/paypal/capture-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                orderID: data.orderID,
                                customerId: customerIdStr,
                                cartItems,
                                totals,
                                customer_email: paypalEmail,
                                shipping_address,
                                billing_address,
                                accessToken: access_token,
                            }),
                        });

                        const captureData = await response.json();

                        if (!response.ok) {
                            throw new Error(captureData.error || t('checkout.paypal_error'));
                        }

                        // Success - call the onSuccess callback
                        if (captureData.transactionId) {
                            onSuccess(captureData.transactionId, captureData.orderData);
                        } else {
                            throw new Error('No transaction ID in response');
                        }
                    } catch (error: any) {
                        console.error('[PayPalButton] Error capturing order:', error);
                        onError(error.message || t('checkout.paypal_error'));
                    } finally {
                        setProcessing(false);
                    }
                },

                onError(error: any) {
                    console.error('[PayPalButton] PayPal error:', error);
                    onError(t('checkout.paypal_error'));
                    setProcessing(false);
                },

                onCancel() {
                    console.log('[PayPalButton] Payment cancelled by user');
                    if (onCancel) {
                        onCancel();
                    }
                    setProcessing(false);
                },

                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'checkout',
                },
            });

            try {
                console.log('[PayPalButton] Rendering PayPal buttons...');
                paypalButtons.render(containerRef.current);
                console.log('[PayPalButton] PayPal buttons rendered successfully');
            } catch (error) {
                console.error('[PayPalButton] Error rendering buttons:', error);
                onError(t('checkout.paypal_error'));
            }
        };

        renderButtons();
    }, [sdkLoaded, showEmailInput, paypalEmail, cartItems, totals, shipping_address, billing_address, customerId, onSuccess, onError, t]);

    if (sdkLoading || isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">{t('checkout.paypal_processing')}</span>
            </div>
        );
    }

    if (showEmailInput) {
        return (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t('checkout.paypal_email_label')}
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                        {t('checkout.paypal_email_description')}
                    </p>
                    <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => {
                            setPaypalEmail(e.target.value);
                            setEmailError('');
                        }}
                        placeholder={t('checkout.paypal_email_placeholder')}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        disabled={processing}
                    />
                    {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
                </div>
                <button
                    onClick={handleEmailSubmit}
                    disabled={processing}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {t('checkout.continue')}
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`paypal-buttons-container ${locale === 'ar' ? 'rtl' : 'ltr'} ${processing ? 'opacity-50 pointer-events-none' : ''
                }`}
        />
    );
}