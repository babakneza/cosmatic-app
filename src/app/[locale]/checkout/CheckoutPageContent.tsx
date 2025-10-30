'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useCheckoutStore, CheckoutStep } from '@/store/checkout';
import { Address, PaymentMethod, ShippingMethod, Locale } from '@/types';
import { CheckoutProgress, ShippingAddressForm, ShippingMethodSelector, PaymentMethodSelector, OrderReview } from '@/components/checkout';
import { calculateCartTotals } from '@/lib/currency';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { createOrder } from '@/lib/api/orders';
import { getCountryName } from '@/lib/api/countries';

interface CheckoutPageContentProps {
    locale: Locale;
}

export default function CheckoutPageContent({ locale }: CheckoutPageContentProps): React.ReactElement {
    // Ensure locale is properly typed as Locale
    const typedLocale: Locale = locale as Locale;
    const router = useRouter();
    const t = useTranslations();
    const isArabic = locale === 'ar';
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirectingToConfirmation, setIsRedirectingToConfirmation] = useState(false);

    // Auth store
    const { user, access_token, refreshTokenIfNeeded, isTokenExpired } = useAuth();

    // Load customer data
    const { customer, addresses, isLoading: isLoadingCustomer, error: customerError, refreshAddresses } = useCheckoutData();

    // Cart store
    const cartItems = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);

    // Checkout store
    const step = useCheckoutStore((state) => state.step);
    const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
    const billingAddress = useCheckoutStore((state) => state.billingAddress);
    const shippingMethod = useCheckoutStore((state) => state.shippingMethod);
    const shippingCost = useCheckoutStore((state) => state.shippingCost);
    const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
    const setStep = useCheckoutStore((state) => state.setStep);
    const setShippingAddress = useCheckoutStore((state) => state.setShippingAddress);
    const setBillingAddress = useCheckoutStore((state) => state.setBillingAddress);
    const setShippingMethod = useCheckoutStore((state) => state.setShippingMethod);
    const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
    const setOrderInfo = useCheckoutStore((state) => state.setOrderInfo);
    const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

    // ====== HOOKS SECTION - ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS ======

    // Initialize checkout state if starting a fresh checkout
    // Only reset if step is stuck at a FINAL state (confirmation from previous order)
    useEffect(() => {
        if (cartItems.length === 0) {
            return; // Cart redirect will handle this
        }

        // Only reset if step is at 'confirmation' (shouldn't appear on a fresh visit)
        // This happens when user adds new items and comes back after completing an order
        // NOTE: 'review' is a legitimate checkout step, so we should NOT reset on it
        if (step === 'confirmation') {
            resetCheckout();
            setStep('shipping');
            return;
        }
    }, [cartItems.length, step]);

    // Redirect to cart if no items (use useEffect to avoid render-phase state updates)
    // But don't redirect if we're currently redirecting to confirmation page
    useEffect(() => {
        if (cartItems.length === 0 && !isRedirectingToConfirmation) {
            router.push(`/${locale}/cart`);
        }
    }, [cartItems.length, locale, router, isRedirectingToConfirmation]);

    // Memoize to prevent infinite useEffect loops in child components
    const handleShippingMethodSelect = useCallback((method: ShippingMethod, cost: number) => {
        setShippingMethod(method, cost);
    }, [setShippingMethod]);

    // Memoize handleShippingMethodContinue to prevent infinite loops
    const handleShippingMethodContinue = useCallback(() => {
        const currentShippingMethod = useCheckoutStore.getState().shippingMethod;
        if (currentShippingMethod) {
            setStep('payment');
        }
    }, [setStep]);

    // ====== END HOOKS SECTION ======

    // Memoize cart totals to prevent infinite loops in child components
    // Only recalculate when cartItems or shippingCost changes
    const itemsData = useMemo(() =>
        cartItems.map((item) => ({
            price: item.product.sale_price || item.product.price,
            quantity: item.quantity,
        })),
        [cartItems]
    );

    const totals = useMemo(() =>
        calculateCartTotals(itemsData, shippingCost, 0),
        [itemsData, shippingCost]
    );

    // Get default address from customer or first saved address
    const defaultAddress = customer?.default_shipping
        ? addresses.find((addr) => addr.id === customer.default_shipping)
        : addresses.length > 0
            ? addresses[0]
            : null;

    // Pre-fill with customer data and default address (using CheckoutAddress format)
    const initialCheckoutAddress = defaultAddress
        ? {
            first_name: defaultAddress.first_name || '',
            last_name: defaultAddress.last_name || '',
            phone: customer?.phone || '',
            email: user?.email || '',
            type: defaultAddress.type || 'shipping',
            company: defaultAddress.company || '',
            address_line_1: defaultAddress.address_line_1 || '',
            address_line_2: defaultAddress.address_line_2 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            postal_code: defaultAddress.postal_code || '',
            country: defaultAddress.country || 'OM',
        }
        : undefined;

    // Show error if customer data not loaded
    if (!isLoadingCustomer && !customer) {
        return (
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h2 className="text-xl font-bold text-red-800 mb-2">{t('checkout.error_title')}</h2>
                <p className="text-red-700 mb-4">{customerError || t('checkout.error_loading_customer')}</p>
                <button
                    onClick={() => router.push(`/${locale}`)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                >
                    {t('checkout.return_home')}
                </button>
            </div>
        );
    }

    if (isLoadingCustomer) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-700">{t('checkout.loading_customer_data')}</span>
                </div>
            </div>
        );
    }

    const handleShippingSubmit = (address: Address) => {
        console.log('[Checkout] handleShippingSubmit received address:', {
            country_id: address.country_id,
            country_name: address.country_name,
            country: address.country,
            fullAddress: address
        });
        setShippingAddress(address);
        setStep('shipping_method');
    };

    const handlePaymentSubmit = (method: PaymentMethod) => {
        setPaymentMethod(method);
        setStep('review');
    };

    const handleOrderConfirm = async () => {
        if (!shippingAddress || !shippingMethod || !paymentMethod) return;
        if (!customer || !user || !access_token) {
            alert(t('checkout.error_auth_required'));
            return;
        }

        setIsLoading(true);
        try {
            // Proactively refresh token before critical operation
            // Don't wait for it to expire - ensure it's fresh
            try {
                await refreshTokenIfNeeded();
            } catch (refreshError) {
                // Continue - token might still be valid
            }

            // Get the current access token (might be refreshed)
            let currentToken = useAuth.getState().access_token;
            if (!currentToken) {
                throw new Error('Failed to obtain valid authentication token');
            }

            // Final check - if token is nearly expired, wait a moment for refresh
            if (isTokenExpired()) {
                // Wait up to 3 seconds for token to be refreshed
                for (let i = 0; i < 30; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    currentToken = useAuth.getState().access_token;
                    if (currentToken && !isTokenExpired()) {
                        break;
                    }
                }

                if (!currentToken) {
                    throw new Error('Failed to obtain valid authentication token after refresh');
                }
            }

            // Prepare order items
            const orderItems = cartItems.map((item) => ({
                product: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.sale_price || item.product.price,
                line_total: (item.product.sale_price || item.product.price) * item.quantity,
            }));

            // Convert addresses to JSON format
            const shippingAddressJson = {
                full_name: shippingAddress.full_name,
                phone: shippingAddress.phone,
                email: shippingAddress.email,
                governorate: shippingAddress.governorate,
                wilayat: shippingAddress.wilayat,
                street_address: shippingAddress.street_address,
                building: shippingAddress.building,
                floor: shippingAddress.floor,
                apartment: shippingAddress.apartment,
                postal_code: shippingAddress.postal_code,
                additional_info: shippingAddress.additional_info,
            };

            const billingAddressJson = billingAddress
                ? {
                    full_name: billingAddress.full_name,
                    phone: billingAddress.phone,
                    email: billingAddress.email,
                    governorate: billingAddress.governorate,
                    wilayat: billingAddress.wilayat,
                    street_address: billingAddress.street_address,
                    building: billingAddress.building,
                    floor: billingAddress.floor,
                    apartment: billingAddress.apartment,
                    postal_code: billingAddress.postal_code,
                    additional_info: billingAddress.additional_info,
                }
                : shippingAddressJson;

            // Create order in Directus with automatic retry on 401
            let order;
            let createOrderAttempt = 0;
            const maxAttempts = 2;

            while (createOrderAttempt < maxAttempts) {
                try {
                    createOrderAttempt++;
                    const tokenForAttempt = useAuth.getState().access_token;

                    if (!customer.id) {
                        throw new Error('Customer ID is required to create an order');
                    }
                    if (!tokenForAttempt) {
                        throw new Error('Authentication token is required to create an order');
                    }

                    order = await createOrder(customer.id, tokenForAttempt, {
                        customer_email: shippingAddress.email,
                        shipping_address: shippingAddressJson,
                        billing_address: billingAddressJson,
                        items: orderItems,
                        subtotal: totals.subtotal,
                        tax_rate: 0,
                        tax_amount: totals.tax,
                        shipping_cost: totals.shipping,
                        discount_amount: 0,
                        total: totals.total,
                        payment_method: paymentMethod?.type || paymentMethod?.id || 'cash_on_delivery',
                    });

                    break; // Success - exit retry loop
                } catch (orderError: any) {
                    // Check if it's a 401 token error and we have more attempts
                    if (orderError.response?.status === 401 && createOrderAttempt < maxAttempts) {
                        // Refresh token and retry once
                        try {
                            await refreshTokenIfNeeded();
                            // Give the new token a moment to settle
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (refreshErr) {
                            console.error('[Checkout] Token refresh failed on retry:', refreshErr);
                            throw orderError; // Re-throw original error
                        }
                    } else {
                        throw orderError; // Re-throw - either not a 401 or we're out of attempts
                    }
                }
            }

            // Ensure order was created successfully
            if (!order) {
                throw new Error('Failed to create order after multiple attempts');
            }

            // Store order details
            setOrderInfo(order.id, order.order_number, {
                subtotal: totals.subtotal,
                shipping: totals.shipping,
                tax: totals.tax,
                total: totals.total,
            });

            // CRITICAL FIX: Set flag BEFORE clearing cart to prevent redirect to /cart
            setIsRedirectingToConfirmation(true);

            // Clear cart first
            clearCart();

            // NOTE: Do NOT reset checkout state immediately
            // This prevents the UI from showing step 1 before confirmation redirect
            // The checkout store will be reset on the next successful checkout flow

            // Navigate to confirmation page
            router.push(`/${locale}/checkout/confirmation?orderId=${order.id}&orderNumber=${order.order_number}`);
        } catch (error: any) {
            console.error('[Checkout] Order creation failed:', error);

            // Check if it's a token/auth error - these are handled by the login modal
            const isTokenError = error.type === 'TOKEN_EXPIRED' ||
                error.handled === true ||
                error._silent === true ||
                error.response?.status === 401 ||
                error.message?.toLowerCase().includes('token') ||
                error.message?.toLowerCase().includes('unauthorized') ||
                error.message?.toLowerCase().includes('login modal');

            if (isTokenError) {
                console.log('[Checkout] Token/auth error handled silently - login modal will be shown by interceptor');
                // Silent handling - login modal is already shown or will be shown
            } else {
                // Only show alert for non-token errors
                alert(error.message || t('errors.something_went_wrong'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'shipping_method') {
            setStep('shipping');
        } else if (step === 'payment') {
            setStep('shipping_method');
        } else if (step === 'review') {
            setStep('payment');
        }
    };

    const handleProgressClick = (clickedStep: CheckoutStep) => {
        // Allow navigation to any completed step or current step
        // We can navigate back to previous steps that are already completed
        const steps: CheckoutStep[] = ['shipping', 'shipping_method', 'payment', 'review'];
        const currentIndex = steps.indexOf(step);
        const clickedIndex = steps.indexOf(clickedStep);

        if (clickedIndex <= currentIndex) {
            setStep(clickedStep);
        }
    };

    return (
        <div className={isArabic ? 'text-right' : 'text-left'}>
            {/* Progress Indicator */}
            <CheckoutProgress currentStep={step} locale={locale} onStepClick={handleProgressClick} />

            {/* Step Content */}
            <div className="bg-white rounded-lg p-6 lg:p-8 border border-gray-200 mb-8">
                {step === 'shipping' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.step_address')}</h2>
                        <ShippingAddressForm
                            initialAddress={shippingAddress ?? undefined}
                            savedAddresses={addresses}
                            customer={customer}
                            userEmail={user?.email}
                            locale={locale}
                            onSubmit={handleShippingSubmit}
                            isLoading={isLoading}
                            accessToken={access_token || undefined}
                            onAddressUpdated={refreshAddresses}
                        />
                    </div>
                )}

                {step === 'shipping_method' && shippingAddress && (
                    <div>
                        {/* Dynamic Title with Location Info */}
                        <div className={`mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('checkout.shipping_methods_available')}
                                {shippingAddress.country_name && `, ${shippingAddress.country_name}`}
                                {!shippingAddress.country_name && shippingAddress.country_id && `, ${getCountryName(shippingAddress.country_id, locale) || shippingAddress.country_id}`}
                            </h2>
                            <p className="text-sm text-gray-600 mt-2">{t('checkout.select_shipping_option')}</p>
                        </div>
                        <div className="space-y-6">
                            <ShippingMethodSelector
                                address={shippingAddress}
                                locale={locale}
                                selectedMethod={shippingMethod || undefined}
                                onSelect={handleShippingMethodSelect}
                                onContinue={handleShippingMethodContinue}
                                isLoading={isLoading}
                                cartSubtotal={totals.subtotal}
                            />

                            {/* Back Button */}
                            <div className={`flex gap-4 pt-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                <button
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {t('checkout.back')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'payment' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.step_payment')}</h2>
                        <div className="space-y-6">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod || undefined}
                                onSelect={(method) => {
                                    console.log('[Checkout] Payment method selected:', method.id);
                                    setPaymentMethod(method);
                                }}
                                onSubmit={() => {
                                    const currentPaymentMethod = useCheckoutStore.getState().paymentMethod;
                                    console.log('[Checkout] Payment method confirmed:', currentPaymentMethod?.id, '- advancing to review');
                                    if (currentPaymentMethod) {
                                        setStep('review');
                                    } else {
                                        console.warn('[Checkout] Cannot advance - no payment method selected');
                                    }
                                }}
                                locale={locale}
                                isLoading={isLoading}
                            />

                            {/* Back Button */}
                            <div className={`flex gap-4 pt-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                <button
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {t('checkout.back')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'review' && shippingAddress && shippingMethod && paymentMethod && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.step_review')}</h2>
                        <OrderReview
                            items={cartItems}
                            shippingAddress={shippingAddress}
                            billingAddress={billingAddress || undefined}
                            shippingMethod={shippingMethod}
                            paymentMethod={paymentMethod}
                            totals={{
                                subtotal: totals.subtotal,
                                shipping: totals.shipping,
                                tax: totals.tax,
                                total: totals.total,
                            }}
                            locale={typedLocale}
                            onEdit={(section) => {
                                if (section === 'address') setStep('shipping');
                                else if (section === 'shipping') setStep('shipping_method');
                                else if (section === 'payment') setStep('payment');
                            }}
                            onConfirm={handleOrderConfirm}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}