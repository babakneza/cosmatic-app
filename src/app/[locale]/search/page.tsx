import { Locale } from '@/types';
import { Metadata } from 'next';
import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import SearchContent from './components/SearchContent';

interface SearchPageProps {
    params: Promise<{
        locale: Locale;
    }>;
    searchParams: Promise<{
        q?: string;
    }>;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const sp = await searchParams;
    const query = sp.q || '';
    return {
        title: query ? `Search Results for "${query}" - BuyJan` : 'Search - BuyJan',
        description: `Find cosmetics and beauty products: ${query}`,
    };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
    const { locale } = await params;
    const sp = await searchParams;
    const query = sp.q || '';

    // Fetch all products and categories
    const [products, categories] = await Promise.all([
        getProducts({ search: query }, undefined, { page: 1, limit: 100, total: 0, total_pages: 0 }),
        getCategories(),
    ]);

    const categoriesData = Array.isArray(categories) ? categories : (categories?.data || []);

    return (
        <SearchContent
            query={query}
            products={products.data}
            categories={categoriesData}
            locale={locale}
            totalResults={products.meta?.filter_count || 0}
        />
    );
}