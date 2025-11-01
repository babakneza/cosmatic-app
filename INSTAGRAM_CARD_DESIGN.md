# Instagram-Inspired Product Card Component

## Overview

The `InstagramProductCard` component is a modern, mobile-first product card design inspired by Instagram's aesthetic. It delivers an engaging, touch-optimized shopping experience with image carousels, interactive animations, and engagement metrics.

## ✨ Key Features

### 1. **Image Carousel**
- **Swipeable gallery**: Horizontal swipe gestures to navigate between product images
- **Image indicators**: Visual dots at the bottom showing current image position
- **Desktop navigation**: Arrow buttons for easy navigation on larger screens
- **Smooth transitions**: Framer Motion animations for seamless image switching
- **Progressive loading**: Images load efficiently with proper Next.js Image optimization

### 2. **Double-Tap Like Interaction**
- **Instant feedback**: Double-tap the image to like/unlike products
- **Heart animation**: Animated heart appears on double-tap with scale and fade effect
- **Visual state**: Heart icon shows like status with filled accent color
- **Like counter**: Real-time like count updates with smooth animations

### 3. **Engagement Metrics**
- **Mock data**: Likes and views counts (simulated for demo purposes)
- **Display format**: Readable locale-specific number formatting
- **Metrics section**: Prominent display between product info and price
- **Real-time updates**: Counters update when users interact with the card

### 4. **Quick Actions**
- **Like button**: Heart icon in bottom-right corner of image
- **Add to cart**: Full-width conversion-focused button
- **Share button**: Native share functionality (with clipboard fallback)
- **Quick view**: Link to detailed product page

### 5. **Product Information**
- **Name**: Product title with line clamping for consistency
- **Rating**: 5-star rating display with review count
- **Price**: Prominent pricing with sale price support
- **Badges**: Stock status, new arrival, sale discount indicators
- **Out of stock overlay**: Visual indicator when product unavailable

### 6. **Animations & Micro-interactions**
- **Entry animation**: Smooth fade-in and scale on mount
- **Hover effects**: Scale transformations and shadow changes
- **Touch feedback**: WhileTap animations for button feedback
- **Image transitions**: Cross-fade between carousel images
- **Heart animation**: Celebratory animation on double-tap

## 📱 Mobile-First Design

- **Touch-optimized**: 44px minimum touch targets
- **Gesture-based**: Swipe, double-tap, long-press interactions
- **One-handed use**: All controls accessible with thumb
- **Responsive images**: 4:5 or 1:1 aspect ratio for optimal viewing
- **Performance**: Minimal re-renders with proper React optimization

## 🚀 Usage

### Basic Implementation

```jsx
import { InstagramProductCard } from '@/components/product';

export default function ProductGrid({ products }) {
    const handleAddToCart = (product) => {
        // Add to cart logic
        console.log('Added to cart:', product.name);
    };

    const handleAddToWishlist = (product) => {
        // Add to wishlist logic
        console.log('Added to wishlist:', product.name);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <InstagramProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                />
            ))}
        </div>
    );
}
```

### Props

```typescript
interface InstagramProductCardProps {
    product: Product;                                    // Product data object
    onAddToCart?: (product: Product) => void;          // Cart handler
    onAddToWishlist?: (product: Product) => void;      // Wishlist handler
}
```

### Product Data Structure

```typescript
interface Product {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description: string;
    price: number;
    sale_price?: number;
    images: ProductImage[];       // Array of product images
    image?: string;               // Main image URL (fallback)
    rating?: number;              // 1-5 star rating
    rating_count?: number;        // Number of reviews
    in_stock: boolean;            // Stock status
    is_new?: boolean;             // New badge flag
    // ... other fields
}

interface ProductImage {
    id: string;
    url: string;
    alt?: string;
}
```

## 🎨 Customization

### Styling Classes

The component uses Tailwind CSS for styling. Key customization points:

```tsx
// Card container
className="group relative bg-white rounded-2xl overflow-hidden"

// Image container
className="relative w-full aspect-square bg-neutral-100"

// Like button
className="absolute bottom-3 right-3 z-20 bg-white rounded-full"

// Add to cart button
className="w-full text-xs sm:text-sm h-9 sm:h-10 rounded-lg"

// Engagement metrics
className="flex items-center justify-between text-xs text-neutral-500"
```

### Custom Animation Duration

Modify motion.animate transition duration:

```tsx
// In the swipe animation section
transition={{ duration: 0.3 }} // Change to desired duration
```

### Mock Data Range

Customize engagement metrics range:

```tsx
// Likes: Random between 50 and 1050
setLikes(Math.floor(Math.random() * 1000) + 50);

// Views: Random between 100 and 5100
setViews(Math.floor(Math.random() * 5000) + 100);
```

## 🔄 Gesture Interactions

