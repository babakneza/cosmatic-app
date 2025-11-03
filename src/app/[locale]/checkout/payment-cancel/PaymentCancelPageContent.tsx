'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Locale } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PaymentCancelPageContentProps {
    locale: Locale;
}

export default function PaymentCancelPageContent({
    locale,
}: PaymentCancelPageContentProps) {
    const router = useRouter();
    const t = useTranslations();
    const isArabic = locale === 'ar';

    const handleRetryCheckout = () => {
        router.push(`/${locale}/checkout`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md">
                <div className={`flex flex-col items-center text-center gap-6 ${isArabic ? 'rtl' : 'ltr'}`}>
                    <div className="rounded-full bg-red-100 p-4">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('checkout.payment_cancelled_title') || 'Payment Cancelled'}
                        </h1>
                        <p className="text-gray-600">
                            {t('checkout.payment_cancelled_message') || 'Your payment has been cancelled. You can return to checkout and try again.'}
                        </p>
                    </div>

                    <div className="flex gap-4 w-full flex-col sm:flex-row">
                        <Button
                            onClick={handleRetryCheckout}
                            variant="default"
                            className="flex-1"
                        >
                            {t('checkout.try_again') || 'Try Again'}
                        </Button>
                        <Link href={`/${locale}`} className="flex-1">
                            <Button
                                variant="outline"
                                className="w-full"
                            >
                                {t('common.back_to_home') || 'Back to Home'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
