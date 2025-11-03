# PayPal Integration - Code Templates & Snippets

Copy these templates and use them as starting points for your implementation.

---

## 📂 Template 1: PayPal Configuration

**File**: `src/lib/paypal/config.ts`

```typescript
import {
  SandboxEnvironment,
  LiveEnvironment,
  PayPalHttpClient,
} from '@paypal/checkout-server-sdk';

// Get environment variables
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || 'sandbox';

// Validate credentials
if (!clientId || !clientSecret) {
  console.error('❌ PayPal credentials missing in environment variables');
  console.error('Required: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET');
  throw new Error('PayPal configuration error: Missing credentials');
}

// Create environment based on mode
const environment = 
  mode === 'live'
    ? new LiveEnvironment(clientId, clientSecret)
    : new SandboxEnvironment(clientId, clientSecret);

// Create PayPal HTTP client
export const paypalClient = new PayPalHttpClient(environment);

// Export Orders class for use in services
export { OrdersCreateRequest, OrdersCaptureRequest } from '@paypal/checkout-server-sdk';

// Export mode for debugging
export const isLiveMode = mode === 'live';

// Log configuration status
if (typeof window === 'undefined') {
  // Server-side only
  console.log(`✅ PayPal configured: ${mode.toUpperCase()} mode`);
}
```

---

## 📂 Template 2: Create Order Service

**File**: `src/lib/paypal/create-order.ts`

```typescript
import { paypalClient, OrdersCreateRequest } from './config';
import logger from '@/lib/logger';

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customer_email: string;
  return_url: string;
  cancel_url: string;
}

export interface CreateOrderResponse {
  orderID: string;
  status: string;
}

/**
 * Creates a PayPal order
 * @param orderData Order data from checkout
 * @returns PayPal Order ID
 */
export async function createPayPalOrder(
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> {
  try {
    // Validate inputs
    if (!orderData.total || orderData.total <= 0) {
      throw new Error('Invalid order total');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Format amount for OMR (3 decimal places)
    const formatAmount = (amount: number): string => {
      return amount.toFixed(3);
    };

    // Build request
    const request = new OrdersCreateRequest();
    request.headers['prefer'] = 'return=representation';
    request.body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `order_${Date.now()}`,
          amount: {
            currency_code: 'OMR',
            value: formatAmount(orderData.total),
            breakdown: {
              item_total: {
                currency_code: 'OMR',
                value: formatAmount(orderData.subtotal),
              },
              tax_total: {
                currency_code: 'OMR',
                value: formatAmount(orderData.tax),
              },
              shipping: {
                currency_code: 'OMR',
                value: formatAmount(orderData.shipping),
              },
            },
          },
          items: orderData.items.map((item) => ({
            name: item.name,
            sku: item.product_id,
            unit_amount: {
              currency_code: 'OMR',
              value: formatAmount(item.unit_price),
            },
            quantity: item.quantity.toString(),
          })),
          payee: {
            email_address: 'seller@example.com', // Replace with your business account
          },
        },
      ],
      payer: {
        email_address: orderData.customer_email,
      },
      application_context: {
        brand_name: 'BuyJan',
        locale: 'en_US',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: orderData.return_url,
        cancel_url: orderData.cancel_url,
      },
    };

    // Execute request
    const response = await paypalClient.execute(request);

    // Log success
    logger.info('PayPal order created', {
      paypalOrderID: response.result.id,
      status: response.result.status,
      customEmail: orderData.customer_email,
      total: orderData.total,
    });

    return {
      orderID: response.result.id,
      status: response.result.status,
    };
  } catch (error: any) {
    logger.error('Failed to create PayPal order', {
      error: error.message,
      statusCode: error.statusCode,
      total: orderData.total,
    });

    throw new Error(
      `PayPal order creation failed: ${error.message || 'Unknown error'}`
    );
  }
}
```

---

## 📂 Template 3: Capture Order Service

**File**: `src/lib/paypal/capture-order.ts`

