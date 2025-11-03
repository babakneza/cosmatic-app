# PayPal Redirect to Confirmation - Comprehensive Test Plan

## Overview
Test plan to verify the PayPal redirect fix works correctly across all scenarios and edge cases.

---

## Test Scenario 1: Happy Path - Successful Redirect
**Category**: Happy Path  
**Priority**: CRITICAL  
**Description**: Standard PayPal payment that redirects to confirmation

### Steps
1. Add 2 products to cart
2. Navigate to checkout
3. Fill shipping address
4. Select shipping method
5. Select PayPal as payment method
6. Review order
7. Click PayPal button
8. Approve payment in PayPal popup
9. Wait for order capture

### Expected Results
- ✅ Console shows: `[Checkout] PayPal payment successful, redirecting to confirmation`
- ✅ Console shows: `[Checkout] Order data: { id: X, order_number: "ORD-..." }`
- ✅ URL changes to: `/[locale]/checkout/confirmation?orderId=X&orderNumber=ORD-...`
- ✅ Confirmation page displays with correct order details
- ✅ Cart is empty after redirect

### Verification Points
```javascript
// In browser console after redirect:
location.href  // Should show: .../checkout/confirmation?orderId=...
sessionStorage.getItem('checkout_state')  // Should be cleared or reset
```

---

## Test Scenario 2: Order Details Verification
**Category**: Happy Path  
**Priority**: HIGH  
**Description**: Verify order data passed to confirmation page is correct

### Steps
1. Complete PayPal payment (Scenario 1)
2. Observe confirmation page loads
3. Check order information displayed

### Expected Results
- ✅ Order ID matches URL parameter `orderId`
- ✅ Order number matches URL parameter `orderNumber`
- ✅ Cart items list shows correct products and quantities
- ✅ Order totals (subtotal, tax, shipping, total) match checkout page
- ✅ Shipping address matches what was entered

### Verification Points
```javascript
// On confirmation page:
document.querySelector('[data-order-id]')?.textContent  // Should show order ID
document.querySelector('[data-order-number]')?.textContent  // Should show order number
```

---

## Test Scenario 3: URL Parameter Preservation
**Category**: Input Verification  
**Priority**: HIGH  
**Description**: Verify URL parameters are correctly constructed

### Steps
1. Complete PayPal payment
2. Check URL in browser address bar
3. Note orderId and orderNumber values
4. Verify they're properly URL-encoded
5. Refresh page and verify it still works

### Expected Results
- ✅ URL has exact format: `?orderId=NUMBER&orderNumber=ORD-YYYYMMDD-XXXXXX`
- ✅ Parameters are not double-encoded
- ✅ Parameters survive page refresh
- ✅ Back button returns to checkout (or appropriate history)

### Verification Points
```javascript
const params = new URL(location.href).searchParams;
params.get('orderId')  // Should be numeric
params.get('orderNumber')  // Should be ORD-... format
```

---

## Test Scenario 4: Locale Handling (Arabic)
**Category**: Branching  
**Priority**: HIGH  
**Description**: Verify redirect works correctly in Arabic locale

### Steps
1. Switch to Arabic locale (ar)
2. Add products to cart
3. Complete PayPal payment
4. Observe redirect

### Expected Results
- ✅ URL shows: `/ar/checkout/confirmation?orderId=...`
- ✅ Confirmation page displays in Arabic (RTL)
- ✅ Order details appear with Arabic text where applicable
- ✅ All navigation links work in Arabic context

### Verification Points
```javascript
// On Arabic confirmation page:
document.documentElement.lang  // Should be 'ar'
document.documentElement.dir   // Should be 'rtl'
```

---

## Test Scenario 5: Locale Handling (English)
**Category**: Branching  
**Priority**: HIGH  
**Description**: Verify redirect works correctly in English locale

### Steps
1. Switch to English locale (en)
2. Add products to cart
3. Complete PayPal payment
4. Observe redirect

### Expected Results
- ✅ URL shows: `/en/checkout/confirmation?orderId=...`
- ✅ Confirmation page displays in English (LTR)
- ✅ Order details appear in English
- ✅ All navigation links work in English context

### Verification Points
```javascript
// On English confirmation page:
document.documentElement.lang  // Should be 'en'
document.documentElement.dir   // Should be 'ltr'
```

---

## Test Scenario 6: Cart Clearing Before Redirect
**Category**: Branching  
**Priority**: MEDIUM  
**Description**: Verify cart is properly cleared during redirect

### Steps
1. Add multiple products to cart (3-5 items)
2. Complete PayPal payment
3. Observe console output
4. Check cart state after redirect

### Expected Results
- ✅ `setIsRedirectingToConfirmation(true)` logged before redirect
- ✅ `clearCart()` called before redirect
- ✅ Cart is empty after redirect
- ✅ Cart items don't reappear on confirmation page

### Verification Points
```javascript
// After redirect on confirmation page:
window.localStorage.getItem('cart-store')  // Should be empty or cleared
// OR check Zustand store directly:
useCartStore.getState().items  // Should be []
```

---

## Test Scenario 7: Network Inspection
**Category**: Branching  
**Priority**: MEDIUM  
**Description**: Verify network requests and responses during redirect

### Steps
1. Open DevTools Network tab
2. Complete PayPal payment
3. Observe network requests
4. Check response payloads

