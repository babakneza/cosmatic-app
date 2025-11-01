'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import { useCheckoutStore } from '@/store/checkout';
import { CartItem, CartSummary, EmptyCart } from '@/components/cart';

interface CartPageContentProps {
    locale: string;
}

export default function CartPageContent({ locale }: CartPageContentProps) {
    const router = useRouter();
    const t = useTranslations();
    const items = useCartStore((state) => state.items);
    const getTotal = useCartStore((state) => state.getTotal);
    const getItemCount = useCartStore((state) => state.getItemCount);
    const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
    const isArabic = locale === 'ar';

    const totals = getTotal();
    const itemCount = getItemCount();

    if (items.length === 0) {
        return <EmptyCart locale={locale} />;
    }

    const handleContinueShopping = () => {
        router.push(`/${locale}/products`);
    };

    const handleCheckout = () => {
        // Reset checkout store to start from step 1
        resetCheckout();
        router.push(`/${locale}/checkout`);
    };

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 ${isArabic ? 'lg:flex-row-reverse' : ''}`}>
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-2 sm:space-y-3 lg:space-y-4">
                {items.map((item) => (
                    <CartItem key={item.id} item={item} locale={locale} />
                ))}
            </div>

            {/* Cart Summary - Sticky on desktop */}
            <div className="lg:col-span-1 lg:sticky lg:top-20">
                <CartSummary
                    subtotal={totals.subtotal}
                    shipping={totals.shipping}
                    tax={totals.tax}
                    total={totals.total}
                    itemCount={itemCount}
                    locale={locale}
                    onContinueShopping={handleContinueShopping}
                    onCheckout={handleCheckout}
                />
            </div>
        </div>
    );
}