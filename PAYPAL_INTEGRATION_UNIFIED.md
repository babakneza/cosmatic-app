# PayPal Integration with Checkout Flow - Unified Implementation Guide

**Project**: BuyJan E-Commerce Platform  
**Goal**: Integrate PayPal payment processing into the existing checkout flow  
**Status**: Ready for Implementation  
**Framework**: Next.js 15, React 19, TypeScript  
**Payment SDK**: @paypal/checkout-server-sdk (v1.0.3) - ✅ Already installed

---

## 📋 Current Checkout Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Checkout Flow (CheckoutPageContent.tsx)                     │
└─────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────┐       ┌──────────────────┐
│  1. Shipping    │ ───→ │ 2. Shipping      │ ───→ ┌───────────┐
│   Address       │       │    Method        │      │ 3.        │
└─────────────────┘       └──────────────────┘      │ Payment   │
                                                    │ Method    │
                          ┌──────────────────┐      └───────────┘
                          │ 4. Order Review  │ ───→ 5. Confirmation
                          └──────────────────┘
```

### Current Payment Method Selection (PaymentMethodSelector.tsx)
- **Available Methods**: Cash on Delivery, Credit Card, Debit Card, Bank Transfer
- **UI**: Radio button selection with icons
- **Location**: Step 3 in checkout flow
- **Integration Point**: `PaymentMethod` type, selected and passed through checkout store

---

## 🎯 Integration Strategy

### Phase 1: Environment & Backend Configuration

#### 1.1 Environment Variables
Add to `.env.local`:
```bash
# PayPal Sandbox Credentials
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>
PAYPAL_MODE=sandbox

# Add to `.env.production.local` for production:
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<production_client_id>
PAYPAL_CLIENT_SECRET=<production_secret>
PAYPAL_MODE=live
```

#### 1.2 PayPal Account Setup
- [ ] Create PayPal Business Account
- [ ] Access PayPal Developer Dashboard
- [ ] Generate Sandbox Client ID and Secret
- [ ] Create test merchant and buyer accounts
- [ ] Verify OMR currency support

---

## 🔧 Phase 2: Backend Implementation

### 2.1 Create PayPal Configuration (`src/lib/paypal/config.ts`)
```typescript
import { 
  SandboxEnvironment, 
  LiveEnvironment, 
  PayPalHttpClient 
} from '@paypal/checkout-server-sdk';

const mode = process.env.PAYPAL_MODE || 'sandbox';
const clientId = process.env.PAYPAL_CLIENT_SECRET || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

if (!clientId || !clientSecret) {
  throw new Error('PayPal credentials are missing in environment variables');
}

const environment = mode === 'live' 
  ? new LiveEnvironment(clientId, clientSecret)
  : new SandboxEnvironment(clientId, clientSecret);

export const paypalClient = new PayPalHttpClient(environment);

export { Orders } from '@paypal/checkout-server-sdk';
```

### 2.2 Create Order Service (`src/lib/paypal/create-order.ts`)
```typescript
/**
 * Accepts checkout data from frontend
 * - Order items with prices
 * - Totals (subtotal, tax, shipping)
 * - Customer information
 * Returns: PayPal Order ID
 */
```

**Key Features**:
- Validate order totals on server-side
- Format amounts for OMR currency (3 decimal places)
- Create PayPal order with item breakdown
- Store PayPal order ID temporarily (in session/database)
- Implement error handling and logging

### 2.3 Capture Order Service (`src/lib/paypal/capture-order.ts`)
```typescript
/**
 * Captures payment for approved PayPal order
 * - Receives PayPal Order ID from frontend
 * - Verifies order status with PayPal API
 * - Captures payment
 * - Extracts transaction details (transaction ID, payer info)
 * Returns: Payment details for order creation
 */
```

**Key Features**:
- Verify PayPal order status before capture
- Extract transaction ID for database storage
- Validate payment amount matches cart total
- Handle capture failures
- Log all transactions

### 2.4 Error Handling (`src/lib/paypal/errors.ts`)
```typescript
/**
 * Custom PayPal error class
 * - Map PayPal errors to user-friendly messages
 * - Categorize errors (network, validation, payment)
 * - Provide error codes for debugging
 */
