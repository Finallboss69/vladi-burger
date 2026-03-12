'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Flame } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const stored = localStorage.getItem('vladi-pwa-dismissed');
    if (stored) {
      const dismissedAt = parseInt(stored, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't appear immediately
      setTimeout(() => setShowPrompt(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('vladi-pwa-dismissed', Date.now().toString());
  }

  if (dismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 z-[60] md:hidden"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-2xl">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35] text-white">
            <Flame className="h-6 w-6" />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Instalar Vladi.burger
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Agrega la app a tu inicio para pedir mas rapido
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={handleInstall}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#FF6B35] px-3 text-xs font-bold text-white cursor-pointer transition-colors hover:bg-[#e55e2e]"
            >
              <Download className="h-3.5 w-3.5" />
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
