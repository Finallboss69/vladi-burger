'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#FF6B35]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#D62828]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Vladi Burger"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Vladi<span className="text-[#FF6B35]">.burger</span>
              </h1>
            </div>
          </Link>
          <p className="text-sm text-[var(--text-muted)]">
            Hamburguesas artesanales de autor
          </p>
        </motion.div>

        {/* Content card */}
        {children}
      </div>
    </div>
  );
}
