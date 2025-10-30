'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface EmptyCartProps {
    locale: string;
}

export default function EmptyCart({ locale }: EmptyCartProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${isArabic ? 'text-right' : 'text-left'}`}>
            {/* Empty Cart Icon */}
            <div className="mb-6 p-6 bg-gray-100 rounded-full">
                <ShoppingCart size={48} className="text-gray-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty_title')}</h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 max-w-md">
                {t('cart.empty_description')}
            </p>

            {/* Continue Shopping Button */}
            <Link href={`/${locale}/shop`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 font-semibold">
                    {t('cart.start_shopping')}
                </Button>
            </Link>
        </div>
    );
}