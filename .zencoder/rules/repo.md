---
description: Repository Information Overview
alwaysApply: true
---

# BuyJan E-commerce Application Information

## Summary
BuyJan is a Next.js-based e-commerce application for premium cosmetics products in the Oman market, built with TypeScript and integrated with Directus CMS v20.1.0. It features multilingual support (Arabic/English), RTL layout, Omani Rial currency formatting, and mobile-first responsive design. Currently in Phase 2 of development, focusing on product experience.

## Structure
- **src/app**: Next.js app router with locale-based routing ([locale]/*)
- **src/components**: UI components (layout, product, category, localization, ui)
- **src/lib**: API clients, utilities, and helpers
- **src/store**: Zustand-based state management
- **src/types**: TypeScript type definitions
- **src/messages**: Localization files (ar.json, en.json)
- **src/i18n**: Internationalization configuration
- **public**: Static assets including placeholder images

## Language & Runtime
**Language**: TypeScript 5.3.3
**Framework**: Next.js 15.0.3 (App Router)
**Package Manager**: npm
**Node Version**: 18.x+
**React Version**: 19.0.0

## Dependencies
**Main Dependencies**:
- @directus/sdk: ^20.1.0 (CMS integration)
- next-intl: ^4.0.0 (Internationalization)
- zustand: ^4.5.0 (State management)
- tailwindcss: ^3.4.1 (Styling)
- framer-motion: ^11.0.3 (Animations)
- @radix-ui/* components (Accessible UI primitives)
- swr: ^2.2.4 (Data fetching and caching)
- axios: ^1.6.5 (HTTP client)

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Styling
**Design System**:
- Tailwind CSS with custom Oman-themed color palette
- Primary (Gold): #D4AF37
- Secondary (Green): #006400
- Accent (Red): #C53030
- RTL-aware utility classes via tailwindcss-rtl plugin
- IBM Plex Sans Arabic for Arabic text
- Inter for English text

## Localization
**Primary Language**: Arabic (RTL)
**Secondary Language**: English (LTR)
**Implementation**: next-intl with middleware
**Currency**: Omani Rial (OMR) with 3 decimal places
**Translation Files**: src/messages/ar.json, src/messages/en.json

## State Management
**Library**: Zustand with localStorage persistence
**Key Stores**: Cart state (add, remove, update, calculate totals)
**Features**: Persistent shopping cart, quantity management
**Implementation**: src/store/cart.ts

## API Integration
**CMS**: Directus v20.1.0
**Authentication**: Static token in environment variables with fallback mechanisms
**Key Collections**: Products, categiries, brands, customers, orders, reviews, wishlist, coupons
**Image Handling**: Custom processing with fallback placeholders
**API Files**:
- **src/lib/api/directus.ts**: Main Directus SDK client
- **src/lib/api/products.ts**: Product-specific API functions
- **src/lib/api/customers.ts**: Customer profiles and addresses
- **src/lib/api/orders.ts**: Order creation and management
- **src/lib/api/reviews.ts**: Product reviews
- **src/lib/api/wishlist.ts**: Wishlist management
- **src/lib/api/coupons.ts**: Coupon validation and management
- **src/lib/api/collections.ts**: Central export for all collections
**API Testing**:
- **test-directus.js**: Tests Directus API connectivity
- **test-directus-sdk.js**: Tests SDK-specific functionality
- **test-directus-api.js**: Tests API endpoints

## Data Models

**Product Model**:
- Basic info: id, name, slug, description, price
- Localized fields: name_ar, description_ar
- Relations: category, brand, images
- Additional fields: ingredients, how_to_use

**Category Model**:
- Basic info: id, name, slug
- Localized fields: name_ar, description_ar
- Relations: parent_id, products
- Note: The collection name in Directus is intentionally spelled as 'categiries'

**Customer Model**:
- Linked to: directus_users (Many-to-One)
- Fields: phone, date_of_birth, loyalty_points
- Relations: default_shipping, default_billing, customer_addresses
- Auto-created on user login/registration

**Order Model**:
- Order info: order_number (unique), status, payment_status
- Customer: customer (Many-to-One), customer_email
- Addresses: shipping_address (JSON), billing_address (JSON)
- Totals: subtotal, tax_rate, tax_amount, shipping_cost, discount_amount, total
- Payment: payment_method, payment_intent_id (for payment gateways)
- Tracking: tracking_number (after shipment)

**Order Items Model**:
- Linked to: orders (Many-to-One), products (Many-to-One)
- Fields: product_name (snapshot), quantity, unit_price, line_total

**Product Reviews Model**:
- Linked to: products (Many-to-One), customers (Many-to-One)
- Fields: rating (1-5), title, comment, status, is_helpful, verified_purchase

**Wishlist Model**:
- Linked to: customers (Many-to-One), products (Many-to-One)
- Fields: date_added (timestamp)

**Coupon Model**:
- Fields: code (unique), type (percentage/fixed), value
- Validation: minimum_cart_amount, max_users, used_count, valid_from, valid_until
- Status: is_active (boolean)

## Development Status
**Current Phase**: Phase 3 - E-Commerce Features
- ✅ Phase 1 (RTL Foundation & Localization) - Complete
- ✅ Phase 2 (Product Experience) - Complete
- **Phase 3 Progress**:
  - ✅ Authentication & Session Management
  - ✅ **Directus Collections Integration** (NEW)
    - Customers (with auto-profile creation on login)
    - Orders & Order Items
    - Product Reviews & Ratings
    - Wishlist Management
    - Coupon System
  - 🔄 Checkout Flow Integration
  - 🔄 Order History & Tracking
  - 🔄 Review Management UI

## Environment Configuration
Required environment variables:
- **NEXT_PUBLIC_DIRECTUS_URL**: Directus CMS URL (default: https://admin.buyjan.com)
- **NEXT_PUBLIC_SITE_URL**: Site URL (default: https://buyjan.com)
- **DIRECTUS_API_TOKEN**: API token for Directus authentication
- **NEXT_PUBLIC_DIRECTUS_API_TOKEN**: Public version of the API token
- **NODE_ENV**: Environment (development/production)

## Error Handling
- Robust error handling for API requests with multiple fallback mechanisms
- Detailed error logging for Directus API interactions
- Fallback UI components when data fetching fails
- Multiple authentication fallback strategies for Directus API
- Image processing with fallback to placeholder images
- Graceful handling of 403 errors with public access fallback

## Testing
**Target Framework**: Playwright
**Status**: No testing framework currently installed
**Test Location**: Tests to be created in `tests/` directory when framework is installed

## Deployment
**Production URL**: https://buyjan.com
**Admin Panel**: https://admin.buyjan.com
**Environment Setup**: Requires DIRECTUS_API_TOKEN in .env.local