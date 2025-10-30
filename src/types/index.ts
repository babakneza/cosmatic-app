// Locale types
export type Locale = 'ar' | 'en';

// Direction type for RTL/LTR
export type Direction = 'rtl' | 'ltr';

// Currency types
export interface Currency {
    code: string;
    symbol: string;
    name: string;
    decimals: number;
}

// Product types
export interface ReviewStats {
    average_rating: number;
    review_count: number;
}

export interface ProductReview {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    is_helpful?: boolean;
    customer?: string;
}

export interface Product {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description: string;
    description_ar?: string;
    price: number;
    sale_price?: number;
    currency: string;
    images: ProductImage[];
    processedImages?: ProductImage[];
    mainImageUrl?: string;
    image?: string; // Single image URL for convenience
    category: Category;
    categories?: Category[];
    brand?: Brand;
    sku: string;
    stock: number;
    in_stock: boolean | number;
    ingredients?: string;
    ingredients_ar?: string;
    how_to_use?: string;
    how_to_use0?: string;
    how_to_use_ar?: string;
    rating?: number;
    rating_count?: number; // Number of reviews/ratings
    reviews_count?: number;
    reviewStats?: ReviewStats; // Average rating and count from product_reviews collection
    reviews?: ProductReview[]; // List of reviews from product_reviews collection
    is_new?: boolean;
    is_new_arrival?: boolean;
    new_until?: string | null;
    cost_price?: number | null;
    excerpt?: string | null;
    created_at: string;
    updated_at: string;
    status?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface ProductImage {
    id: string;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    is_primary?: boolean;
}

// Category types
export interface Category {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description?: string;
    description_ar?: string;
    image?: string;
    parent_id?: string;
    products_count?: number;
}

// Brand types
export interface Brand {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    logo?: string;
    description?: string;
    description_ar?: string;
}

// Cart types
export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    selected_variant?: ProductVariant;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    value: string;
    price_adjustment?: number;
}

// Address types
export interface Address {
    id?: string;
    full_name: string;
    phone: string;
    email: string;
    governorate: string;
    wilayat: string;
    street_address: string;
    building?: string;
    floor?: string;
    apartment?: string;
    postal_code?: string;
    additional_info?: string;
    is_default?: boolean;
    country?: string; // Country name (e.g., "Oman", "UAE")
    country_id?: string | number; // Numeric country ID from countries collection
    country_name?: string; // Explicit country name for display
}

// Omani Governorates
export const OMAN_GOVERNORATES = [
    { value: 'muscat', label_en: 'Muscat', label_ar: 'مسقط' },
    { value: 'dhofar', label_en: 'Dhofar', label_ar: 'ظفار' },
    { value: 'musandam', label_en: 'Musandam', label_ar: 'مسندم' },
    { value: 'al_buraimi', label_en: 'Al Buraimi', label_ar: 'البريمي' },
    { value: 'ad_dakhiliyah', label_en: 'Ad Dakhiliyah', label_ar: 'الداخلية' },
    { value: 'al_batinah_north', label_en: 'Al Batinah North', label_ar: 'شمال الباطنة' },
    { value: 'al_batinah_south', label_en: 'Al Batinah South', label_ar: 'جنوب الباطنة' },
    { value: 'ash_sharqiyah_north', label_en: 'Ash Sharqiyah North', label_ar: 'شمال الشرقية' },
    { value: 'ash_sharqiyah_south', label_en: 'Ash Sharqiyah South', label_ar: 'جنوب الشرقية' },
    { value: 'ad_dhahirah', label_en: 'Ad Dhahirah', label_ar: 'الظاهرة' },
    { value: 'al_wusta', label_en: 'Al Wusta', label_ar: 'الوسطى' },
] as const;

// Shipping types - Updated to match Directus schema
export interface ShippingMethod {
    id: string;
    name: string; // English name
    name_ar: string; // Arabic name
    type: 'standard' | 'express' | 'overnight' | string; // Type of shipping
    cost: number; // Base cost in OMR
    available_countries: (string | number | { id: string | number;[key: string]: any })[]; // Country IDs from countries collection, can be IDs, numbers, or expanded objects
    is_active: boolean;
    sort_order: number;
    min_value?: number; // Minimum cart value
    max_value?: number; // Maximum cart value
    additional_cost?: number;
    estimated_days_min?: number; // Minimum delivery days
    estimated_days_max?: number; // Maximum delivery days
    free_shipping_threshold?: number; // Order value for free shipping

    // Legacy/deprecated fields for backward compatibility
    description?: string;
    description_ar?: string;
    estimated_days?: string;
    estimated_days_ar?: string;
    is_available?: boolean;
    basePrice?: number;
}

export interface GovernorateShipping {
    governorate: string;
    methods: {
        [key: string]: {
            cost: number;
            available: boolean;
            estimated_days?: number;
        };
    };
}

// Payment types
export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery' | 'omannet';
    name: string;
    name_ar?: string;
    icon?: string;
    is_available: boolean;
}

// Order types
export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    items: CartItem[];
    shipping_address: Address;
    billing_address: Address;
    payment_method: PaymentMethod;
    shipping_method: ShippingMethod;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    currency: string;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

// User types
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar?: string;
    addresses?: Address[];
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    meta?: {
        total_count?: number;
        filter_count?: number;
    };
}

export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}

// Filter and Sort types
export interface ProductFilters {
    category?: string | string[];
    brand?: string | string[];
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    search?: string;
}

export type SortOption =
    | 'newest'
    | 'price_low_high'
    | 'price_high_low'
    | 'name_a_z'
    | 'name_z_a'
    | 'rating';

// Pagination types
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}
