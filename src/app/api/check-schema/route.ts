import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const token = process.env.DIRECTUS_API_TOKEN;

        // Create a client to fetch the schema
        const client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Get the fields for the categories collection
        const response = await client.get('/items/directus_fields?filter[collection][_eq]=categiries');

        return NextResponse.json({
            success: true,
            schema: response.data.data
        });
    } catch (error) {
        console.error('Error fetching schema:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch schema',
            errorDetails: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}