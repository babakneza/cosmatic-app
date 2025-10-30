'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import { formatOMR } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import { X, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}

export default function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
    const t = useTranslations();
    const items = useCartStore((state) => state.items);
    const getTotal = useCartStore((state) => state.getTotal);
    const getItemCount = useCartStore((state) => state.getItemCount);
    const isArabic = locale === 'ar';

    const totals = getTotal();
    const itemCount = getItemCount();

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 overflow-y-auto flex flex-col ${isOpen ? (isArabic ? 'translate-x-0' : 'translate-x-0') : (isArabic ? 'translate-x-full' : '-translate-x-full')
                    } ${isArabic ? 'right-0' : 'left-0'}`}
            >
                {/* Header */}
                <div className={`sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingCart size={24} />
                        {t('cart.shopping_cart')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <EmptyCart locale={locale} />
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} locale={locale} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className={`sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                        {/* Summary */}
                        <div className="space-y-2 pb-4 border-b border-gray-200">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>{t('cart.subtotal')}</span>
                                <span>{formatOMR(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>{totals.shipping === 0 ? t('cart.free_shipping') : t('cart.shipping')}</span>
                                <span className={totals.shipping === 0 ? 'text-green-600' : ''}>
                                    {totals.shipping === 0 ? t('cart.free') : formatOMR(totals.shipping)}
                                </span>
                            </div>
                            {totals.tax > 0 && (
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>{t('cart.tax')}</span>
                                    <span>{formatOMR(totals.tax)}</span>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center bg-white rounded-lg p-3 border-2 border-blue-500">
                            <span className="font-bold text-gray-900">{t('cart.total')}</span>
                            <span className="font-bold text-xl text-blue-600">{formatOMR(totals.total)}</span>
                        </div>

                        {/* Items Info */}
                        <p className="text-sm text-gray-600 text-center">
                            {t('cart.items_in_cart', { count: itemCount })}
                        </p>

                        {/* Buttons */}
                        <div className="space-y-2">
                            <Link href={`/${locale}/cart`} onClick={onClose} className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 font-semibold">
                                    {t('cart.view_cart')}
                                </Button>
                            </Link>
                            <Link href={`/${locale}/checkout`} onClick={onClose} className="block">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 font-semibold">
                                    {t('cart.checkout')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}