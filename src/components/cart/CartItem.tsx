'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemType, Locale } from '@/types';
import { useCartStore } from '@/store/cart';
import Price from '@/components/ui/Price';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
    locale: string;
    onRemove?: () => void;
}

export default function CartItem({ item, locale, onRemove }: CartItemProps) {
    const t = useTranslations();
    const { updateQuantity, removeItem } = useCartStore();
    const [isRemoving, setIsRemoving] = useState(false);

    const product = item.product;
    const price = product.sale_price || product.price;
    const image = product.mainImageUrl || product.image || '/images/placeholder-product.jpg';
    const isArabic = locale === 'ar';

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity <= 0) return;
        updateQuantity(product.id, newQuantity);
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        removeItem(product.id);
        onRemove?.();
    };

    const productName = isArabic && product.name_ar ? product.name_ar : product.name;

    return (
        <div
            className={`flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors ${isRemoving ? 'opacity-50' : ''
                }`}
        >
            {/* Product Image */}
            <div className="flex-shrink-0 w-full sm:w-24 h-24 sm:h-24">
                <Link href={`/${locale}/product/${product.slug}`}>
                    <div className="relative w-full sm:w-24 h-24 sm:h-24 rounded-md overflow-hidden bg-gray-100">
                        <Image
                            src={image}
                            alt={productName}
                            fill
                            className="object-cover"
                            priority={false}
                        />
                        {product.sale_price && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {t('product.sale')}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Product Details & Controls Container */}
            <div className="flex-1 flex flex-col gap-1 sm:gap-3">
                {/* Product Details */}
                <div className={`flex-1 ${isArabic ? 'text-right' : 'text-left'}`}>
                    <Link href={`/${locale}/product/${product.slug}`}>
                        <h3 className="font-semibold text-xs sm:text-base text-gray-900 hover:text-blue-600 line-clamp-2">
                            {productName}
                        </h3>
                    </Link>
                    <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">SKU: {product.sku}</p>

                    {/* Price Display */}
                    <div className="mt-1 sm:mt-2">
                        {product.sale_price ? (
                            <div className="flex gap-2 items-center">
                                <Price
                                    amount={product.sale_price}
                                    locale={locale as Locale}
                                    size="base"
                                    weight="bold"
                                    className="text-gray-900"
                                />
                                <Price
                                    amount={product.price}
                                    locale={locale as Locale}
                                    size="sm"
                                    strikethrough
                                    className="text-gray-500"
                                />
                            </div>
                        ) : (
                            <Price
                                amount={product.price}
                                locale={locale as Locale}
                                size="base"
                                weight="bold"
                                className="text-gray-900"
                            />
                        )}
                    </div>
                </div>

                {/* Quantity & Controls - Mobile: Full width, Desktop: Flex end */}
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white w-fit">
                        <button
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            className="px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label={t('cart.decrease_quantity')}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-2 sm:px-4 py-1 sm:py-2 text-center min-w-[1.5rem] font-semibold text-xs sm:text-sm">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            className="px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label={t('cart.increase_quantity')}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Line Total & Remove - Stack on mobile */}
                    <div className="flex justify-between sm:flex-col sm:items-end gap-1 sm:gap-2">
                        <div className={isArabic ? 'text-left' : 'text-right'}>
                            <p className="text-xs sm:text-sm text-gray-600">{t('cart.subtotal')}</p>
                            <Price
                                amount={price * item.quantity}
                                locale={locale as Locale}
                                size="sm"
                                weight="bold"
                                className="text-gray-900"
                            />
                        </div>
                        <button
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1 sm:p-2 hover:bg-red-50 rounded"
                            aria-label={t('cart.remove_item')}
                        >
                            <X size={16} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}