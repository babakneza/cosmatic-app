/**
 * Directus Collections Types
 * Comprehensive type definitions for all e-commerce collections
 */

// ============================================================================
// COUNTRIES
// ============================================================================

export interface Country {
    id: string | number;
    countries: string; // Country name
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// CUSTOMERS & ADDRESSES
// ============================================================================

export interface CustomerAddress {
    id: string;
    customer?: string; // Many-to-One → customers [REQUIRED]
    type: 'shipping' | 'billing' | 'both'; // Address type
    first_name: string; // [REQUIRED]
    last_name: string; // [REQUIRED]
    company?: string; // Optional
    address_line_1: string; // [REQUIRED]
    address_line_2?: string; // Optional (apartment, suite, etc.)
    city: string; // [REQUIRED]
    state?: string; // Optional
    postal_code: string; // [REQUIRED]
    phone_number?: string; // Optional phone number for address
    countries?: string | number | Country; // [REQUIRED] Many-to-One → countries (numeric ID or expanded object)
    country?: string | number | Country; // Fallback for country field (may be present in some responses)
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DirectusUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    status?: string;
}

export interface Customer {
    id: string;
    user?: string | DirectusUser; // Many-to-One → directus_users
    phone?: string;
    date_of_birth?: string; // ISO date
    loyalty_points?: number;
    default_shipping?: string | CustomerAddress; // Many-to-One → customer_addresses
    default_billing?: string | CustomerAddress; // Many-to-One → customer_addresses
    customer_addresses?: CustomerAddress[]; // One-to-Many reverse
    first_name?: string; // Optional - may come from user data
    last_name?: string; // Optional - may come from user data
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// ORDERS & ORDER ITEMS
// ============================================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
    id: string;
    order: string; // Many-to-One → orders
    product: string; // Many-to-One → products
    variation?: string; // Many-to-One → product_variations (if exists)
    product_name: string;
    product_name_ar?: string; // Arabic product name
    variation_name?: string;
    quantity: number;
    unit_price: number; // decimal
    line_total: number; // decimal
    created_at?: string;
    updated_at?: string;
}

export interface OrderAddress {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone_number?: string;
}

export interface Order {
    id: string;
    status: OrderStatus;
    order_number: string; // Unique order identifier
    customer: string; // Many-to-One → customers
    customer_email: string;
    shipping_address: OrderAddress; // Structured address
    billing_address: OrderAddress; // Structured address
    subtotal: number; // decimal
    tax_rate: number; // decimal (e.g., 0.05 for 5%)
    tax_amount: number; // decimal
    shipping_cost: number; // decimal
    discount_amount?: number; // decimal
    total: number; // decimal
    payment_status: PaymentStatus;
    payment_method: string;
    payment_intent_id?: string; // For Stripe or other payment providers
    tracking_number?: string;
    items?: OrderItem[]; // One-to-Many reverse
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// REVIEWS
// ============================================================================

export type ReviewStatus = 'draft' | 'published' | 'archived';

export interface ProductReview {
    id: string;
    status: ReviewStatus;
    product: string; // Many-to-One → products
    customer: string | {
        id: string;
        user?: {
            id: string;
            first_name?: string;
            last_name?: string;
            email?: string;
        };
    }; // Many-to-One → customers
    rating: number; // 1-5
    title?: string;
    comment?: string;
    is_helpful?: Record<string, any>; // JSON { customers: [], count: number }
    verified_purchase?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// WISHLIST
// ============================================================================

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    image?: string;
    [key: string]: any; // Allow other product fields
}

export interface WishlistItem {
    id: string;
    customer: string; // Many-to-One → customers
    product: string | Product; // Many-to-One → products (can be string ID or expanded object)
    date_added?: string; // Timestamp
    created_at?: string;
}

// ============================================================================
// COUPONS
// ============================================================================

export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
    id: string;
    code: string; // Unique coupon code
    type: CouponType; // 'percentage' or 'fixed'
    value: number; // decimal (e.g., 0.10 for 10% or 5.00 for 5 OMR)
    minimum_cart_amount?: number; // decimal
    max_users?: number; // Maximum number of users who can use this coupon
    used_count?: number; // Current usage count
    valid_from: string; // timestamp/datetime
    valid_until: string; // timestamp/datetime
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiCollectionResponse<T> {
    data: T[];
    meta?: {
        total_count?: number;
        filter_count?: number;
    };
}

export interface ApiItemResponse<T> {
    data: T;
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface OrderFilters {
    customer?: string;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    date_from?: string;
    date_to?: string;
}

export interface ReviewFilters {
    product?: string;
    customer?: string;
    status?: ReviewStatus;
    rating?: number;
}

export interface WishlistFilters {
    customer?: string;
}

// ============================================================================
// SHIPPING
// ============================================================================

export interface ShippingCountryRelation {
    id?: string | number; // Junction table ID
    countries_id: {
        id: number;
        countries: string; // Country name (e.g., "Oman", "UAE")
    };
}

export interface ShippingMethod {
    id: string;
    name: string; // English name
    name_ar: string; // Arabic name
    type: 'standard' | 'express' | 'overnight' | string; // Type of shipping
    cost: number; // Base cost in OMR
    available_countries: ShippingCountryRelation[]; // Many-to-Many relationship with countries
    is_active: boolean; // Is this method active
    sort_order: number; // Sort order for display
    min_value?: number; // Minimum cart value for this method (decimal as string or number)
    max_value?: number; // Maximum cart value for this method (decimal as string or number)
    additional_cost?: number; // Additional cost for special cases
    estimated_days_min?: number; // Minimum estimated delivery days
    estimated_days_max?: number; // Maximum estimated delivery days
    free_shipping_threshold?: number; // Order value for free shipping
    description?: string; // English description
    description_ar?: string; // Arabic description
    created_at?: string;
    updated_at?: string;
}