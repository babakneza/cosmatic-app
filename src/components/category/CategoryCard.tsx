'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getDirectusAssetUrl } from '@/lib/utils';
import { Locale } from '@/types';

interface CategoryCardProps {
    category: {
        id: string | number;
        name: string;
        name_ar?: string; // Optional for backward compatibility
        slug: string;
        description?: string;
        description_ar?: string; // Optional for backward compatibility
        image?: string | { id: string };
        icon?: string; // Material icon name
        parent?: string | number | null;
    };
    locale: Locale;
    index: number;
}

export default function CategoryCard({ category, locale, index }: CategoryCardProps) {
    const [imageError, setImageError] = useState(false);
    const isRTL = locale === 'ar';

    // Extract image URL from category using the utility function
    const getImageUrl = () => {
        if (!category.image) {
            return '/images/placeholder-category.jpg';
        }

        // Always use the getDirectusAssetUrl utility function to ensure proper authentication
        // This function handles different image formats (string, object with id, etc.)
        try {
            // For Directus SDK v20.1.0, we need to handle different image object formats
            if (typeof category.image === 'object' && category.image !== null) {
                const imageObj = category.image as any;

                // Check if it's a relation object with a nested structure
                if (imageObj.id) {
                    return getDirectusAssetUrl(imageObj.id);
                }

                // Check if it has a directus_files_id property
                if (imageObj.directus_files_id) {
                    return getDirectusAssetUrl(imageObj.directus_files_id);
                }

                // If it's some other object format, pass the whole object to the utility function
                return getDirectusAssetUrl(category.image);
            }

            // If it's a string or other primitive, pass it directly
            return getDirectusAssetUrl(category.image);
        } catch (error) {
            return '/images/placeholder-category.jpg';
        }
    };

    const imageUrl = getImageUrl();
    // Since name_ar might not exist in your schema, just use name
    const displayName = category.name;

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.43, 0.13, 0.23, 0.96]
            }
        })
    };

    return (
        <motion.div
            className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl h-56 sm:h-64 w-full"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.03 }}
        >
            <Link href={`/${locale}/categories/${category.slug}`} className="block h-full">
                <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

                    {!imageError ? (
                        <Image
                            src={imageUrl}
                            alt={displayName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={() => setImageError(true)}
                            priority={index < 4} // Prioritize loading the first 4 images
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            {category.icon ? (
                                <div className="flex flex-col items-center">
                                    <span className="material-icons text-primary-800 text-5xl mb-2">{category.icon}</span>
                                    <span className="text-primary-800 text-lg font-medium">{displayName}</span>
                                </div>
                            ) : (
                                <span className="text-primary-800 text-lg font-medium">{displayName}</span>
                            )}
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
                        <h3 className="text-lg font-bold mb-1 drop-shadow-md">{displayName}</h3>
                        <div className="flex items-center">
                            <span className="text-sm opacity-90 drop-shadow-md">
                                Shop Now
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ml-1 ${isRTL ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}