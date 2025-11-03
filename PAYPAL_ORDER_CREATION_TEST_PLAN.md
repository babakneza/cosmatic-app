# PayPal Order Creation Fix - Test Plan

## Test Environment Setup

### Prerequisites
- [ ] Node.js 18.x+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] `.env.local` configured with:
  - `NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com`
  - `NEXT_PUBLIC_SITE_URL=https://buyjan.com`
  - `DIRECTUS_API_TOKEN=_iQfIHh8zaLNsRffzE0slvWkC5R2rtKi`
  - `NEXT_PUBLIC_DIRECTUS_API_TOKEN=izyRKjxRG23gpyFZkqq2fzHVoAbyRyyQ`
  - `NODE_ENV=development`
  - PayPal credentials configured
- [ ] Fresh browser session (clear localStorage if needed)

## Test Scenario 1: Happy Path - Complete PayPal Payment (Development)

**Objective**: Verify successful order creation after PayPal payment in development environment

**Steps**:
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/en/checkout` (or your locale)
3. Ensure you're logged in with a valid user
4. Add products to cart if needed (verify via cart state)
5. Fill checkout form with valid data:
   - Full name
   - Email address
   - Street address
   - Wilayat/City
   - Postal code
   - Country (Oman)
   - Phone number
6. Select PayPal as payment method
7. Click "Pay with PayPal"
8. Complete PayPal Sandbox flow (approve payment)

**Expected Results**:
- ✅ PayPal order created successfully on PayPal side
- ✅ Console shows: `[Orders] Using development server-side URL: http://localhost:3000`
- ✅ Console shows: `[Orders] Creating order at: http://localhost:3000/api/orders`
- ✅ Network tab shows POST `/api/orders` with status **200 or 201**
- ✅ Console shows: `[Orders] Created order: [id]`
- ✅ Console shows: `[Orders] Order number: ORD-[DATE]-[CODE]`
- ✅ User redirected to order confirmation page
- ✅ Order appears in Directus admin panel

**Failure Indicators**:
- ❌ Console error: `Invalid URL`
- ❌ POST `/api/orders` returns 5xx error
- ❌ User remains on checkout page without redirect
- ❌ No order appears in Directus

---

## Test Scenario 2: Production Environment Preparation

**Objective**: Verify the fix works with production URL configuration

**Steps**:
1. Build production: `npm run build`
2. Check environment has: `NODE_ENV=production`
3. Verify `NEXT_PUBLIC_SITE_URL` is set to production domain
4. Start production server: `npm start`
5. Attempt same payment flow

**Expected Results**:
- ✅ Console shows: `[Orders] Using production URL: https://buyjan.com`
- ✅ All order creation succeeds as in development
- ✅ No errors about invalid URLs

---

## Test Scenario 3: URL Resolution Verification (Development)

**Objective**: Confirm the absolute URL is correctly constructed

**Steps**:
1. Start dev server
2. Open browser DevTools → Console
3. Filter logs for: `[Orders] Creating order at:`
4. Verify the logged URL

**Expected Result**:
```
[Orders] Creating order at: http://localhost:3000/api/orders
```

**Verification Checklist**:
- [ ] URL starts with `http://` (protocol present)
- [ ] Contains `localhost:3000` (in dev)
- [ ] Ends with `/api/orders` (correct endpoint)
- [ ] No relative path like `/api/orders` alone

---

## Test Scenario 4: Different Customer Types

**Objective**: Verify fix works with all customer scenarios

### Test 4a: Registered User
- [ ] Log in with existing account
- [ ] Complete payment flow
- [ ] Order should have correct customer reference

### Test 4b: New User Registration
- [ ] Register new account during checkout (if available)
- [ ] Complete payment
- [ ] Order should be linked to new customer

### Test 4c: Mixed Address Types
- [ ] Use saved address for shipping
- [ ] Use different address for billing
- [ ] Both should be formatted correctly in Directus

---

## Test Scenario 5: Error Scenarios

### Test 5a: Invalid Customer ID
**Steps**:
1. Manually send invalid customerId in request
2. Expect: Clear error message

**Expected**:
```
[API] Invalid customerId received: { customerId: undefined, type: 'undefined' }
Error: Customer ID is required
```

### Test 5b: Missing Access Token
**Steps**:
1. Clear access token from auth state
2. Attempt payment

**Expected**:
```
[API] Missing access token for payment capture
Error: Authentication required
```

### Test 5c: Invalid Order Data
**Steps**:
1. Send request with incomplete cart items
2. Expect validation error

**Expected**:
```
Error: Order must contain at least one item
```

---

## Test Scenario 6: Network Inspection

**Objective**: Verify all network requests are correct

**Steps**:
1. Open DevTools → Network tab
2. Filter by: `orders` 
3. Complete payment flow
4. Examine request/response

**Expected Requests**:

1. **POST /api/payments/paypal/create-order** (200 OK)
   - Creates PayPal order
   - Returns: `{ success: true, id: "PAYPAL_ORDER_ID" }`

2. **POST /api/payments/paypal/capture-order** (200 OK)
   - Captures PayPal payment
   - Should include `orderData` in response
   - Should include `transactionId`

3. **POST /api/orders** (201 Created) ← **This is the fixed request**
   - Creates order in Directus
   - Response should include order ID and order number

**Verification**:
- [ ] All requests show correct URLs
- [ ] All requests have proper Authorization headers
- [ ] Response bodies contain expected data
- [ ] No 5xx errors in responses

---

## Test Scenario 7: Directus Verification

**Objective**: Confirm order data was properly stored in Directus

**Steps**:
1. Log into Directus admin: `https://admin.buyjan.com`
2. Navigate to: **Collections → Orders**
3. Find the most recent order
4. Click to view details

