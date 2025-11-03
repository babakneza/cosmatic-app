# Directus API Filter Formats Guide

Complete reference for filtering in BuyJan API requests using Directus SDK.

## Table of Contents

1. [Filter Operators](#filter-operators)
2. [Logical Operators](#logical-operators)
3. [Filter Syntax](#filter-syntax)
4. [Common Patterns](#common-patterns)
5. [Real-World Examples](#real-world-examples)
6. [Performance Tips](#performance-tips)

---

## Filter Operators

All filter operators are prefixed with underscore `_` in Directus.

### Comparison Operators

#### `_eq` - Equal To
Matches values that equal the specified value.

```typescript
// Find products with exact price
{ price: { _eq: 99.99 } }

// Find product by slug
{ slug: { _eq: 'rose-perfume' } }

// Find products in specific category
{ category: { _eq: 'skincare' } }
```

#### `_neq` - Not Equal
Matches values that do NOT equal the specified value.

```typescript
// Find all non-featured products
{ is_featured: { _neq: true } }

// Find products without category
{ category: { _neq: null } }
```

#### `_lt` - Less Than
Matches values strictly less than the specified value.

```typescript
// Find products under $50
{ price: { _lt: 50 } }

// Find orders from before 2024
{ created_at: { _lt: '2024-01-01T00:00:00Z' } }
```

#### `_lte` - Less Than or Equal
Matches values less than or equal to the specified value.

```typescript
// Find products $50 or cheaper
{ price: { _lte: 50 } }
```

#### `_gt` - Greater Than
Matches values strictly greater than the specified value.

```typescript
// Find expensive products
{ price: { _gt: 100 } }

// Find high-rated products
{ average_rating: { _gt: 4 } }
```

#### `_gte` - Greater Than or Equal
Matches values greater than or equal to the specified value.

```typescript
// Find products $50 or more
{ price: { _gte: 50 } }

// Find recent orders
{ created_at: { _gte: '2024-01-01T00:00:00Z' } }
```

#### `_in` - In List
Matches if value is in the specified array.

```typescript
// Find products in multiple categories
{ category: { _in: ['skincare', 'makeup', 'fragrance'] } }

// Find specific products by ID
{ id: { _in: [1, 2, 3, 4, 5] } }

// Find orders with specific statuses
{ status: { _in: ['pending', 'processing', 'shipped'] } }
```

#### `_nin` - Not In List
Matches if value is NOT in the specified array.

```typescript
// Find products excluding certain categories
{ category: { _nin: ['discontinued', 'testing'] } }

// Find incomplete orders (exclude finished statuses)
{ status: { _nin: ['delivered', 'cancelled', 'returned'] } }
```

#### `_contains` - String Contains
Case-sensitive substring match. Used for text search within fields.

```typescript
// Find products containing 'rose' in name
{ name: { _contains: 'rose' } }

// Find descriptions containing 'organic'
{ description: { _contains: 'organic' } }
```

**Note:** For case-insensitive search, use `_icontains` (if available in your Directus version).

#### `_starts_with` - String Starts With
Matches strings that start with the specified value.

```typescript
// Find categories starting with 'skin'
{ name: { _starts_with: 'skin' } }

// Find email addresses from specific domain
{ email: { _starts_with: 'admin@' } }
```

#### `_ends_with` - String Ends With
Matches strings that end with the specified value.

```typescript
// Find file names with image extension
{ filename: { _ends_with: '.jpg' } }

// Find domains ending in .com
{ domain: { _ends_with: '.com' } }
```

#### `_between` - Between Two Values
Matches values between two specified values (inclusive).

```typescript
// Find products in price range $50-$100
{ price: { _between: [50, 100] } }

// Find orders from specific date range
{ created_at: { _between: ['2024-01-01', '2024-12-31'] } }

// Find products with rating between 3-5
{ average_rating: { _between: [3, 5] } }
```

#### `_null` - Is NULL
Matches fields that are null/empty.

```typescript
// Find products without a category
{ category: { _null: true } }

// Find orders without shipping address
{ shipping_address: { _null: true } }
```

#### `_nnull` - Is NOT NULL
Matches fields that have a value (not null).

```typescript
// Find products that have been reviewed
{ average_rating: { _nnull: true } }

// Find completed orders
{ completed_at: { _nnull: true } }
```

#### `_empty` - Is Empty String
Matches empty string values.

```typescript
// Find products with empty description
{ description: { _empty: true } }
```

#### `_nempty` - Is NOT Empty String
Matches non-empty string values.

```typescript
// Find products with descriptions
{ description: { _nempty: true } }
```

---

## Logical Operators

Combine multiple filters with logical operators.

### `_and` - AND Logic
ALL conditions must be true (default behavior).

```typescript
// Products that are both featured AND on sale
{
  _and: [
    { is_featured: { _eq: true } },
    { sale_price: { _nnull: true } }
  ]
}

// Expensive products in skincare category
{
  _and: [
    { price: { _gt: 50 } },
    { category: { _eq: 'skincare' } }
  ]
}
```

### `_or` - OR Logic
AT LEAST ONE condition must be true.

```typescript
// Products that are either featured OR on sale
{
  _or: [
    { is_featured: { _eq: true } },
    { sale_price: { _nnull: true } }
  ]
}

// Find customers from NYC or LA
{
  _or: [
    { city: { _eq: 'New York' } },
    { city: { _eq: 'Los Angeles' } }
  ]
}
```

### `_not` - NOT Logic
Negates a condition.

```typescript
// Find products that are NOT featured
{ _not: { is_featured: { _eq: true } } }

// Find non-premium customers
{ _not: { is_premium: { _eq: true } } }
```

### Combining Logical Operators

```typescript
// Products that are (featured OR on sale) AND in stock
{
  _and: [
    {
      _or: [
        { is_featured: { _eq: true } },
        { sale_price: { _nnull: true } }
      ]
    },
    { in_stock: { _eq: true } }
  ]
}

// High-rated products (rating 4-5) in skincare category that are in stock
{
  _and: [
    { category: { _eq: 'skincare' } },
    { in_stock: { _eq: true } },
    { average_rating: { _between: [4, 5] } }
  ]
}
```

---

## Filter Syntax

### Basic Filter Format

```typescript
const filter = {
  fieldName: { operator: value }
};
```

### Nested Relationship Filtering

Filter by related records using dot notation or nested objects.

```typescript
// Find products in a specific brand
{ brand: { name: { _eq: 'Chanel' } } }

// Find customers who made purchases
{ customer: { total_orders: { _gt: 0 } } }

// Find reviews for high-rated products
{ product: { average_rating: { _gte: 4 } } }
```

### Pagination with Filters

Filters work with `limit` and `offset` for pagination.

```typescript
const result = await client.request(
  readItems('products', {
    filter: {
      price: { _between: [50, 100] },
      category: { _eq: 'skincare' }
    },
    limit: 20,
    offset: 0,
    sort: 'price'
  })
);
```

---

## Common Patterns

### Price Range Filter

```typescript
// Find products between $50-$150
const priceRangeFilter = {
  price: { _between: [50, 150] }
};

// Find discounted products
const discountedFilter = {
  sale_price: { _nnull: true },
  sale_price: { _lt: 'price' } // sale price < regular price
};
```

### Search Filter (Text)

```typescript
// Search in product names (case-sensitive)
const searchFilter = {
  name: { _contains: 'rose' }
};

// Search in multiple fields
const multiFieldSearch = {
  _or: [
    { name: { _contains: 'rose' } },
    { description: { _contains: 'rose' } }
  ]
};
```

### Category Filter

```typescript
// Products in single category
const singleCategory = {
  category: { _eq: 'skincare' }
};

// Products in multiple categories
const multipleCategories = {
  category: { _in: ['skincare', 'makeup', 'fragrance'] }
};

// Products excluding certain categories
const excludeCategories = {
  category: { _nin: ['discontinued', 'archived'] }
};
```

### Status Filter

```typescript
// Find pending orders
const pendingOrders = {
  status: { _eq: 'pending' }
};

// Find completed orders
const completedOrders = {
  status: { _in: ['delivered', 'completed'] }
};

// Find active customers
const activeCustomers = {
  status: { _in: ['active', 'premium'] }
};
```

### Date Range Filter

```typescript
// Orders from specific month
const dateRangeFilter = {
  created_at: {
    _between: [
      '2024-01-01T00:00:00Z',
      '2024-01-31T23:59:59Z'
    ]
  }
};

// Recent orders (last 7 days)
const recentFilter = {
  created_at: {
    _gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
};
```

### Combination Filter (Complex)

```typescript
// Find best-selling skincare products under $50
const complexFilter = {
  _and: [
    { category: { _eq: 'skincare' } },
    { price: { _lt: 50 } },
    { average_rating: { _gte: 4 } },
    { total_sold: { _gte: 100 } },
    { status: { _eq: 'active' } }
  ]
};
```

---

## Real-World Examples

### Example 1: Product Search with Filters

```typescript
// User searching for: "rose perfume" between $50-$150 in fragrance category

async function searchProducts(searchTerm: string, minPrice: number, maxPrice: number) {
  const client = await getDirectusClient();
  
  const filter = {
    _and: [
      // Category filter
      { category: { _eq: 'fragrance' } },
      // Price range
      { price: { _between: [minPrice, maxPrice] } },
      // Search term in name OR description
      {
        _or: [
          { name: { _contains: searchTerm } },
          { description: { _contains: searchTerm } }
        ]
      },
      // Must be in stock
      { in_stock: { _eq: true } }
    ]
  };

  const result = await client.request(
    readItems('products', {
      filter,
      limit: 20,
      sort: '-average_rating'
    })
  );

  return result;
}
```

### Example 2: Order History with Status

```typescript
// Fetch user's orders excluding cancelled ones

async function getUserOrders(customerId: string) {
  const client = await getDirectusClient();
  
  const filter = {
    _and: [
      // Orders for specific customer
      { customer: { _eq: customerId } },
      // Exclude cancelled orders
      { status: { _nin: ['cancelled', 'returned'] } }
    ]
  };

  const result = await client.request(
    readItems('orders', {
      filter,
      sort: '-created_at',
      limit: 50
    })
  );

  return result;
}
```

### Example 3: Reviews for High-Rated Products

```typescript
// Get 5-star reviews for skincare products

async function getHighRatedProductReviews() {
  const client = await getDirectusClient();
  
  const filter = {
    _and: [
      // Only 5-star reviews
      { rating: { _eq: 5 } },
      // From skincare products
      { product: { category: { _eq: 'skincare' } } },
      // Only verified purchases
      { verified_purchase: { _eq: true } }
    ]
  };

  const result = await client.request(
    readItems('product_reviews', {
      filter,
      sort: '-created_at',
      limit: 10
    })
  );

  return result;
}
```

### Example 4: Wishlist with Price Drops

```typescript
// Find wishlisted items that have been discounted

async function getWishlistDiscounts(customerId: string) {
  const client = await getDirectusClient();
  
  const filter = {
    _and: [
      // Customer's wishlist
      { customer: { _eq: customerId } },
      // Product has sale price
      { product: { sale_price: { _nnull: true } } },
      // Sale price is at least 10% off
      // Note: This example shows structure; actual comparison might require calculation
      { product: { in_stock: { _eq: true } } }
    ]
  };

  const result = await client.request(
    readItems('wishlist', {
      filter,
      sort: 'product.sale_price'
    })
  );

  return result;
}
```

---

## Performance Tips

### 1. Use `_in` Instead of Multiple `_or` Operators

```typescript
// ❌ Less efficient - multiple OR conditions
const filter = {
  _or: [
    { category: { _eq: 'skincare' } },
    { category: { _eq: 'makeup' } },
    { category: { _eq: 'fragrance' } }
  ]
};

// ✅ More efficient - single IN operator
const filter = {
  category: { _in: ['skincare', 'makeup', 'fragrance'] }
};
```

### 2. Filter Early, Limit Results

```typescript
// ❌ Fetches all products, then filters in code
const allProducts = await getProducts({});
const filtered = allProducts.filter(p => p.price < 50);

// ✅ Filter at API level
const filtered = await getProducts({
  filter: { price: { _lt: 50 } },
  limit: 20
});
```

### 3. Use Specific Fields to Reduce Payload

```typescript
// ❌ Returns all fields
const result = await client.request(
  readItems('products', { filter })
);

// ✅ Only request needed fields
const result = await client.request(
  readItems('products', {
    filter,
    fields: ['id', 'name', 'price', 'average_rating']
  })
);
```

### 4. Index Filter Fields in Directus

Configure indexes on frequently filtered fields in Directus:
- `category` (high cardinality)
- `price` (range filters)
- `status` (commonly filtered)
- `created_at` (date range filters)

### 5. Combine Filters Efficiently

```typescript
// ✅ Filter multiple conditions at once
const filter = {
  _and: [
    { category: { _eq: 'skincare' } },
    { price: { _between: [10, 100] } },
    { status: { _eq: 'active' } }
  ]
};

// Fetch with all filters at once
const result = await client.request(
  readItems('products', {
    filter,
    limit: 20
  })
);
```

---

## API Integration in BuyJan

### Products API

```typescript
import { getProducts } from '@/lib/api/products';

// Example: Search skincare products $50-$150
const result = await getProducts(
  {
    category: 'skincare',
    min_price: 50,
    max_price: 150,
    search: 'rose'
  },
  'price_low_high',
  { page: 1, limit: 20 }
);
```

### Custom Filters with SDK

```typescript
import { getDirectusClient } from '@/lib/api/directus';
import { readItems } from '@directus/sdk';

const client = await getDirectusClient();
const products = await client.request(
  readItems('products', {
    filter: {
      _and: [
        { category: { _eq: 'skincare' } },
        { price: { _between: [50, 100] } }
      ]
    },
    limit: 20
  })
);
```

---

## Troubleshooting

### Filter Not Working

1. **Check operator spelling**: Must be `_eq`, `_neq`, not `eq`, `neq`
2. **Verify field name**: Use exact field names from Directus schema
3. **Check data types**: String filters vs number filters
4. **Enable debug logging**: Set `DEBUG=buyjan:*` to see filter queries

### Performance Issues

1. **Analyze slow queries**: Use Directus query logs
2. **Add database indexes**: Index frequently filtered fields
3. **Reduce result set**: Use `limit` and pagination
4. **Cache results**: Use request deduplication cache
5. **Denormalize if needed**: Pre-calculate frequently filtered values

### Complex Filters

For very complex filters, consider:
- Breaking into multiple API calls
- Creating Directus views for common queries
- Using search endpoints instead of filters
- Implementing server-side aggregations

---

## See Also

- [Directus API Documentation](https://docs.directus.io/reference/query.html)
- [BuyJan API Modules](../src/lib/api/)
- [Type Definitions](../src/types/)