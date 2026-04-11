'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function VideoThumbnail({ playbackId }: { playbackId: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const [hasError, setHasError] = useState(false);

    const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;
    const gifUrl = `https://image.mux.com/${playbackId}/animated.gif?width=320`;

    if (hasError) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[rgba(29,39,51,0.08)] text-sm text-[var(--foreground-soft)]">
                No preview
            </div>
        );
    }

    return (
        <div 
        className="relative h-full w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
            <Image 
            src={isHovered ? gifUrl : posterUrl}
            alt="Video thumbnail"
            fill
            unoptimized
            onError={() => setHasError(true)}
            className={`object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-90'}`}
            />
        </div>
    );
}