```

### 2.5 API Endpoint: Create Order (`src/app/api/payments/paypal/create-order/route.ts`)
```typescript
/**
 * POST /api/payments/paypal/create-order
 * 
 * Request body:
 * {
 *   items: Array<{ product_id, name, quantity, unit_price }>,
 *   subtotal: number,
 *   tax: number,
 *   shipping: number,
 *   total: number,
 *   customer: { email, phone },
 *   shipping_address: Address,
 *   billing_address: Address
 * }
 * 
 * Response:
 * { orderID: string }
 */
```

**Implementation Checklist**:
- [ ] POST method handler
- [ ] Request validation (amount verification)
- [ ] Server-side total calculation verification
- [ ] Call PayPal create order service
- [ ] CSRF protection
- [ ] Rate limiting (use existing `src/lib/rateLimit.ts`)
- [ ] Error handling
- [ ] Logging

### 2.6 API Endpoint: Capture Order (`src/app/api/payments/paypal/capture-order/route.ts`)
```typescript
/**
 * POST /api/payments/paypal/capture-order
 * 
 * Request body:
 * {
 *   orderID: string (PayPal order ID),
 *   customerId: string,
 *   cartItems: Array,
 *   totals: { subtotal, tax, shipping, total }
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   transactionId: string,
 *   orderData: Order (Directus order created)
 * }
 */
```

**Implementation Checklist**:
- [ ] POST method handler
- [ ] PayPal order validation
- [ ] Call capture service
- [ ] Extract transaction ID
- [ ] Create order in Directus
- [ ] Set `payment_status: 'completed'`
- [ ] Set `payment_intent_id: transactionId`
- [ ] Clear cart
- [ ] Error handling
- [ ] Logging

### 2.7 Orders API Update (`src/lib/api/orders.ts`)
- [ ] Ensure `createOrder()` accepts `payment_intent_id` parameter
- [ ] Store PayPal transaction ID in order record
- [ ] Ensure `payment_method` field stores the payment method type

---

## 🎨 Phase 3: Frontend Implementation

### 3.1 PayPal Button Component (`src/components/checkout/PayPalButton.tsx`)
```typescript
/**
 * Client-side PayPal button component
 * - Loads PayPal SDK dynamically
 * - Renders PayPal Buttons
 * - Handles order creation on user click
 * - Handles approval and capture
 * - Shows loading/error states
 * - Supports RTL layout
 */
```

**Key Features**:
- Load PayPal Buttons SDK (only when PayPal selected)
- Implement `createOrder()` - call backend `/api/payments/paypal/create-order`
- Implement `onApprove()` - call backend `/api/payments/paypal/capture-order`
- Implement `onError()` - display error messages
- Show loading spinner while processing
- Handle currency and locale (Arabic/English, OMR)
- RTL styling support

**Props**:
```typescript
interface PayPalButtonProps {
  orderId?: string; // Internal order ID (if creating)
  cartItems: CartItem[];
  totals: Totals;
  customerId: string;
  onSuccess: (transactionId: string, order: Order) => void;
  onError: (error: string) => void;
  locale: 'ar' | 'en';
  isLoading?: boolean;
}
```

### 3.2 PayPal SDK Loader (`src/lib/paypal/client-sdk.ts`)
```typescript
/**
 * Dynamically loads PayPal Buttons SDK
 * - Loads only when PayPal is selected
 * - Uses correct Client ID
 * - Configures currency (OMR)
 * - Configures locale (en_US / ar_EG)
 * - Handles SDK load errors
 */
