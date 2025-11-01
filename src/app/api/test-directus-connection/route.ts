import { NextResponse } from 'next/server';

export async function GET() {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
    const token = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

    console.log('[Test] Directus URL:', directusUrl);
    console.log('[Test] Token available:', Boolean(token));

    const results = {
        directusUrl,
        tokenAvailable: Boolean(token),
        tests: {} as Record<string, any>
    };

    try {
        console.log('[Test] Testing basic connectivity...');
        const response = await fetch(`${directusUrl}/server/info`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : ''
            }
        });

        results.tests['info_endpoint'] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        };

        const data = await response.json();
        results.tests['info_data'] = data;
    } catch (error: any) {
        results.tests['info_endpoint'] = {
            error: error.message
        };
    }

    try {
        console.log('[Test] Testing products endpoint...');
        const response = await fetch(
            `${directusUrl}/items/products?limit=1&fields=id`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : ''
                }
            }
        );

        results.tests['products_endpoint'] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        };

        if (response.ok) {
            const data = await response.json();
            results.tests['products_data'] = {
                hasData: Boolean(data.data),
                count: data.data?.length || 0
            };
        } else {
            const errorData = await response.text();
            results.tests['products_error'] = errorData.substring(0, 200);
        }
    } catch (error: any) {
        results.tests['products_endpoint'] = {
            error: error.message
        };
    }

    return NextResponse.json(results);
}
