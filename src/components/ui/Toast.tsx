'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles: Record<ToastType, string> = {
  success:
    'border-[#2D6A4F] bg-green-50 text-green-900 dark:bg-green-950/60 dark:text-green-200',
  error:
    'border-[#D62828] bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200',
  info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200',
  warning:
    'border-[#F5CB5C] bg-yellow-50 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-200',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-[#2D6A4F]',
  error: 'text-[#D62828]',
  info: 'text-blue-500',
  warning: 'text-[#F5CB5C]',
};

function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const Icon = toastIcons[type];

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 p-4 shadow-lg',
        toastStyles[type],
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {message && (
          <p className="mt-0.5 text-xs opacity-80">{message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

Toast.displayName = 'Toast';

export { Toast };
export type { ToastProps, ToastType };
