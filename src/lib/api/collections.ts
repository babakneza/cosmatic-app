/**
 * Collections API Export
 * Central export for all collection APIs
 */

// Export all customer-related functions
export * from './customers';

// Export all order-related functions
export * from './orders';

// Export all review-related functions
export * from './reviews';

// Export all wishlist-related functions
export * from './wishlist';

// Export all coupon-related functions
export * from './coupons';

// Export all shipping-related functions
export * from './shipping';

// Re-export types for convenience
export type {
    Customer,
    CustomerAddress,
    Order,
    OrderItem,
    ProductReview,
    WishlistItem,
    Coupon,
    ShippingMethod,
    OrderStatus,
    PaymentStatus,
    ReviewStatus,
    CouponType,
    OrderFilters,
    ReviewFilters,
    WishlistFilters,
    ApiCollectionResponse,
    ApiItemResponse
} from '@/types/collections';