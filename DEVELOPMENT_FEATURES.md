# 🚀 Development Mode - All Features Enabled

## Application Status: **DEVELOPMENT MODE ACTIVE**

**NODE_ENV**: `development`  
**Configuration**: All production restrictions removed  
**Build Optimization**: Disabled  
**Console Logging**: Fully enabled  

---

## 📋 Enabled Development Features

### 1. **Debug Pages**
Full-featured debug pages for development and testing:

#### 🔍 Debug Page
- **URL**: `http://localhost:3000/en/debug` or `http://localhost:3000/ar/debug`
- **Features**:
  - Real-time Zustand store state inspection
  - localStorage auth-store display
  - Authentication status indicator
  - Token information display
  - Hydration status indicator
  - Quick navigation to other pages

#### 🔑 Authentication Test Page
- **URL**: `http://localhost:3000/en/auth-test` or `http://localhost:3000/ar/auth-test`
- **Features**:
  - Authentication status display
  - Token information (access, refresh, expiry)
  - User profile information
  - Test login/logout functionality
  - Session management testing
  - Token refresh testing

#### 📦 Test Product Page
- **URL**: `http://localhost:3000/en/test-product` or `http://localhost:3000/ar/test-product`
- **Features**:
  - Test product display and rendering
  - Product gallery testing
  - Add to cart functionality
  - Price calculation verification
  - Localization testing

---

### 2. **Debug API Endpoints**
Backend endpoints for debugging and inspection:

#### Categories Debug Endpoint
- **URL**: `GET http://localhost:3000/api/debug-categories`
- **Purpose**: Fetch all categories with full debug information
- **Response**: Includes all categories and limited sample

#### Mock Product Endpoint
- **URL**: `GET http://localhost:3000/api/mock-product`
- **Purpose**: Return mock product data for testing
- **Response**: Fully formatted mock product object

#### Schema Inspection Endpoint
- **URL**: `GET http://localhost:3000/api/check-schema`
- **Purpose**: Inspect Directus collection schema
- **Response**: Field definitions for categories collection

#### Test Categories Endpoint
- **URL**: `GET http://localhost:3000/api/test-categories`
- **Purpose**: Test categories API endpoint

---

### 3. **Console Logging**
All console output fully preserved:

- ✅ `console.log()` - Informational messages
- ✅ `console.error()` - Error messages
- ✅ `console.warn()` - Warning messages
- ✅ `console.debug()` - Debug messages
- ✅ `console.trace()` - Stack traces
- ✅ `console.time()` - Performance timing

**Developer Console Labels** (visible in browser DevTools):
```
[DEBUG]
[useCheckoutData]
[ShippingMethodSelector]
[Wishlist]
[Shipping API]
[API]
[Authentication]
```

---

### 4. **React & TypeScript Configuration**

#### React Strict Mode
- ✅ Enabled for detecting unsafe lifecycle methods
- ✅ Warnings for components using legacy patterns
- ✅ Double-rendering of components in development for side-effect detection

#### TypeScript
- ✅ Full type checking enabled
- ✅ Strict mode enabled
- ✅ Type errors display in console
- ✅ Source maps available for debugging

#### JSX Processing
- ✅ Source maps preserved
- ✅ Original JSX visible in browser DevTools
- ✅ Fast Refresh enabled for instant component updates

---

### 5. **Performance & Optimization**

#### Image Optimization
- ✅ Unoptimized images in development (faster build times)
- ✅ All image formats supported (AVIF, WebP, original)
- ✅ Local image sources allowed (`localhost`, `127.0.0.1`)

#### Code Optimization
- ✅ Minification disabled
- ✅ SWC compression disabled
- ✅ Hot Module Replacement (HMR) active
- ✅ Fast Refresh enabled for components and styles

#### On-Demand Entries
- ✅ Pages kept in memory for faster reloads
- ✅ 60-second inactivity timeout
- ✅ 5-page buffer for frequently accessed pages

---

### 6. **Directus CMS Integration**

#### API Connection
- ✅ Static token authentication: `gA_XCHBw42I5BxcfLroKxWLY67GwmxL0`
- ✅ Admin credentials available: `admin@buyjan.com`
- ✅ CMS URL: `https://admin.buyjan.com`
- ✅ Site URL: `https://buyjan.com`

