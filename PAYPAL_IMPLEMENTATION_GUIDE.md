# PayPal Payment Integration - Implementation Guide

## BuyJan E-Commerce Platform
**Comprehensive Architecture & Best Practices**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Approach](#implementation-approach)
3. [Security Best Practices](#security-best-practices)
4. [Code Organization](#code-organization)
5. [Integration Points](#integration-points)
6. [Error Handling Strategy](#error-handling-strategy)
7. [Testing Strategy](#testing-strategy)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Logging](#monitoring--logging)
10. [Compliance & Regulations](#compliance--regulations)

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────┐
│   Checkout UI   │ (React Component)
└────────┬────────┘
         │
         ├─────────── Select PayPal Payment ──────────────┐
         │                                                 │
         ├─────────── Submit Order ───────────────────────┤
         │                                                 │
         ▼                                                 ▼
┌─────────────────────────────────┐    ┌────────────────────────────┐
│  Frontend: PayPalButton Component   │    │  Backend: API Routes       │
│                                     │    │                            │
│  Handles:                          │    │  POST /api/payments/paypal/│
│  - SDK Loading                     │    │      create-order          │
│  - Button Rendering                │    │                            │
│  - User Interactions                │    │  POST /api/payments/paypal/│
│  - Approval Flow                    │    │      capture-order         │
└────────┬────────────────────────────┘    └────────┬─────────────────┘
         │                                           │
         ├──────────────────────────────────────────┤
         │                                           │
         ▼                                           ▼
    ┌──────────────────────────────────────────────────────┐
    │         PayPal Hosted Checkout                        │
    │  (Customer interacts with PayPal, not your site)     │
    └──────────────────────────────────────────────────────┘
         │                                           │
         │  (After Approval)                         │
         │                                           │
         ▼                                           ▼
    ┌──────────────────────────────────────────────────────┐
    │    Backend: PayPal SDK                               │
    │  - captureOrder() API Call                           │
    │  - Transaction Processing                            │
    │  - Payment Confirmation                              │
    └────────┬─────────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────────┐
    │    Directus: Create Order Record                     │
    │  - Store order in orders collection                  │
    │  - Set payment_status: 'completed'                   │
    │  - Store transaction ID in payment_intent_id         │
    └────────┬─────────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────────┐
    │    Frontend: Show Confirmation                       │
    │  - Display order details                             │
    │  - Show transaction ID                               │
    │  - Send confirmation email                           │
    └──────────────────────────────────────────────────────┘
```

### System Architecture

```
Your Next.js App
├── Client Layer (React Components)
│   ├── PaymentMethodSelector
│   ├── PayPalButton
│   └── CheckoutForm
│
├── API Routes Layer (Next.js API)
│   ├── /api/payments/paypal/create-order
│   ├── /api/payments/paypal/capture-order
│   └── /api/webhooks/paypal (optional)
│
├── Business Logic Layer
│   └── /lib/paypal/
│       ├── config.ts (SDK initialization)
│       ├── create-order.ts (order creation)
│       ├── capture-order.ts (payment capture)
│       └── errors.ts (error handling)
│
├── Integration Layer
│   ├── Directus API (orders collection)
│   ├── Auth Store (user info)
│   └── Checkout Store (order data)
│
└── External Services
    ├── PayPal Sandbox (testing)
    └── PayPal Production (live)
```

---

## Implementation Approach

### Phase-Based Implementation

#### Phase 1: Foundation (Week 1)
- Set up PayPal credentials
- Create `src/lib/paypal/config.ts` (SDK configuration)
- Set up environment variables
- Create helper functions for order data validation

#### Phase 2: Backend (Week 1-2)
- Implement `createOrder()` function
- Implement `captureOrder()` function
- Create API routes
- Implement error handling
- Add logging and monitoring

#### Phase 3: Frontend (Week 2)
- Create `PayPalButton.tsx` component
- Integrate with checkout flow
- Add loading states and error messages
- Implement user feedback mechanisms

#### Phase 4: Integration (Week 2-3)
- Connect frontend to backend
- Connect backend to Directus
- Test end-to-end flow
- Implement order creation in Directus

#### Phase 5: Testing (Week 3)
- Unit tests for all functions
- Integration tests for API routes
- E2E tests for checkout flow
- Security testing

#### Phase 6: Deployment (Week 3-4)
- Staging deployment
- Production setup
- Monitoring configuration
- Go-live checklist

---

## Security Best Practices

### 1. Credential Management

✅ **DO:**
```typescript
// Store sensitive info in environment variables
const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // Public, safe
const clientSecret = process.env.PAYPAL_CLIENT_SECRET; // Private, server-only
```

❌ **DON'T:**
```typescript
// Never hardcode credentials
const clientId = "AWO6VqhV8n..."; // Exposed!
const clientSecret = "EMjsNvSXcT..."; // Major security risk!
```

### 2. Server-Side Processing

✅ **DO:**
```typescript
// API route (server-side)
export async function POST(req: NextRequest) {
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET; // ✓ Safe
  // Process payment on server
}
```

❌ **DON'T:**
```typescript
// Client-side component
const PayPalButton = () => {
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET; // ✗ Exposed to browser!
}
```

### 3. Amount Validation

✅ **DO:**
```typescript
// Server-side validation
export async function POST(req: NextRequest) {
  const { items, subtotal, tax, shipping, total } = await req.json();
  
  // Calculate total server-side
  const calculatedTotal = subtotal + tax + shipping;
  
  // Verify amounts match
  if (Math.abs(calculatedTotal - total) > 0.01) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }
}
```

❌ **DON'T:**
```typescript
// Never trust client-provided total
export async function POST(req: NextRequest) {
  const { total } = await req.json();
  // Use client's total directly - vulnerable to tampering!
  await captureOrder(total); // ✗ Security risk!
}
```

### 4. Error Message Security

✅ **DO:**
```typescript
// Generic message to user, detailed logging on server
try {
  await captureOrder(paypalOrderId);
} catch (error) {
  console.error('[PayPal] Detailed error:', error); // Server log
  return NextResponse.json(
    { error: 'Payment processing failed' }, // Generic message
    { status: 500 }
  );
}
```

❌ **DON'T:**
```typescript
// Exposing internal error details
catch (error) {
  return NextResponse.json(
    { error: `Database connection failed: ${error.message}` }, // ✗ Too much info!
    { status: 500 }
  );
}
```

### 5. HTTPS & Secure Transport

✅ **DO:**
```typescript
// Enforce HTTPS
const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation`;
// Must be HTTPS in production
```

### 6. Rate Limiting

✅ **DO:**
```typescript
// Import existing rate limiter
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  const limited = await rateLimit(clientIp, 'paypal-order', 5, 60000); // 5 per minute
  
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // Process order...
}
```

### 7. Input Validation

✅ **DO:**
```typescript
// Validate all inputs
function validateOrderData(orderData: any) {
  if (!orderData.customerId || typeof orderData.customerId !== 'string') {
    throw new Error('Invalid customer ID');
  }
  
  if (typeof orderData.total !== 'number' || orderData.total <= 0) {
    throw new Error('Invalid order total');
  }
  
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('Order must contain items');
  }
  
  return true;
}
```

---

## Code Organization

### Directory Structure

```
src/lib/paypal/
├── config.ts                 # PayPal SDK configuration
│   ├── client()             # Returns PayPal HTTP client
│   └── environment()        # Returns sandbox or live environment
│
├── create-order.ts          # Create PayPal order
│   └── createOrder()        # Takes order data, returns PayPal Order ID
│
├── capture-order.ts         # Capture payment
│   └── captureOrder()       # Takes PayPal Order ID, returns transaction details
│
├── errors.ts                # Error handling
│   ├── PayPalError          # Custom error class
│   ├── ERROR_MESSAGES       # User-friendly error messages
│   └── mapPayPalError()     # Map PayPal errors to user messages
│
├── hooks.ts                 # React hooks (optional)
│   ├── usePayPalOrder()     # Hook for creating PayPal order
│   └── usePayPalCapture()   # Hook for capturing order
│
├── types.ts                 # TypeScript types
│   ├── PayPalOrderData      # Order creation data
│   ├── PayPalCaptureResult  # Capture response
│   └── PayPalError          # Error types
│
└── utils.ts                 # Utility functions (optional)
    ├── formatCurrency()     # Format OMR amounts
    └── validateAmount()     # Validate payment amounts
```

### API Routes Structure

```
src/app/api/payments/
├── paypal/
│   ├── create-order/
│   │   └── route.ts         # POST endpoint for creating order
│   │       ├── Request validation
│   │       ├── PayPal SDK call
│   │       ├── Error handling
│   │       └── Response formatting
│   │
│   ├── capture-order/
│   │   └── route.ts         # POST endpoint for capturing order
│   │       ├── Request validation
│   │       ├── PayPal SDK call
│   │       ├── Directus order creation
│   │       ├── Payment status update
│   │       └── Response formatting
│   │
│   └── webhooks/ (optional)
│       └── route.ts         # Webhook for PayPal notifications
│           ├── Signature verification
│           ├── Event processing
│           ├── Order status updates
│           └── Logging
```

### Components Structure

```
src/components/checkout/
├── PaymentMethodSelector.tsx
│   ├── Displays all payment methods (including PayPal)
│   └── Passes selection to checkout store
│
├── PayPalButton.tsx (NEW)
│   ├── Loads PayPal SDK
│   ├── Renders PayPal buttons
│   ├── Handles user interactions
│   ├── Manages loading states
│   └── Error display
│
└── [Other checkout components]
```

---

## Integration Points

### 1. Checkout Store Integration

```typescript
// In useCheckoutStore
export interface CheckoutState {
  paymentMethod: PaymentMethod | null;
  // NEW FIELDS:
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentError: string | null;
  paypalOrderId: string | null;
  transactionId: string | null;
  
  // NEW ACTIONS:
  setPaymentStatus: (status: string) => void;
  setPaymentError: (error: string | null) => void;
  setPaypalOrderId: (id: string) => void;
  setTransactionId: (id: string) => void;
}
```

### 2. Auth Store Integration

```typescript
// Retrieve user info from auth store for PayPal
import { useAuthStore } from '@/store/auth';

const { user, accessToken } = useAuthStore();
const customerId = user?.id;
const customerEmail = user?.email;
```

### 3. Directus Order Creation Integration

```typescript
// After successful PayPal capture, create order in Directus
import { createOrder } from '@/lib/api/orders';

await createOrder(customerId, accessToken, {
  customer_email: customerEmail,
  items: cartItems,
  subtotal: cartTotal.subtotal,
  tax_amount: cartTotal.tax,
  shipping_cost: cartTotal.shipping,
  total: cartTotal.total,
  payment_method: 'paypal',
  payment_intent_id: transactionId, // From PayPal capture
  shipping_address: formatAddressAsJSON(shippingAddress),
  billing_address: formatAddressAsJSON(billingAddress),
});
```

### 4. Localization Integration

```typescript
// Use existing i18n system
import { useTranslations } from 'next-intl';

const t = useTranslations();

const errorMessage = t('checkout.payment_failed');
const processingMessage = t('checkout.payment_processing');
```

---

## Error Handling Strategy

### Error Hierarchy

```
PayPalError (Custom)
├── ValidationError
│   ├── Invalid amount
│   ├── Invalid currency
│   └── Invalid order data
├── NetworkError
│   ├── Connection timeout
│   ├── DNS resolution failure
│   └── Server unreachable
├── AuthenticationError
│   ├── Invalid client ID
│   ├── Invalid secret
│   └── Expired credentials
├── PaymentError
│   ├── Payment declined
│   ├── Insufficient funds
│   └── Card expired
└── SystemError
    ├── Directus connection failed
    ├── Database error
    └── Unknown error
```

### Error Handling Pattern

```typescript
// src/lib/paypal/errors.ts
export class PayPalError extends Error {
  constructor(
    public code: string,
    public message: string,
    public userMessage: string,
    public statusCode: number = 500,
    public originalError?: any
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

// API Route
export async function POST(req: NextRequest) {
  try {
    // Process payment
  } catch (error) {
    const paypalError = handlePayPalError(error);
    
    // Log detailed error server-side
    console.error('[PayPal]', paypalError.message, paypalError.originalError);
    
    // Return generic message to client
    return NextResponse.json(
      { error: paypalError.userMessage },
      { status: paypalError.statusCode }
    );
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/paypal/create-order.spec.ts
describe('createOrder', () => {
  it('should create PayPal order with valid data', async () => {
    const result = await createOrder({
      amount: '100.00',
      currency: 'OMR',
      reference: 'ORD-123',
      items: [/* ... */],
    });
    
    expect(result).toHaveProperty('id');
    expect(result.id).toMatch(/^[A-Z0-9-]+$/);
  });
  
  it('should throw error with invalid amount', async () => {
    await expect(createOrder({
      amount: '-50.00', // Invalid
      currency: 'OMR',
      reference: 'ORD-123',
      items: [],
    })).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// tests/api/paypal-create-order.spec.ts
describe('POST /api/payments/paypal/create-order', () => {
  it('should return PayPal order ID', async () => {
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({
        items: [/* ... */],
        subtotal: 95.00,
        tax: 2.00,
        shipping: 3.00,
        total: 100.00,
        orderNumber: 'ORD-123',
      }),
    });
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(response.status).toBe(200);
  });
  
  it('should reject amount mismatch', async () => {
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({
        subtotal: 95.00,
        tax: 2.00,
        shipping: 3.00,
        total: 200.00, // Mismatch!
        orderNumber: 'ORD-123',
      }),
    });
    
    expect(response.status).toBe(400);
  });
});
```

### E2E Tests

```typescript
// tests/checkout-paypal.spec.ts
test('Complete checkout with PayPal', async ({ page }) => {
  // Add item to cart
  await addToCart(page, 'product-id');
  
  // Go to checkout
  await page.goto('/checkout');
  
  // Fill shipping address
  await fillShippingForm(page);
  
  // Select PayPal
  await page.click('text=PayPal');
  
  // Submit order
  await page.click('text=Pay with PayPal');
  
  // Simulate PayPal approval (in test environment)
  // ... PayPal iframe handling ...
  
  // Verify confirmation
  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

---

## Performance Optimization

### 1. SDK Loading Optimization

```typescript
// Load SDK only when PayPal is selected
import dynamic from 'next/dynamic';

const PayPalButton = dynamic(() => import('./PayPalButton'), {
  loading: () => <div>Loading payment options...</div>,
  ssr: false, // Don't server-side render
});

// Only render when PayPal selected
{selectedPaymentMethod?.id === 'paypal' && <PayPalButton />}
```

### 2. Request Optimization

```typescript
// Batch data for API calls
const orderDataToSend = {
  // Only send necessary fields
  items: cartItems.map(item => ({
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
  })),
  subtotal,
  tax,
  shipping,
  total,
  orderNumber,
};
```

### 3. Caching Strategy

```typescript
// Cache PayPal configuration
const paypalConfig = useMemo(() => ({
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: 'OMR',
  locale: locale === 'ar' ? 'ar-OM' : 'en-US',
}), [locale]);
```

### 4. Error Retry with Exponential Backoff

```typescript
// Use existing retry utility
import { retryWithBackoff } from '@/lib/retry';

const paypalOrderId = await retryWithBackoff(
  () => fetch('/api/payments/paypal/create-order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  { maxAttempts: 3, backoffMultiplier: 2 }
);
```

---

## Monitoring & Logging

### Logging Strategy

```typescript
// src/lib/paypal/logger.ts
export function logPaymentEvent(event: string, data: any) {
  console.log(`[PayPal Payment] ${event}`, {
    timestamp: new Date().toISOString(),
    orderNumber: data.orderNumber,
    amount: data.total,
    status: data.status,
    // Never log sensitive data
    // DO NOT log: paymentIntent, transactionId details, card info
  });
}

// Usage
logPaymentEvent('order_created', {
  orderNumber: 'ORD-123',
  total: 100.00,
  status: 'pending',
});

logPaymentEvent('payment_captured', {
  orderNumber: 'ORD-123',
  total: 100.00,
  status: 'completed',
});
```

### Error Tracking

```typescript
// Track payment errors for analysis
export function trackPaymentError(
  errorCode: string,
  message: string,
  context: any
) {
  console.error(`[PayPal Error] ${errorCode}: ${message}`, context);
  
  // Optionally send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
}
```

### Metrics to Track

```
- Payment method selection rate (PayPal vs others)
- Order creation success rate
- Payment capture success rate
- Average payment processing time
- Error rate by error type
- Cart abandonment rate at payment step
- Revenue by payment method
```

---

## Compliance & Regulations

### PCI DSS Compliance

✅ **PayPal handles PCI DSS for you** - Your site never handles credit cards directly

- PayPal is PCI-DSS Level 1 compliant
- Never store or transmit card data yourself
- Use Hosted Checkout (you're already doing this)

### GDPR Compliance (if applicable)

- [ ] Document PayPal as data processor
- [ ] Include PayPal in privacy policy
- [ ] Allow users to delete payment data
- [ ] Get consent for payment processing

### Local Regulations (Oman)

- [ ] Verify Oman allows PayPal payments
- [ ] Check currency regulations for OMR
- [ ] Document tax handling
- [ ] Comply with local payment laws

### Currency & Tax

```typescript
// Ensure proper currency handling
const CURRENCY = 'OMR'; // Omani Rial
const TAX_RATE = 0.05; // 5% tax (adjust as needed)

// Format amounts with correct decimals
const formatAmount = (amount: number) => {
  return amount.toFixed(3); // OMR uses 3 decimal places
};
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code reviewed
- [ ] Tests passing (unit, integration, E2E)
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] PayPal credentials obtained
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team trained

### Deployment Steps

```bash
# 1. Set production environment variables
export NEXT_PUBLIC_PAYPAL_CLIENT_ID="YOUR_LIVE_CLIENT_ID"
export PAYPAL_CLIENT_SECRET="YOUR_LIVE_SECRET"
export PAYPAL_MODE="live"

# 2. Deploy code
npm run build
npm start

# 3. Verify endpoints
curl https://buyjan.com/api/payments/paypal/create-order

# 4. Test with small transaction

# 5. Monitor logs and metrics
```

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check payment success rate (target: >95%)
- [ ] Verify order creation in Directus
- [ ] Check customer feedback
- [ ] Monitor system performance
- [ ] Review payment logs daily for first week

---

## Summary

PayPal integration should follow these core principles:

1. **Security First**: Credentials server-side, validate everything, use HTTPS
2. **User Experience**: Smooth flow, clear error messages, multi-language support
3. **Reliability**: Error handling, retry logic, monitoring
4. **Compliance**: PCI-DSS, GDPR, local regulations
5. **Performance**: Optimize SDK loading, efficient API calls
6. **Testing**: Comprehensive test coverage before production

---

## Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Directus API Documentation](https://docs.directus.io/)
- [OWASP Payment Security](https://owasp.org/www-community/attacks/Fraud_using_payment_gateways)

---

**Last Updated**: 2024  
**Maintained By**: Development Team  
**Status**: Ready for Implementation