```

### 3.3 Update Payment Method Selector
**File**: `src/components/checkout/PaymentMethodSelector.tsx`

**Changes**:
- Add PayPal to `DEFAULT_PAYMENT_METHODS`:
```typescript
{
  id: 'paypal',
  type: 'paypal',
  name: 'PayPal',
  name_ar: 'باي بال',
  is_available: true,
}
```
- Add PayPal icon in `getPaymentIcon()`
- Add PayPal description in localization

### 3.4 Update Checkout Flow
**File**: `src/app/[locale]/checkout/CheckoutPageContent.tsx`

**Changes in Payment Step**:
```typescript
{step === 'payment' && (
  <div>
    <h2>{t('checkout.step_payment')}</h2>
    <PaymentMethodSelector {...props} />
    
    {/* Conditional rendering for PayPal button */}
    {paymentMethod?.id === 'paypal' && (
      <PayPalButton
        cartItems={cartItems}
        totals={totals}
        customerId={customer.id}
        onSuccess={(transactionId) => {
          // Handle successful payment
          setPaymentMethod(paymentMethod);
          setStep('review');
        }}
        onError={(error) => {
          alert(error);
        }}
        locale={locale}
      />
    )}
    
    {paymentMethod?.id !== 'paypal' && (
      <button onClick={onSubmit}>{t('checkout.continue')}</button>
    )}
  </div>
)}
```

### 3.5 Checkout Store Updates (if needed)
**File**: `src/store/checkout.ts`

**Add if implementing async PayPal operations**:
```typescript
interface CheckoutState {
  // ... existing fields
  paypalOrderId?: string;
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  paymentError?: string;
  
