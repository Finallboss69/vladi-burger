'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Instagram, MapPin, Clock, Phone, Heart } from 'lucide-react';
import { RESTAURANT } from '@/lib/config';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div {...fadeInUp} className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20">
                <Flame className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {RESTAURANT.shortName}<span className="text-[#FF6B35]">.burger</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Hamburguesas artesanales hechas con pasion. Cada burger es una obra de arte.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={RESTAURANT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-all hover:bg-[#FF6B35]/10 hover:text-[#FF6B35]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Navegacion
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                { href: '/menu', label: 'Menu' },
                { href: '/blog', label: 'Blog' },
                { href: '/nosotros', label: 'Nosotros' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Informacion
            </h3>
            <ul className="mt-3 space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B35]" />
                <span>{RESTAURANT.address}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B35]" />
                <span>
                  {RESTAURANT.hours.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < RESTAURANT.hours.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B35]" />
                <span>{RESTAURANT.phone}</span>
              </li>
            </ul>
          </motion.div>

          {/* Account */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Tu Cuenta
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                { href: '/cuenta', label: 'Mi Perfil' },
                { href: '/cuenta/pedidos', label: 'Mis Pedidos' },
                { href: '/cuenta/puntos', label: 'Mis Sellos' },
                { href: '/cuenta/direcciones', label: 'Direcciones' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-8 border-t border-[var(--border-color)] pt-6 text-center text-sm text-[var(--text-muted)] sm:mt-10">
          <p className="flex items-center justify-center gap-1">
            Hecho con <Heart className="h-3.5 w-3.5 fill-[#D62828] text-[#D62828]" /> por {RESTAURANT.name}
            &middot; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </footer>
  );
}
