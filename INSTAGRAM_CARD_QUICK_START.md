# 🚀 Instagram Card - Quick Start Guide

## 1️⃣ Import the Component

```jsx
import { InstagramProductCard } from '@/components/product';
```

## 2️⃣ Basic Usage

```jsx
<InstagramProductCard
    product={product}
    onAddToCart={handleAddToCart}
    onAddToWishlist={handleAddToWishlist}
/>
```

## 3️⃣ In a Grid

```jsx
<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
    {products.map(product => (
        <InstagramProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
        />
    ))}
</div>
```

## 4️⃣ With Cart Integration

```jsx
import { useCart } from '@/store/cart';
import { InstagramProductCard } from '@/components/product';

export default function ShopPage() {
    const { addItem } = useCart();

    const handleAddToCart = (product) => {
        addItem({
            id: product.id,
            product,
            quantity: 1
        });
    };

    return (
        <InstagramProductCard
            product={product}
            onAddToCart={handleAddToCart}
        />
    );
}
```

## 5️⃣ With Wishlist Integration

```jsx
import { useWishlist } from '@/store/wishlist';
import { InstagramProductCard } from '@/components/product';

export default function ShopPage() {
    const { toggleWishlist } = useWishlist();

    const handleAddToWishlist = (product) => {
        toggleWishlist(product.id);
    };

    return (
        <InstagramProductCard
            product={product}
            onAddToWishlist={handleAddToWishlist}
        />
    );
}
```

## 6️⃣ Full Integration Example

```jsx
'use client';

import { useState } from 'react';
import { InstagramProductCard } from '@/components/product';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { showToast } from '@/components/ui/toast';
import type { Product } from '@/types';

interface ShopPageProps {
    products: Product[];
}

export default function ShopPage({ products }: ShopPageProps) {
    const { addItem } = useCart();
    const { toggleWishlist } = useWishlist();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async (product: Product) => {
        try {
            setLoading(true);
            addItem({
                id: product.id,
                product,
                quantity: 1
            });
            showToast.success(`${product.name} added to cart`);
        } catch (error) {
            showToast.error('Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWishlist = async (product: Product) => {
        try {
            await toggleWishlist(product.id);
            showToast.success(`${product.name} added to wishlist`);
        } catch (error) {
            showToast.error('Failed to update wishlist');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-8">Shop</h1>
                
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
            </div>
        </div>
    );
}
```

## 7️⃣ Product Data Requirements

Ensure your product has these fields:

```typescript
{
    id: "123",
    name: "Product Name",
    name_ar: "اسم المنتج",
    slug: "product-slug",
    price: 29.99,
    sale_price: 24.99,           // Optional
    image: "url-to-image.jpg",   // Fallback
    images: [                     // Recommended
        { id: "1", url: "image1.jpg" },
        { id: "2", url: "image2.jpg" },
        { id: "3", url: "image3.jpg" }
    ],
    rating: 4.5,                 // 0-5
    rating_count: 150,           // Number of reviews
    in_stock: true,              // true/false
    is_new: true,                // Optional
    description: "Product description"
}
```

## 8️⃣ Styling & Customization

### Grid Layout
```jsx
// 2 columns on mobile
<div className="grid grid-cols-2">

// 3 columns on tablet
<div className="grid grid-cols-2 md:grid-cols-3">

// 4 columns on desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

// With gap
<div className="grid grid-cols-2 gap-4">
```

### Card Container Customization
```jsx
// Custom wrapper
<div className="p-4 bg-white rounded-lg">
    <InstagramProductCard product={product} />
</div>

// With shadow
<div className="shadow-lg rounded-2xl overflow-hidden">
    <InstagramProductCard product={product} />
</div>
```

## 9️⃣ Troubleshooting

### Issue: Images not displaying
**Solution**: Ensure image URLs are correct and accessible
```jsx
// Check product data
console.log(product.image);      // Should have valid URL
console.log(product.images);     // Should be array with URLs
```

### Issue: Double-tap not working
**Solution**: Ensure touch events aren't being prevented
```jsx
// Check event handlers
// Make sure other handlers aren't calling preventDefault()
```

