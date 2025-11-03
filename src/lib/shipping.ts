/**
 * @fileOverview Shipping Configuration and Utilities
 * 
 * Centralized shipping configuration including:
 * - Predefined shipping methods (Standard, Express, Overnight)
 * - Governorate-specific shipping costs and availability
 * - Free shipping threshold
 * - Utilities for calculating shipping costs and availability
 * 
 * @module lib/shipping
 * @requires @/types - Type definitions for ShippingMethod and GovernorateShipping
 * 
 * @remarks
 * All prices in Omani Rial (OMR). Supports 11 Omani governorates.
 * Some remote areas have limited shipping method availability.
 */

import { ShippingMethod, GovernorateShipping } from '@/types';

/**
 * Available shipping methods
 * 
 * Predefined shipping service types available throughout Oman.
 * Each method has estimated delivery time and cost information.
 * 
 * @constant
 * @type {ShippingMethod[]}
 * 
 * @remarks
 * - Standard: 3-5 days, most cost-effective option (1.5 OMR)
 * - Express: 1-2 days, faster delivery (3.0 OMR)
 * - Overnight: Next day delivery, premium service (5.0 OMR)
 * 
 * These are base costs that may be adjusted per governorate.
 * All methods sorted by delivery speed (slowest to fastest).
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
 * Governorate-specific shipping configuration
 * 
 * Defines available shipping methods, costs, and delivery times for each
 * of the 11 governorates in Oman. Costs vary based on distance and accessibility.
 * Some remote areas may have limited method availability (e.g., no overnight).
 * 
 * @constant
 * @type {GovernorateShipping[]}
 * 
 * @remarks
 * Includes all 11 Omani governorates:
 * - Muscat (capital, best availability)
 * - Al Batinah North & South
 * - Al Sharqiyah North & South  
 * - Ad Dakhiliyah
 * - Ad Dhahirah
 * - Al Buraimi
 * - Musandam
 * - Dhofar
 * - Al Wusta (most remote, limited options)
 * 
 * Remote areas (Al Buraimi, Musandam, Dhofar, Al Wusta) have:
 * - Higher base shipping costs
 * - Limited express/overnight availability
 * - Longer estimated delivery times
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
 * 
 * Retrieves list of shipping methods available for the specified governorate.
 * Each method includes its cost for that location. Returns default standard
 * shipping if governorate not found (graceful fallback).
 * 
 * @param {string} governorate - Governorate code (e.g., 'muscat', 'al_batinah_north')
 * @returns {Array<ShippingMethod & {cost: number}>} Available methods with costs
 * 
 * @example
 * ```typescript
 * // Get methods for Muscat (best availability)
 * const methods = getAvailableShippingMethods('muscat');
 * // Returns: [
 * //   { id: 'standard', name: 'Standard Shipping', cost: 1.5, ... },
 * //   { id: 'express', name: 'Express Shipping', cost: 3.0, ... },
 * //   { id: 'overnight', name: 'Overnight Shipping', cost: 5.0, ... }
 * // ]
 * 
 * // Remote area with limited options
 * const remoteMethods = getAvailableShippingMethods('al_wusta');
 * // Returns: [
 * //   { id: 'standard', name: 'Standard Shipping', cost: 5.0, ... }
 * // ]
 * 
 * // Unknown governorate falls back to standard
 * const fallback = getAvailableShippingMethods('unknown_location');
 * // Returns: [{ id: 'standard', ..., cost: 2.0 }]
 * ```
 * 
 * @remarks
 * - Returns methods filtered by availability in that governorate
 * - Each method includes location-specific cost
 * - Unknown governorates default to standard shipping (2.0 OMR)
 * - Useful for populating shipping method selection in checkout
 * - Respects governorate-specific method limitations
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
 * Get shipping cost for specific governorate and method
 * 
 * Calculates the cost for a specific shipping method in a given governorate.
 * Returns null if method is not available in that location.
 * 
 * @param {string} governorate - Governorate code
 * @param {string} methodId - Shipping method ID ('standard', 'express', 'overnight')
 * @returns {number | null} Shipping cost in OMR, or null if method unavailable
 * 
 * @example
 * ```typescript
 * // Available method
 * getShippingCost('muscat', 'standard');       // Returns: 1.5
 * getShippingCost('muscat', 'express');        // Returns: 3.0
 * 
 * // Unavailable method in remote area
 * getShippingCost('al_wusta', 'overnight');    // Returns: null (not available)
 * getShippingCost('al_wusta', 'express');      // Returns: null (not available)
 * getShippingCost('al_wusta', 'standard');     // Returns: 5.0 (available)
 * 
 * // Unknown governorate defaults
 * getShippingCost('unknown', 'standard');      // Returns: 2.0
 * getShippingCost('unknown', 'express');       // Returns: null
 * ```
 * 
 * @remarks
 * - Unknown governorates default to 2.0 OMR for standard shipping only
 * - Returns null for any unavailable method (use for UI logic)
 * - Safe to use in conditional rendering (null check)
 * - Used in checkout to validate user selections
 * - Prevents showing/charging for unavailable methods
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
 * Free shipping threshold for standard shipping
 * 
 * Minimum cart subtotal to qualify for free standard shipping.
 * Express and overnight shipping always incur a fee.
 * 
 * @constant
 * @type {number}
 * @default 50.0 OMR
 * 
 * @example
 * ```typescript
 * // Cart qualifies for free shipping
 * if (cartSubtotal >= FREE_SHIPPING_THRESHOLD) {
 *   shippingCost = 0; // Free for standard method
 * }
 * 
 * // Usually shown to user for motivation
 * const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
 * if (remaining > 0) {
 *   showMessage(`Add ${formatOMR(remaining)} more for free shipping`);
 * }
 * ```
 * 
 * @remarks
 * - Currently set to 50.0 OMR
 * - Only applies to standard shipping method
 * - Express/overnight shipping always charged
 * - Used in cart and checkout UIs
 * - Consider displaying in cart summary for user motivation
 */
export const FREE_SHIPPING_THRESHOLD = 50.0; // 50 OMR

/**
 * Check if free shipping applies
 * 
 * Determines if cart qualifies for free shipping.
 * Free shipping only applies to standard method when subtotal meets threshold.
 * 
 * @param {number} subtotal - Cart subtotal in OMR
 * @param {string} methodId - Shipping method ID ('standard', 'express', 'overnight')
 * @returns {boolean} True if free shipping applies, false otherwise
 * 
 * @example
 * ```typescript
 * // Standard method with qualifying subtotal
 * isFreeShippingAvailable(55.0, 'standard');    // Returns: true
 * 
 * // Below threshold
 * isFreeShippingAvailable(45.0, 'standard');    // Returns: false
 * 
 * // Express/overnight never free
 * isFreeShippingAvailable(60.0, 'express');     // Returns: false
 * isFreeShippingAvailable(60.0, 'overnight');   // Returns: false
 * 
 * // In checkout calculation
 * let shippingCost = getShippingCost(governorate, methodId);
 * if (isFreeShippingAvailable(subtotal, methodId)) {
 *   shippingCost = 0;
 * }
 * ```
 * 
 * @remarks
 * - Only standard method qualifies
 * - Requires subtotal >= FREE_SHIPPING_THRESHOLD (50.0 OMR)
 * - Short-circuits on method check first (faster than threshold check)
 * - Used in checkout and cart calculations
 * - Shown in cart UI to incentivize purchases
 */
export function isFreeShippingAvailable(subtotal: number, methodId: string): boolean {
    return subtotal >= FREE_SHIPPING_THRESHOLD && methodId === 'standard';
}