import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import CartPageContent from './CartPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: t('cart.shopping_cart'),
        description: t('cart.your_cart'),
    };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const isArabic = locale === 'ar';

    return (
        <main className={isArabic ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg" padding="lg" marginTop="sm" marginBottom="sm">
                <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t('cart.shopping_cart')}
                </h1>

                <CartPageContent locale={locale} />
            </Container>
        </main>
    );
}