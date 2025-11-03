/**
 * Centralized Configuration Constants
 * All environment-dependent constants in one place
 */

/**
 * Validate environment variables
 */
function validateEnvironment() {
    const requiredVars = [
        'NEXT_PUBLIC_DIRECTUS_URL',
        'NEXT_PUBLIC_SITE_URL'
    ];

    const missing = requiredVars.filter(
        (varName) => !process.env[varName]
    );

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }

    if (missing.length > 0) {
        console.warn(
            `Missing environment variables: ${missing.join(', ')}. Using defaults.`
        );
    }
}

// Validate on module load
validateEnvironment();

/**
 * API Configuration
 */
export const API_CONFIG = {
    /** Directus CMS URL */
    DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com',

    /** Application site URL */
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://buyjan.com',

    /** API timeout in milliseconds */
    TIMEOUT: 30000,

    /** Maximum retry attempts */
    MAX_RETRIES: 3,

    /** Initial retry delay in milliseconds */
    RETRY_DELAY: 1000,

    /** Maximum retry delay in milliseconds */
    MAX_RETRY_DELAY: 10000,

    /** Request deduplication interval in milliseconds */
    DEDUPE_INTERVAL: 60000,

    /** SWR revalidation interval in milliseconds */
    SWR_INTERVAL: 60000
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
    /** Token key in localStorage */
    TOKEN_STORAGE_KEY: 'directus_token',

    /** User key in localStorage */
    USER_STORAGE_KEY: 'directus_user',

    /** Token refresh buffer (milliseconds before expiry to refresh) */
    TOKEN_REFRESH_BUFFER: 60000, // 1 minute

    /** Session check interval */
    SESSION_CHECK_INTERVAL: 300000 // 5 minutes
} as const;

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
    /** Default page size */
    DEFAULT_LIMIT: 12,

    /** Maximum page size */
    MAX_LIMIT: 100,

    /** Default offset */
    DEFAULT_OFFSET: 0
} as const;

/**
 * Directus Collections - intentionally misspelled names from schema
 */
export const COLLECTIONS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categiries', // Note: Intentionally misspelled in Directus
    BRANDS: 'brands',
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    PRODUCT_REVIEWS: 'product_reviews',
    WISHLIST: 'wishlist',
    COUPONS: 'coupons',
    COUNTRIES: 'countries',
    STATES: 'states',
    SHIPPING_METHODS: 'shipping_methods'
} as const;

/**
 * Product field mappings
 */
export const PRODUCT_FIELDS = {
    /** Basic product information fields */
    BASIC: [
        'id',
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
        'price',
        'sale_price',
        'sku',
        'in_stock',
        'is_new'
    ] as const,

    /** Product image fields */
    IMAGES: [
        'main_image',
        'image',
        'images.*',
        'image_gallery.*'
    ] as const,

    /** Product metadata fields */
    METADATA: [
        'rating',
        'rating_count'
    ] as const,

    /** Product details (for single product page) */
    DETAILS: [
        'ingredients',
        'ingredients_ar',
        'how_to_use',
        'how_to_use_ar'
    ] as const,

    /** Related data fields */
    RELATIONS: [
        'category.id',
        'category.name',
        'category.name_ar',
        'category.slug',
        'categories.*.id',
        'categories.*.name',
        'categories.*.slug',
        'brand.id',
        'brand.name',
        'brand.name_ar',
        'brand.slug'
    ] as const,

    /** Review fields */
    REVIEWS: [
        'product_reviews.*'
    ] as const
} as const;

/**
 * All product fields for list view
 */
export const PRODUCT_LIST_FIELDS = [
    ...PRODUCT_FIELDS.BASIC,
    ...PRODUCT_FIELDS.IMAGES,
    ...PRODUCT_FIELDS.METADATA,
    ...PRODUCT_FIELDS.RELATIONS,
    ...PRODUCT_FIELDS.REVIEWS
] as const;

/**
 * All product fields for detail view
 */
export const PRODUCT_DETAIL_FIELDS = [
    ...PRODUCT_FIELDS.BASIC,
    ...PRODUCT_FIELDS.IMAGES,
    ...PRODUCT_FIELDS.METADATA,
    ...PRODUCT_FIELDS.DETAILS,
    ...PRODUCT_FIELDS.RELATIONS,
    ...PRODUCT_FIELDS.REVIEWS
] as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
    /** API request failed */
    API_REQUEST_FAILED: 'API_REQUEST_FAILED',

    /** Resource not found */
    NOT_FOUND: 'NOT_FOUND',

    /** Authentication failed */
    AUTH_FAILED: 'AUTH_FAILED',

    /** Authorization failed */
    AUTHZ_FAILED: 'AUTHZ_FAILED',

    /** Validation failed */
    VALIDATION_FAILED: 'VALIDATION_FAILED',

    /** Network error */
    NETWORK_ERROR: 'NETWORK_ERROR',

    /** Server error */
    SERVER_ERROR: 'SERVER_ERROR',

    /** Unknown error */
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;