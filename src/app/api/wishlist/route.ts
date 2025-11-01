import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { processDirectusImage } from '@/lib/api/directus-config';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const API_TOKEN = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

interface AddToWishlistRequest {
    customer: string;
    product: string;
}

interface WishlistQueryParams {
    customer?: string;
    product?: string;
    limit?: string;
    offset?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as AddToWishlistRequest;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader && !API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token provided' },
                { status: 401 }
            );
        }

        const token = authHeader ? authHeader.replace('Bearer ', '') : API_TOKEN;

        if (!body.customer || !body.product) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'customer and product are required' },
                { status: 400 }
            );
        }

        console.log('[Wishlist API] Adding to wishlist:', {
            customer: body.customer,
            product: body.product,
        });

        const payload = {
            customer: body.customer,
            product: body.product,
        };

        const response = await axios.post(
            `${DIRECTUS_URL}/items/wishlist`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const wishlistItem = response.data.data;
        if (!wishlistItem) {
            throw new Error('No wishlist item returned from API');
        }

        console.log('[Wishlist API] Successfully added to wishlist:', wishlistItem.id);

        return NextResponse.json(
            { data: wishlistItem },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('[Wishlist API] Error adding to wishlist:', error.message);
        if (error.response?.data) {
            console.error('[Wishlist API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to add to wishlist',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customer');
        const productId = searchParams.get('product');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!customerId) {
            return NextResponse.json(
                { error: 'Missing customer ID' },
                { status: 400 }
            );
        }

        console.log('[Wishlist API] Fetching wishlist:', {
            customer: customerId,
            product: productId,
            limit,
            offset,
        });

        let filter: any = {
            customer: { id: { _eq: customerId } },
        };

        if (productId) {
            filter.product = { id: { _eq: productId } };
        }

        const filterParams = {
            filter: JSON.stringify(filter),
            limit,
            offset,
            fields: [
                'id',
                'customer',
                'product.id',
                'product.name',
                'product.name_ar',
                'product.slug',
                'product.price',
                'product.sale_price',
                'product.main_image',
                'product.images.*',
                'product.description',
                'product.description_ar',
                'product.in_stock',
                'product.sku',
                'product.brand.id',
                'product.brand.name',
                'product.category.id',
                'product.category.name',
                'created_at'
            ],
        };

        const response = await axios.get(
            `${DIRECTUS_URL}/items/wishlist`,
            {
                params: filterParams,
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                },
            }
        );

        const items = response.data.data || [];
        const total = response.data.meta?.total_count ?? items.length;

        // Process images for all items
        const processedItems = items.map((item: any) => {
            if (item.product && typeof item.product === 'object') {
                let processedImages: any[] = [];
                
                // Start with main_image if it exists
                if (item.product.main_image) {
                    const processedImage = processDirectusImage(DIRECTUS_URL, item.product.main_image);
                    if (processedImage) {
                        processedImages.push(processedImage);
                    }
                }
                
                // Add images array if it exists
                if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const galleryImages = item.product.images
                        .map((img: any) => {
                            const processed = processDirectusImage(DIRECTUS_URL, img);
                            return processed ? { id: processed.id, url: processed.url } : null;
                        })
                        .filter((img: any) => img !== null);
                    processedImages.push(...galleryImages);
                }
                
                return {
                    ...item,
                    product: {
                        ...item.product,
                        images: processedImages.length > 0 ? processedImages : []
                    }
                };
            }
            return item;
        });

        console.log('[Wishlist API] Successfully fetched wishlist:', {
            count: items.length,
            total,
            responseMeta: response.data.meta,
        });

        return NextResponse.json({ data: processedItems, meta: { total_count: total } });
    } catch (error: any) {
        console.error('[Wishlist API] Error fetching wishlist:', error.message);
        if (error.response?.data) {
            console.error('[Wishlist API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to fetch wishlist',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}
