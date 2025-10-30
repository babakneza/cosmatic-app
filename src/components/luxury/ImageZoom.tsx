'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    zoomFactor?: number;
    onLoad?: () => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function ImageZoom({
    src,
    alt,
    width,
    height,
    className,
    zoomFactor = 1.5,
    onLoad,
    onError
}: ImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imageRef.current) return;

        const { left, top, width, height } = imageRef.current.getBoundingClientRect();

        // Calculate position as percentage
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        setPosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    return (
        <div
            ref={imageRef}
            className={cn("relative overflow-hidden", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="w-full h-full object-cover transition-transform duration-200"
                onLoad={onLoad}
                onError={onError}
            />

            {isZoomed && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
                        backgroundSize: `${zoomFactor * 100}%`,
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}
        </div>
    );
}