### Expected Results
- ✅ POST to `/api/payments/paypal/capture-order` returns 200
- ✅ Response includes `orderData` with `id` and `order_number`
- ✅ Response structure matches expected format
- ✅ Navigation request to confirmation page succeeds

### Verification Points
Network request response:
```javascript
{
  "success": true,
  "transactionId": "...",
  "orderData": {
    "id": 41,
    "order_number": "ORD-20251103-TI7TMI",
    "payment_intent_id": "...",
    ...
  },
  "message": "Payment captured and order created successfully"
}
```

---

## Test Scenario 8: Error Fallback - Missing Order Number
**Category**: Exception Handling  
**Priority**: HIGH  
**Description**: Verify graceful fallback if order number is missing

### Steps
1. Simulate scenario where `orderData.order_number` is undefined
2. Observe redirect behavior
3. Check console for error logging

### Expected Results
- ✅ Console shows error: `[Checkout] Missing order ID or order number in response`
- ✅ Page still redirects to confirmation page (fallback)
- ✅ Confirmation page loads (even without parameters)
- ✅ Confirmation page attempts to fetch order details from API

### Verification Points
```javascript
// Expected console output:
// [Checkout] Missing order ID or order number in response: { orderId: X, orderNumber: undefined }
// Then redirect happens anyway
```

---

## Test Scenario 9: Error Fallback - Missing Order ID
**Category**: Exception Handling  
**Priority**: HIGH  
**Description**: Verify graceful fallback if order ID is missing

### Steps
1. Simulate scenario where `orderData.id` is undefined
2. Observe redirect behavior
3. Check console for error logging

### Expected Results
- ✅ Console shows error: `[Checkout] Missing order ID or order number in response`
- ✅ Page redirects to: `/[locale]/checkout/confirmation` (no parameters)
- ✅ Confirmation page loads
- ✅ Confirmation page handles missing parameters gracefully

### Verification Points
```javascript
// Expected URL after redirect:
location.href  // Should be: .../checkout/confirmation (no query params)
```

---

## Test Scenario 10: Multiple Consecutive Payments
**Category**: Branching  
**Priority**: MEDIUM  
**Description**: Verify multiple PayPal payments work correctly in sequence

### Steps
1. Complete first PayPal payment (verify redirect)
2. Navigate back to home
3. Add different products to cart
4. Repeat checkout
5. Complete second PayPal payment (verify redirect with different order)

### Expected Results
- ✅ First order redirects with orderId=X
- ✅ Second order redirects with orderId=Y (different)
- ✅ Each confirmation page shows correct order details
- ✅ Order numbers are sequential (ORD-YYYYMMDD-XXXXXX pattern)

### Verification Points
```javascript
// After each payment:
const params = new URL(location.href).searchParams;
console.log(params.get('orderId'));  // Should be different each time
console.log(params.get('orderNumber'));  // Should be unique
```

---

## Test Scenario 11: Page Refresh on Confirmation Page
**Category**: Branching  
**Priority**: MEDIUM  
**Description**: Verify confirmation page remains functional after refresh

### Steps
1. Complete PayPal payment (reach confirmation page)
2. Note order ID in URL
3. Refresh the page (F5)
4. Verify page content loads

### Expected Results
- ✅ Confirmation page reloads successfully
- ✅ Order details still display
- ✅ Order ID matches URL parameter
- ✅ No console errors

### Verification Points
```javascript
// After page refresh:
document.querySelector('[data-order-id]')?.textContent  // Should still show order
```

---

## Test Scenario 12: Back Button Navigation
**Category**: Branching  
**Priority**: MEDIUM  
**Description**: Verify back button behavior after redirect

### Steps
1. Complete PayPal payment (reach confirmation page)
2. Click browser back button
3. Observe navigation

### Expected Results
- ✅ Browser navigates back in history (expected behavior)
- ✅ Previous page (checkout or home) loads
- ✅ No errors in console
- ✅ Order confirmation is still accessible via URL

### Verification Points
```javascript
// After back button:
location.href  // Should show previous page URL
// Manual navigation to confirmation URL still works
```

---

## Console Log Verification Checklist

✅ When payment is approved:
```
[Checkout] PayPal payment successful, redirecting to confirmation
[Checkout] Order data: { id: 41, order_number: "ORD-20251103-TI7TMI", ... }
```

✅ When order data is missing:
```
[Checkout] Missing order ID or order number in response: { orderId: undefined, orderNumber: undefined }
```

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Performance Metrics

Measure and verify:
- [ ] Time from payment approval to redirect: < 2 seconds
- [ ] Confirmation page load time: < 1 second
- [ ] No console warnings or errors
- [ ] Network requests complete successfully

---

## Regression Testing

Verify these still work after the fix:
- [ ] Cart functionality (add/remove items)
- [ ] Other payment methods (still work)
- [ ] Address selection flow
- [ ] Shipping method selection
- [ ] Order history viewing

---

## Deployment Verification

Before deploying to production:
- [ ] All 12 test scenarios pass
- [ ] No console errors in any scenario
- [ ] Network requests show correct status codes
- [ ] Confirmation page displays properly
- [ ] Mobile responsiveness verified
- [ ] Both locales (en/ar) tested

---

## Post-Deployment Monitoring

After deployment, monitor:
- [ ] Server logs for redirect-related errors
- [ ] User feedback on checkout experience
- [ ] PayPal payment conversion rate
- [ ] Confirmation page load times
- [ ] Browser console errors from users