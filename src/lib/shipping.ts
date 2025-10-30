import { ShippingMethod, GovernorateShipping } from '@/types';

/**
 * Available shipping methods
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
    {
        id: 'standard',
        type: 'standard',
        name: 'Standard Shipping',
        name_ar: 'الشحن العادي',
        description: 'Standard delivery service',
        description_ar: 'خدمة التوصيل العادية',
        cost: 1.5,
        available_countries: [],
        is_active: true,
        sort_order: 1,
        estimated_days_min: 3,
        estimated_days_max: 5,
    },
    {
        id: 'express',
        type: 'express',
        name: 'Express Shipping',
        name_ar: 'الشحن السريع',
        description: 'Fast delivery service',
        description_ar: 'خدمة التوصيل السريعة',
        cost: 3.0,
        available_countries: [],
        is_active: true,
        sort_order: 2,
        estimated_days_min: 1,
        estimated_days_max: 2,
    },
    {
        id: 'overnight',
        type: 'overnight',
        name: 'Overnight Shipping',
        name_ar: 'الشحن في الليل',
        description: 'Next day delivery service',
        description_ar: 'خدمة التوصيل في اليوم التالي',
        cost: 5.0,
        available_countries: [],
        is_active: true,
        sort_order: 3,
        estimated_days_min: 1,
        estimated_days_max: 1,
    },
];

/**
 * Shipping costs per governorate
 * Costs can vary based on distance and method
 */
export const GOVERNORATE_SHIPPING: GovernorateShipping[] = [
    {
        governorate: 'muscat',
        methods: {
            standard: { cost: 1.5, available: true, estimated_days: 2 },
            express: { cost: 3.0, available: true, estimated_days: 1 },
            overnight: { cost: 5.0, available: true, estimated_days: 1 },
        },
    },
    {
        governorate: 'al_batinah_north',
        methods: {
            standard: { cost: 2.0, available: true, estimated_days: 3 },
            express: { cost: 3.5, available: true, estimated_days: 2 },
            overnight: { cost: 5.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'al_batinah_south',
        methods: {
            standard: { cost: 2.0, available: true, estimated_days: 3 },
            express: { cost: 3.5, available: true, estimated_days: 2 },
            overnight: { cost: 5.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'ash_sharqiyah_north',
        methods: {
            standard: { cost: 2.5, available: true, estimated_days: 4 },
            express: { cost: 4.0, available: true, estimated_days: 2 },
            overnight: { cost: 6.0, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'ash_sharqiyah_south',
        methods: {
            standard: { cost: 3.0, available: true, estimated_days: 5 },
            express: { cost: 4.5, available: true, estimated_days: 3 },
            overnight: { cost: 6.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'ad_dakhiliyah',
        methods: {
            standard: { cost: 2.5, available: true, estimated_days: 4 },
            express: { cost: 4.0, available: true, estimated_days: 2 },
            overnight: { cost: 5.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'ad_dhahirah',
        methods: {
            standard: { cost: 3.0, available: true, estimated_days: 5 },
            express: { cost: 4.5, available: true, estimated_days: 3 },
            overnight: { cost: 6.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'al_buraimi',
        methods: {
            standard: { cost: 3.5, available: true, estimated_days: 5 },
            express: { cost: 5.0, available: false, estimated_days: undefined },
            overnight: { cost: 7.0, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'musandam',
        methods: {
            standard: { cost: 4.0, available: true, estimated_days: 6 },
            express: { cost: 6.0, available: false, estimated_days: undefined },
            overnight: { cost: 8.0, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'dhofar',
        methods: {
            standard: { cost: 4.5, available: true, estimated_days: 7 },
            express: { cost: 6.5, available: false, estimated_days: undefined },
            overnight: { cost: 8.5, available: false, estimated_days: undefined },
        },
    },
    {
        governorate: 'al_wusta',
        methods: {
            standard: { cost: 5.0, available: true, estimated_days: 7 },
            express: { cost: 7.0, available: false, estimated_days: undefined },
            overnight: { cost: 9.0, available: false, estimated_days: undefined },
        },
    },
];

/**
 * Get available shipping methods for a governorate
 * @param governorate - The governorate code
 * @returns Array of available shipping methods with costs
 */
export function getAvailableShippingMethods(governorate: string): (ShippingMethod & { cost: number })[] {
    const governorateData = GOVERNORATE_SHIPPING.find((g) => g.governorate === governorate);

    if (!governorateData) {
        // Default to standard shipping if governorate not found
        return [
            {
                ...SHIPPING_METHODS[0],
                cost: 2.0,
            },
        ];
    }

    return SHIPPING_METHODS.filter((method) => governorateData.methods[method.id]?.available).map(
        (method) => ({
            ...method,
            cost: governorateData.methods[method.id].cost,
        })
    );
}

/**
 * Get shipping cost for a specific governorate and method
 * @param governorate - The governorate code
 * @param methodId - The shipping method ID
 * @returns Shipping cost in OMR or null if not available
 */
export function getShippingCost(governorate: string, methodId: string): number | null {
    const governorateData = GOVERNORATE_SHIPPING.find((g) => g.governorate === governorate);

    if (!governorateData) {
        return 2.0; // Default cost
    }

    const method = governorateData.methods[methodId];
    if (!method || !method.available) {
        return null;
    }

    return method.cost;
}

/**
 * Free shipping threshold - orders above this amount get free standard shipping
 */
export const FREE_SHIPPING_THRESHOLD = 50.0; // 50 OMR

/**
 * Determine if free shipping is available
 * @param subtotal - Cart subtotal
 * @param methodId - Shipping method ID
 * @returns True if free shipping applies
 */
export function isFreeShippingAvailable(subtotal: number, methodId: string): boolean {
    return subtotal >= FREE_SHIPPING_THRESHOLD && methodId === 'standard';
}