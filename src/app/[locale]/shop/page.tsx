import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { Locale, Product, SortOption } from '@/types';
import ShopContent from './components/ShopContent';

interface ShopPageProps {
    params: Promise<{
        locale: Locale;
    }>;
    searchParams: Promise<{
        category?: string | string[];
        brand?: string | string[];
        min_price?: string;
        max_price?: string;
        sort?: string;
        page?: string;
        search?: string;
    }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
    const { locale } = await params;
    const searchParamsData = await searchParams;
    const {
        category,
        brand,
        min_price,
        max_price,
        sort,
        page = '1',
        search,
    } = searchParamsData;

    // Parse pagination parameters
    const currentPage = parseInt(page, 10) || 1;
    const limit = 12; // Products per page

    // Validate sort option
    const validSortOptions: SortOption[] = ['newest', 'price_low_high', 'price_high_low', 'name_a_z', 'name_z_a', 'rating'];
    const validatedSort = (sort && validSortOptions.includes(sort as SortOption) ? sort : undefined) as SortOption | undefined;

    // Prepare filters
    const filters = {
        category,
        brand,
        min_price: min_price ? parseFloat(min_price) : undefined,
        max_price: max_price ? parseFloat(max_price) : undefined,
        search,
        in_stock: true, // Show products that are in stock (works with both boolean and integer values)
    };

    // Fetch data in parallel - get all products (not just featured) for the shop page
    // Only filter by in_stock on server, let client handle category/brand/price/search filtering
    const [productsResponse, categories, brands] = await Promise.all([
        getProducts({ in_stock: true }, validatedSort, { limit: 1000, page: 1, total: 0, total_pages: 0 }),
        getCategories(),
        getBrands(),
    ]);

    const products = productsResponse.data;

    // Ensure we have proper data structures for categories and brands
    const categoriesData = Array.isArray(categories) ? categories : (categories?.data || []);
    const brandsData = Array.isArray(brands.data) ? brands.data : (brands?.data || []);

    // Helper function to convert string or array to array
    const toArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : value.split(',');
    };

    // Filter products based on selected categories and brands with improved performance
    const filteredProducts = products.filter((product: Product) => {
        // Filter by category - handle both string and array of strings
        const selectedCategories = toArray(filters.category);
        if (selectedCategories.length > 0) {
            // Check if product has any of the selected categories
            // Handle both single category and categories array
            const productCategories = product.categories || (product.category ? [product.category] : []);

            // Ensure we're working with an array of category objects
            const categoryObjects = Array.isArray(productCategories) ? productCategories : [productCategories];

            // Check if any of the product's categories match the selected categories
            const hasCategory = categoryObjects.some(cat => {
                // Handle both category objects and string slugs
                const catSlug = typeof cat === 'string' ? cat : cat?.slug;
                return catSlug && selectedCategories.includes(catSlug);
            });

            if (!hasCategory) return false;
        }

        // Filter by brand - handle both string and array of strings
        const selectedBrands = toArray(filters.brand);
        if (selectedBrands.length > 0 && product.brand) {
            // Handle both brand object and string slug
            const brandSlug = typeof product.brand === 'string' ? product.brand : product.brand?.slug;
            if (!brandSlug || !selectedBrands.includes(brandSlug)) {
                return false;
            }
        }

        // Filter by price range
        if (filters.min_price !== undefined && product.price < filters.min_price) {
            return false;
        }
        if (filters.max_price !== undefined && product.price > filters.max_price) {
            return false;
        }

        // Filter by search term
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const productName = (product.name || '').toLowerCase();
            const productNameAr = (product.name_ar || '').toLowerCase();
            const productDescription = (product.description || '').toLowerCase();

            if (!productName.includes(searchTerm) &&
                !productNameAr.includes(searchTerm) &&
                !productDescription.includes(searchTerm)) {
                return false;
            }
        }

        // All other filters already applied by server (in_stock)
        return true;
    });

    // Apply pagination manually since we're getting all products at once
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <ShopContent
            products={paginatedProducts}
            categories={categoriesData}
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