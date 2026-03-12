'use client';

import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-xl',
};

function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--border-color)]',
        variantStyles[variant],
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { SkeletonProps, SkeletonVariant };