```typescript
import { paypalClient, OrdersCaptureRequest } from './config';
import logger from '@/lib/logger';

export interface CaptureOrderResponse {
  orderID: string;
  transactionID: string;
  payerEmail: string;
  payerName: string;
  status: string;
  amount: number;
}

/**
 * Captures payment for an approved PayPal order
 * @param orderID PayPal Order ID
 * @returns Transaction details
 */
export async function capturePayPalOrder(
  orderID: string
): Promise<CaptureOrderResponse> {
  try {
    if (!orderID) {
      throw new Error('PayPal Order ID is required');
    }

    // Build capture request
    const request = new OrdersCaptureRequest(orderID);
    request.headers['prefer'] = 'return=representation';

    // Execute capture
    const response = await paypalClient.execute(request);

    // Extract transaction details
    const order = response.result;
    const purchase = order.purchase_units?.[0];
    const payment = purchase?.payments?.captures?.[0];
    const payer = order.payer;

    if (!payment || payment.status !== 'COMPLETED') {
      throw new Error('Payment capture was not completed');
    }

    // Log success
    logger.info('PayPal order captured', {
      paypalOrderID: orderID,
      transactionID: payment.id,
      payerEmail: payer?.email_address,
      amount: payment.amount?.value,
      status: payment.status,
    });

    return {
      orderID: order.id,
      transactionID: payment.id,
      payerEmail: payer?.email_address || 'unknown',
      payerName: 
        `${payer?.name?.given_name} ${payer?.name?.surname}`.trim() || 'Customer',
      status: payment.status,
      amount: parseFloat(payment.amount?.value || '0'),
    };
  } catch (error: any) {
    logger.error('Failed to capture PayPal order', {
      error: error.message,
      statusCode: error.statusCode,
      orderID,
    });

    throw new Error(
      `PayPal payment capture failed: ${error.message || 'Unknown error'}`
    );
  }
}
```

---

## 📂 Template 4: Error Handling

**File**: `src/lib/paypal/errors.ts`

```typescript
export class PayPalError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

/**
 * Maps PayPal errors to user-friendly messages
 */
export function mapPayPalErrorToUserMessage(error: any): string {
  // Log detailed error for debugging
  console.error('[PayPal Error Details]', {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    details: error.details,
  });

  // Return user-friendly message based on error type
  if (error.statusCode === 401 || error.statusCode === 403) {
    return 'Payment authorization failed. Please check your PayPal account.';
  }

  if (error.statusCode === 422) {
    return 'Payment information is invalid. Please try again.';
  }

  if (error.message?.includes('INSUFFICIENT_FUNDS')) {
    return 'Insufficient funds in your PayPal account.';
  }

  if (error.message?.includes('INSTRUMENT_DECLINED')) {
    return 'Your payment method was declined. Please try another.';
  }

  if (error.message?.includes('PAYER_ACCOUNT_RESTRICTED')) {
    return 'Your PayPal account has restrictions. Please contact PayPal.';
  }

  if (
    error.message?.includes('ALREADY_CAPTURED') ||
    error.message?.includes('ALREADY_VOIDED')
  ) {
    return 'This payment has already been processed.';
  }

  // Generic fallback
  return 'Payment processing failed. Please try again or contact support.';
}

/**
 * Validates PayPal API response
 */
export function validatePayPalResponse(response: any): boolean {
  if (!response.result) {
    throw new PayPalError('Invalid PayPal response: No result', 'INVALID_RESPONSE');
  }

  if (!response.result.id) {
    throw new PayPalError(
      'Invalid PayPal response: No order ID',
      'MISSING_ORDER_ID'
    );
  }

  return true;
}
```

---

## 📂 Template 5: Create Order API Endpoint

**File**: `src/app/api/payments/paypal/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal/create-order';
import { PayPalError, mapPayPalErrorToUserMessage } from '@/lib/paypal/errors';
import logger from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Get user identifier for rate limiting
    const userId = request.headers.get('x-user-id') || request.ip || 'anonymous';
    
    // Apply rate limiting
    const { success, limit, remaining, reset } = await rateLimit(
      `paypal-create-order:${userId}`,
      10 // 10 requests
    );

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (typeof body.total !== 'number' || body.total <= 0) {
      return NextResponse.json(
        { error: 'Invalid order total' },
        { status: 400 }
      );
    }

    if (!body.customer_email || !body.return_url || !body.cancel_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create PayPal order
    const result = await createPayPalOrder({
      items: body.items,
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      shipping: body.shipping || 0,
      total: body.total,
      customer_email: body.customer_email,
      return_url: body.return_url,
      cancel_url: body.cancel_url,
    });

    logger.info('PayPal order creation endpoint called', {
      userId,
      orderID: result.orderID,
      total: body.total,
    });

    return NextResponse.json(result, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error: any) {
    const userMessage = mapPayPalErrorToUserMessage(error);

    logger.error('PayPal create order endpoint error', {
      error: error.message,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      { error: userMessage },
      { status: error.statusCode || 500 }
    );
  }
}
```

