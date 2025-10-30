import { NextResponse } from 'next/server';
import { getFeaturedCategories } from '@/lib/api/categories';

export async function GET() {
    try {
        const categories = await getFeaturedCategories(6);
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}