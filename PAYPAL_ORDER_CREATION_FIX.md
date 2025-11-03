# PayPal Order Creation - Invalid URL Fix

## Problem Summary

**Error Messages:**
```
[Orders] Failed to create order: Invalid URL
[API] Unexpected error capturing PayPal order: Invalid URL
POST /api/payments/paypal/capture-order 500 in 3.9s
```

When users completed a PayPal payment, the order capture succeeded on PayPal's side, but order creation in Directus failed with an "Invalid URL" error.

## Root Cause

The `createOrder()` function in `src/lib/api/orders.ts` was using a **relative URL** (`/api/orders`) with axios:

```typescript
// ❌ BEFORE - This fails in server-side context
const response = await axios.post(
    '/api/orders',  // Relative URL - no base URL configured!
    {
        customer: customerId,
        ...orderData,
    },
    {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    }
);
```

### Why This Fails

1. The `createOrder()` function is called from **server-side route** (`/api/payments/paypal/capture-order`)
2. Axios in Node.js doesn't have the same URL resolution as the browser
3. A relative URL like `/api/orders` needs a base URL to construct an absolute URL
4. Without a base URL configured in axios, it can't resolve the URL → **"Invalid URL" error**

## Solution

Updated `createOrder()` function to construct **absolute URLs** with proper environment-aware base URL selection:

```typescript
// ✅ AFTER - Uses environment-aware base URL
const isDevelopment = process.env.NODE_ENV === 'development';
let baseUrl: string;

if (isDevelopment) {
    baseUrl = 'http://localhost:3000';
    console.log('[Orders] Using development server-side URL:', baseUrl);
} else {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (baseUrl === 'http://localhost:3000' && !process.env.NEXT_PUBLIC_SITE_URL) {
        console.warn('[Orders] No NEXT_PUBLIC_SITE_URL configured in production, using fallback');
    } else {
        console.log('[Orders] Using production URL:', baseUrl);
    }
}

const url = `${baseUrl}/api/orders`;  // ✅ Absolute URL
const response = await axios.post(url, { ... });
```

### Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| **URL Type** | Relative (`/api/orders`) | Absolute (`http://localhost:3000/api/orders`) |
| **Base URL** | None configured | Environment-aware (dev/prod) |
| **Development** | N/A | Uses `http://localhost:3000` |
| **Production** | N/A | Uses `NEXT_PUBLIC_SITE_URL` with fallback |
| **Error Handling** | Generic "Invalid URL" | Detailed logging with URL shown |

## Technical Details

### Development Environment
- **NODE_ENV** = "development" → Uses `http://localhost:3000`
- This ensures PayPal callback works with local dev server

### Production Environment
- **NODE_ENV** = "production" → Uses `NEXT_PUBLIC_SITE_URL` (currently `https://buyjan.com`)
- Has fallback to `http://localhost:3000` if `NEXT_PUBLIC_SITE_URL` is not configured

### Enhanced Error Logging
```typescript
console.error('[Orders] Error details:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
});
```

## Flow After Fix

```
User completes PayPal payment
    ↓
POST /api/payments/paypal/capture-order
    ↓
capturePayPalOrder() succeeds
    ↓
createOrder() called with order data
    ↓
Constructs URL: http://localhost:3000/api/orders (dev) or https://buyjan.com/api/orders (prod)
    ↓
axios.post(absolute_url, ...) → ✅ Success!
    ↓
Order created in Directus
    ↓
Response sent to frontend with transactionId and orderData
    ↓
User redirected to order confirmation 🎉
```

## Files Modified

- **`src/lib/api/orders.ts`** - Updated `createOrder()` function (lines 177-220)

## Testing Checklist

### Local Development Testing
- [ ] NODE_ENV is "development" in terminal
- [ ] Run `npm run dev`
- [ ] Attempt PayPal payment in Sandbox mode
- [ ] Check console logs: Should show `[Orders] Using development server-side URL: http://localhost:3000`
- [ ] Order should be created in Directus
- [ ] Check network tab: `/api/orders` request should succeed (200/201)
- [ ] Order confirmation page loads successfully

### Console Log Verification
Expected development logs:
```
[Orders] Creating order at: http://localhost:3000/api/orders
[Orders] Using development server-side URL: http://localhost:3000
[Orders] Created order: 123
[Orders] Order number: ORD-20240115-ABC123
```

### Production Testing (Pre-Deployment)
- [ ] Build production: `npm run build`
- [ ] Ensure `NEXT_PUBLIC_SITE_URL=https://buyjan.com` in `.env.local`
- [ ] Production console logs should show: `[Orders] Using production URL: https://buyjan.com`
- [ ] All other functionality remains unchanged

## Backward Compatibility

✅ **100% Backward Compatible**
- No breaking changes to function signatures
- No new dependencies added
- Client-side code unaffected (still uses relative URLs, which work fine in browser)
- Only server-side absolute URL resolution changed

## Related Files

For context on the complete payment flow:
- `src/app/api/payments/paypal/capture-order/route.ts` - Capture-order endpoint (calls createOrder)
- `src/app/api/orders/route.ts` - Orders API endpoint (creates order in Directus)
- `src/components/checkout/PayPalButton.tsx` - Frontend PayPal button component
- `src/app/[locale]/checkout/CheckoutPageContent.tsx` - Checkout page (calls capture-order)

## Error Resolution Map

| Error | Cause | Status |
|-------|-------|--------|
| `Invalid URL` | Relative URL without base | ✅ Fixed |
| `Invalid customerId: 1` | Type validation | ✅ Fixed (in previous session) |
| `Authentication required (401)` | Missing access token | ✅ Fixed (in previous session) |

## Future Improvements

1. Consider centralizing axios configuration with interceptors for consistent URL handling
2. Add retry logic for transient network failures
3. Monitor order creation latency and log metrics
4. Consider using Next.js built-in fetch API for server-to-server calls (eliminates axios dependency)

## Sign-Off

- **Fix Date**: Today's session
- **Severity**: Critical (prevents PayPal payments from completing)
- **Status**: ✅ Ready for testing and deployment
- **Risk Level**: Low (isolated fix, fully backward compatible)