---

## 📂 Template 6: Capture Order API Endpoint

**File**: `src/app/api/payments/paypal/capture-order/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal/capture-order';
import { createOrder } from '@/lib/api/orders';
import { PayPalError, mapPayPalErrorToUserMessage } from '@/lib/paypal/errors';
import logger from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Get user identifier for rate limiting
    const userId = request.headers.get('x-user-id') || request.ip || 'anonymous';
    
    // Apply rate limiting
    const { success, remaining, reset } = await rateLimit(
      `paypal-capture-order:${userId}`,
      10
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.orderID) {
      return NextResponse.json(
        { error: 'PayPal Order ID is required' },
        { status: 400 }
      );
    }

    if (!body.customerId || !body.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Capture PayPal payment
    const paypalResult = await capturePayPalOrder(body.orderID);

    logger.info('PayPal payment captured', {
      userId,
      transactionID: paypalResult.transactionID,
      amount: paypalResult.amount,
    });

    // Create order in Directus
    const directusOrder = await createOrder(body.customerId, body.accessToken, {
      customer_email: body.customer_email,
      shipping_address: body.shipping_address,
      billing_address: body.billing_address,
      items: body.items,
      subtotal: body.subtotal,
      tax_rate: 0,
      tax_amount: body.tax,
      shipping_cost: body.shipping,
      discount_amount: 0,
      total: body.total,
      payment_method: 'paypal',
      payment_intent_id: paypalResult.transactionID,
    });

    logger.info('Order created in Directus after PayPal capture', {
      directusOrderID: directusOrder.id,
      orderNumber: directusOrder.order_number,
      transactionID: paypalResult.transactionID,
    });

    return NextResponse.json(
      {
        success: true,
        transactionID: paypalResult.transactionID,
        orderID: directusOrder.id,
        orderNumber: directusOrder.order_number,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    const userMessage = mapPayPalErrorToUserMessage(error);

    logger.error('PayPal capture order endpoint error', {
      error: error.message,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      { error: userMessage },
      { status: error.statusCode || 500 }
    );
  }
}
```

---

## 📂 Template 7: PayPal Button Component

