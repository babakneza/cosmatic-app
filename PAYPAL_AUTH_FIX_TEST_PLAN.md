# PayPal Authentication Token Fix - Test Plan

## Overview
This test plan verifies that the PayPal payment flow works end-to-end with proper authentication token handling.

## Test Setup
- **Environment**: Sandbox
- **Prerequisites**: 
  - Valid PayPal Sandbox account
  - User logged into BuyJan application
  - Items in shopping cart
  - Valid shipping address

## Test Scenarios

### Test 1: Unauthenticated User Cannot Access PayPal Button
**Precondition**: User is NOT logged in
**Steps**:
1. Go to checkout page (`/en/checkout`)
2. Add items to cart (if not already present)
3. Verify PayPal button is NOT visible
4. Verify authentication warning message appears: "You must be logged in to complete your purchase with PayPal"
5. Verify "Log In to Continue" button is visible

**Expected Result**: ✅ PayPal button hidden, authentication gate displayed

---

### Test 2: Authenticated User Can See PayPal Button
**Precondition**: User IS logged in with valid access token
**Steps**:
1. User logs in successfully
2. Go to checkout page (`/en/checkout`)
3. Fill in or verify shipping address
4. Select shipping method
5. Select PayPal as payment method
6. Verify PayPal button is visible

**Expected Result**: ✅ PayPal button visible, authentication gate hidden

---

### Test 3: PayPal Order Creation (Create-Order API)
**Precondition**: User is logged in, on checkout page with PayPal selected
**Steps**:
1. Click PayPal button
2. Check browser console for logs
3. Monitor network tab in DevTools
4. Verify `POST /api/payments/paypal/create-order` request contains:
   - Correct totalOMR and totalUSD values
   - Currency conversion logged: "Currency converted from OMR to USD for PayPal Sandbox compatibility"
5. Verify response contains PayPal orderID

**Expected Result**: ✅ Create-order API returns 200 with valid PayPal orderID

---

### Test 4: PayPal Order Approval (onApprove Handler)
**Precondition**: User has clicked PayPal button and approved in PayPal popup
**Steps**:
1. User approves payment in PayPal modal
2. Check browser console for logs:
   - `[PayPalButton] Capturing with customerId: [valid number]`
   - Should NOT see: `Invalid customerId: [value]`
3. Monitor network tab for `POST /api/payments/paypal/capture-order` request

**Expected Result**: ✅ onApprove handler executes without customerId errors

---

### Test 5: Capture-Order API Authentication (CRITICAL)
**Precondition**: PayPal order has been approved
**Steps**:
1. Verify `POST /api/payments/paypal/capture-order` request body contains:
   - `accessToken`: should be a valid string (not null or undefined)
   - `customerId`: should be a valid number as string
   - `orderID`: valid PayPal order ID
2. Check server logs for:
   - Should NOT see: `[API] Missing access token for payment capture`
   - Should see: `[API] Capturing PayPal order for customer: [ID]`
3. Verify response status is 200 (not 401)

**Expected Result**: ✅ API receives valid access token, returns 200

---

### Test 6: Full Payment Flow Completion
**Precondition**: All previous tests passed
**Steps**:
1. Start from logged-in checkout with PayPal
2. Approve PayPal payment
3. Wait for order confirmation page
4. Verify redirect to `/en/checkout/confirmation`
5. Verify cart is cleared
6. Verify order details are displayed

**Expected Result**: ✅ Complete payment flow succeeds, user redirected to confirmation

---

### Test 7: Error Recovery - Invalid Token
**Precondition**: Auth store has corrupted or expired token
**Steps**:
1. Manually clear auth store: Open DevTools console and run:
   ```javascript
   localStorage.removeItem('app-auth-store'); // Or clear the appropriate key
   localStorage.removeItem('accessToken'); // Clear any direct token keys
   ```
2. Reload page
3. User should be logged out
4. Try to navigate to checkout
5. PayPal button should not be visible (unauthenticated)

**Expected Result**: ✅ App handles missing token gracefully, gate appears

---

### Test 8: Token Type Flexibility (Numeric Customer ID)
**Precondition**: Directus returns numeric customer ID
**Steps**:
1. Check browser console during payment approval
2. Verify customerId is converted to string: `[PayPalButton] Capturing with customerId: 123`
3. Verify no errors about type mismatch
4. Verify API receives customer ID as string

**Expected Result**: ✅ Numeric customer IDs handled without errors

---

## Console Log Expectations

### Success Scenario Logs:
```
[PayPalButton] PayPal SDK already loaded
[PayPal] Creating order: { totalOMR: '...', totalUSD: '... USD' }
[PayPal] Order created successfully: 7WV28566RX6528022
[API] PayPal order created successfully: 7WV28566RX6528022
[PayPalButton] Capturing with customerId: 123
[API] Capturing PayPal order for customer: 123
[API] PayPal order captured successfully
```

### Error Scenario Logs (OLD - Should NOT appear):
```
❌ [API] Missing access token for payment capture
❌ [PayPalButton] Invalid customerId: 1
❌ Authentication required. Please log in to complete your purchase.
```

---

## API Response Expectations

### Create-Order Endpoint
```
Status: 200 OK
Body: {
  "orderID": "7WV28566RX6528022",
  "status": "CREATED"
}
```

### Capture-Order Endpoint
```
Status: 200 OK (✅ NOT 401)
Body: {
  "status": "COMPLETED",
  "transactionId": "...",
  "orderData": {
    "id": "...",
    "order_number": "...",
    "status": "completed"
  }
}
```

---

## Browser DevTools Checklist

- [ ] Network tab shows capture-order request with status 200
- [ ] Request payload includes `accessToken` (not null)
- [ ] Request payload includes numeric `customerId`
- [ ] Response doesn't contain `401 Unauthorized`
- [ ] Console has no `Invalid customerId` errors
- [ ] Console shows successful payment logs
- [ ] LocalStorage still contains auth store after payment

---

## Regression Tests

### Test: Other Payment Methods Still Work
- [ ] Credit card checkout flow still works
- [ ] Stripe/other providers still receive required tokens

### Test: Checkout Without Authentication
- [ ] Guest checkout (if supported) still works
- [ ] Unauthenticated users see appropriate messages

### Test: Arabic Locale
- [ ] All translations load correctly
- [ ] PayPal button appears in Arabic checkout
- [ ] Error messages display in Arabic

---

## Performance Considerations

- [ ] PayPal button renders without delays
- [ ] No unnecessary API calls due to token retrieval
- [ ] Token passed directly via props (no localStorage lookups)
- [ ] TypeScript compilation succeeds without errors

---

## Documentation Updates

- [ ] Updated any API documentation if token handling changed
- [ ] Added comments explaining prop-based token passing
- [ ] Documented why localStorage approach was replaced

---

## Sign-Off

| Item | Status | Notes |
|------|--------|-------|
| All tests passed | ⬜ | |
| No console errors | ⬜ | |
| API responses correct | ⬜ | |
| User experience improved | ⬜ | |
| Ready for production | ⬜ | |
