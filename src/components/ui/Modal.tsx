'use client';

import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
                  'rounded-2xl bg-[var(--bg-primary)] p-6 shadow-xl',
                  'border border-[var(--border-color)]',
                  'focus:outline-none',
                  className,
                )}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                {title && (
                  <Dialog.Title className="text-lg font-bold text-[var(--text-primary)]">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-[var(--text-secondary)]">
                    {description}
                  </Dialog.Description>
                )}
                <div className={cn(title && 'mt-4')}>{children}</div>
                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

Modal.displayName = 'Modal';

export { Modal };
export type { ModalProps };
