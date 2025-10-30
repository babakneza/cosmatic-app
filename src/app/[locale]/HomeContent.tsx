'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { ProductSection } from '@/components/product/ProductSection';
import CategorySection from '@/components/category/CategorySection';
import { Product, Locale, ProductImage } from '@/types';

interface HomeContentProps {
    featuredProducts: any[];
    newArrivals: any[];
    bestSellers: any[];
    featuredCategories: any[];
}

export default function HomeContent({
    featuredProducts,
    newArrivals,
    bestSellers,
    featuredCategories
}: HomeContentProps) {
    const t = useTranslations('common');
    const params = useParams();
    const locale = params.locale as Locale;

    // Convert API products to our Product type
    const mapApiProductToProduct = (apiProduct: any): Product => {
        // Handle images properly
        let productImages: ProductImage[] = [];

        // Add main image if it exists
        if (apiProduct.main_image) {
            try {
                // Use mainImageUrl if it was already processed by the API
                if (apiProduct.mainImageUrl) {
                    productImages.push({
                        id: 'main',
                        url: apiProduct.mainImageUrl,
                        is_primary: true
                    });
                } else {
                    // Handle both string ID and object with ID property
                    let mainImageId;

                    if (typeof apiProduct.main_image === 'string') {
                        mainImageId = apiProduct.main_image;
                    } else if (typeof apiProduct.main_image === 'object' && apiProduct.main_image !== null) {
                        // Try to extract ID from object
                        const imgObj = apiProduct.main_image as any;
                        mainImageId = imgObj.id || imgObj.directus_files_id || imgObj.file_id || JSON.stringify(imgObj);
                    } else {
                        // Convert to string if it's a number or other type
                        mainImageId = String(apiProduct.main_image);
                    }

                    productImages.push({
                        id: mainImageId,
                        url: mainImageId, // The URL will be processed by getDirectusAssetUrl in the component
                        is_primary: true
                    });
                }
            } catch (error) {
                productImages.push({
                    id: 'default',
                    url: '/images/placeholder-product.jpg',
                    is_primary: true
                });
            }
        }

        // Add processed images if they exist (from API processing)
        if (apiProduct.processedImages && Array.isArray(apiProduct.processedImages)) {
            // If we already have processed images from the API, use those
            productImages = apiProduct.processedImages.map((img: any) => ({
                id: img.id || 'processed',
                url: img.url,
                is_primary: img.is_primary || false
            }));
        }
        // Add gallery images if they exist
        else if (apiProduct.images && Array.isArray(apiProduct.images)) {
            try {
                const galleryImages = apiProduct.images.map((img: any) => {
                    try {
                        // Handle both ID and object formats
                        let imgId;

                        if (typeof img === 'string') {
                            imgId = img;
                        } else if (typeof img === 'number') {
                            imgId = img.toString();
                        } else if (typeof img === 'object' && img !== null) {
                            // Try to extract ID from object
                            imgId = img.id || img.directus_files_id || img.file_id || JSON.stringify(img);
                        } else {
                            imgId = String(img);
                        }

                        return {
                            id: imgId,
                            url: imgId, // The URL will be processed by getDirectusAssetUrl in the component
                            is_primary: false
                        };
                    } catch (error) {
                        return null;
                    }
                }).filter(Boolean); // Remove any null entries

                productImages = [...productImages, ...galleryImages];
            } catch (error) {
                // Silent catch
            }
        }

        // If no images were found, add a default placeholder
        if (productImages.length === 0) {
            productImages = [{
                id: 'default',
                url: '/images/placeholder-product.jpg',
                is_primary: true
            }];
        }

        // Get the primary image URL for the 'image' field
        const primaryImage = productImages.find(img => img.is_primary)?.url || productImages[0]?.url || '/images/placeholder-product.jpg';

        return {
            id: apiProduct.id,
            name: apiProduct.name,
            name_ar: apiProduct.name_ar,
            slug: apiProduct.slug,
            description: apiProduct.description || '',
            description_ar: apiProduct.description_ar,
            price: apiProduct.price,
            sale_price: apiProduct.sale_price,
            currency: 'OMR',
            // Set the image field for components that use it
            image: apiProduct.image || apiProduct.mainImageUrl || primaryImage,
            images: productImages,
            category: apiProduct.category || { id: '', name: '', slug: '' },
            brand: apiProduct.brand,
            sku: apiProduct.sku || '',
            stock: apiProduct.stock || 10,
            in_stock: apiProduct.in_stock !== false,
            created_at: apiProduct.date_created || new Date().toISOString(),
            updated_at: apiProduct.date_updated || new Date().toISOString(),
        };
    };

    const mappedFeatured = featuredProducts.map(mapApiProductToProduct);
    const mappedNewArrivals = newArrivals.map(mapApiProductToProduct);
    const mappedBestSellers = bestSellers.map(mapApiProductToProduct);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-background-gold py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-4 tracking-tight">
                        {t('welcome')}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
                        Premium Beauty Products in Oman
                    </p>
                    <Link
                        href={`/${locale}/products`}
                        className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        {t('shop')}
                    </Link>
                </div>
            </section>

            {/* Featured Categories */}
            <CategorySection
                title={t('categories')}
                categories={featuredCategories}
                locale={locale}
                viewAllLink={`/${locale}/categories`}
                className="bg-neutral-50"
            />

            {/* Featured Products */}
            <ProductSection
                title={t('featured')}
                products={mappedFeatured}
                locale={locale}
                viewAllLink={`/${locale}/products?featured=true`}
            />

            {/* New Arrivals */}
            <ProductSection
                title={t('new_arrivals')}
                products={mappedNewArrivals}
                locale={locale}
                viewAllLink={`/${locale}/products?sort=newest`}
                className="bg-background-secondary"
            />

            {/* Best Sellers */}
            <ProductSection
                title={t('best_sellers')}
                products={mappedBestSellers}
                locale={locale}
                viewAllLink={`/${locale}/products?sort=rating`}
            />
        </div>
    );
}