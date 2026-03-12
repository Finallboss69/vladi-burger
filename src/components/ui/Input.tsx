'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      iconLeft,
      iconRight,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              error &&
                'border-[#D62828] focus:ring-[#D62828]',
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
          {iconRight && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-xs text-[#D62828]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
