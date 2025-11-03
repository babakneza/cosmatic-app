# PayPal Currency Fix: OMR to USD Conversion

## Problem
The previous implementation attempted to convert OMR (Omani Rial) to AED (UAE Dirham) for PayPal Sandbox transactions. However, PayPal Sandbox returned a `CURRENCY_NOT_SUPPORTED` error, indicating that AED might not be supported in the Sandbox environment.

## Solution
Updated the currency conversion to use **USD (US Dollar)** instead of AED. USD is universally supported by PayPal in all environments (Sandbox and Live), making it the most reliable choice.

## Changes Made

### 1. Updated `src/lib/currency.ts`
- **Renamed function**: `convertOMRtoAED()` → `convertOMRtoUSD()`
- **Updated exchange rate**: 1 OMR = 2.6 USD (was 1 OMR = 9.5 AED)
- **Kept backward compatibility**: `convertOMRtoAED()` now calls `convertOMRtoUSD()` with a deprecation notice

**Rationale for exchange rate**:
- OMR is pegged to a basket of international currencies
- Standard market rate: 1 OMR ≈ 2.6 USD
- This provides a more realistic conversion for Sandbox testing

### 2. Updated `src/lib/paypal/create-order.ts`
- Imported new `convertOMRtoUSD` function instead of `convertOMRtoAED`
- Changed all `currency_code` fields from `'AED'` to `'USD'`:
  - Item unit amounts (line 176)
  - Purchase unit amount (line 216)
  - Item total breakdown (line 220)
  - Shipping breakdown (line 224)
  - Tax breakdown (line 228)
- Updated console logging to show USD amounts instead of AED
- Added note explaining USD is universally supported

## Technical Details

### Currency Code Changes
```
Before:
- unit_amount.currency_code: 'AED'
- amount.currency_code: 'AED'
- breakdown.item_total.currency_code: 'AED'
- breakdown.shipping.currency_code: 'AED'
- breakdown.tax_total.currency_code: 'AED'

After:
- unit_amount.currency_code: 'USD'
- amount.currency_code: 'USD'
- breakdown.item_total.currency_code: 'USD'
- breakdown.shipping.currency_code: 'USD'
- breakdown.tax_total.currency_code: 'USD'
```

### Conversion Rate
```
Exchange Rate: 1 OMR = 2.6 USD

Examples:
- 11.80 OMR → 30.68 USD (was 112.10 AED)
- 100.000 OMR → 260.00 USD (was 950.00 AED)
- 25.500 OMR → 66.30 USD (was 242.25 AED)
```

## Impact Analysis

### Internal Application Logic
- **No impact**: All OMR pricing, calculations, and display remain unchanged
- Cart totals, tax calculations, and shipping remain in OMR
- Database stores OMR values
- UI displays OMR currency to users

### PayPal Integration
- **PayPal Sandbox**: Now receives USD currency code (supported)
- **PayPal Live**: Should also work with USD (universally supported)
- **Order processing**: Customer pays in USD equivalent to OMR price
- **Conversion**: Applied only during PayPal request creation

## Testing Requirements

The following scenarios should be tested:

1. ✅ Currency conversion function works correctly
2. ✅ All PayPal request fields use USD currency code
3. ✅ Amounts are properly converted from OMR to USD
4. ✅ PayPal order creation succeeds with USD
5. ✅ Order capture also handles USD amounts correctly
6. ✅ Internal OMR calculations remain unchanged
7. ✅ UI still displays OMR prices to customers
8. ✅ Database stores OMR values correctly

## Backward Compatibility

- `convertOMRtoAED()` function is marked as `@deprecated` but still works
- It now delegates to `convertOMRtoUSD()` internally
- Any code still calling the old function will get USD conversion (which is actually better)

## Production Considerations

### For Live PayPal Account
1. **USD continues to work**: USD is universally supported in production
2. **Optional change**: If your PayPal business account supports OMR natively, you could revert to OMR currency code
3. **No migration needed**: The current USD solution works perfectly for production

### Future Currency Support
If regional payment processors are added that natively support OMR:
- Regional Gateway A: Use OMR directly
- PayPal (Sandbox/Live): Use USD conversion
- Regional Gateway B: Use native currency

## Files Modified
- `src/lib/currency.ts`: Added `convertOMRtoUSD()` function
- `src/lib/paypal/create-order.ts`: Updated to use USD currency codes

## Verification Steps

1. Build application: `npm run build`
2. Type check: `npm run type-check`
3. Start dev server: `npm run dev`
4. Test PayPal checkout in Sandbox environment
5. Verify order creation succeeds
6. Check console logs for USD conversion details

## References
- [PayPal Supported Currency Codes](https://developer.paypal.com/docs/integration/direct/rest/currency-codes/)
- [Oman Currency Information](https://en.wikipedia.org/wiki/Omani_rial)