  setPaypalOrderId: (id: string) => void;
  setPaymentStatus: (status: string) => void;
  setPaymentError: (error: string) => void;
}
```

### 3.6 Localization Updates

**File**: `src/messages/en.json`
```json
{
  "checkout": {
    "paypal_payment": "Pay with PayPal",
    "paypal_description": "Fast and secure payment with PayPal",
    "paypal_button": "Continue to PayPal",
    "paypal_processing": "Processing payment...",
    "paypal_success": "Payment successful!",
    "paypal_error": "Payment failed. Please try again.",
    "paypal_cancelled": "Payment cancelled."
  }
}
```

**File**: `src/messages/ar.json`
```json
{
  "checkout": {
    "paypal_payment": "الدفع عبر PayPal",
    "paypal_description": "دفع آمن وسريع مع PayPal",
    "paypal_button": "متابعة إلى PayPal",
    "paypal_processing": "جاري معالجة الدفع...",
    "paypal_success": "تم الدفع بنجاح!",
    "paypal_error": "فشل الدفع. يرجى المحاولة مرة أخرى.",
    "paypal_cancelled": "تم إلغاء الدفع."
  }
}
```

---

## 🔐 Phase 4: Security Implementation

### 4.1 Backend Security Measures
- [ ] **Amount Validation**: Verify totals on server-side before payment
- [ ] **CSRF Protection**: Use Next.js built-in CSRF mechanisms
- [ ] **Rate Limiting**: Apply to payment endpoints
  - `/api/payments/paypal/create-order`: 5-10 requests/minute per user
  - `/api/payments/paypal/capture-order`: 5-10 requests/minute per user
- [ ] **Input Validation**: Validate all incoming data
  - Customer ID format
  - Order amounts (must be positive, correct decimal places)
  - Item prices and quantities
  - Address data

### 4.2 Data Protection
- [ ] **No Secret Exposure**: PayPal secret ONLY on server
- [ ] **Sensitive Logging**: Never log full card details, CVV, or personal info
- [ ] **Transaction Logging**: Log only transaction IDs and non-sensitive data
- [ ] **Access Control**: Verify user owns the order before payment

### 4.3 Network Security
- [ ] **HTTPS Enforcement**: Required for production
- [ ] **Secure Cookies**: Set SameSite=Strict for session cookies
- [ ] **CSP Headers**: Configure Content Security Policy

### 4.4 Error Handling
- [ ] **Generic User Messages**: Never expose internal error details to users
- [ ] **Server-Side Logging**: Log detailed errors for debugging
- [ ] **Graceful Failures**: Show clear error states in UI

---

## 🧪 Phase 5: Testing

### 5.1 Unit Tests
- [ ] Create `tests/paypal/config.spec.ts`
  - Test SDK initialization
  - Test environment detection (sandbox vs live)
  
- [ ] Create `tests/paypal/create-order.spec.ts`
  - Test order creation with valid data
  - Test currency formatting (3 decimal places)
  - Test error scenarios
  
- [ ] Create `tests/paypal/capture-order.spec.ts`
  - Test payment capture
  - Test transaction ID extraction
  - Test error handling

### 5.2 API Tests
- [ ] Create `tests/api/paypal-create-order.spec.ts`
  - Test POST endpoint
  - Test rate limiting
  - Test validation
  
- [ ] Create `tests/api/paypal-capture-order.spec.ts`
  - Test capture endpoint
  - Test order creation in Directus
  - Test error responses

### 5.3 Integration Tests
- [ ] Test full checkout flow with PayPal
  - Add items to cart
  - Go to checkout
  - Select PayPal payment
  - Complete PayPal payment
  - Verify order in Directus
  - Verify order confirmation page

### 5.4 Manual Testing (Sandbox)
- [ ] Test successful payment
- [ ] Test payment decline
- [ ] Test payment cancellation
- [ ] Test error scenarios
- [ ] Verify order data in Directus
- [ ] Verify transaction ID storage

### 5.5 Security Testing
- [ ] Test CSRF protection
- [ ] Test rate limiting
- [ ] Test unauthorized access
- [ ] Verify no sensitive data in logs

---

## 📊 Phase 6: Implementation Checklist

### Backend
- [ ] 1. Create `src/lib/paypal/config.ts`
- [ ] 2. Create `src/lib/paypal/create-order.ts`
- [ ] 3. Create `src/lib/paypal/capture-order.ts`
- [ ] 4. Create `src/lib/paypal/errors.ts`
- [ ] 5. Create `src/app/api/payments/paypal/create-order/route.ts`
- [ ] 6. Create `src/app/api/payments/paypal/capture-order/route.ts`
- [ ] 7. Update `src/lib/api/orders.ts` for payment_intent_id support

### Frontend
- [ ] 8. Create `src/components/checkout/PayPalButton.tsx`
- [ ] 9. Create `src/lib/paypal/client-sdk.ts`
- [ ] 10. Update `src/components/checkout/PaymentMethodSelector.tsx`
- [ ] 11. Update `src/app/[locale]/checkout/CheckoutPageContent.tsx`
- [ ] 12. Update `src/store/checkout.ts` (if needed)

### Localization
- [ ] 13. Update `src/messages/en.json`
- [ ] 14. Update `src/messages/ar.json`

### Testing
- [ ] 15. Create PayPal unit tests
- [ ] 16. Create API endpoint tests
- [ ] 17. Manual testing in PayPal Sandbox
- [ ] 18. Security testing

---

## 📌 Key Integration Points

### 1. Payment Method Selection → PayPal Button
```
PaymentMethodSelector (select PayPal)
  ↓
CheckoutPageContent (conditional rendering)
  ↓
PayPalButton (render PayPal button)
```

### 2. PayPal Payment Flow
```
User clicks "Continue to PayPal" button
  ↓
PayPalButton calls `createOrder()`
  ↓
Frontend calls POST /api/payments/paypal/create-order
  ↓
Backend validates cart and creates PayPal order
  ↓
Backend returns PayPal Order ID to frontend
  ↓
PayPal Buttons SDK displays modal/redirects to PayPal
  ↓
User approves payment
  ↓
onApprove() callback triggered
  ↓
Frontend calls POST /api/payments/paypal/capture-order
  ↓
Backend captures payment and creates order in Directus
  ↓
Backend returns transaction ID
  ↓
Frontend navigates to confirmation page
```

### 3. Order Creation Flow
```
handleOrderConfirm() in CheckoutPageContent
  ↓
For PayPal: Transaction already captured, use payment_intent_id
For other methods: Create order directly
  ↓
Create order in Directus with payment details
  ↓
Store payment_method and payment_intent_id
  ↓
