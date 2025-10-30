# Category Catalog Pages

This directory contains beautiful category-specific product catalog pages for the BuyJan e-commerce application.

## 📁 Structure

```
categories/
├── [slug]/
│   ├── page.tsx                 # Server component for category page
│   └── components/
│       ├── CategoryContent.tsx   # Beautiful category showcase with filters
│       └── CategoryFilterSidebar.tsx # Brand & price filters for category
└── README.md
```

## 🎨 Features

### Beautiful Hero Section
- **Category Image**: Displays category image as a backdrop with overlay
- **Gradient Design**: Oman-themed gradient (Gold, Green, Red)
- **Decorative Elements**: Animated blobs and smooth animations
- **Category Info**: Name, description, and product count
- **Responsive**: Works perfectly on mobile, tablet, and desktop

### Product Display
- **Grid Layout**: 2 columns on mobile, 3 on tablet/desktop
- **Luxury Cards**: High-quality product cards with images, names, prices
- **Responsive**: Adapts to screen size automatically
- **Pagination**: Navigate through products easily

### Filtering & Sorting
- **Brand Filter**: Filter products by brand within the category
- **Price Range**: Set min/max price in OMR
- **Search**: Search products within the category
- **Sort Options**: Sort by newest, price, name, and rating
- **Active Filters**: Display and remove active filters easily

### Mobile Optimization
- **Responsive Design**: Full RTL/LTR support
- **Mobile Filter Drawer**: Slide-in filter panel on mobile
- **Touch-Friendly**: Large tap targets and smooth interactions
- **Fast Performance**: Optimized rendering and pagination

## 🔗 Usage

### Accessing Category Pages

```
/ar/categories/[category-slug]  # Arabic version
/en/categories/[category-slug]  # English version
```

### Example URLs
```
/ar/categories/skin_brightening
/en/categories/intimate_care
/ar/categories/hair_body_care
/en/categories/acne_sun_protection
```

### Query Parameters

```
?brand=loreal,maybelline     # Filter by brands (comma-separated)
&min_price=10                # Minimum price in OMR
&max_price=100               # Maximum price in OMR
&sort=newest                 # Sort option
&page=1                      # Page number
&search=serum                # Search term
```

### Example with Filters
```
/ar/categories/skin_brightening?brand=loreal&min_price=20&max_price=80&sort=newest&page=1
```

## 📦 Components

### CategoryContent.tsx
**Main content component for category pages**

Props:
- `category`: Category object with name, description, image
- `products`: Filtered products for pagination
- `brands`: Available brands for filtering
- `filters`: Active filters
- `sort`: Current sort option
- `pagination`: Pagination data
- `locale`: Current locale (ar/en)

Features:
- Beautiful hero section with category image
- Search bar with real-time filtering
- Filter sidebar (desktop) and drawer (mobile)
- Sort dropdown
- Active filters display
- Product grid with pagination
- Mobile-responsive design

### CategoryFilterSidebar.tsx
**Filter controls for category pages**

Props:
- `brands`: Available brands
- `filters`: Active filters
- `locale`: Current locale

Filters:
- Brand selection (checkboxes)
- Price range (min/max sliders)
- Expandable sections with smooth animations

### CategoryShowcase.tsx
**Component to display categories on homepage**

Props:
- `categories`: Array of categories
- `locale`: Current locale
- `title`: Optional custom title
- `limit`: Number of categories to show (default: 6)

Features:
- Beautiful category cards with images
- Hover effects and animations
- Links to category pages
- Responsive grid layout

## 🎯 Data Flow

### Server-Side (page.tsx)
1. Fetch all categories from Directus
2. Fetch all products from Directus
3. Fetch all brands from Directus
4. Find the specific category by slug
5. Filter products by category
6. Apply additional filters (brand, price, search)
7. Calculate pagination
8. Pass data to client component

### Client-Side (CategoryContent.tsx)
1. Display beautiful hero section
2. Handle filter changes with URL params
3. Update product display based on filters
4. Handle pagination and sorting
5. Provide smooth interactions

