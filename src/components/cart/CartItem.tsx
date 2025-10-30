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
            className={`flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors ${isRemoving ? 'opacity-50' : ''
                }`}
        >
            {/* Product Image */}
            <div className="flex-shrink-0 w-24 h-24">
                <Link href={`/${locale}/product/${product.slug}`}>
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100">
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

            {/* Product Details */}
            <div className={`flex-1 flex flex-col justify-between ${isArabic ? 'text-right' : 'text-left'}`}>
                <div>
                    <Link href={`/${locale}/product/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                            {productName}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                </div>

                {/* Price Display */}
                <div className="mt-2">
                    {product.sale_price ? (
                        <div className="flex gap-2 items-center">
                            <Price
                                amount={product.sale_price}
                                locale={locale as Locale}
                                size="lg"
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
                            size="lg"
                            weight="bold"
                            className="text-gray-900"
                        />
                    )}
                </div>
            </div>

            {/* Quantity & Remove */}
            <div className={`flex flex-col justify-between items-end ${isArabic ? 'items-start' : 'items-end'}`}>
                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    aria-label={t('cart.remove_item')}
                >
                    <X size={20} />
                </button>

                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label={t('cart.decrease_quantity')}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="px-3 py-1 text-center min-w-[2rem] font-semibold">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label={t('cart.increase_quantity')}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Line Total */}
                <div className="text-right">
                    <p className="text-sm text-gray-600">{t('cart.subtotal')}</p>
                    <Price
                        amount={price * item.quantity}
                        locale={locale as Locale}
                        size="base"
                        weight="bold"
                        className="text-gray-900"
                    />
                </div>
            </div>
        </div>
    );
}