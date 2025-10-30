# Buyjan - Premium Cosmetics E-Commerce (Oman Market)

A modern, mobile-first e-commerce platform for premium cosmetics and beauty products, specifically optimized for the Oman market with full RTL (Right-to-Left) support, Arabic localization, and Omani Rial (OMR) currency formatting.

## 🌟 Features

### Core Features
- ✅ **Mobile-First Design** - Optimized for mobile devices with responsive layouts
- ✅ **RTL Support** - Complete right-to-left layout for Arabic language
- ✅ **Bilingual** - Arabic (primary) and English support with next-intl
- ✅ **Omani Rial (OMR)** - Currency formatting with 3 decimal places
- ✅ **Directus CMS** - Integration with Directus headless CMS
- ✅ **Modern Stack** - Next.js 15, TypeScript, Tailwind CSS

### Oman-Specific Features
- 🇴🇲 Omani Rial (OMR) currency with proper formatting (3 decimals)
- 🇴🇲 Arabic language as primary with IBM Plex Sans Arabic font
- 🇴🇲 Omani governorates and wilayat address fields
- 🇴🇲 Local payment methods (Bank Muscat, BankDhofar, OmanNet, etc.)
- 🇴🇲 Oman color palette (Gold, Green, Red from Omani heritage)
- 🇴🇲 Cultural considerations (Ramadan, Eid themes support)

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with RTL plugin
- **State Management:** Zustand
- **Data Fetching:** SWR
- **Internationalization:** next-intl
- **Animations:** Framer Motion
- **UI Components:** Shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Backend:** Directus CMS (https://admin.buyjan.com)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Git

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

The `.env.local` file is already created with default values:

```env
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
NEXT_PUBLIC_SITE_URL=https://buyjan.com
DIRECTUS_API_TOKEN=
NODE_ENV=development
```

Update the `DIRECTUS_API_TOKEN` if you have one.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/ar` (Arabic) as the default locale.

## 📁 Project Structure

```
cosmatic_app_directus/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized routes
│   │   │   ├── layout.tsx     # Locale-specific layout
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Product listing
│   │   │   ├── product/[id]/  # Product details
│   │   │   ├── cart/          # Shopping cart
│   │   │   └── checkout/      # Checkout flow
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── layout/            # Layout components
│   │   ├── product/           # Product components
│   │   └── localization/      # Language switcher
│   ├── lib/
│   │   ├── api/               # API clients
│   │   │   ├── directus.ts    # Directus client
│   │   │   └── products.ts    # Product API
│   │   ├── currency.ts        # OMR formatting
│   │   └── utils.ts           # Utility functions
│   ├── store/
│   │   └── cart.ts            # Cart state management
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── messages/
│   │   ├── ar.json            # Arabic translations
│   │   └── en.json            # English translations
│   ├── i18n.ts                # i18n configuration
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🎨 Design System

### Colors (Oman Theme)
- **Primary (Gold):** `#D4AF37` - Represents Omani heritage
- **Secondary (Green):** `#006400` - Omani nature
- **Accent (Red):** `#C53030` - Traditional Omani patterns
- **Neutral:** Shades of gray for text and backgrounds

### Typography
- **Arabic Font:** IBM Plex Sans Arabic (Variable)
- **English Font:** Inter (Variable)
- **Weights:** 400, 500, 600, 700

### Spacing
- 4px grid system
- Mobile-first breakpoints: 375px, 640px, 768px, 1024px, 1280px

## 🌐 Localization

### Supported Languages
- Arabic (ar) - Primary, RTL
- English (en) - Secondary, LTR

### Adding Translations
Edit the translation files:
- `src/messages/ar.json` - Arabic translations
- `src/messages/en.json` - English translations

### Currency Formatting
```typescript
import { formatOMR } from '@/lib/currency';

// Format price in OMR
formatOMR(12.5, 'ar'); // "12.500 ر.ع."
formatOMR(12.5, 'en'); // "OMR 12.500"
```

## 🛒 State Management

### Cart Store (Zustand)
```typescript
import { useCartStore } from '@/store/cart';

const { items, addItem, removeItem, getTotal } = useCartStore();
```

## 🔌 API Integration

### Directus API
```typescript
import { directusClient } from '@/lib/api/directus';
import { getProducts, getProduct } from '@/lib/api/products';

// Fetch products
const products = await getProducts();

// Fetch single product
const product = await getProduct('product-id');
```

## 📱 Mobile Optimization

- Touch-friendly UI with minimum 44px tap targets
- Optimized images with Next.js Image component
- Prevents zoom on input focus (16px font size)
- Safe area support for notched devices
- Responsive grid layouts

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
```bash
vercel
```

## 🧪 Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 Phase 1 Completion Status

✅ **Completed:**
- Project initialization with Next.js 15
- TypeScript configuration
- Tailwind CSS with RTL support
- Arabic/English internationalization
- OMR currency formatting utilities
- Directus API client
- Type definitions
- Cart state management
- Global styles with RTL support
- Basic app structure

🔄 **Next Steps (Phase 2):**
- Product listing components
- Product detail pages
- Search functionality
- Category navigation
- Filtering and sorting

## 🤝 Contributing

This is a private project for Buyjan. For any questions or issues, please contact the development team.

## 📄 License

Proprietary - All rights reserved by Buyjan

## 🔗 Links

- **Production Site:** https://buyjan.com
- **Admin Panel:** https://admin.buyjan.com
- **Documentation:** [Internal Wiki]

---

**Built with ❤️ for the Oman market**
