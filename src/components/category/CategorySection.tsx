'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import DraggableContainer from './DraggableContainer';
import { Locale } from '@/types';

interface CategorySectionProps {
    title: string;
    categories: any[];
    locale: Locale;
    viewAllLink?: string;
    className?: string;
}

export default function CategorySection({
    title,
    categories,
    locale,
    viewAllLink,
    className = '',
}: CategorySectionProps) {
    const t = useTranslations('common');
    const isRTL = locale === 'ar';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Track touch and mouse events for scrolling
    const touchStartRef = useRef<number | null>(null);
    const touchEndRef = useRef<number | null>(null);
    const isTouchActiveRef = useRef<boolean>(false);
    const isMouseDownRef = useRef<boolean>(false);
    const lastMouseXRef = useRef<number | null>(null);

    // Reference to the DraggableContainer component
    const draggableContainerRef = useRef<any>(null);

    // Handle scroll buttons with smooth animation
    const scrollLeft = () => {
        if (draggableContainerRef.current) {
            draggableContainerRef.current.scrollSmoothly(isRTL ? 1 : -1);
        }
    };

    const scrollRight = () => {
        if (draggableContainerRef.current) {
            draggableContainerRef.current.scrollSmoothly(isRTL ? -1 : 1);
        }
    };

    // Enable smooth scrolling with mouse wheel and touch events
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        // Mouse wheel handler
        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            }
        };

        // Touch event handlers
        const handleTouchStart = (e: TouchEvent) => {
            touchStartRef.current = e.touches[0].clientX;
            isTouchActiveRef.current = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            // We'll let the browser handle the touch scrolling naturally
            // This is more reliable on mobile devices
            if (!touchStartRef.current || !isTouchActiveRef.current) return;

            // Just track the current position for potential use in touchEnd
            touchEndRef.current = e.touches[0].clientX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndRef.current = e.changedTouches[0].clientX;
            isTouchActiveRef.current = false;
        };

        // SIMPLIFIED MOUSE DRAG IMPLEMENTATION
        let isDown = false;
        let startX = 0;
        let startScrollLeft = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            scrollContainer.classList.add('dragging');
            startX = e.pageX;
            startScrollLeft = scrollContainer.scrollLeft;
            scrollContainer.style.cursor = 'grabbing';

            // Prevent text selection during drag
            document.body.style.userSelect = 'none';
            e.preventDefault();
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;

            e.preventDefault();
            const x = e.pageX;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            scrollContainer.scrollLeft = startScrollLeft - walk;
        };

        const handleMouseUp = () => {
            isDown = false;
            scrollContainer.classList.remove('dragging');
            scrollContainer.style.cursor = 'grab';
            document.body.style.userSelect = '';
        };

        const handleMouseLeave = () => {
            if (isDown) {
                isDown = false;
                scrollContainer.classList.remove('dragging');
                scrollContainer.style.cursor = 'grab';
                document.body.style.userSelect = '';
            }
        };

        // Add event listeners
        scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
        scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true }); // Make passive to allow native scrolling
        scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Add mouse drag event listeners - use document for better tracking
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseUp);

        return () => {
            // Remove event listeners
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchmove', handleTouchMove);
            scrollContainer.removeEventListener('touchend', handleTouchEnd);

            // Remove mouse drag event listeners
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseUp);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.43, 0.13, 0.23, 0.96]
            }
        }
    };

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className={`py-16 px-4 ${className}`}>
            <div className="container mx-auto">
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center mb-10"
                    variants={titleVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-3xl font-bold text-neutral-800 mb-4 md:mb-0"
                    >
                        {title}
                    </motion.h2>

                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="inline-flex items-center text-primary hover:text-primary-600 font-medium transition-colors"
                        >
                            {isRTL ? (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 ml-1 rotate-180"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                    {t('view_all')}
                                </>
                            ) : (
                                <>
                                    {t('view_all')}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 ml-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </Link>
                    )}
                </motion.div>

                <div className="relative group/scroll before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent before:md:hidden">
                    <DraggableContainer ref={draggableContainerRef} className="pb-4" isRTL={isRTL}>
                        <div className="flex gap-4 min-w-full px-2">
                            {categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className="flex-none w-[47%] sm:w-[45%] md:w-[30%] lg:w-[23%] px-1"
                                >
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    duration: 0.5,
                                                    ease: [0.43, 0.13, 0.23, 0.96]
                                                }
                                            }
                                        }}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20
                                        }}
                                    >
                                        <CategoryCard
                                            category={category}
                                            locale={locale}
                                            index={index}
                                        />
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </DraggableContainer>

                    {/* Scroll indicators */}
                    <div className="hidden md:flex justify-center mt-4 gap-1">
                        {Array.from({ length: Math.min(Math.ceil(categories.length / 4), 5) }).map((_, i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-gray-300 hover:bg-primary cursor-pointer"
                                aria-label={`Page ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Mobile scroll indicator */}
                    <div className="flex md:hidden justify-center mt-4 items-center text-neutral-500 touch-target">
                        {isRTL && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 animate-scroll-hint text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        )}
                        <span className="text-xs font-medium">Drag to scroll</span>
                        {!isRTL && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 animate-scroll-hint text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </div>

                    {/* Desktop scroll buttons */}
                    <button
                        onClick={scrollLeft}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={scrollRight}
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}