import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/types';
import { Container } from '@/components/layout';
import CheckoutPageContent from './CheckoutPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: t('checkout.checkout'),
        description: 'Complete your purchase securely',
    };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const isArabic = locale === 'ar';

    return (
        <main className={isArabic ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg" padding="lg" marginTop="md" marginBottom="md">
                <CheckoutPageContent locale={locale} />
            </Container>
        </main>
    );
}