Navigate to confirmation page
```

---

## ⚠️ Important Implementation Notes

### 1. Async vs Sync Payment Processing
- **Current flow**: Order created AFTER payment collection (on "Confirm" button)
- **PayPal integration**: Order creation should happen during payment capture
- **Decision**: Handle this in the capture-order endpoint - create Directus order during payment capture
- **Alternative**: Store PayPal order ID in checkout store, create Directus order later

### 2. Cart Clearing
- Current: Cart cleared after order creation
- With PayPal: Clear cart after payment capture success
- Add flag to prevent premature cart clearing

### 3. Error Recovery
- If PayPal payment fails: Keep user on payment step
- If Directus order creation fails after PayPal capture: Log issue, retry, show error
- Consider implementing a job queue for failed orders

### 4. Multi-Currency Support
- Currently: OMR currency (3 decimal places)
- PayPal: Verify OMR is supported in PayPal account settings
- Format: Always use 3 decimal places for OMR (e.g., "100.000")

### 5. Localization
- PayPal SDK supports: en_US, ar_EG (and others)
- Pass correct locale to PayPal SDK
- Translate payment-related messages in app

---

## 🚀 Deployment Checklist

### Staging
- [ ] Deploy code to staging
- [ ] Test with PayPal Sandbox
- [ ] Verify all endpoints working
- [ ] Test error scenarios
- [ ] Performance testing
- [ ] Security testing

### Production
- [ ] Obtain PayPal Live credentials
- [ ] Update `.env.production.local`
- [ ] Test with small amount (1 OMR)
- [ ] Set up monitoring and alerts
- [ ] Prepare rollback plan
- [ ] Deploy code
- [ ] Activate PayPal Live mode
- [ ] Monitor payment success rates

---

## 📚 File Structure Reference

```
src/
├── lib/
│   ├── paypal/
│   │   ├── config.ts          # PayPal SDK configuration
│   │   ├── create-order.ts    # Create PayPal order service
│   │   ├── capture-order.ts   # Capture payment service
│   │   ├── errors.ts          # Error handling
│   │   └── client-sdk.ts      # SDK loader for frontend
│   └── api/
│       └── orders.ts          # Updated for payment_intent_id
│
├── components/
│   └── checkout/
│       ├── PaymentMethodSelector.tsx (updated)
│       └── PayPalButton.tsx    # NEW
│
├── app/
│   └── api/
│       └── payments/
│           └── paypal/
│               ├── create-order/
│               │   └── route.ts    # NEW
│               └── capture-order/
│                   └── route.ts    # NEW
│
└── store/
    └── checkout.ts            # Updated if needed

tests/
├── paypal/
│   ├── config.spec.ts
│   ├── create-order.spec.ts
│   └── capture-order.spec.ts
└── api/
    ├── paypal-create-order.spec.ts
    └── paypal-capture-order.spec.ts
```

---

## 🔗 Related Documentation

- **Repository Info**: `.zencoder/rules/repo.md`
- **PayPal Checklist**: `PAYPAL_CHECKLIST.md`
- **PayPal Integration TODO**: `PAYPAL_INTEGRATION_TODO.md`
- **Checkout Store**: `src/store/checkout.ts`
- **Checkout Component**: `src/app/[locale]/checkout/CheckoutPageContent.tsx`
- **Payment Methods**: `src/components/checkout/PaymentMethodSelector.tsx`

---

## 📞 Support & Troubleshooting

### Common Issues

1. **PayPal SDK not loading**
   - Check Client ID in environment variables
   - Verify HTTPS in production
   - Check browser console for errors

2. **Payment capture fails**
   - Verify order total matches PayPal order
   - Check PayPal account credentials
   - Review server logs

3. **Order not created in Directus**
   - Verify Directus token in environment
   - Check order validation logic
   - Review error logs

4. **OMR currency not supported**
   - Verify PayPal account settings
   - Contact PayPal support

---

**Last Updated**: 2024
**Version**: 1.0.0
**Author**: Development Team