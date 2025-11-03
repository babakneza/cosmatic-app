# BuyJan API Documentation Guide

## Overview

This document provides comprehensive documentation for all API functions in the BuyJan e-commerce application. All API functions use Directus CMS as the data source.

## Directory Structure

```
src/lib/api/
├── directus.ts           - Core product API (getProducts, getProduct)
├── products.ts           - Enhanced product data fetching
├── customers.ts          - Customer profile and address management
├── orders.ts             - Order creation and management
├── reviews.ts            - Product reviews and ratings
├── wishlist.ts           - Customer wishlists
├── coupons.ts            - Coupon validation and management
├── collections.ts        - Central API exports
├── directus-config.ts    - Directus SDK configuration
└── API_DOCUMENTATION.md  - This file
```

## Core API Functions

### Products API (`directus.ts`)

#### `getProducts(filters?): Promise<{data, meta}>`

Fetches products with filtering, sorting, and pagination.

**Parameters:**
- `filters.search`: Text search across names and descriptions
- `filters.category`: Filter by category slug
- `filters.min_price`: Minimum price filter
- `filters.max_price`: Maximum price filter
- `filters.limit`: Results per page (default: 12)
- `filters.offset`: Pagination offset (default: 0)
- `filters.sort`: Sort field (e.g., '-price' for descending price)

**Returns:**
- `data`: Array of product objects with processed images and ratings
- `meta`: Object with `total_count` and `filter_count`

**Example:**
```typescript
const { data: products, meta } = await getProducts({
  category: 'skincare',
  min_price: 10,
  max_price: 100,
  limit: 20,
  offset: 0
});
```

**Error Handling:**
- Returns empty array on API failure
- Implements automatic retry with exponential backoff
- Logs detailed errors for debugging

---

#### `getProduct(idOrSlug): Promise<{data}>`

Fetches a single product by ID or slug.

**Parameters:**
- `idOrSlug`: Product ID (UUID or numeric) or slug

**Returns:**
- `data`: Product object with full details including:
  - Basic info (name, description, pricing)
  - Localized fields (name_ar, description_ar)
  - Product attributes (ingredients, usage instructions)
  - Related data (category, brand)
  - Gallery images with processed URLs
  - Reviews with average rating

**Example:**
```typescript
// Fetch by slug
const { data: product } = await getProduct('classic-red-lipstick');

// Fetch by UUID
const { data: product } = await getProduct('550e8400-e29b-41d4-a716-446655440000');
```

**Error Handling:**
- Throws error if product not found
- Attempts public access if authenticated request fails (403)
- Detailed error logging with stack traces

---

#### `getFeaturedProducts(limit?): Promise<{data, meta}>`

Convenience function for fetching recently added products.

**Parameters:**
- `limit`: Number of products to return (default: 8)

**Example:**
```typescript
const { data: featured } = await getFeaturedProducts(10);
```

---

#### `searchProducts(query, limit?): Promise<{data, meta}>`

Search products by keyword.

**Parameters:**
- `query`: Search term
- `limit`: Maximum results (default: 10)

**Example:**
```typescript
const { data: results } = await searchProducts('perfume', 20);
```

---

#### `getProductsByCategory(slug, limit?, offset?): Promise<{data, meta}>`

Fetch products within a specific category with pagination.

**Parameters:**
- `slug`: Category slug
- `limit`: Items per page (default: 12)
- `offset`: Pagination offset (default: 0)

**Example:**
```typescript
// First page
const { data: page1 } = await getProductsByCategory('skincare', 12, 0);

// Second page
const { data: page2 } = await getProductsByCategory('skincare', 12, 12);
```

---

### Customers API (`customers.ts`)

#### `createCustomerProfile(userId, accessToken, data?): Promise<Customer>`

Create customer profile after user registration.

**Parameters:**
- `userId`: Directus user ID
- `accessToken`: JWT access token
- `data`: Optional customer data (phone, date_of_birth, etc.)

**Example:**
```typescript
const customer = await createCustomerProfile(userId, token, {
  phone: '9689123456',
  date_of_birth: '1990-01-15'
});
```

---

#### `getCustomerProfile(userId, accessToken): Promise<Customer | null>`

Retrieve customer profile by user ID.

---

#### `updateCustomerProfile(customerId, accessToken, updates): Promise<Customer>`

Update customer profile information.

---

#### `createCustomerAddress(customerId, accessToken, address): Promise<CustomerAddress>`

Add new address to customer profile.

---

#### `getCustomerAddresses(customerId, accessToken): Promise<CustomerAddress[]>`

Get all addresses for a customer.

---

#### `updateCustomerAddress(addressId, accessToken, updates): Promise<CustomerAddress>`

Update customer address.

---

#### `deleteCustomerAddress(addressId, accessToken): Promise<void>`

Delete customer address.

---

#### `setDefaultShippingAddress(customerId, addressId, accessToken): Promise<Customer>`

Set default shipping address for customer.

---

#### `setDefaultBillingAddress(customerId, addressId, accessToken): Promise<Customer>`

Set default billing address for customer.

---

### Orders API (`orders.ts`)

