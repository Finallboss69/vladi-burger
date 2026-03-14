'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Ticket,
  BarChart3,
  ChefHat,
  ArrowLeft,
  Menu,
  X,
  User,
  LogOut,
  Stamp,
  Layers,
  Truck,
  Navigation,
  Camera,
  FileText,
  Salad,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { RESTAURANT } from '@/lib/config';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/productos', label: 'Productos', icon: UtensilsCrossed },
  { href: '/admin/categorias', label: 'Categorías', icon: Layers },
  { href: '/admin/ingredientes', label: 'Ingredientes', icon: Salad },
  { href: '/admin/cupones', label: 'Cupones', icon: Ticket },
  { href: '/admin/sellos', label: 'Sellos', icon: Stamp },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/asignar', label: 'Asignar Pedidos', icon: Navigation },
  { href: '/admin/fotos', label: 'Fotos', icon: Camera },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/cocina', label: 'Cocina', icon: ChefHat },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, hydrated, logout } = useAuthStore();

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user || user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#FF6B35] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col flex-1 bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border-color)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white font-bold text-lg">
              V
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">{RESTAURANT.name}</h1>
              <p className="text-xs text-[var(--text-muted)]">Panel Admin</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active && 'text-[#FF6B35]')} />
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="admin-nav-indicator"
                      className="ml-auto h-2 w-2 rounded-full bg-[#FF6B35]"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Back to site */}
          <div className="border-t border-[var(--border-color)] p-3">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al sitio</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white font-bold text-lg">
                    V
                  </div>
                  <span className="text-lg font-bold text-[var(--text-primary)]">Admin</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const active = isActiveRoute(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        active
                          ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-color)] p-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Volver al sitio</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al sitio
            </Link>

            <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Administrador</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[#D62828] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-md py-2 lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors',
                active ? 'text-[#FF6B35]' : 'text-[var(--text-muted)]',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="admin-mobile-indicator"
                  className="absolute -bottom-0 h-0.5 w-8 rounded-full bg-[#FF6B35]"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