### Issue: Swipe not working on mobile
**Solution**: Device may not support touch events
```jsx
// Test on actual device
// Check browser console for errors
```

### Issue: Slow animations
**Solution**: Reduce animation complexity or disable on low-end devices
```jsx
// Check device performance
// Consider reducing image sizes
```

## 🔟 File Locations

```
Component:
├─ src/components/product/InstagramProductCard.tsx

Documentation:
├─ INSTAGRAM_CARD_DESIGN.md      (Full docs)
├─ INSTAGRAM_CARD_SUMMARY.md     (Visual guide)
├─ INSTAGRAM_CARD_QUICK_START.md (This file)

Translations:
├─ src/messages/en.json
├─ src/messages/ar.json

Export:
├─ src/components/product/index.ts
```

## 1️⃣1️⃣ Key Features Recap

| Feature | How to Use |
|---------|-----------|
| **Swipe Gallery** | Swipe left/right on image |
| **Double-tap Like** | Tap image twice quickly |
| **Add to Cart** | Click "ADD TO CART" button |
| **Share** | Click share icon (📤) |
| **Quick View** | Click "QUICK VIEW" link |
| **Like Button** | Click heart in bottom-right |
| **Price Display** | Shown below product info |
| **Rating** | 5-star rating + review count |
| **Engagement** | Likes & views display |
| **Badges** | New, Sale, Out of stock |

## 1️⃣2️⃣ Common Patterns

### With Filters
```jsx
const [filteredProducts, setFilteredProducts] = useState(products);

return (
    <div>
        <FilterBar onChange={setFilteredProducts} />
        <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => (
                <InstagramProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
);
```

### With Pagination
```jsx
const itemsPerPage = 12;
const [currentPage, setCurrentPage] = useState(1);

const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
);

return (
    <div>
        <div className="grid grid-cols-2 gap-4">
            {paginatedProducts.map(product => (
                <InstagramProductCard key={product.id} product={product} />
            ))}
        </div>
        <Pagination 
            total={products.length}
            itemsPerPage={itemsPerPage}
            onChange={setCurrentPage}
        />
    </div>
);
```

### With Sorting
```jsx
const [sortBy, setSortBy] = useState('newest');
const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price_low':
                return a.price - b.price;
            case 'price_high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
}, [products, sortBy]);

return (
    <div>
        <SortDropdown value={sortBy} onChange={setSortBy} />
        <div className="grid grid-cols-2 gap-4">
            {sortedProducts.map(product => (
                <InstagramProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
);
```

## 1️⃣3️⃣ Performance Tips

1. **Use key prop**: Always provide unique `key` in lists
2. **Lazy load images**: Images load as carousel advances
3. **Optimize product data**: Don't fetch unnecessary fields
4. **Memoize callbacks**: Use `useCallback` for handlers
5. **Image sizes**: Provide optimized image URLs
6. **Pagination**: Load products in chunks, not all at once

## 1️⃣4️⃣ Mobile-First Checklist

- ✅ Test on actual mobile device
- ✅ Test touch interactions (swipe, tap, double-tap)
- ✅ Test on slow network (throttle in DevTools)
- ✅ Test with images of varying sizes
- ✅ Test RTL/LTR languages
- ✅ Test with and without images
- ✅ Test add to cart flow
- ✅ Test wishlist integration
- ✅ Test share functionality
- ✅ Test on various screen sizes

## 1️⃣5️⃣ Next Steps

1. **Read Full Docs**: See `INSTAGRAM_CARD_DESIGN.md` for detailed info
2. **Check Code**: Review `InstagramProductCard.tsx` for implementation
3. **Test Locally**: Run dev server and test component
4. **Integrate**: Add to your shop page
5. **Customize**: Adjust colors, spacing, animations
6. **Deploy**: Push to production
7. **Monitor**: Track performance and user engagement

---

**Need Help?**
- Check documentation files
- Review component source code
- Test in browser DevTools
- Enable verbose logging for debugging
- Contact development team

**Happy Coding! 🚀**