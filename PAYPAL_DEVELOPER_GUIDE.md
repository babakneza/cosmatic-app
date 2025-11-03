# PayPal Integration - Developer Guide

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Complete Implementation

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Configuration](#configuration)
4. [API Reference](#api-reference)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm installed
- PayPal Business Account
- PayPal Sandbox credentials

### Setup Steps

#### 1. Configure Environment Variables

Create `.env.local`:
```bash
# PayPal Sandbox Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
```

#### 2. Install Dependencies
```bash
npm install
# Already included: @paypal/checkout-server-sdk v1.0.3
```

#### 3. Run Development Server
```bash
npm run dev
# Navigate to http://localhost:3000/[locale]/checkout
```

#### 4. Run Tests
```bash
npm run test -- tests/unit/ --run
# Expected: 78/78 tests passing ✅
```

---

## Architecture Overview

### Project Structure

```
src/
├── lib/paypal/
│   ├── config.ts              # SDK initialization & configuration
│   ├── create-order.ts        # Order creation logic
│   ├── capture-order.ts       # Payment capture logic
│   ├── errors.ts              # Error types & mapping
│   ├── monitoring.ts          # Metrics & event tracking
│   └── client-sdk.ts          # Frontend SDK loader
│
├── app/api/payments/paypal/
│   ├── create-order/
│   │   └── route.ts           # POST /api/payments/paypal/create-order
│   └── capture-order/
│       └── route.ts           # POST /api/payments/paypal/capture-order
│
└── components/checkout/
    ├── PayPalButton.tsx       # PayPal button component
    └── PaymentMethodSelector.tsx

tests/
├── unit/paypal/
│   ├── config.spec.ts         # Config tests (12 tests)
│   ├── create-order.spec.ts   # Order creation tests (16 tests)
│   ├── capture-order.spec.ts  # Capture tests (22 tests)
│   └── api/paypal-endpoints.spec.ts  # API tests (28 tests)
```

### Data Flow

```
User Checkout
    ↓
[PayPalButton Component]
    ↓
POST /api/payments/paypal/create-order
    ↓
[Backend: Create PayPal Order]
    ↓
PayPal API → PayPal Order ID
    ↓
User Approves Payment (PayPal Redirect)
    ↓
POST /api/payments/paypal/capture-order
    ↓
[Backend: Capture Payment]
    ↓
PayPal API → Transaction Details
    ↓
[Backend: Create Directus Order]
    ↓
Order Stored + Payment Complete
```

---

## Configuration

### Environment Variables

#### Required for Development
```env
# PayPal Sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
```

#### Required for Production
```env
# PayPal Live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_MODE=live
```

#### Site Configuration
```env
NEXT_PUBLIC_SITE_URL=https://buyjan.com        # For PayPal return URLs
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
DIRECTUS_API_TOKEN=your_api_token
```

### Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Log in with your PayPal Business Account
3. Navigate to **Apps & Credentials**
4. Select **Sandbox** mode
5. Create an app (if not already created)
6. Copy **Client ID** and **Secret**

```bash
# .env.local
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ABC123XYZ_abc123xyz
PAYPAL_CLIENT_SECRET=abc123xyz_ABC123XYZ
PAYPAL_MODE=sandbox
```

### Configuration Helper Functions

```typescript
// src/lib/paypal/config.ts

// Get current PayPal mode (sandbox or live)
import { getPayPalMode } from '@/lib/paypal/config';
const mode = getPayPalMode(); // 'sandbox' | 'live'

// Check if PayPal is configured
import { isPayPalConfigured } from '@/lib/paypal/config';
if (isPayPalConfigured()) {
  // Safe to use PayPal
}

// Get SDK client
import { getPayPalSDKClient } from '@/lib/paypal/config';
const client = getPayPalSDKClient();
```

---

## API Reference

### 1. POST `/api/payments/paypal/create-order`

Creates a PayPal order from a checkout order.

**Request Body**:
```typescript
{
  email: string;              // Customer email (required)
  total: number;              // Total amount in OMR (required)
  subtotal: number;           // Subtotal (required)
  tax_amount: number;         // Tax amount (required)
  shipping_cost: number;      // Shipping cost (required)
  items: Array<{              // Cart items (required)
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: {         // Shipping address (required)
    full_name: string;
    address_line_1: string;
    city: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {         // Billing address (optional)
    // Same structure as shipping_address
  };
}
```

**Response**:
```typescript
// Success (201)
{
  success: true;
  orderId: string;            // PayPal Order ID
}

// Error (400, 500)
{
  success: false;
  error: string;              // Error message
  details?: string;           // Optional: detailed error info
}
```

**Example**:
```typescript
const response = await fetch('/api/payments/paypal/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@example.com',
    total: 100.500,           // OMR with 3 decimal places
    subtotal: 95.000,
    tax_amount: 5.500,
    shipping_cost: 0,
    items: [
      { id: '1', name: 'Product A', quantity: 2, price: 47.500 }
    ],
    shipping_address: {
      full_name: 'John Doe',
      address_line_1: 'Street 123',
      city: 'Muscat',
      postal_code: '111',
      country: 'OM'
    }
  })
});

const data = await response.json();
if (data.success) {
  console.log('PayPal Order ID:', data.orderId);
}
```

---

### 2. POST `/api/payments/paypal/capture-order`

Captures a PayPal payment and creates the order in Directus.

**Request Body**:
```typescript
{
  orderId: string;            // PayPal Order ID (required)
  customerId: string;         // Directus customer ID (required)
}
```

**Response**:
```typescript
// Success (200)
{
  success: true;
  transactionId: string;      // PayPal transaction ID
  orderNumber: string;        // Directus order number
  paymentStatus: string;      // 'completed'
}

// Error (400, 500)
{
  success: false;
  error: string;              // Error message
}
```

**Example**:
```typescript
const response = await fetch('/api/payments/paypal/capture-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '8UH456789',
    customerId: 'customer_uuid_here'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Transaction ID:', data.transactionId);
  console.log('Order Number:', data.orderNumber);
}
```

---

### 3. PayPal Button Component

```typescript
import PayPalButton from '@/components/checkout/PayPalButton';

<PayPalButton
  total={100.500}              // Required: OMR amount
  subtotal={95.000}            // Required
  tax_amount={5.500}           // Required
  shipping_cost={0}            // Required
  items={cartItems}            // Required: array of items
  shipping_address={address}   // Required
  onSuccess={(orderId) => {    // Success callback
    console.log('Order created:', orderId);
  }}
  onError={(error) => {        // Error callback
    console.error('Payment error:', error);
  }}
/>
```

---

## Error Handling

### Error Types

```typescript
// src/lib/paypal/errors.ts

enum PayPalErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',      // Input validation failed
  API_ERROR = 'API_ERROR',                    // PayPal API error
  NETWORK_ERROR = 'NETWORK_ERROR',            // Network connectivity issue
  CAPTURE_ERROR = 'CAPTURE_ERROR',            // Payment capture failed
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', // Auth/token issue
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'             // Unexpected error
}
```

### Error Messages

Messages are automatically bilingual (Arabic/English):

```typescript
// English
"Payment capture failed"
"Failed to create payment order"
"Payment system is not available"

// Arabic (العربية)
"فشل التقاط الدفع"
"فشل في إنشاء أمر الدفع"
"نظام الدفع غير متاح"
```

### Retry Logic

Automatic retry with exponential backoff:

```typescript
// Retry Configuration
- Max attempts: 3
- Initial delay: 1 second
- Multiplier: 2x per attempt
- Max delay: 10 seconds

// Retried HTTP Status Codes
408, 429, 500, 502, 503, 504

// Non-retryable Errors
400, 401, 403, 404, 422
```

### Handling Errors in Code

```typescript
import { capturePayPalOrder } from '@/lib/paypal/capture-order';
import { PayPalErrorType } from '@/lib/paypal/errors';

try {
  const result = await capturePayPalOrder(orderId);
  console.log('Payment successful:', result);
} catch (error) {
  if (error.type === PayPalErrorType.NETWORK_ERROR) {
    // Network issue - will be retried automatically
    console.log('Network error, retrying...');
  } else if (error.type === PayPalErrorType.VALIDATION_ERROR) {
    // User input issue - show user error
    console.log('Please check your payment details');
  } else if (error.type === PayPalErrorType.CAPTURE_ERROR) {
    // Payment capture failed
    console.log('Payment capture failed, please try again');
  }
}
```

---

## Code Examples

### Example 1: Creating an Order Programmatically

```typescript
// src/lib/paypal/create-order.ts
import { createPayPalOrder } from '@/lib/paypal/create-order';

const orderDetails = {
  email: 'customer@example.com',
  total: 150.500,
  subtotal: 140.000,
  tax_amount: 10.500,
  shipping_cost: 0,
  items: [
    { id: '1', name: 'Perfume', quantity: 1, price: 140 }
  ],
  shipping_address: {
    full_name: 'Ahmed Ali',
    address_line_1: 'Al Khoudh St',
    city: 'Muscat',
    postal_code: '123',
    country: 'OM'
  }
};

try {
  const paypalOrderId = await createPayPalOrder(orderDetails);
  console.log('PayPal Order ID:', paypalOrderId);
} catch (error) {
  console.error('Failed to create order:', error.message);
}
```

### Example 2: Capturing a Payment

```typescript
import { capturePayPalOrder } from '@/lib/paypal/capture-order';

try {
  const result = await capturePayPalOrder('paypal_order_id_here');
  
  console.log('Transaction ID:', result.transactionId);
  console.log('Payer Email:', result.payerEmail);
  console.log('Amount:', result.amount);
  console.log('Currency:', result.currency);
  
  // Result is ready to create Directus order
} catch (error) {
  console.error('Capture failed:', error);
}
```

### Example 3: React Hook Usage

```typescript
import { useState } from 'react';
import PayPalButton from '@/components/checkout/PayPalButton';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = (orderId: string) => {
    setIsProcessing(true);
    // Order created successfully
    // Redirect to confirmation page
    router.push(`/order-confirmation?id=${orderId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Show error message to user
  };

  return (
    <PayPalButton
      total={100.500}
      subtotal={95.000}
      tax_amount={5.500}
      shipping_cost={0}
      items={[...]}
      shipping_address={{...}}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

### Example 4: Monitoring Payment Events

```typescript
import { trackPaymentEvent, getMetrics } from '@/lib/paypal/monitoring';

// Track events
trackPaymentEvent('created', {
  orderId: 'order123',
  customerId: 'customer456'
});

trackPaymentEvent('captured', {
  orderId: 'order123',
  transactionId: 'tx123',
  amount: 100.50
});

// Get metrics
const metrics = getMetrics();
console.log('Total Orders:', metrics.totalOrders);
console.log('Success Rate:', metrics.successRate);
console.log('Failed Payments:', metrics.failedPayments);
```

---

## Testing

### Run All Tests

```bash
# Run all tests
npm run test

# Run PayPal tests only
npm run test -- tests/unit/paypal --run

# Run API endpoint tests
npm run test -- tests/unit/api/paypal-endpoints --run

# Watch mode (auto-rerun on changes)
npm run test -- tests/unit/paypal
```

### Test Coverage

**Configuration Tests** (12 tests):
- Environment detection
- Credential validation
- SDK initialization
- Mode switching

**Order Creation Tests** (16 tests):
- Valid order creation
- Currency handling (OMR decimals)
- Invalid totals
- Missing fields
- Error scenarios

**Order Capture Tests** (22 tests):
- Successful capture
- Invalid order IDs
- Transaction extraction
- Amount validation
- Error handling

**API Endpoint Tests** (28 tests):
- Request validation
- Response format
- Error responses
- Rate limiting
- Security headers
- CORS handling

### Writing New Tests

```typescript
import { describe, it, expect } from 'vitest';
import { createPayPalOrder } from '@/lib/paypal/create-order';

describe('PayPal Order Creation', () => {
  it('should create order with valid data', async () => {
    const orderDetails = {
      email: 'test@example.com',
      total: 100.500,
      subtotal: 95.000,
      tax_amount: 5.500,
      shipping_cost: 0,
      items: [{ id: '1', name: 'Test', quantity: 1, price: 95 }],
      shipping_address: {
        full_name: 'Test User',
        address_line_1: 'Street 1',
        city: 'Muscat',
        postal_code: '123',
        country: 'OM'
      }
    };

    const orderId = await createPayPalOrder(orderDetails);
    expect(orderId).toBeDefined();
    expect(typeof orderId).toBe('string');
  });

  it('should fail with invalid total', async () => {
    const orderDetails = {
      // ... (same as above but with invalid total)
      total: -100 // Invalid: negative amount
    };

    await expect(createPayPalOrder(orderDetails))
      .rejects
      .toThrow();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. **"Payment system is not available"**

**Cause**: PayPal credentials not configured  
**Solution**:
```bash
# Check .env.local has:
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox
```

#### 2. **"Failed to create payment order"**

**Cause**: Invalid order data  
**Solution**:
- Verify all required fields are present
- Check amount is positive number with max 3 decimals
- Validate email format
- Ensure address fields are not empty

#### 3. **"Network error" (with retry)**

**Cause**: Temporary network issue  
**Solution**:
- Check PayPal API status
- Verify internet connection
- Check CORS settings
- Wait for automatic retry (max 3 attempts)

#### 4. **Tests Failing with "ENOTFOUND"**

**Cause**: Test environment not properly configured  
**Solution**:
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install

# Clear .next cache
rm -r .next

# Re-run tests
npm run test -- tests/unit/paypal --run
```

#### 5. **"Invalid amount" Error**

**Cause**: OMR currency precision issue  
**Solution**:
```typescript
// Correct: Use 3 decimal places for OMR
const amount = 100.500;  // ✅ Correct

// Incorrect: Don't use other precisions
const amount = 100.5;    // ❌ Wrong: missing decimals
const amount = 100.50;   // ❌ Wrong: only 2 decimals
```

#### 6. **Credentials Not Loading in Tests**

**Cause**: Lazy evaluation not working  
**Solution**:
```typescript
// Correct: Lazy evaluation (reads env on each call)
export const getClientId = () => process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// Incorrect: Eager evaluation (reads env at import time)
export const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
```

### Debug Logging

```typescript
// Enable detailed logging
import { logger } from '@/lib/logger';

logger.info('Creating PayPal order', { 
  email: 'test@example.com',
  total: 100.500 
});

// Check logs in:
// - Browser console (client-side)
// - Terminal output (server-side)
// - Directus logs (if integrated)
```

### Check PayPal API Health

```bash
# Test PayPal connectivity
curl https://api.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "CLIENT_ID:SECRET" \
  -d "grant_type=client_credentials"

# Should return access token
```

---

## Best Practices

### 1. Always Validate on Backend

```typescript
// ✅ Do: Validate on server
if (total <= 0) {
  throw new Error('Invalid amount');
}

// ❌ Don't: Trust only client validation
// Always verify server-side
```

### 2. Use Type Safety

```typescript
// ✅ Do: Use TypeScript types
import type { OrderDetails } from '@/types/paypal';

// ❌ Don't: Use `any` type
const orderDetails: any = { ... };
```

### 3. Handle All Error Cases

```typescript
// ✅ Do: Handle specific errors
try {
  await captureOrder(id);
} catch (error) {
  if (error.type === PayPalErrorType.NETWORK_ERROR) {
    // Handle network error
  } else if (error.type === PayPalErrorType.CAPTURE_ERROR) {
    // Handle capture error
  }
}

// ❌ Don't: Ignore errors
await captureOrder(id);
```

### 4. Log Important Events

```typescript
// ✅ Do: Log key events for debugging
trackPaymentEvent('created', { orderId, customerId });
trackPaymentEvent('captured', { orderId, transactionId });

// ❌ Don't: Log sensitive data
console.log('Secret:', PAYPAL_CLIENT_SECRET);  // ❌ Never!
```

### 5. Test Edge Cases

```typescript
// ✅ Do: Test boundary conditions
- Zero amount
- Very large amount
- Special characters in names
- Missing optional fields
- Network timeouts

// ❌ Don't: Only test happy path
```

---

## Performance Tips

### 1. SDK Loading
```typescript
// Load PayPal SDK only once
import { initPayPalSDK } from '@/lib/paypal/client-sdk';
initPayPalSDK(); // Safe to call multiple times, only loads once
```

### 2. Request Deduplication
```typescript
// The platform uses request deduplication
// Multiple simultaneous requests for same order are deduplicated
import { dedupRequest } from '@/lib/requestDedup';
```

### 3. Caching
```typescript
// Rates are cached to avoid repeated calculations
// Reset cache if needed
import { getCurrencyRate } from '@/lib/currency';
const rate = await getCurrencyRate('OMR/USD'); // Cached
```

---

## Security Considerations

### 1. Never Expose Client Secret
```typescript
// ✅ Do: Keep secret server-side only
PAYPAL_CLIENT_SECRET=secret_here  // In .env (never committed)

// ❌ Don't: Expose in code or browser
const secret = "exposed_secret";  // Visible in source code!
window.PayPalSecret = "exposed";  // Visible in browser!
```

### 2. Validate on Both Sides
```typescript
// Frontend: Quick validation for UX
// Backend: Strict validation for security

// Backend verification:
if (requestedAmount !== cartTotal) {
  throw new Error('Amount mismatch');
}
```

### 3. Rate Limiting
```typescript
// Endpoints are rate-limited to 1 req/sec per user
// This prevents abuse and DDoS
// Automatically handled by rateLimit middleware
```

### 4. Input Sanitization
```typescript
// All user input is sanitized
email.toLowerCase().trim();  // Email
address.trim();              // Address fields
// Special characters are safely handled
```

---

## Support & Resources

### Documentation
- **Repo**: `.env.local` configuration guide
- **Tests**: See `tests/unit/paypal/` for examples
- **Types**: See `src/types/` for TypeScript definitions

### PayPal Resources
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [REST API Reference](https://developer.paypal.com/api/rest/)
- [SDK Documentation](https://developer.paypal.com/sdk/js/)

### Project Documentation
- `PAYPAL_QUICK_START.md` - 5-minute setup guide
- `PAYPAL_IMPLEMENTATION_STATUS.md` - Detailed status report
- `PAYPAL_IMPLEMENTATION_COMPLETE.md` - Complete implementation details

---

## Next Steps

1. ✅ **Configure Credentials** - Add PayPal credentials to `.env.local`
2. ✅ **Run Tests** - Verify all 78 tests pass
3. 🔄 **Integration Testing** - Test with PayPal sandbox account
4. 📊 **Monitoring Setup** - Configure external services (Sentry, etc.)
5. 🚀 **Deployment** - Deploy to staging and production

---

**Last Updated**: 2024  
**Maintained By**: BuyJan Development Team  
**Status**: Production Ready ✅