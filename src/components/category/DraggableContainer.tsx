'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface DraggableContainerProps {
    children: ReactNode;
    className?: string;
    isRTL?: boolean;
}

const DraggableContainer = React.forwardRef<any, DraggableContainerProps>(({
    children,
    className = '',
    isRTL = false
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    // Motion values for smooth scrolling
    const x = useMotionValue(0);
    const dragStartX = useRef(0);
    const dragVelocity = useRef(0);
    const lastDragX = useRef(0);
    const lastTimestamp = useRef(0);

    // Spring configuration for smooth deceleration
    const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
    const springX = useSpring(x, springConfig);

    // Update container and content dimensions
    useEffect(() => {
        if (!containerRef.current || !contentRef.current) return;

        const updateConstraints = () => {
            if (!containerRef.current || !contentRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const contentWidth = contentRef.current.scrollWidth;

            // Only allow scrolling if content is wider than container
            if (contentWidth > containerWidth) {
                setConstraints({
                    left: -(contentWidth - containerWidth),
                    right: 0
                });
            } else {
                setConstraints({ left: 0, right: 0 });
            }
        };

        updateConstraints();

        // Update dimensions on resize
        const resizeObserver = new ResizeObserver(updateConstraints);
        resizeObserver.observe(containerRef.current);
        resizeObserver.observe(contentRef.current);

        return () => {
            if (containerRef.current) resizeObserver.unobserve(containerRef.current);
            if (contentRef.current) resizeObserver.unobserve(contentRef.current);
        };
    }, []);

    // Mouse and touch event handlers
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        setIsDragging(true);

        // Get client position for both mouse and touch events
        const clientX = 'touches' in e
            ? e.touches[0].clientX
            : e.clientX;

        dragStartX.current = clientX;
        lastDragX.current = clientX;
        lastTimestamp.current = performance.now();

        // Stop any ongoing animation
        springX.stop();

        // Apply grabbing cursor for mouse events
        if (!('touches' in e)) {
            document.body.style.cursor = 'grabbing';
        }

        // Prevent text selection
        e.preventDefault();
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        // Get client position for both mouse and touch events
        const clientX = 'touches' in e
            ? (e as TouchEvent).touches[0].clientX
            : (e as MouseEvent).clientX;

        const deltaX = clientX - lastDragX.current;
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTimestamp.current;

        if (deltaTime > 0) {
            // Calculate velocity (pixels per second)
            dragVelocity.current = (deltaX / deltaTime) * 1000;
        }

        // Update position
        const newX = x.get() + deltaX;
        x.set(Math.max(constraints.left, Math.min(constraints.right, newX)));

        lastDragX.current = clientX;
        lastTimestamp.current = currentTime;

        e.preventDefault();
    };

    const handleDragEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        // Apply momentum based on velocity
        const momentum = dragVelocity.current * 0.5; // Adjust multiplier to control momentum
        const targetX = Math.max(constraints.left, Math.min(constraints.right, x.get() + momentum));

        // Animate to the new position with spring physics
        springX.set(targetX);

        // Reset cursor
        document.body.style.cursor = '';
    };

    // Expose scrollSmoothly method to parent components
    useEffect(() => {
        if (!ref) return;

        // Create a method to scroll smoothly in either direction
        const scrollSmoothly = (direction: number) => {
            if (!containerRef.current || !contentRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const scrollAmount = containerWidth * 0.75 * direction;
            const targetX = Math.max(
                constraints.left,
                Math.min(constraints.right, x.get() + scrollAmount)
            );

            // Animate to the new position with spring physics
            springX.set(targetX);
        };

        // Expose methods via ref
        if (typeof ref === 'function') {
            ref({ scrollSmoothly });
        } else {
            ref.current = { scrollSmoothly };
        }
    }, [ref, constraints]);

    // Add global event listeners for mouse/touch move and up/end
    useEffect(() => {
        if (isDragging) {
            // Mouse events
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('mouseleave', handleDragEnd);

            // Touch events
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
            document.addEventListener('touchcancel', handleDragEnd);
        }

        return () => {
            // Mouse events
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('mouseleave', handleDragEnd);

            // Touch events
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            document.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [isDragging, constraints]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden relative ${className}`}
            style={{
                userSelect: 'none',
                touchAction: 'pan-y',
                minHeight: '200px',
                direction: 'ltr'
            }}
        >
            <motion.div
                ref={contentRef}
                className="flex w-full"
                style={{
                    x: springX,
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                animate={{
                    scale: isDragging ? 0.99 : 1,
                    transition: { duration: 0.3 }
                }}
            >
                {children}
            </motion.div>
        </div>
    );
});

DraggableContainer.displayName = 'DraggableContainer';
export default DraggableContainer;