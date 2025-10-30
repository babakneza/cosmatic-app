import { NextRequest, NextResponse } from 'next/server';

// Mock product data from the provided JSON
const mockProductData = {
    "data": [
        {
            "id": 1,
            "name": "Hair Serum",
            "slug": "hair_serum",
            "description": "<ul>\n<li>HAIR GROWTH SUPPLEMENT: This Hair Serum supports the strengthening of the hair root and can make the blood flow of the scalp. Make perfectly smooth hair. And easy to manage and healthy-looking.</li>\n<li>HAIR GROWTH TREATMENT: Encourages healthier hair growth, good for stopping thinning hair and treating alopecia, make it grow faster and thicker.</li>\n<li>HAIR REPAIR: Hair Serum helps repair damaged hair's surface, lock in moisture &amp; shine and control frizz. Repairs, softens and strengthens dry, brittle, frizzy, overworked and damaged hair.</li>\n<li>PERFECT FOR ALL HAIR TYPES: Dry and frizzy hair, medium to coarse hair, both men and women.</li>\n<li>TIP: If it is in use, if it accidentally flows into the eyes, it should be washed immediately with cold water.</li>\n</ul>\n<p>&nbsp;</p>\n<p>Original Product Guaranteed - Imported from USA/Europe - the price displayed on the product page is inclusive of logistical expenses, transaction fees, packaging, shipping, and handling charges necessary for shipping to your destination country.</p>\n<p><br><strong>Special Care For Your Hair:</strong><br>Sustain natural hair growth, remove frizz and add shine while keeping hair healthy and beautiful. Feel the smooth soft results, easy to comb and confident.<br><br><strong>Product Efficacy:</strong><br>Repair And Revitalizes Hair Follicles<br>Stable Hair Roots<br>Reduce And Prevent Hair Loss<br>Eliminates Frizz And Improve Dry Joke<br>Add Softness &amp; Shine<br><br><strong>Instructions of Use:</strong><br>Each time before washing your hair, add 3 ml hair growth serum to 100 ml shampoo, then Stir well. Put this mixture on your hair and massage your scalp. Regular usage 2-3 per week.<br><br><strong>Attention:</strong><br>1 Keep away from the children. Pregnant or breastfeeding women should avoid using.<br>2 Keep away from the light.<br>3 For external use only.<br><br>Package:1 x bottle of Hair Serum</p>",
            "excerpt": null,
            "sku": "1",
            "price": "5.00000",
            "cost_price": null,
            "is_featured": false,
            "ingredients": "test",
            "how_to_use0": "Each time before washing your hair, add 3 ml hair growth serum to 100 ml shampoo, then Stir well. Put this mixture on your hair and massage your scalp. Regular usage 2-3 per week.",
            "main_image": "6cf62674-2241-411a-ae72-66d28a17e4ea",
            "category": 4,
            "brand": null,
            "is_new_arrival": true,
            "new_until": "2025-10-31T12:00:00",
            "sale_price": null,
            "image_gallery": [1, 2, 3, 4]
        }
    ]
};

// Process the mock data to match our expected format
const processedProduct = {
    id: mockProductData.data[0].id.toString(),
    name: mockProductData.data[0].name,
    name_ar: mockProductData.data[0].name, // Using English name as fallback
    slug: mockProductData.data[0].slug,
    description: mockProductData.data[0].description,
    description_ar: mockProductData.data[0].description, // Using English description as fallback
    price: parseFloat(mockProductData.data[0].price),
    sale_price: mockProductData.data[0].sale_price ? parseFloat(mockProductData.data[0].sale_price) : undefined,
    sku: mockProductData.data[0].sku,
    in_stock: true,
    status: 'published',
    rating: 4.5, // Mock rating
    reviews_count: 12, // Mock review count
    is_new_arrival: mockProductData.data[0].is_new_arrival,
    new_until: mockProductData.data[0].new_until,

    // Brand and category
    brand: null,
    categories: [],
    category: {
        id: '4',
        name: 'Hair Care',
        slug: 'hair-care'
    },

    // Images
    main_image: mockProductData.data[0].main_image,
    image_gallery: mockProductData.data[0].image_gallery,
    mainImageUrl: '/images/placeholder-product.jpg', // Using placeholder as we don't have real URLs
    images: ['/images/placeholder-product.jpg'],
    processedImages: [
        { id: '1', url: '/images/placeholder-product.jpg', alt: 'Hair Serum' },
        { id: '2', url: '/images/placeholder-product.jpg', alt: 'Hair Serum' },
        { id: '3', url: '/images/placeholder-product.jpg', alt: 'Hair Serum' },
        { id: '4', url: '/images/placeholder-product.jpg', alt: 'Hair Serum' }
    ],

    // Additional fields required by the Product type
    stock: 100,
    currency: 'OMR',

    // Additional product fields
    ingredients: mockProductData.data[0].ingredients,
    ingredients_ar: mockProductData.data[0].ingredients,
    how_to_use: mockProductData.data[0].how_to_use0,
    how_to_use_ar: mockProductData.data[0].how_to_use0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),

    // Cost price if available
    cost_price: mockProductData.data[0].cost_price,

    // Excerpt for short description
    excerpt: mockProductData.data[0].excerpt
};

export async function GET() {
    try {
        // Return the processed mock product
        return NextResponse.json(processedProduct);
    } catch (error) {
        console.error('[API] Error in mock product API:', error);
        return NextResponse.json(
            { error: 'Failed to get mock product data' },
            { status: 500 }
        );
    }
}