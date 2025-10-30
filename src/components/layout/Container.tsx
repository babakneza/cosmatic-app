import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
    children: ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    marginTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Container Component
 * 
 * Reusable wrapper component that provides:
 * - Consistent padding and margins
 * - Max-width constraints
 * - Responsive design
 * - RTL support (through Tailwind's default RTL handling)
 * 
 * Usage:
 * ```tsx
 * <Container maxWidth="lg" padding="lg">
 *   <h1>Content goes here</h1>
 * </Container>
 * ```
 */
export default function Container({
    children,
    className,
    maxWidth = 'lg',
    padding = 'md',
    marginTop = 'none',
    marginBottom = 'none',
}: ContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-4xl',
        xl: 'max-w-5xl',
        '2xl': 'max-w-7xl',
        full: 'max-w-full',
    };

    const paddingClasses = {
        none: 'px-0 py-0',
        sm: 'px-3 py-3 sm:px-4 sm:py-4',
        md: 'px-4 py-6 sm:px-6 sm:py-8',
        lg: 'px-6 py-8 sm:px-8 sm:py-12',
        xl: 'px-8 py-12 sm:px-10 sm:py-16',
    };

    const marginTopClasses = {
        none: 'mt-0',
        sm: 'mt-4 sm:mt-6',
        md: 'mt-6 sm:mt-8',
        lg: 'mt-8 sm:mt-12',
        xl: 'mt-12 sm:mt-16',
    };

    const marginBottomClasses = {
        none: 'mb-0',
        sm: 'mb-4 sm:mb-6',
        md: 'mb-6 sm:mb-8',
        lg: 'mb-8 sm:mb-12',
        xl: 'mb-12 sm:mb-16',
    };

    return (
        <div
            className={cn(
                'mx-auto w-full',
                maxWidthClasses[maxWidth],
                paddingClasses[padding],
                marginTopClasses[marginTop],
                marginBottomClasses[marginBottom],
                className
            )}
        >
            {children}
        </div>
    );
}