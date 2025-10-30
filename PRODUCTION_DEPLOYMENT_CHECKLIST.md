# Production Deployment Checklist - BuyJan E-Commerce

## ✅ Completed Pre-Deployment Cleanup

### 1. **Debug Logging Removed** 
   - ✅ Removed all `console.log()` and `console.warn()` statements from production code
   - ✅ Kept `console.error()` for error tracking in production
   - ✅ Files cleaned:
     - `src/lib/api/categories.ts`
     - `src/lib/api/auth.ts`
     - `src/lib/api/countries.ts`
     - `src/hooks/useCheckoutData.ts`
     - `src/hooks/useTokenRefreshInterceptor.ts`
     - `src/hooks/useTokenExpiredInterceptor.ts`
     - `src/components/checkout/ShippingAddressForm.tsx`
     - `src/components/checkout/ShippingMethodSelector.tsx`
     - `src/app/[locale]/checkout/CheckoutPageContent.tsx`
     - `src/store/auth.ts`

### 2. **Test Files Removed**
   - ✅ Deleted test pages: `/src/app/[locale]/auth-test`, `/src/app/[locale]/debug`, `/src/app/[locale]/test-product`
   - ✅ Deleted 20+ test API files from root directory (`test-*.js`)

### 3. **Documentation Cleaned**
   - ✅ Removed 176 development markdown files
   - ✅ Removed development log files and debug screenshots
   - ✅ Kept only essential README.md

### 4. **Build Configuration Ready**
   - ✅ `next.config.js` configured with `removeConsole: true` for production builds
   - ✅ TypeScript `strict` mode enabled
   - ✅ Image optimization configured for Directus and production URLs
   - ✅ RTL support (tailwindcss-rtl) included

---

## 📋 Pre-Deployment Checklist (Before Deployment)

### Environment Variables Setup
- [ ] Update `.env.production` or `.env.local` with these variables:
  ```env
  NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
  NEXT_PUBLIC_SITE_URL=https://buyjan.com
  DIRECTUS_API_TOKEN=<YOUR_SECURE_API_TOKEN>
  NEXT_PUBLIC_DIRECTUS_API_TOKEN=<YOUR_SECURE_API_TOKEN>
  NODE_ENV=production
  ```
- [ ] Verify all tokens are **valid and not expired**
- [ ] Ensure sensitive tokens are only in `.env.local` (never committed to git)

### Database & Directus Verification
- [ ] Verify Directus CMS is accessible: `https://admin.buyjan.com`
- [ ] Confirm all collections exist and are properly configured:
  - [ ] `products`
  - [ ] `categiries` (note: intentional misspelling)
  - [ ] `categories`
  - [ ] `brands`
  - [ ] `customers`
  - [ ] `orders`
  - [ ] `order_items`
  - [ ] `reviews`
  - [ ] `wishlist`
  - [ ] `coupons`
  - [ ] `countries`
  - [ ] `shipping`
- [ ] Verify API token has appropriate permissions for all collections
- [ ] Test API connectivity with: `curl https://admin.buyjan.com/api/system/info`

### Code Quality Verification
- [ ] Run: `npm run lint` - ensure no ESLint errors
- [ ] Run: `npm run type-check` - review any remaining type warnings (many are pre-existing)
- [ ] Review and resolve any TypeScript errors in checkout flow:
  - `src/app/[locale]/checkout/CheckoutPageContent.tsx`
  - `src/app/[locale]/checkout/confirmation/ConfirmationPageContent.tsx`

### Build & Deployment
- [ ] Run: `npm run build` locally to verify successful build
- [ ] Check `.next` directory is created without errors
- [ ] Verify build size is reasonable (target: < 10MB for `.next` folder)
- [ ] Test build output: `npm start` locally to verify production behavior

### Translation Files
- [ ] Verify all translation keys exist in both languages:
  - [ ] `src/messages/ar.json`
  - [ ] `src/messages/en.json`
- [ ] Confirm no missing translation errors in checkout flow
- [ ] Test both Arabic and English language switches

### Authentication & Security
- [ ] Verify session persistence is working correctly
- [ ] Test token refresh mechanism:
  - [ ] Token expiration handling
  - [ ] Automatic token refresh before 401 errors
  - [ ] Login modal appears on token expiration