#### `formatAddressAsJSON(address, addressType): Record<string, any>`

Convert address objects to Directus JSON format.

**Parameters:**
- `address`: Address object (CustomerAddress or checkout Address)
- `addressType`: 'shipping' or 'billing' (default: 'shipping')

---

#### `createOrder(userId, accessToken, orderData): Promise<Order>`

Create new order with order items.

---

#### `getOrder(orderId, accessToken): Promise<Order>`

Retrieve order details.

---

#### `getCustomerOrders(customerId, accessToken, filters?): Promise<Order[]>`

Get all orders for a customer with optional filtering.

---

#### `updateOrderStatus(orderId, status, accessToken): Promise<Order>`

Update order status.

---

### Reviews API (`reviews.ts`)

#### `createReview(customerId, productId, accessToken, reviewData): Promise<ProductReview>`

Create product review.

**Parameters:**
- `customerId`: Customer ID
- `productId`: Product ID
- `accessToken`: JWT token
- `reviewData`: Object with rating, title, comment

**Example:**
```typescript
const review = await createReview(customerId, productId, token, {
  rating: 5,
  title: 'Great product!',
  comment: 'Excellent quality and fast delivery.'
});
```

---

#### `getProductReviews(productId, filters?): Promise<{data, total}>`

Get reviews for a product.

**Parameters:**
- `productId`: Product ID
- `filters`: Optional filters (status, limit, offset)

---

#### `updateReview(reviewId, accessToken, updates): Promise<ProductReview>`

Update existing review.

---

#### `deleteReview(reviewId, accessToken): Promise<void>`

Delete review.

---

### Wishlist API (`wishlist.ts`)

#### `addToWishlist(customerId, productId, accessToken): Promise<WishlistItem>`

Add product to customer's wishlist.

---

#### `removeFromWishlist(wishlistItemId, accessToken): Promise<void>`

Remove item from wishlist.

---

#### `getCustomerWishlist(customerId, accessToken): Promise<WishlistItem[]>`

Get all wishlist items for customer.

---

#### `isProductInWishlist(customerId, productId, accessToken): Promise<boolean>`

Check if product is in customer's wishlist.

---

### Coupons API (`coupons.ts`)

#### `validateCoupon(code, amount, accessToken?): Promise<{valid, discount, message}>`

Validate coupon code and calculate discount.

**Parameters:**
- `code`: Coupon code
- `amount`: Cart amount for validation
- `accessToken`: Optional JWT token

---

#### `applyCoupon(orderId, couponCode, accessToken): Promise<Coupon>`

Apply validated coupon to order.

---

## Error Handling

All API functions implement robust error handling:

1. **Automatic Retries**: Failed requests retry with exponential backoff
2. **Fallback Mechanisms**: Public access fallback when authenticated requests fail
3. **Detailed Logging**: Errors logged with context for debugging
4. **Type Safety**: TypeScript ensures type-safe operations
5. **Graceful Degradation**: Functions return empty data rather than throwing

## Authentication

Most API functions require:
- `accessToken`: JWT token from authentication
- Tokens obtained via `POST /api/auth/login`

## Response Format

### Success Response
```json
{
  "data": { /* resource data */ },
  "meta": { /* pagination or count info */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400,
  "info": { /* detailed error info */ }
}
```

## Rate Limiting

API requests are subject to Directus rate limiting. Implement exponential backoff
for automatic retries. See `retry.ts` for implementation details.

## Performance Optimization

- Use SWR hooks for client-side caching
- Implement pagination for large datasets
- Cache category/brand data (infrequently changing)
- Use image optimization for gallery images

## Common Patterns

### Pagination
```typescript
const PAGE_SIZE = 12;
const page = 1;
const { data, meta } = await getProducts({
  limit: PAGE_SIZE,
  offset: (page - 1) * PAGE_SIZE
});
```

### Search with Filters
```typescript
const { data } = await getProducts({
  search: query,
  category: selectedCategory,
  min_price: minPrice,
  max_price: maxPrice,
  sort: sortOrder,
  limit: 20
});
```

### Featured Products on Homepage
```typescript
const { data: featured } = await getFeaturedProducts(8);
const { data: topRated } = await getProducts({ sort: '-rating', limit: 8 });
```

## Testing API Endpoints

Test scripts are available:
- `test-directus.js`: Tests basic Directus connectivity
- `test-directus-sdk.js`: Tests SDK-specific functionality
- `test-directus-api.js`: Tests API endpoints

Run with: `node test-directus-api.js`

## Troubleshooting

### 403 Unauthorized
- Check API token in environment variables
- Verify token hasn't expired
- Application will automatically try public access

### 404 Not Found
- Verify product ID/slug is correct
- Check product status in Directus (should be published)
- For slug-based queries, check slug format

### Timeout Errors
- Check network connectivity
- Verify Directus server is running
- Check rate limiting hasn't been exceeded

## Contributing

When adding new API functions:
1. Add comprehensive JSDoc comments
2. Include usage examples
3. Document error scenarios
4. Add type definitions to `src/types/collections.ts`
5. Update this documentation