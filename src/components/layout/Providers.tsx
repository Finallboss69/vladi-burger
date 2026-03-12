'use client';

import { type ReactNode, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Toast } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  const isDark = useThemeStore((s) => s.isDark);
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      {children}
      {/* Toast Container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <Toast
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              duration={n.duration}
              onDismiss={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
