'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const variants = {
  primary:
    'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 focus-visible:ring-[#FF6B35]',
  secondary:
    'border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus-visible:ring-[#FF6B35]',
  ghost:
    'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus-visible:ring-[#FF6B35]',
  danger:
    'bg-[#D62828] text-white hover:bg-[#D62828]/90 focus-visible:ring-[#D62828]',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-base gap-2 rounded-xl',
  lg: 'h-12 px-6 text-lg gap-2.5 rounded-xl',
} as const;

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface ButtonProps
  extends Omit<
    HTMLMotionProps<'button'> & ButtonHTMLAttributes<HTMLButtonElement>,
    'ref'
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.95 }}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'cursor-pointer',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Spinner size={size} className="shrink-0" />
        ) : icon ? (
          <span className={cn('shrink-0', iconSizes[size])}>{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
