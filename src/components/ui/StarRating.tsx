'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  className?: string;
  size?: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  className,
  size = 24,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  const handleClick = useCallback(
    (star: number) => {
      if (readonly || !onChange) return;
      onChange(star);
    },
    [readonly, onChange],
  );

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (readonly) return;
      setHovered(star);
    },
    [readonly],
  );

  const handleMouseLeave = useCallback(() => {
    if (readonly) return;
    setHovered(0);
  }, [readonly]);

  const displayValue = hovered || value;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role="radiogroup"
      aria-label="Calificación"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;

        return (
          <motion.button
            key={star}
            type="button"
            whileTap={readonly ? undefined : { scale: 0.8 }}
            whileHover={readonly ? undefined : { scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(
              'p-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] rounded',
              readonly ? 'cursor-default' : 'cursor-pointer',
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            disabled={readonly}
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                filled
                  ? 'fill-[#F5CB5C] text-[#F5CB5C]'
                  : 'fill-transparent text-[var(--text-muted)]',
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

StarRating.displayName = 'StarRating';

export { StarRating };
export type { StarRatingProps };
