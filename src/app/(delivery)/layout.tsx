'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types';

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-lg font-bold text-[#FF6B35] tabular-nums">
      {time}
    </span>
  );
}

function AvailabilityToggle() {
  const [available, setAvailable] = useState(true);

  return (
    <button
      onClick={() => setAvailable((prev) => !prev)}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        available
          ? 'bg-[#2D6A4F]/20 text-[#2D6A4F] border border-[#2D6A4F]/40'
          : 'bg-[#D62828]/20 text-[#D62828] border border-[#D62828]/40'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          available ? 'bg-[#2D6A4F] animate-pulse' : 'bg-[#D62828]'
        }`}
      />
      {available ? 'Disponible' : 'No disponible'}
    </button>
  );
}

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (user.role !== Role.DELIVERY && user.role !== Role.ADMIN) {
      router.replace('/login');
      return;
    }
    setChecked(true);
  }, [isAuthenticated, user, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B35] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#333] bg-[#1A1A1A]/95 backdrop-blur-md px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#FF6B35]" />
            <span className="text-sm font-bold text-white">
              Vladi.burger <span className="text-[#FF6B35]">Entregas</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AvailabilityToggle />
          <div className="h-5 w-px bg-[#333]" />
          <Clock />
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-20">{children}</main>
    </div>
  );
}
