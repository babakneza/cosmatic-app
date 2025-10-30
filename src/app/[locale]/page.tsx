import { getFeaturedProducts, getNewArrivals, getBestSellers } from '@/lib/api/products';
import { getFeaturedCategories } from '@/lib/api/categories';
import { useTranslations } from 'next-intl';
import HomeContent from './HomeContent';

export default async function HomePage() {
    // Fetch data for homepage
    const [featuredProducts, newArrivals, bestSellers, featuredCategories] = await Promise.all([
        getFeaturedProducts(8),
        getNewArrivals(8),
        getBestSellers(8),
        getFeaturedCategories(6),
    ]);

    return (
        <HomeContent
            featuredProducts={featuredProducts}
            newArrivals={newArrivals}
            bestSellers={bestSellers}
            featuredCategories={featuredCategories}
        />
    );
}