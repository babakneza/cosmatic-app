'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import AuthInitializer from '@/components/auth/AuthInitializer';

// Dynamically import layout components with ssr enabled
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: true });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: true });
const MobileBottomNav = dynamic(() => import('@/components/layout/MobileBottomNav'), { ssr: true });

interface LayoutClientWrapperProps {
    children: ReactNode;
    direction: 'rtl' | 'ltr';
    locale: string;
}

/**
 * LayoutClientWrapper
 * Wraps the locale layout with client-side functionality
 * - Runs AuthInitializer to validate auth state on app load
 * - Wraps Header, Footer, and MobileBottomNav components
 */
export const LayoutClientWrapper = ({
    children,
    direction,
    locale
}: LayoutClientWrapperProps) => {
    return (
        <>
            {/* Initialize auth state on mount */}
            <AuthInitializer />

            {/* Main layout */}
            <div dir={direction} lang={locale} className="w-full min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                {/* Mobile bottom navigation */}
                <MobileBottomNav />
            </div>
        </>
    );
};

export default LayoutClientWrapper;