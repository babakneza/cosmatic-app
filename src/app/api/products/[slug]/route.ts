import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/api/directus';
import { Locale } from '@/types';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        // In Next.js 15, params is a Promise that needs to be awaited before destructuring
        let slug: string;
        try {
            const params = await context.params;
            slug = params?.slug;
        } catch (e) {
            console.error('[API] Error extracting params:', e);
            return NextResponse.json(
                { error: 'Failed to extract product ID from URL' },
                { status: 400 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const locale = (searchParams.get('locale') || 'en') as Locale;

        console.log(`[API] Fetching product with slug: ${slug}, locale: ${locale}`);
        console.log(`[API] Environment variables:`, {
            NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL ? 'Set' : 'Not set',
            DIRECTUS_API_TOKEN: process.env.DIRECTUS_API_TOKEN ? 'Set' : 'Not set',
            NEXT_PUBLIC_DIRECTUS_API_TOKEN: process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN ? 'Set' : 'Not set'
        });

        // Validate slug
        if (!slug || slug === 'undefined') {
            console.error('[API] No slug provided');
            return NextResponse.json(
                { error: 'No product ID provided' },
                { status: 400 }
            );
        }

        // Use the getProduct function which handles both IDs and slugs
        const result = await getProduct(slug);
        const product = result?.data || result;

        // If product not found
        if (!product) {
            console.log(`[API] No product found with slug: ${slug}`);

            // Return a 404 response
            return NextResponse.json(
                {
                    error: 'Product not found',
                    slug,
                    message: `No product found with slug: ${slug}`
                },
                { status: 404 }
            );
        }

        // Ensure all required fields are present and properly formatted
        const finalProduct = {
            id: product.id || '',
            name: product.name || '',
            name_ar: product.name_ar || product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            description_ar: product.description_ar || product.description || '',
            price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
            sale_price: product.sale_price ? (typeof product.sale_price === 'number' ? product.sale_price : parseFloat(product.sale_price)) : undefined,
            sku: product.sku || '',
            in_stock: product.in_stock !== undefined ? product.in_stock : true, // Use the correct in_stock field
            status: product.status || 'published',
            rating: product.rating || 0,
            reviews_count: product.reviews_count || 0,
            is_new_arrival: product.is_new_arrival || false,
            new_until: product.new_until || null,

            // Brand and category
            brand: product.brand || null,
            category: product.category || null,

            // Images
            main_image: product.main_image || null,
            image_gallery: product.image_gallery || [],
            mainImageUrl: product.mainImageUrl || '/images/placeholder-product.jpg',
            images: product.images || [],
            processedImages: product.processedImages || [],

            // Additional fields required by the Product type
            stock: product.stock || 0,
            currency: 'OMR',

            // Additional product fields
            ingredients: product.ingredients || '',
            ingredients_ar: product.ingredients_ar || product.ingredients || '',
            how_to_use: product.how_to_use0 || product.how_to_use || '',
            how_to_use0: product.how_to_use0 || '',
            how_to_use_ar: product.how_to_use_ar || product.how_to_use0 || product.how_to_use || '',
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString(),

            // Cost price if available
            cost_price: product.cost_price || null,

            // Excerpt for short description
            excerpt: product.excerpt || null
        };

        // Log the image data for debugging
        console.log(`[API] Product images:`, {
            mainImageUrl: finalProduct.mainImageUrl,
            processedImagesCount: finalProduct.processedImages.length,
            firstProcessedImage: finalProduct.processedImages[0] ?
                `${finalProduct.processedImages[0].id.substring(0, 8)}... (${finalProduct.processedImages[0].url.substring(0, 30)}...)` :
                'None'
        });

        // Log complete product structure for debugging
        console.log('[API] Final product structure:', {
            id: finalProduct.id ? 'Present' : 'Missing',
            name: finalProduct.name ? 'Present' : 'Missing',
            price: finalProduct.price ? 'Present' : 'Missing',
            mainImageUrl: finalProduct.mainImageUrl ? 'Present' : 'Missing',
            processedImages: finalProduct.processedImages.length > 0 ? 'Present' : 'Empty array',
            images: finalProduct.images.length > 0 ? 'Present' : 'Empty array',
            category: finalProduct.category ? 'Present' : 'Missing',
            brand: finalProduct.brand ? 'Present' : 'Missing',
            required_fields: {
                sku: finalProduct.sku ? 'Present' : 'Missing',
                stock: finalProduct.stock !== undefined ? 'Present' : 'Missing',
                currency: finalProduct.currency ? 'Present' : 'Missing',
                in_stock: finalProduct.in_stock !== undefined ? 'Present' : 'Missing'
            }
        });

        // Return the product data
        console.log(`[API] Successfully processed product: ${finalProduct.name}`);
        return NextResponse.json(finalProduct);
    } catch (error) {
        console.error('[API] Error fetching product:', error);

        // More detailed error response
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';

        // Get the slug from params (must be awaited and destructured in Next.js 15)
        const { slug } = await context.params;

        // Create a structured error response
        const errorResponse = {
            error: 'Failed to fetch product',
            message: errorMessage,
            slug: slug,
            timestamp: new Date().toISOString(),
            // Only include stack trace in development
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            environment: {
                NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL ? 'Set' : 'Not set',
                DIRECTUS_API_TOKEN: process.env.DIRECTUS_API_TOKEN ? 'Set' : 'Not set',
                NEXT_PUBLIC_DIRECTUS_API_TOKEN: process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN ? 'Set' : 'Not set'
            }
        };

        // Log the full error response for debugging
        console.error('[API] Error response:', JSON.stringify(errorResponse, null, 2));

        return NextResponse.json(errorResponse, { status: 500 });
    }
}