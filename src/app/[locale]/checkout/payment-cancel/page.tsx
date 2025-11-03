import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { Locale } from '@/types';
import PaymentCancelPageContent from './PaymentCancelPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: t('checkout.payment_cancelled'),
        description: 'Your payment was cancelled',
    };
}

export default async function PaymentCancelPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: localeString } = await params;
    const locale = localeString as Locale;
    const isArabic = locale === 'ar';

    return (
        <main className={isArabic ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg" padding="lg" marginTop="md" marginBottom="md">
                <PaymentCancelPageContent locale={locale} />
            </Container>
        </main>
    );
}
