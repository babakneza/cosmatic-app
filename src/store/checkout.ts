import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address, ShippingMethod, PaymentMethod } from '@/types';
import { Order } from '@/types/collections';

export type CheckoutStep = 'shipping' | 'shipping_method' | 'payment' | 'review' | 'confirmation';

export interface CheckoutOrderInfo {
    id: string;
    order_number: string;
    totals: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
}

interface CheckoutState {
    step: CheckoutStep;
    shippingAddress: Address | null;
    billingAddress: Address | null;
    shippingMethod: ShippingMethod | null;
    shippingCost: number;
    paymentMethod: PaymentMethod | null;
    orderInfo: CheckoutOrderInfo | null;
    orderDetails: any; // Legacy field for confirmation page compatibility

    // Actions
    setStep: (step: CheckoutStep) => void;
    setShippingAddress: (address: Address) => void;
    setBillingAddress: (address: Address | null) => void;
    setShippingMethod: (method: ShippingMethod, cost: number) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    setOrderInfo: (id: string, orderNumber: string, totals: CheckoutOrderInfo['totals']) => void;
    resetCheckout: () => void;
}

const initialState = {
    step: 'shipping' as CheckoutStep,
    shippingAddress: null,
    billingAddress: null,
    shippingMethod: null,
    shippingCost: 0,
    paymentMethod: null,
    orderInfo: null,
    orderDetails: null,
};

export const useCheckoutStore = create<CheckoutState>()(
    persist(
        (set) => ({
            ...initialState,

            setStep: (step: CheckoutStep) => {
                set({ step });
            },

            setShippingAddress: (address: Address) => {
                set({ shippingAddress: address });
            },

            setBillingAddress: (address: Address | null) => {
                set({ billingAddress: address });
            },

            setShippingMethod: (method: ShippingMethod, cost: number) => {
                set({ shippingMethod: method, shippingCost: cost });
            },

            setPaymentMethod: (method: PaymentMethod) => {
                set({ paymentMethod: method });
            },

            setOrderInfo: (id: string, orderNumber: string, totals: CheckoutOrderInfo['totals']) => {
                set({
                    orderInfo: {
                        id,
                        order_number: orderNumber,
                        totals,
                    },
                });
            },

            resetCheckout: () => {
                set(initialState);
            },
        }),
        {
            name: 'checkout-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);