import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';
import { getBrands } from '@/lib/api/brands';
import { Locale, Category, Product, SortOption } from '@/types';
import CategoryContent from './components/CategoryContent';

interface CategoryPageProps {
    params: Promise<{
        locale: Locale;
        slug: string;
    }>;
    searchParams: Promise<{
        brand?: string | string[];
        min_price?: string;
        max_price?: string;
        sort?: string;
        page?: string;
        search?: string;
    }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { locale, slug } = await params;
    const sp = await searchParams;
    const {
        brand,
        min_price,
        max_price,
        sort,
        page = '1',
        search,
    } = sp;

    // Parse pagination parameters
    const currentPage = parseInt(page, 10) || 1;
    const limit = 12; // Products per page

    // Fetch categories, products, and brands in parallel
    const [allCategories, allProducts, brands] = await Promise.all([
        getCategories(),
        getProducts(undefined, undefined, { page: 1, limit: 100, total: 0, total_pages: 0 }), // Get more products to filter
        getBrands(),
    ]);

    // Find the current category
    const category = allCategories.find((c: Category) => c.slug === slug);

    if (!category) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Category Not Found</h1>
                    <p className="text-neutral-600">The category you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Helper function to convert string or array to array
    const toArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : value.split(',');
    };

    // Filter products for this category
    const categoryProducts = (allProducts?.data || []).filter((product: Product) => {
        // Check if product belongs to this category
        const productCategories = product.categories || (product.category ? [product.category] : []);
        const categoryObjects = Array.isArray(productCategories) ? productCategories : [productCategories];

        const hasCategory = categoryObjects.some(cat => {
            const catSlug = typeof cat === 'string' ? cat : cat?.slug;
            return catSlug && catSlug === slug;
        });

        if (!hasCategory) return false;

        // Filter by brand if specified
        const selectedBrands = toArray(brand);
        if (selectedBrands.length > 0 && product.brand) {
            const brandSlug = typeof product.brand === 'string' ? product.brand : product.brand?.slug;
            if (!brandSlug || !selectedBrands.includes(brandSlug)) {
                return false;
            }
        }

        // Filter by price range
        if (min_price !== undefined && product.price < parseFloat(min_price)) {
            return false;
        }
        if (max_price !== undefined && product.price > parseFloat(max_price)) {
            return false;
        }

        // Filter by search term
        if (search) {
            const searchTerm = search.toLowerCase();
            const productName = (product.name || '').toLowerCase();
            const productNameAr = (product.name_ar || '').toLowerCase();
            const productDescription = (product.description || '').toLowerCase();

            if (!productName.includes(searchTerm) &&
                !productNameAr.includes(searchTerm) &&
                !productDescription.includes(searchTerm)) {
                return false;
            }
        }

        // Filter by stock status
        const inStock = typeof product.in_stock === 'boolean'
            ? product.in_stock
            : (typeof product.in_stock === 'number' ? product.in_stock > 0 : false);

        if (!inStock) return false;

        return true;
    });

    // Apply pagination
    const totalProducts = categoryProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = categoryProducts.slice(startIndex, endIndex);

    // Ensure we have proper data structures
    const brandsData = Array.isArray(brands.data) ? brands.data : (brands?.data || []);

    const filters = {
        brand,
        min_price: min_price ? parseFloat(min_price) : undefined,
        max_price: max_price ? parseFloat(max_price) : undefined,
        search,
    };

    // Validate sort option
    const validSortOptions: SortOption[] = ['newest', 'price_low_high', 'price_high_low', 'name_a_z', 'name_z_a', 'rating'];
    const validatedSort = (sort && validSortOptions.includes(sort as SortOption) ? sort : undefined) as SortOption | undefined;

    return (
        <CategoryContent
            category={category}
            products={paginatedProducts}
            brands={brandsData}
            filters={filters}
            sort={validatedSort}
            pagination={{
                currentPage,
                totalPages,
                totalProducts,
            }}
            locale={locale}
        />
    );
}

// Generate static paths for popular categories
// DIAGNOSTIC: Temporarily disabled to isolate build error
// export async function generateStaticParams() {
//     try {
//         const categories = await getCategories();
//         return categories.map((category: Category) => ({
//             slug: category.slug,
//             locale: 'en',
//         }));
//     } catch (error) {
//         console.error('Error generating static params for categories:', error);
//         return [];
//     }
// }