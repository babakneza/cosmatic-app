# PayPal Authentication Token Fix

## Problem
The PayPal capture-order API was returning `401 Unauthorized` with message "Authentication required. Please log in to complete your purchase." 

The server logs showed:
```
[API] Missing access token for payment capture
 POST /api/payments/paypal/capture-order 401
```

## Root Cause
The `PayPalButton` component was trying to retrieve the access token from localStorage using `localStorage.getItem('accessToken')`, but:
1. The Zustand persist middleware stores auth data in a nested format under the store key, not as individual `accessToken` keys
2. The token was therefore `null` or `undefined` when being sent to the capture-order API

## Solution
Modified the data flow to pass the access token as a prop from parent to child component:

### 1. **PayPalButton.tsx** - Updated Interface
```typescript
interface PayPalButtonProps {
    // ... existing props
    access_token: string;  // NEW: Added required prop
    // ... rest of props
}
```

### 2. **PayPalButton.tsx** - Updated Function Signature
```typescript
export default function PayPalButton({
    cartItems,
    totals,
    customerId,
    customer_email,
    shipping_address,
    billing_address,
    access_token,  // NEW: Added to destructuring
    onSuccess,
    onError,
    onCancel,
    locale,
    isLoading = false,
}: PayPalButtonProps) {
```

### 3. **PayPalButton.tsx** - Updated Fetch Call
```typescript
// BEFORE:
accessToken: localStorage.getItem('accessToken'), // ❌ Wrong approach

// AFTER:
accessToken: access_token, // ✅ Use prop passed from parent
```

### 4. **CheckoutPageContent.tsx** - Pass Token to PayPalButton
```typescript
<PayPalButton
    cartItems={cartItems}
    totals={totals}
    customer_email={shippingAddress.email}
    shipping_address={shippingAddress}
    billing_address={billingAddress || shippingAddress}
    customerId={customer.id || user.id}
    access_token={access_token}  // NEW: Pass the token
    locale={typedLocale}
    onSuccess={(transactionId: string, orderData: any) => {
        setIsRedirectingToConfirmation(true);
        clearCart();
    }}
    onError={(error: string) => {
        console.error('PayPal payment error:', error);
    }}
/>
```

## Additional Improvements

### 1. **Customer ID Type Flexibility** (PayPalButton.tsx)
- Updated interface to accept both `string | number` for `customerId`
- Added conversion logic to handle numeric customer IDs from Directus
- Updated validation to accept both types before sending to API

### 2. **Enhanced Error Handling** (PayPalButton.tsx)
- Added better logging for invalid customer IDs
- Shows type information in console for debugging
- Clearer error messages to users

## Files Modified
1. `src/components/checkout/PayPalButton.tsx`
   - Updated interface to include `access_token: string`
   - Updated function signature
   - Changed fetch call to use prop instead of localStorage
   - Added support for numeric customer IDs

2. `src/app/[locale]/checkout/CheckoutPageContent.tsx`
   - Added `access_token={access_token}` prop when rendering PayPalButton

## Authentication Flow
```
CheckoutPageContent (has access_token from useAuth hook)
    ↓
    passes access_token prop
    ↓
PayPalButton (receives access_token)
    ↓
    sends to capture-order API
    ↓
Backend validates token ✅
```

## Testing
After these changes:
1. Users must be logged in to see the PayPal button (CheckoutPageContent shows authentication gate)
2. When PayPal button onApprove is triggered, the access token is properly passed
3. Backend API receives valid access token and can validate authentication ✅
4. Order capture proceeds without "Authentication required" errors

## Key Insights
- Never rely on localStorage keys from 3rd party libraries (Zustand stores)
- Always pass required authentication tokens as props through component hierarchy
- Use TypeScript interface to enforce required auth tokens in components that need them
- Parent components with auth context should pass tokens to children rather than children fetching them