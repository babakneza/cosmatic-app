import { NextResponse } from 'next/server';
import { directusClient } from '@/lib/api/directus';

export async function GET() {
    try {
        // Get environment variables
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const apiToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || '';

        // Get a sample category with an image
        const response = await directusClient.get('categiries', {
            fields: ['id', 'name', 'slug', 'image'],
            limit: 1
        });

        const category = response.data?.[0] || null;

        // Generate image URL
        let imageUrl = '';
        let imageId = '';

        if (category?.image) {
            if (typeof category.image === 'string') {
                imageId = category.image;
            } else if (typeof category.image === 'object' && category.image.id) {
                imageId = category.image.id;
            }

            imageUrl = `${directusUrl}/assets/${imageId}?access_token=${apiToken}`;
        }

        return NextResponse.json({
            success: true,
            directusUrl,
            hasToken: !!apiToken,
            tokenLength: apiToken ? apiToken.length : 0,
            category,
            imageId,
            imageUrl,
            // Don't include the full token for security reasons
            tokenFirstChars: apiToken ? `${apiToken.substring(0, 3)}...` : '',
        });
    } catch (error: any) {
        console.error('Debug images error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }, { status: 500 });
    }
}