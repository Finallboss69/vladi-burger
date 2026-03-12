'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps
  extends Omit<
    HTMLMotionProps<'div'> & HTMLAttributes<HTMLDivElement>,
    'ref'
  > {
  children: ReactNode;
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-md',
          'border border-[var(--border-color)]',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-3', className)} {...props}>
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-3 flex items-center', className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps };
