'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import WishlistView from '@/components/account/WishlistView';
import { Heart, ArrowLeft, Share2, Download } from 'lucide-react';

interface WishlistPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function WishlistPage({ params: paramsPromise }: WishlistPageProps) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const { user, is_authenticated, access_token } = useAuth();
    const [isHydrated, setIsHydrated] = React.useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !is_authenticated) {
            router.push(`/${params.locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, params, router]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!is_authenticated || !user || !access_token) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Navigation */}
                <Link
                    href={`/${params.locale}/account`}
                    className="inline-flex items-center gap-2 text-gold hover:text-amber-600 mb-8 transition font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Account
                </Link>

                {/* Hero Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-8 mb-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-100 rounded-full opacity-30 -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-full opacity-30 -ml-16 -mb-16"></div>

                    <div className="relative z-10 flex items-start justify-between gap-6">
                        {/* Left Content */}
                        <div className="flex items-start gap-6 flex-1">
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Heart className="w-10 h-10 text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                                <p className="text-xl text-gray-600 mb-4">
                                    Curate your collection of favorite beauty products
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        <span>Save items to buy later</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Share2 className="w-4 h-4 text-blue-500" />
                                        <span>Share with friends</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-shrink-0">
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'My BuyJan Wishlist',
                                            text: 'Check out my favorite products!',
                                            url,
                                        });
                                    }
                                }}
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition border border-blue-200 flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Wishlist Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <WishlistView
                        customerId={user.id}
                        accessToken={access_token}
                        locale={params.locale}
                    />
                </div>
            </div>
        </div>
    );
}