## 🔄 Filter Logic

### Category Filtering
- Products are pre-filtered by category on the server
- Only products belonging to the category are shown

### Brand Filtering
- Users can select multiple brands
- Products are filtered to show only selected brands
- Brands are stored as comma-separated values in URL

### Price Filtering
- Min and Max price sliders
- Prices filtered in OMR currency
- Both sliders can be used together

### Search Filtering
- Real-time search within the category
- Searches in product name, name_ar, and description
- Case-insensitive search

### Sorting
- Newest first (by updated_at)
- Price: Low to High
- Price: High to Low
- Name: A-Z
- Best rated (by average rating from reviews)

## 🎨 Design Features

### Oman-Themed Colors
```
Primary (Gold):    #D4AF37
Secondary (Green): #006400
Accent (Red):      #C53030
```

### Typography
- Arabic: IBM Plex Sans Arabic (RTL)
- English: Inter (LTR)

### Animations
- Animated blobs in hero section
- Smooth hover effects on category cards
- Transition animations for filters
- Lazy loading for images

## 📱 Responsive Breakpoints

```
Mobile:  < 640px   (2 columns, full width)
Tablet:  640-1024px (3 columns)
Desktop: > 1024px  (3 columns)
```

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast text
- Touch-friendly tap targets (44x44px minimum)
- Screen reader friendly

## 🚀 Performance Optimizations

- **Static Generation**: Categories pre-rendered at build time
- **Image Optimization**: Next.js Image component for auto-optimization
- **Code Splitting**: Components lazy-loaded as needed
- **Debounced Filters**: URL updates are debounced
- **Memoization**: useCallback and useMemo for performance

## 🔧 API Integration

### Categories API
```typescript
const categories = await getCategories();
const category = categories.find(c => c.slug === slug);
```

### Products API
```typescript
const products = await getProducts({ limit: 100 });
const categoryProducts = products.filter(p => 
  p.categories?.some(c => c.slug === slug)
);
```

### Brands API
```typescript
const brands = await getBrands();
```

## 📝 Translation Keys

The category pages use these i18n keys:

```json
{
  "shop": {
    "premium_cosmetics": "Premium Cosmetics",
    "filter": "Filter",
    "brand": "Brand",
    "brands": "Brands",
    "price_range": "Price Range",
    "min_price": "Minimum Price",
    "max_price": "Maximum Price",
    "sort_by": "Sort By",
    "active_filters": "Active Filters",
    "clear_all": "Clear All",
    "products": "products",
    "showing": "Showing",
    "of": "of",
    "no_products": "No Products",
    "no_products_found": "No Products Found",
    "try_adjusting_filters": "Try adjusting your filters..."
  }
}
```

## 🧪 Testing

To test category pages:

1. **Navigation**: Click on category cards to navigate to category pages
2. **Filters**: Test brand selection, price range filtering
3. **Search**: Search for products within the category
4. **Sorting**: Change sort order and verify results
5. **Pagination**: Navigate through pages
6. **Mobile**: Test on mobile device or responsive mode
7. **RTL**: Switch between Arabic and English

## 🐛 Troubleshooting

### No products showing
- Check if products have the category assigned
- Verify category slug matches
- Check product `in_stock` status

### Filters not working
- Check URL parameters are updating
- Verify brand slugs in URL
- Check filter values are valid

### Images not loading
- Verify Directus URL is correct
- Check image asset exists in Directus
- Verify NEXT_PUBLIC_DIRECTUS_URL env var

### Performance issues
- Clear Next.js cache: `rm -rf .next`
- Check product count (may be too large)
- Verify database connection

## 📚 Future Enhancements

- [ ] Category image uploads
- [ ] Subcategory support
- [ ] Product reviews on category pages
- [ ] Related categories sidebar
- [ ] Category-specific promotions
- [ ] Product comparison within category
- [ ] Wishlist functionality
- [ ] Advanced filters (ingredients, benefits)
- [ ] Category analytics