#### Collections Available
- Products
- Categories (categiries)
- Brands
- Customers
- Orders
- Order Items
- Reviews
- Wishlist
- Coupons
- Countries
- Shipping Methods

---

### 7. **State Management (Zustand)**

#### Auth Store
- Real-time state display in debug page
- Full token information inspection
- User profile display
- Persistent localStorage storage
- Hydration state indication

#### Cart Store
- Shopping cart state visibility
- Item management testing
- Quantity tracking
- Total calculation verification

#### Checkout Store
- Shipping information display
- Address management
- Payment method selection
- Form state inspection

#### Modal Store
- Modal state tracking
- Dialog management

---

### 8. **Developer Tools & Integrations**

#### Browser DevTools
- ✅ React Developer Tools extension support
- ✅ Full source maps for TypeScript
- ✅ Network tab debugging
- ✅ Console error details with stack traces
- ✅ Performance profiling available
- ✅ Local storage inspection

#### Next.js DevTools
- ✅ Fast Refresh for instant updates
- ✅ Detailed error overlays
- ✅ Build analysis available
- ✅ Route inspection

#### Environment
- ✅ Node.js 18.x+
- ✅ npm 9+
- ✅ TypeScript 5.3.3
- ✅ Next.js 15.0.3
- ✅ React 19.0.0

---

### 9. **Localization & RTL**

#### Multiple Language Support
- ✅ Arabic (RTL) - Primary
- ✅ English (LTR) - Secondary
- ✅ Full RTL support
- ✅ Dynamic language switching

#### Testing Localization
- ✅ Locale parameter in URL: `/{locale}/...`
- ✅ Language switcher component
- ✅ Message file inspection: `src/messages/{locale}.json`

---

### 10. **API Testing & Validation**

#### Available API Routes
```
GET  /api/products              - List all products
GET  /api/products/[slug]       - Get product by slug
GET  /api/categories            - List all categories
GET  /api/debug-categories      - Debug categories
GET  /api/mock-product          - Mock product data
GET  /api/check-schema          - Inspect schema
GET  /api/auth/me               - Get current user
POST /api/auth/login            - Login endpoint
POST /api/auth/logout           - Logout endpoint
POST /api/auth/register         - Registration endpoint
GET  /api/auth/refresh          - Refresh token
GET  /api/orders                - List orders
POST /api/orders                - Create order
GET  /api/customers             - List customers
GET  /api/shipping              - Get shipping methods
GET  /api/search                - Search products
GET  /api/countries             - List countries
```

---

## 🚀 Quick Start

### Start Development Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### Access Debug Pages
1. **Store Debug**: `http://localhost:3000/en/debug`
2. **Auth Test**: `http://localhost:3000/en/auth-test`
3. **Product Test**: `http://localhost:3000/en/test-product`

### View Console Logs
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Filter by `[DEBUG]`, `[API]`, `[Wishlist]`, etc.

### API Testing
Use tools like:
- Postman
- curl
- Browser Network tab
- Thunder Client VSCode extension

### Inspect State
1. Go to `/en/debug` page
2. View Zustand store state
3. Check localStorage content
4. Monitor real-time updates

---

## 📊 Configuration Files

### Environment
- `.env.local` - Local environment variables
- `.env.development` - Development-specific settings
- `.env.production.local` - Production overrides

### Build Configuration
- `next.config.js` - Next.js build settings (development-optimized)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration

### Development Tools
- `playwright.config.ts` - E2E testing configuration
- `.eslintrc.json` - Code linting configuration
- `postcss.config.js` - CSS processing

---

## 📝 Notes

- All features are enabled by default in development mode
- Production optimizations are automatically disabled
- Source maps are available for debugging
- Console output is preserved for inspection
- Hot Module Replacement (HMR) enables instant component updates
- Fast Refresh works for both code and style changes

---

## ✅ Status Checklist

- ✅ NODE_ENV set to `development`
- ✅ Console logging fully enabled
- ✅ Debug pages accessible
- ✅ Debug API endpoints available
- ✅ React Strict Mode enabled
- ✅ Source maps generated
- ✅ TypeScript strict mode enabled
- ✅ All development features enabled
- ✅ Production optimizations disabled
- ✅ Fast Refresh active
- ✅ Image optimization disabled for faster builds
- ✅ On-demand entries configured
- ✅ Directus API fully accessible
- ✅ State management fully debuggable

---

**Application is ready for full development with all features enabled.**