### Double-Tap to Like
```
1. Tap image once (sets timestamp)
2. Tap again within 300ms
3. Like animation triggers
4. Heart icon fills with accent color
5. Like count increases
```

### Swipe to Navigate Images
```
1. Touch and hold on image
2. Swipe left (or right in RTL) to go to next image
3. Swipe threshold: 50px minimum
4. Image carousel updates with transition
5. Indicators update to reflect current position
```

### Desktop Navigation
```
- Left/Right arrows appear on hover
- Click arrows to navigate carousel
- Indicators show position in carousel
- Disabled state when at first/last image
```

## 📊 Engagement Metrics

The component includes mock engagement data:

- **Likes**: Simulated user engagement count
- **Views**: Simulated product view count
- **Updates**: Counters refresh on user interactions
- **Format**: Locale-aware number formatting (1.5K, 2.3K, etc.)

To integrate with real data:

```tsx
// Fetch from your API
const [likes, setLikes] = useState(product.like_count || 0);
const [views, setViews] = useState(product.view_count || 0);

// Update on interaction
const handleLike = () => {
    // Call your API to update like count
    updateProductLikes(product.id);
};
```

## 🌐 Internationalization

The component supports RTL/LTR languages:

```tsx
const rtl = isRTL(locale);

// Applied to component
<div dir={rtl ? 'rtl' : 'ltr'}>
```

Translation keys used:

```json
{
  "product": {
    "reviews": "Reviews",
    "likes": "Likes",
    "views": "Views",
    "outOfStock": "Out of Stock",
    "new": "New"
  },
  "common": {
    "addToCart": "Add to Cart",
    "share": "Share",
    "quickView": "Quick View"
  }
}
```

## 🎯 Performance Optimization

### Image Optimization
- Uses Next.js `Image` component with automatic optimization
- Responsive sizing with `sizes` prop
- Priority loading for first image
- Lazy loading for carousel images

### Animation Performance
- Framer Motion GPU-accelerated transforms
- Conditional animations (only on mouse events for desktop)
- Optimized re-renders with proper dependency tracking
- Minimal state updates

### Bundle Size
- ~12KB minified (with Framer Motion)
- Lazy loadable component
- Tree-shakeable exports

## 🔧 Integration Examples

### With Shopping Cart

```jsx
import { InstagramProductCard } from '@/components/product';
import { useCart } from '@/store/cart';

export default function ProductShowcase() {
    const { addItem } = useCart();

    const handleAddToCart = (product) => {
        addItem({
            id: product.id,
            product,
            quantity: 1
        });
        // Show toast notification
        showSuccessNotification('Added to cart!');
    };

    return (
        <InstagramProductCard
            product={product}
            onAddToCart={handleAddToCart}
        />
    );
}
```

### With Wishlist

```jsx
import { InstagramProductCard } from '@/components/product';
import { useWishlist } from '@/store/wishlist';

export default function FeaturedProduct() {
    const { addToWishlist } = useWishlist();

    return (
        <InstagramProductCard
            product={product}
            onAddToWishlist={(prod) => addToWishlist(prod.id)}
        />
    );
}
```

### In a Product Grid

```jsx
import { InstagramProductCard } from '@/components/product';

export default function ShopPage({ products }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <InstagramProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                />
            ))}
        </div>
    );
}
```

## ⚡ Best Practices

1. **Image Quality**: Provide high-quality product images (minimum 500x500px)
2. **Alt Text**: Always include descriptive alt text for accessibility
3. **Loading States**: Handle image loading with skeleton loaders
4. **Error Handling**: Provide fallback images for failed loads
5. **Performance**: Use CDN-optimized images for fast loading
6. **Testing**: Test swipe interactions on actual touch devices
7. **Accessibility**: Maintain semantic HTML and ARIA labels
8. **Mobile-First**: Design primarily for mobile, enhance for desktop

## 🐛 Troubleshooting

### Swipe Not Working
- Ensure touch events are properly handled
- Check `onTouchStart` and `onTouchEnd` event binding
- Verify swipe threshold (50px minimum)

### Double-Tap Not Triggering
- Check if tap events are being prevented by event handlers
- Ensure 300ms time window between taps
- Verify lastTapRef is properly tracking timestamps

### Images Not Loading
- Check image URLs are correct and accessible
- Verify CORS settings if using external CDN
- Use fallback image if primary image fails

### Animations Laggy
- Reduce animation complexity on low-end devices
- Use `will-change` CSS sparingly
- Consider disabling animations on low-power devices

## 📚 Related Components

- `ProductCard`: Classic grid product card
- `ProductGrid`: Grid layout manager
- `ProductGallery`: Detailed image gallery
- `ProductRating`: Rating display component

## 🔐 Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly text
- High contrast for visibility
- Touch-friendly button sizes (44px minimum)

## 📝 License

This component is part of the BuyJan e-commerce platform.