**Expected Data**:
- [ ] Order number is present (format: `ORD-YYYYMMDD-XXXXXX`)
- [ ] Customer is linked correctly
- [ ] Customer email matches checkout email
- [ ] Shipping address is populated
- [ ] Billing address is populated
- [ ] Order items list is not empty
- [ ] Totals (subtotal, tax, shipping, total) are correct
- [ ] Payment method shows "paypal"
- [ ] Payment intent ID contains PayPal transaction ID
- [ ] Status is "pending"
- [ ] Payment status is "pending" (should later update to "completed")

---

## Test Scenario 8: Logging Verification

**Objective**: Confirm all logging points work as expected

**Steps**:
1. Complete full payment flow
2. Check browser console for all logs
3. Check server logs (terminal running `npm run dev`)

**Expected Console Logs (Client)**:
```
[PayPalButton] Approving PayPal order...
[Checkout] Payment succeeded!
```

**Expected Server Logs**:
```
[API] Creating PayPal order for customer: [email]
[PayPal] Creating order: { totalOMR: '...', totalUSD: '...' }
[PayPal] Order created successfully: [PAYPAL_ORDER_ID]
[API] PayPal order created successfully: [PAYPAL_ORDER_ID]
[API] Capturing PayPal order: [PAYPAL_ORDER_ID]
[PayPal] Capturing order: [PAYPAL_ORDER_ID]
[PayPal] Order captured successfully: { orderId: '...', transactionId: '...', amount: '...' }
[API] Creating order in Directus with PayPal payment
[Orders] Using development server-side URL: http://localhost:3000
[Orders] Creating order at: http://localhost:3000/api/orders
[Orders API] Creating order in Directus with customer: [CUSTOMER_ID]
[Orders API] Order number: ORD-[DATE]-[CODE]
[Orders API] Tracking number: TRK-[TIMESTAMP]-[CODE]
[Orders API] Creating order items...
[Orders API] Order created successfully in Directus: [ORDER_ID]
[API] Order created successfully in Directus: [ORDER_NUMBER]
```

---

## Test Scenario 9: Regression Testing

**Objective**: Verify no existing functionality was broken

### Test 9a: Cart Functionality
- [ ] Add product to cart
- [ ] Remove product from cart
- [ ] Update quantities
- [ ] Cart persists across page navigation

### Test 9b: Other Payment Methods (if implemented)
- [ ] Test credit card payment (if available)
- [ ] Test other payment methods
- [ ] Verify they still work

### Test 9c: Authentication
- [ ] Log in with existing credentials
- [ ] Log out
- [ ] Register new account
- [ ] Session management works

### Test 9d: Checkout Flow
- [ ] Fill all required fields
- [ ] Validation works
- [ ] Address formatting correct
- [ ] Address options appear

---

## Performance Metrics

Track these during testing:

| Metric | Threshold | Status |
|--------|-----------|--------|
| Order creation API response time | < 2 seconds | ⏱️ |
| Full payment flow (create → capture → create order) | < 5 seconds | ⏱️ |
| Directus order retrieval after creation | < 1 second | ⏱️ |
| Network tab shows no failed requests | 0 failures | ✅ |

---

## Sign-Off Checklist

### Before Deployment
- [ ] All 9 test scenarios completed successfully
- [ ] No console errors (only expected warnings)
- [ ] Network requests all return success status (2xx/3xx)
- [ ] Order data correctly appears in Directus
- [ ] Logging shows expected messages
- [ ] No regression in existing functionality
- [ ] Performance metrics within acceptable ranges

### Post-Deployment Monitoring
- [ ] Monitor error logs for next 24 hours
- [ ] Check order creation rate in Directus
- [ ] Verify PayPal transaction reconciliation
- [ ] Confirm no customer complaints about payment issues

---

## Troubleshooting Guide

### Issue: "Invalid URL" Still Appears
**Cause**: Server restart needed or cache issue

**Solution**:
1. Stop server: `Ctrl+C`
2. Clear cache: `rm -rf .next`
3. Restart: `npm run dev`

### Issue: Order Not Created in Directus
**Cause**: Authentication token expired or invalid

**Solution**:
1. Verify `DIRECTUS_API_TOKEN` in `.env.local`
2. Check Directus is accessible: `https://admin.buyjan.com`
3. Verify API token hasn't expired in Directus admin

### Issue: Localhost Connection Refused
**Cause**: Dev server not running on port 3000

**Solution**:
1. Check if another process uses port 3000: `lsof -i :3000`
2. Kill if needed: `kill -9 [PID]`
3. Restart dev server

### Issue: Wrong URL in Production
**Cause**: `NEXT_PUBLIC_SITE_URL` not set properly

**Solution**:
1. Verify env var: `echo $NEXT_PUBLIC_SITE_URL`
2. Ensure it's set before `npm run build`
3. Check server logs for actual URL being used

---

## Test Result Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/PROD]

Scenario 1 (Happy Path): [ PASS / FAIL ]
- Details: 

Scenario 2 (Production): [ PASS / FAIL ]
- Details:

Scenario 3 (URL Verification): [ PASS / FAIL ]
- Details:

[Continue for all scenarios...]

Overall Status: [ PASS / FAIL ]
Notes: 
```

---

## Rollback Plan

If issues arise post-deployment:

1. **Immediate**: Disable PayPal payment method in checkout
2. **Short-term**: Roll back to previous commit
3. **Long-term**: Fix root cause and re-deploy

---

## Related Documentation

- `PAYPAL_ORDER_CREATION_FIX.md` - Technical explanation of the fix
- `PAYPAL_AUTH_FIX_QUICK_REFERENCE.md` - Quick reference for authentication fixes
- `SOLUTION_SUMMARY.txt` - Visual summary of all PayPal fixes