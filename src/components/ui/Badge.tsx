'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  lowStock:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 animate-pulse',
} as const;

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
} as const;

type BadgeVariant = keyof typeof badgeVariants;
type BadgeSize = keyof typeof badgeSizes;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

function Badge({
  className,
  variant = 'info',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
