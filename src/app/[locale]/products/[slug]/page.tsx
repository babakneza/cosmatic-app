'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import Price from '@/components/ui/Price';

import { Product, Locale } from '@/types';
import { cn, getDirection, isRTL, getFontFamily, getLocalizedValue, getDirectusAssetUrl } from '@/lib/utils';
import { calculateDiscount, formatDiscount } from '@/lib/currency';
import { useCartStore } from '@/store/cart';

// Placeholder product data for initial render
const placeholderProduct: Product = {
    id: '',
    name: '',
    slug: '',
    price: 0,
    in_stock: true,
    status: 'published',
    description: '',
    sku: '',
    stock: 0,
    currency: 'OMR',
    images: [],
    category: {
        id: '',
        name: '',
        slug: ''
    },
    created_at: '',
    updated_at: ''
};

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const locale = params?.locale as Locale;
    const t = useTranslations();
    const direction = getDirection(locale);
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    // Fetch product data from Directus
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(`[Client] Fetching product with slug: ${slug}, locale: ${locale}`);

                // Fetch from the API route that connects to Directus
                const response = await fetch(`/api/products/${slug}?locale=${locale}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });

                console.log(`[Client] API response status:`, response.status);

                // Get the response as text first for better error handling
                const responseText = await response.text();
                console.log(`[Client] API response text length:`, responseText.length);

                // Try to parse the response as JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error(`[Client] Failed to parse response as JSON:`, parseError);
                    console.log(`[Client] Response text:`, responseText.substring(0, 200) + '...');
                    const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
                    throw new Error(`Invalid JSON response: ${errorMsg}`);
                }

                // Handle error responses
                if (!response.ok) {
                    console.error(`[Client] API error response:`, data);

                    // Create a meaningful error message
                    const errorMessage = data.error
                        ? `${data.error}: ${data.message || 'No details provided'}`
                        : `Failed to fetch product: ${response.statusText}`;

                    throw new Error(errorMessage);
                }

                console.log('[Client] Product data from API:', data);

                // Validate the product data
                if (!data || !data.id) {
                    console.error('[Client] Invalid product data:', data);
                    throw new Error('Invalid product data received');
                }

                // Ensure all required fields are present with defaults
                const processedProduct = {
                    ...data,
                    name: data.name || '',
                    name_ar: data.name_ar || data.name || '',
                    slug: data.slug || '',
                    description: data.description || '',
                    description_ar: data.description_ar || data.description || '',
                    price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
                    sale_price: data.sale_price ? (typeof data.sale_price === 'number' ? data.sale_price : parseFloat(data.sale_price)) : undefined,
                    in_stock: data.in_stock !== undefined ? data.in_stock : true,
                    status: data.status || 'published',
                    mainImageUrl: data.mainImageUrl || '/images/placeholder-product.jpg',
                    processedImages: data.processedImages || [],
                    // Ensure images array exists
                    images: data.images || data.processedImages || [],
                    // Ensure category and brand exist
                    category: data.category || {
                        id: '',
                        name: '',
                        slug: ''
                    },
                    categories: data.categories || [],
                    brand: data.brand || null,
                    // Add other required fields from the Product type
                    sku: data.sku || '',
                    stock: data.stock || 0,
                    currency: data.currency || 'OMR',
                    // Additional product fields
                    ingredients: data.ingredients || '',
                    ingredients_ar: data.ingredients_ar || data.ingredients || '',
                    how_to_use: data.how_to_use || data.how_to_use0 || '',
                    how_to_use_ar: data.how_to_use_ar || data.how_to_use || data.how_to_use0 || '',
                    created_at: data.created_at || new Date().toISOString(),
                    updated_at: data.updated_at || new Date().toISOString(),
                    // New fields
                    is_new_arrival: data.is_new_arrival || false,
                    new_until: data.new_until || null,
                    cost_price: data.cost_price || null,
                    excerpt: data.excerpt || null
                };

                console.log('[Client] Processed product before setting state:', processedProduct);
                setProduct(processedProduct);
                console.log('[Client] Product state should be updated now');
            } catch (err) {
                console.error('[Client] Error fetching product:', err);
                setError(err instanceof Error ? err.message : 'Failed to load product');

                // Set a fallback product with error state
                setProduct({
                    ...placeholderProduct,
                    name: 'Error loading product',
                    description: err instanceof Error ? err.message : 'Unknown error',
                    price: 0,
                    mainImageUrl: '/images/placeholder-product.jpg',
                    error: true,
                    errorMessage: err instanceof Error ? err.message : 'Unknown error'
                });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug, locale]);

    // Debug effect to monitor product state changes
    useEffect(() => {
        console.log('[Client] Product state changed:', product);
        if (product) {
            console.log('[Client] Product name:', product.name);
            console.log('[Client] Product images:', product.processedImages?.length || 0);
            console.log('[Client] Product main image URL:', product.mainImageUrl);
            console.log('[Client] Product ingredients:', product.ingredients);
            console.log('[Client] Product how_to_use:', product.how_to_use);
            console.log('[Client] Product is_new_arrival:', product.is_new_arrival);
            console.log('[Client] Product new_until:', product.new_until);
            console.log('[Client] Product in_stock:', product.in_stock);
            console.log('[Client] Product price:', product.price);
            console.log('[Client] Product sale_price:', product.sale_price);
            console.log('[Client] Product excerpt:', product.excerpt);

            // Log all available fields for debugging
            console.log('[Client] All product fields:', Object.keys(product).join(', '));
        }
    }, [product]);

    // Handle quantity change
    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    // Handle add to cart
    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity);
            // Optional: Show confirmation message
        }
    };

    // Handle image navigation
    const nextImage = () => {
        // Use processedImages if available, otherwise fall back to images
        const imageArray = product?.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0
            ? product.processedImages
            : product?.images && Array.isArray(product.images) ? product.images : [];

        if (imageArray.length > 0) {
            console.log('[Client] Moving to next image, current index:', currentImageIndex, 'total images:', imageArray.length);
            setCurrentImageIndex(prev =>
                prev === imageArray.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        // Use processedImages if available, otherwise fall back to images
        const imageArray = product?.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0
            ? product.processedImages
            : product?.images && Array.isArray(product.images) ? product.images : [];

        if (imageArray.length > 0) {
            console.log('[Client] Moving to previous image, current index:', currentImageIndex, 'total images:', imageArray.length);
            setCurrentImageIndex(prev =>
                prev === 0 ? imageArray.length - 1 : prev - 1
            );
        }
    };

    // Get current image URL
    const getCurrentImageUrl = () => {
        if (!product) {
            console.log('[Client] No product available for image URL');
            return '/images/placeholder-product.jpg';
        }

        console.log('[Client] Getting image URL with currentImageIndex:', currentImageIndex);
        console.log('[Client] Product image data:', {
            hasProcessedImages: product.processedImages && Array.isArray(product.processedImages),
            processedImagesCount: product.processedImages && Array.isArray(product.processedImages) ? product.processedImages.length : 0,
            hasMainImageUrl: !!product.mainImageUrl,
            hasImages: product.images && Array.isArray(product.images),
            imagesCount: product.images && Array.isArray(product.images) ? product.images.length : 0
        });

        // First check if we have pre-processed images from the API
        if (product.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0) {
            // If we have processed images, use the current index or the first one
            const safeIndex = Math.min(currentImageIndex, product.processedImages.length - 1);
            const processedImage = product.processedImages[safeIndex];

            console.log('[Client] Using processed image at index:', safeIndex);

            if (processedImage && processedImage.url) {
                console.log('[Client] Found valid processed image URL:', processedImage.url.substring(0, 50) + '...');
                return processedImage.url;
            }
        }

        // If no processed images or the current one is invalid, fall back to main image
        if (product.mainImageUrl && product.mainImageUrl !== '/images/placeholder-product.jpg') {
            console.log('[Client] Using main image URL:', product.mainImageUrl.substring(0, 50) + '...');
            return product.mainImageUrl;
        }

        // Check if we have any images in the images array
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const safeIndex = Math.min(currentImageIndex, product.images.length - 1);
            const image = product.images[safeIndex] as any;

            if (image) {
                // If the image is an object with a url property
                if (typeof image === 'object' && image !== null && 'url' in image) {
                    const imageObj = image as any;
                    const urlString = (imageObj.url ?? '') as string;
                    if (urlString) {
                        console.log('[Client] Using image URL from images array:', urlString.substring(0, 50) + '...');
                        return imageObj.url;
                    }
                }

                // If the image is a string URL
                if (typeof image === 'string') {
                    const imageStr = image as string;
                    if (imageStr && (imageStr as string).startsWith && (imageStr as string).startsWith('http')) {
                        console.log('[Client] Using string URL from images array:', (imageStr as string).substring(0, 50) + '...');
                        return imageStr;
                    }
                }
            }
        }

        // Final fallback to placeholder
        console.log('[Client] No valid images found, using placeholder');
        return '/images/placeholder-product.jpg';
    };

    // Get localized product name and description
    const productName = product ? getLocalizedValue(
        { name: product.name || '', name_ar: product.name_ar || product.name || '' },
        locale
    ) : '';

    const productDescription = product ? getLocalizedValue(
        { name: product.description || '', name_ar: product.description_ar || product.description || '' },
        locale
    ) : '';

    console.log('[Client] Localized product name:', productName);
    console.log('[Client] Localized product description length:', productDescription ? productDescription.length : 0);

    // Check if product is still a new arrival based on new_until date
    const isStillNewArrival = product?.is_new_arrival && product?.new_until
        ? new Date(product.new_until) > new Date()
        : product?.is_new_arrival || false;

    // Calculate discount if there's a sale price
    const hasDiscount = product?.sale_price !== undefined && product.sale_price < product.price;
    const discountPercentage = hasDiscount && product
        ? calculateDiscount(product.price, product.sale_price!)
        : 0;

    if (loading) {
        console.log('[Client] Rendering loading state');
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-neutral-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error && !product) {
        console.log('[Client] Rendering error state:', error);
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="text-4xl text-neutral-300 mb-4">
                        <ShoppingCart size={64} />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800 mb-2">{t('product.not_found')}</h1>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                    >
                        {t('common.go_back')}
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        console.log('[Client] Product is null, returning null');
        return null;
    }

    // Detailed product structure check
    console.log('[Client] Product structure check:', {
        id: product.id ? 'Present' : 'Missing',
        name: product.name ? 'Present' : 'Missing',
        price: product.price !== undefined ? `Present: ${product.price}` : 'Missing',
        mainImageUrl: product.mainImageUrl ? 'Present' : 'Missing',
        processedImages: product.processedImages && Array.isArray(product.processedImages) ?
            `Array with ${product.processedImages.length} items` : 'Missing or not an array',
        images: product.images && Array.isArray(product.images) ?
            `Array with ${product.images.length} items` : 'Missing or not an array',
        category: product.category ? 'Present' : 'Missing',
        brand: product.brand ? 'Present' : 'Missing',
        required_fields: {
            sku: product.sku ? 'Present' : 'Missing',
            stock: product.stock !== undefined ? 'Present' : 'Missing',
            currency: product.currency ? 'Present' : 'Missing',
            in_stock: product.in_stock !== undefined ? 'Present' : 'Missing'
        }
    });

    console.log('[Client] Rendering product component with data:', {
        name: product.name,
        price: product.price,
        hasMainImage: !!product.mainImageUrl,
        hasProcessedImages: Array.isArray(product.processedImages) && product.processedImages.length > 0,
        hasImages: Array.isArray(product.images) && product.images.length > 0,
        imageUrl: getCurrentImageUrl(),
        hasCategory: !!product.category,
        hasBrand: !!product.brand
    });

    // Debug component removed

    return (
        <div
            className={cn(
                "container mx-auto px-4 py-8",
                rtl ? 'font-arabic' : 'font-english'
            )}
            dir={direction}
        >
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm text-neutral-500">
                <span>{t('common.home')}</span>
                <span className="mx-2">/</span>
                {product.brand && product.brand.name && (
                    <>
                        <span>{getLocalizedValue(
                            { name: product.brand.name || '', name_ar: product.brand.name_ar || product.brand.name || '' },
                            locale
                        )}</span>
                        <span className="mx-2">/</span>
                    </>
                )}
                <span className="text-neutral-800">{productName || product.name || 'Product'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Product Images */}
                <div className="relative">
                    {/* Main Image with Gallery */}
                    <div className="relative mb-4">
                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute start-4 top-4 z-20 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white">
                                {formatDiscount(product.price, product.sale_price!, locale)}
                            </div>
                        )}

                        {/* New Arrival Badge */}
                        {isStillNewArrival && (
                            <div className="absolute end-4 top-4 z-20 rounded-full bg-green-500 px-3 py-1.5 text-sm font-medium text-white">
                                New Product
                            </div>
                        )}

                        {/* Debug info for new_until date removed */}

                        {/* Out of Stock Overlay */}
                        {!product.in_stock && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/60 rounded-lg">
                                <span className="rounded-md bg-neutral-900 px-4 py-2 text-base font-medium text-white">
                                    {t('product.out_of_stock')}
                                </span>
                            </div>
                        )}

                        {/* Use the ProductGallery component for displaying product images */}
                        <ProductGallery
                            images={product.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0
                                ? product.processedImages.map(img => img.url)
                                : product.images && Array.isArray(product.images) && product.images.length > 0
                                    ? product.images.map(img => typeof img === 'string' ? img : img.url)
                                    : [product.mainImageUrl || '/images/placeholder-product.jpg']
                            }
                            productName={productName || 'Product'}
                        />

                        {/* Debug overlay for development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs p-1 rounded z-10">
                                {product.processedImages && Array.isArray(product.processedImages)
                                    ? `${product.processedImages.length} gallery images`
                                    : 'No processed images'}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails are already included in the ProductGallery component */}
                    {/* Define imagesToUse variable for debugging purposes only */}
                    {(() => {
                        // Define imagesToUse variable based on available image sources
                        const imagesToUse = product?.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0
                            ? product.processedImages
                            : product?.images && Array.isArray(product.images) && product.images.length > 0
                                ? product.images
                                : product?.mainImageUrl ? [product.mainImageUrl] : [];

                        // Log gallery images for debugging
                        console.log('[Client] Gallery images:',
                            imagesToUse ? `${imagesToUse.length} images` : 'No images available');

                        // Not rendering any additional thumbnails here as they're already in ProductGallery
                        return null;
                    })()}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    {/* Brand Name - if available */}
                    {product.brand && (
                        <p className="text-sm text-neutral-500 mb-2">
                            {getLocalizedValue(
                                { name: product.brand.name, name_ar: product.brand.name_ar || product.brand.name },
                                locale
                            )}
                        </p>
                    )}

                    {/* Product Name */}
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
                        {productName || product.name || 'Product'}
                    </h1>

                    {/* Rating section */}
                    {product.rating !== undefined && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={cn(
                                            "h-5 w-5",
                                            star <= Math.round(product.rating || 0)
                                                ? "fill-primary text-primary"
                                                : "fill-neutral-200 text-neutral-200"
                                        )}
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-neutral-600">
                                {product.rating.toFixed(1)}
                            </span>
                            {product.reviews_count !== undefined && (
                                <span className="text-sm text-neutral-500">
                                    ({product.reviews_count} {t('product.reviews')})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        {hasDiscount ? (
                            <>
                                <Price
                                    amount={product.sale_price!}
                                    locale={locale}
                                    size="2xl"
                                    weight="bold"
                                    className="text-accent"
                                />
                                <Price
                                    amount={product.price || 0}
                                    locale={locale}
                                    size="lg"
                                    strikethrough
                                    className="text-neutral-500"
                                />
                                <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded">
                                    {discountPercentage}% {t('common.off')}
                                </span>
                            </>
                        ) : (
                            <Price
                                amount={product.price || 0}
                                locale={locale}
                                size="2xl"
                                weight="bold"
                                className="text-neutral-800"
                            />
                        )}
                    </div>

                    {/* Sale price info - only shown when there's a discount */}
                    {hasDiscount && (
                        <div className="mb-4">
                            <span className="text-sm bg-blue-100 text-blue-800 p-2 rounded">
                                Old price: <Price
                                    amount={product.price || 0}
                                    locale={locale}
                                    size="sm"
                                    strikethrough
                                    className="text-blue-800 inline-block"
                                />
                            </span>
                        </div>
                    )}

                    {/* Short Description - Limited to 25 words */}
                    {(productDescription || product.description) && (
                        <div className="mb-6">
                            <p className="text-neutral-600">
                                {/* Strip HTML tags and limit to 25 words */}
                                {(productDescription || product.description || '')
                                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                                    .split(/\s+/)
                                    .slice(0, 25)
                                    .join(' ')}
                                {(productDescription || product.description || '').split(/\s+/).length > 25 && '...'}
                            </p>
                            <button
                                className="mt-2 text-primary font-medium hover:underline"
                                onClick={() => {
                                    setActiveTab('description');
                                    // Scroll to the tabs section
                                    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Read more...
                            </button>
                        </div>
                    )}

                    {/* If no description is available, show a placeholder in development */}
                    {process.env.NODE_ENV === 'development' && !productDescription && !product.description && (
                        <div className="mb-6">
                            <p className="text-neutral-400 italic">No product description available</p>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-neutral-700 font-medium">{t('product.quantity')}:</span>
                        <div className="flex items-center border border-neutral-200 rounded-md">
                            <button
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                            >
                                -
                            </button>
                            <span className="w-12 text-center text-neutral-800">{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.in_stock}
                            className={cn(
                                "flex-1 py-3 px-6 flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
                                product.in_stock
                                    ? "bg-primary text-white hover:bg-primary-600"
                                    : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                            )}
                        >
                            <ShoppingCart size={20} />
                            <span>{t('common.add_to_cart')}</span>
                        </button>

                        <button
                            className="py-3 px-6 flex items-center justify-center gap-2 border border-neutral-200 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            <Heart size={20} />
                            <span>{t('product.add_to_wishlist')}</span>
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="border-t border-neutral-200 pt-6 space-y-4">
                        {/* SKU */}
                        {product.sku && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-700">{t('product.sku')}:</span>
                                <span className="text-sm text-neutral-600">{product.sku}</span>
                            </div>
                        )}

                        {/* Categories */}
                        {product.categories && Array.isArray(product.categories) && product.categories.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-700">{t('product.categories')}:</span>
                                <div className="flex flex-wrap gap-1">
                                    {product.categories.map((category, index) => {
                                        const categoryName = getLocalizedValue(
                                            { name: category.name, name_ar: category.name_ar || category.name },
                                            locale
                                        );
                                        const categories = product.categories;
                                        const isLast = index < (categories?.length ?? 0) - 1;

                                        return (
                                            <span key={category.id || index} className="text-sm text-neutral-600">
                                                {categoryName}{isLast ? ', ' : ''}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Share */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-700">{t('product.share')}:</span>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors">
                                    <Share2 size={16} />
                                </button>
                                {/* Add more social share buttons as needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Tabs */}
            <div id="product-tabs" className="mb-12">
                {/* Tab Navigation */}
                <div className="border-b border-neutral-200 mb-6">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={cn(
                                "py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                activeTab === 'description'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                            )}
                        >
                            {t('product.description')}
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                activeTab === 'details'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                            )}
                        >
                            Additional Information
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={cn(
                                "py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                activeTab === 'reviews'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                            )}
                        >
                            {t('product.reviews')}
                            {product.reviews_count !== undefined && ` (${product.reviews_count})`}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="prose max-w-none">
                    {activeTab === 'description' && (
                        <div>
                            {productDescription ? (
                                <div dangerouslySetInnerHTML={{ __html: productDescription }} />
                            ) : (
                                <p className="text-neutral-500">{t('product.no_description')}</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div>
                            {(product.ingredients || product.how_to_use || product.how_to_use0) ? (
                                <div className="space-y-6">
                                    {product.ingredients && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{t('product.ingredients')}</h3>
                                            <div className="text-neutral-700" dangerouslySetInnerHTML={{
                                                __html: getLocalizedValue(
                                                    { name: product.ingredients, name_ar: product.ingredients_ar || product.ingredients },
                                                    locale
                                                )
                                            }} />
                                        </div>
                                    )}

                                    {(product.how_to_use || product.how_to_use0) && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{t('product.how_to_use')}</h3>
                                            <div className="text-neutral-700" dangerouslySetInnerHTML={{
                                                __html: getLocalizedValue(
                                                    {
                                                        name: product.how_to_use || product.how_to_use0 || '',
                                                        name_ar: product.how_to_use_ar || product.how_to_use || product.how_to_use0 || ''
                                                    },
                                                    locale
                                                )
                                            }} />
                                        </div>
                                    )}

                                    {product.excerpt && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{t('product.excerpt')}</h3>
                                            <div className="text-neutral-700" dangerouslySetInnerHTML={{
                                                __html: product.excerpt || ''
                                            }} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-neutral-500">{t('product.no_additional_information')}</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            {/* This would be populated with product reviews */}
                            <p className="text-neutral-500">{t('product.no_reviews')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            {/* This would be populated with related products */}
        </div>
    );
}