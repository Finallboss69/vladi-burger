'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingCart, User, Sun, Moon,
  ChefHat, Flame, UtensilsCrossed, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

const navLinks = [
  { href: '/menu', label: 'Menu' },
  { href: '/arma-tu-burger', label: 'Arma tu Burger' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/nosotros', label: 'Nosotros' },
];

const mobileNavItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/arma-tu-burger', label: 'Crear', icon: Flame },
  { href: '/carrito', label: 'Carrito', icon: ShoppingCart },
  { href: '/cuenta', label: 'Cuenta', icon: User },
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const pathname = usePathname();

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b transition-all duration-300',
          scrolled
            ? 'border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-xl shadow-sm'
            : 'border-transparent bg-[var(--bg-primary)]/60 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20"
            >
              <Flame className="h-6 w-6" />
            </motion.div>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              Vladi<span className="text-[#FF6B35]">.burger</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-[#FF6B35]'
                    : 'text-[var(--text-secondary)] hover:text-[#FF6B35]',
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-[#FF6B35]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={toggleTheme}
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            <Link
              href="/carrito"
              className="relative rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[#FF6B35]"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-[10px] font-bold text-white shadow-lg shadow-[#FF6B35]/30"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                href="/cuenta"
                className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex h-9 items-center rounded-xl bg-[#FF6B35] px-4 text-sm font-semibold text-white shadow-md shadow-[#FF6B35]/20 transition-all hover:bg-[#FF6B35]/90 hover:shadow-lg hover:shadow-[#FF6B35]/30"
              >
                Ingresar
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[#FF6B35]"
                title="Panel Admin"
              >
                <ChefHat className="h-4 w-4" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] md:hidden"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)] md:hidden"
            >
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all',
                        isActive(link.href)
                          ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {!isAuthenticated && (
                  <motion.div
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={navLinks.length}
                  >
                    <Link
                      href="/login"
                      className="mt-2 flex h-12 items-center justify-center rounded-xl bg-[#FF6B35] text-base font-semibold text-white shadow-md shadow-[#FF6B35]/20"
                    >
                      Ingresar
                    </Link>
                  </motion.div>
                )}
                {isAuthenticated && (
                  <motion.div
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={navLinks.length}
                  >
                    <Link
                      href="/cuenta"
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      <User className="h-5 w-5" />
                      Mi Cuenta
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation - only on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isCart = item.href === '/carrito';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-[#FF6B35]' : 'text-[var(--text-muted)]',
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isCart && itemCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B35] text-[8px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#FF6B35]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
