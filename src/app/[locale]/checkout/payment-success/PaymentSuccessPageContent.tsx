'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Locale } from '@/types';
import { CheckCircle } from 'lucide-react';

interface PaymentSuccessPageContentProps {
    locale: Locale;
    orderId: string;
    orderNumber: string;
}

export default function PaymentSuccessPageContent({
    locale,
    orderId,
    orderNumber,
}: PaymentSuccessPageContentProps) {
    const router = useRouter();
    const t = useTranslations();
    const isArabic = locale === 'ar';
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleViewOrder = () => {
        if (orderId) {
            router.push(`/${locale}/account/orders/${orderId}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md">
                <div className={`flex flex-col items-center text-center gap-6 ${isArabic ? 'rtl' : 'ltr'}`}>
                    <div className="rounded-full bg-green-100 p-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('checkout.payment_successful_title') || 'Payment Successful!'}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {t('checkout.payment_successful_message') || 'Your order has been placed successfully.'}
                        </p>
                        {orderNumber && (
                            <p className="text-sm text-gray-500">
                                {t('checkout.order_number') || 'Order Number'}: <span className="font-semibold">{orderNumber}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 w-full flex-col sm:flex-row">
                        <Button
                            onClick={handleViewOrder}
                            variant="default"
                            className="flex-1"
                            disabled={!orderId}
                        >
                            {t('checkout.view_order') || 'View Order'}
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
