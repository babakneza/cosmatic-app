import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { Locale } from '@/types';
import ConfirmationPageContent from './ConfirmationPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: t('checkout.confirmation_title'),
        description: 'Your order has been successfully confirmed',
    };
}

export default async function ConfirmationPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}) {
    const { locale: localeString } = await params;
    const { orderId, orderNumber } = await searchParams;
    const locale = localeString as Locale;
    const isArabic = locale === 'ar';

    return (
        <main className={isArabic ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg" padding="lg" marginTop="md" marginBottom="md">
                <ConfirmationPageContent
                    locale={locale}
                    orderId={orderId || ''}
                    orderNumber={orderNumber || ''}
                />
            </Container>
        </main>
    );
}