**File**: `src/components/checkout/PayPalButton.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { OnApproveData } from '@paypal/checkout-server-sdk';
import { CartItem, Order, Locale } from '@/types';

interface PayPalButtonProps {
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  customerId: string;
  customerEmail: string;
  shippingAddress: any;
  billingAddress?: any;
  onSuccess: (transactionId: string, order: Order) => void;
  onError: (error: string) => void;
  locale: Locale;
  isLoading?: boolean;
}

export default function PayPalButton({
  cartItems,
  totals,
  customerId,
  customerEmail,
  shippingAddress,
  billingAddress,
  onSuccess,
  onError,
  locale,
  isLoading = false,
}: PayPalButtonProps) {
  const t = useTranslations();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    if (typeof window === 'undefined' || paypalLoaded) return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error('PayPal Client ID not found');
      return;
    }

    // Add PayPal script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=OMR&locale=${
      locale === 'ar' ? 'ar_EG' : 'en_US'
    }`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => {
      onError('Failed to load PayPal SDK');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render PayPal button when SDK is loaded
  useEffect(() => {
    if (!paypalLoaded || typeof window === 'undefined' || !window.paypal) return;

    // Create order on button click
    const createOrder = async () => {
      try {
        setProcessing(true);

        const response = await fetch('/api/payments/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              product_id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              unit_price: item.product.sale_price || item.product.price,
            })),
            subtotal: totals.subtotal,
            tax: totals.tax,
            shipping: totals.shipping,
            total: totals.total,
            customer_email: customerEmail,
            return_url: `${window.location.origin}/${locale}/checkout`,
            cancel_url: `${window.location.origin}/${locale}/checkout`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create PayPal order');
        }

        const data = await response.json();
        return data.orderID;
      } catch (error: any) {
        onError(error.message || 'Failed to create order');
        throw error;
      } finally {
        setProcessing(false);
      }
    };

    // Approve and capture payment
    const onApprove = async (data: OnApproveData) => {
      try {
        setProcessing(true);

        const response = await fetch('/api/payments/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderID: data.orderID,
            customerId,
            customer_email: customerEmail,
            shipping_address: shippingAddress,
            billing_address: billingAddress || shippingAddress,
            items: cartItems.map((item) => ({
              product: item.product.id,
              product_name: item.product.name,
              quantity: item.quantity,
              unit_price: item.product.sale_price || item.product.price,
              line_total:
                (item.product.sale_price || item.product.price) * item.quantity,
            })),
            subtotal: totals.subtotal,
            tax: totals.tax,
            shipping: totals.shipping,
            total: totals.total,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to capture payment');
        }

        const result = await response.json();
        onSuccess(result.transactionID, result.orderData);
      } catch (error: any) {
        onError(error.message || 'Payment failed');
      } finally {
        setProcessing(false);
      }
    };

    // Render buttons
    window.paypal
      .Buttons({
        createOrder,
        onApprove,
        onError: () => {
          onError('PayPal payment failed');
        },
        onCancel: () => {
          onError('Payment cancelled');
        },
        style: {
          layout: locale === 'ar' ? 'horizontal' : 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        },
      })
      .render('#paypal-button-container');
  }, [
    paypalLoaded,
    cartItems,
    totals,
    customerId,
    customerEmail,
    locale,
    onSuccess,
    onError,
  ]);

  if (!paypalLoaded || isLoading || processing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700">
          {t('checkout.paypal_processing')}
        </span>
      </div>
    );
  }

  return <div id="paypal-button-container" className="mt-6 mb-6" />;
}
```

---

## 📂 Template 8: Update Payment Method Selector

**File**: `src/components/checkout/PaymentMethodSelector.tsx` (Changes)

```typescript
// ADD to DEFAULT_PAYMENT_METHODS array:

{
  id: 'paypal',
  type: 'paypal',
  name: 'PayPal',
  name_ar: 'باي بال',
  is_available: true,
},

// ADD to getPaymentIcon() function:

case 'paypal':
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      {/* PayPal logo SVG path */}
      <path d="M20.5 9.5h-3.5L15.5 7h-3l.5 2.5h-3.5l-.5-2.5h-3l.5 2.5H3l1.5 8h3.5l1-5.5h3.5l-1 5.5h3.5l.5-2.5h3.5z" />
    </svg>
  );
```

---

## 📂 Template 9: Localization Messages

**File**: `src/messages/en.json` (Add to checkout section)

```json
{
  "checkout": {
    "paypal_payment": "Pay with PayPal",
    "paypal_description": "Fast and secure payment with your PayPal account",
    "paypal_processing": "Processing payment...",
    "paypal_success": "Payment successful!",
    "paypal_error": "Payment failed. Please try again.",
    "paypal_cancelled": "Payment was cancelled."
  }
}
```

**File**: `src/messages/ar.json` (Add to checkout section)

```json
{
  "checkout": {
    "paypal_payment": "الدفع عبر PayPal",
    "paypal_description": "دفع آمن وسريع باستخدام حسابك على PayPal",
    "paypal_processing": "جاري معالجة الدفع...",
    "paypal_success": "تم الدفع بنجاح!",
    "paypal_error": "فشل الدفع. يرجى المحاولة مرة أخرى.",
    "paypal_cancelled": "تم إلغاء الدفع."
  }
}
```

---

## 🔧 Environment Variables Template

**File**: `.env.local` (Add these)

```bash
# PayPal Sandbox Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_MODE=sandbox

# Add to .env.production.local for production:
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_client_id_here
# PAYPAL_CLIENT_ID=your_production_client_id_here
# PAYPAL_CLIENT_SECRET=your_production_secret_here
# PAYPAL_MODE=live
```

---

## 📝 Notes on Templates

1. **Replace placeholder values**:
   - `seller@example.com` → Your PayPal business email
   - API keys from PayPal Developer Dashboard

2. **Adjust currency**: These templates use OMR. Change to your currency if needed.

3. **Error messages**: Customize according to your brand

4. **RTL layout**: Components support both Arabic (RTL) and English (LTR)

5. **Rate limiting**: Adjust request limits based on your needs

---

**Use these templates as a starting point and customize for your needs!**