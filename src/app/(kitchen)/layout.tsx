'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChefHat } from 'lucide-react';

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

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#333] bg-[#1A1A1A]/95 backdrop-blur-md px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#9E9E9E] transition-colors hover:bg-[#2D2D2D] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="h-5 w-px bg-[#333]" />
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-[#FF6B35]" />
            <span className="text-sm font-bold text-white">
              Vladi.burger <span className="text-[#FF6B35]">KDS</span>
            </span>
          </div>
        </div>
        <Clock />
      </header>

      {/* Content */}
      <main className="p-4">{children}</main>
    </div>
  );
}