- [ ] Test account creation and profile updates
- [ ] Verify all sensitive data is encrypted at rest

### Checkout Flow Testing
- [ ] Test complete checkout flow:
  - [ ] Add product to cart
  - [ ] Enter shipping address
  - [ ] Select shipping method
  - [ ] Choose payment method
  - [ ] Review order
  - [ ] Create order successfully
  - [ ] Confirm order display on confirmation page
- [ ] Test with both authenticated and new users
- [ ] Verify all order data is saved to Directus

### Payment Integration
- [ ] Verify payment methods are configured:
  - [ ] Bank Transfer
  - [ ] Cash on Delivery
- [ ] Test payment flow (if using payment gateway)
- [ ] Confirm payment confirmations are logged

### Performance Optimization
- [ ] Enable gzip compression on server
- [ ] Enable caching headers for static assets
- [ ] Test Core Web Vitals with Lighthouse
- [ ] Monitor initial page load time (target: < 3s)

### Domain & HTTPS
- [ ] Domain configured: `https://buyjan.com`
- [ ] Admin domain configured: `https://admin.buyjan.com`
- [ ] SSL certificates valid and auto-renewing
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)

### Monitoring & Logging
- [ ] Set up error tracking (e.g., Sentry, LogRocket)
- [ ] Configure server-side logging
- [ ] Set up monitoring for:
  - [ ] API response times
  - [ ] Error rates
  - [ ] Checkout abandonment
- [ ] Enable Application Performance Monitoring (APM)

### Final Verification
- [ ] Test on multiple browsers:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Mobile browsers (iOS Safari, Android Chrome)
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test with RTL layout (Arabic mode)
- [ ] Verify Omani Rial currency formatting
- [ ] Test search functionality
- [ ] Verify product filtering and sorting

---

## 🚀 Deployment Steps

### 1. **Build for Production**
```bash
npm install
npm run build
```

### 2. **Set Production Environment Variables**
```bash
export NODE_ENV=production
export NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
export NEXT_PUBLIC_SITE_URL=https://buyjan.com
export DIRECTUS_API_TOKEN=<YOUR_SECURE_TOKEN>
export NEXT_PUBLIC_DIRECTUS_API_TOKEN=<YOUR_SECURE_TOKEN>
```

### 3. **Start Production Server**
```bash
npm start
# Or use PM2 for process management:
# pm2 start npm --name "buyjan" -- start
```

### 4. **Configure Reverse Proxy (nginx)**
```nginx
server {
    listen 443 ssl http2;
    server_name buyjan.com www.buyjan.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. **Enable Auto-Restart (systemd)**
Create `/etc/systemd/system/buyjan.service`:
```ini
[Unit]
Description=BuyJan E-Commerce App
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/buyjan
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl enable buyjan
systemctl start buyjan
```

---

## ⚠️ Known Issues & Notes

### TypeScript Type Errors
- Many pre-existing TypeScript errors exist in the codebase
- These do not prevent the Next.js build from succeeding
- They should be addressed in future refactoring sprints

### API Route Issues
- Some API routes may need updates for Next.js 15 compatibility
- Ensure dynamic route parameters are properly awaited in handlers

### Recommendation: Address Before Going Live
1. Fix remaining TypeScript errors in critical paths:
   - Checkout flow components
   - Authentication handlers
   - API route handlers

---

## 📞 Troubleshooting

### Build Fails
- Clear `.next` cache: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (should be 18.x+)

### Token Expiration Errors
- Verify `DIRECTUS_API_TOKEN` is valid and has not expired
- Check token permissions in Directus admin panel
- Ensure token has read/write access to all collections

### Checkout Flow Issues
- Verify all API routes are accessible
- Check Directus connectivity
- Enable error logging for debugging
- Review browser console for JavaScript errors

### Performance Issues
- Enable caching in Directus
- Implement Redis caching for API responses
- Optimize images with Directus image processing
- Use CDN for static assets

---

## 📊 Success Metrics

After deployment, monitor these metrics:
- ✅ Page load time: < 3 seconds
- ✅ API response time: < 500ms (p95)
- ✅ Error rate: < 0.1%
- ✅ Checkout success rate: > 95%
- ✅ Uptime: > 99.5%

---

**Last Updated:** October 29, 2024
**Status:** Ready for Deployment ✅