'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Flame, Star, Users, Timer,
  ShoppingCart, Minus, Plus, Check, X, Package,
} from 'lucide-react';
import { Button } from '@/components/ui';
import api from '@/lib/api';
import { formatPrice, generateId, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { Product, ProductExtra } from '@/types';

interface StatsData {
  burgersSold: number;
  avgRating: number;
  totalCustomers: number;
  totalOrders: number;
}

function formatStatValue(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  return String(n);
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
}

/* ---- Product Quick-View Modal ---- */

function BurgerModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);
  const [notes, setNotes] = useState('');

  function toggleExtra(extraId: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(extraId)) next.delete(extraId);
      else next.add(extraId);
      return next;
    });
  }

  const chosenExtras: ProductExtra[] = product.extras.filter((e) =>
    selectedExtras.has(e.id),
  );
  const extrasTotal = chosenExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = (product.price + extrasTotal) * quantity;

  function handleAdd() {
    addItem({
      id: generateId(),
      product,
      name: product.name,
      price: product.price,
      quantity,
      extras: chosenExtras,
      imageUrl: product.imageUrl,
      isCustom: false,
      notes: notes.trim() || undefined,
    });
    addNotification({
      type: 'success',
      title: 'Agregado al carrito',
      message: `${product.name} x${quantity} se agrego a tu carrito`,
      duration: 2500,
    });
    setAdded(true);
    setTimeout(() => onClose(), 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[var(--bg-primary)] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-52 w-full sm:h-60">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 500px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-tertiary)]">
              <span className="text-6xl">🍔</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-extrabold text-white drop-shadow-lg sm:text-2xl">
                {product.name}
              </h3>
              {product.stock === 0 ? (
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">Agotado</span>
              ) : product.stock > 0 && product.stock < 5 ? (
                <span className="rounded-md bg-[#D62828] px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">Quedan {product.stock}!</span>
              ) : product.stock > 0 ? (
                <span className="rounded-md bg-emerald-600/80 px-2 py-0.5 text-[10px] font-bold text-white">Stock: {product.stock}</span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-white/70 line-clamp-2">{product.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {product.extras.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Personaliza tu burger
              </h4>
              <div className="flex flex-col gap-1.5">
                {product.extras.map((extra) => {
                  const isSelected = selectedExtras.has(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition-all',
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35]/8'
                          : 'border-[var(--border-color)] hover:border-[#FF6B35]/30',
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                            isSelected
                              ? 'border-[#FF6B35] bg-[#FF6B35]'
                              : 'border-[var(--border-color)]',
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {extra.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        +{formatPrice(extra.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Comentario (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, bien cocida..."
              rows={2}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 cursor-pointer items-center justify-center text-[var(--text-muted)] hover:text-[#FF6B35]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.75rem] text-center text-base font-bold text-[var(--text-primary)]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center text-[var(--text-muted)] hover:text-[#FF6B35]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-2xl font-extrabold text-[#FF6B35]">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAdd}
            disabled={added}
            icon={added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          >
            {added ? 'Agregado!' : 'Agregar al carrito'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---- Main Page ---- */

export default function HomePage() {
  const [allBurgers, setAllBurgers] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedBurger, setSelectedBurger] = useState<Product | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState('4.8');
  const [totalReviews, setTotalReviews] = useState(0);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    api.get('/products?categoryId=1').then((res) => {
      const burgers = res.data.data.filter((p: Product) => p.isActive);
      setAllBurgers(burgers);
      if (burgers.length > 0) {
        setActiveIndex(burgers.length - 1);
      }
    }).catch(() => {});

    api.get('/stats').then((res) => {
      setStats(res.data.data);
    }).catch(() => {});

    api.get('/reviews?limit=6').then((res) => {
      const data = res.data.data;
      setReviews(data.reviews);
      if (data.totalReviews > 0) {
        setAvgRating(String(data.avgRating));
      }
      setTotalReviews(data.totalReviews);
    }).catch(() => {});
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  // Auto-cycle
  useEffect(() => {
    if (!isAutoPlaying || selectedBurger || allBurgers.length === 0) return;
    const len = allBurgers.length;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % len);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, selectedBurger, allBurgers.length]);

  return (
    <div className="flex flex-col">
      {/* ====== Hero: Vertical Card Accordion + Banner ====== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="absolute inset-0 bg-[#0a0604]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,53,0.08)_0%,transparent_50%)]" />

        <motion.div
          style={{ y: heroY }}
          className="relative mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:py-14"
        >
          {/* Vertical cards row — tall narrow strips side by side */}
          <div className="flex gap-1.5 sm:gap-2 h-[420px] sm:h-[460px] lg:h-[500px]">
            {activeIndex >= 0 && allBurgers.map((burger, i) => {
              const isActive = i === activeIndex;
              const burgerLowStock = burger.stock > 0 && burger.stock < 5;

              return (
                <motion.div
                  key={burger.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative cursor-pointer overflow-hidden rounded-2xl transition-shadow duration-500',
                    isActive
                      ? 'shadow-2xl shadow-[#FF6B35]/10'
                      : 'shadow-md hover:shadow-lg',
                  )}
                  animate={{
                    flex: isActive ? 5 : 0.5,
                  }}
                  transition={{
                    flex: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {/* Image */}
                  {burger.imageUrl ? (
                    <Image
                      src={burger.imageUrl}
                      alt={burger.name}
                      fill
                      priority={i < 3}
                      sizes={isActive ? '70vw' : '60px'}
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2a1508] flex items-center justify-center text-5xl">🍔</div>
                  )}

                  {/* Overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 transition-all duration-500',
                      isActive
                        ? 'bg-gradient-to-r from-black/75 via-black/30 to-black/10'
                        : 'bg-gradient-to-t from-black/70 via-black/40 to-black/25',
                    )}
                  />

                  {/* Collapsed: vertical name + stock */}
                  <AnimatePresence>
                    {!isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-between py-3"
                      >
                        {/* Stock dot indicator at top */}
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              burger.stock === 0
                                ? 'bg-red-500'
                                : burger.stock > 0 && burger.stock < 5
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-emerald-400',
                            )}
                          />
                          <span className="text-[8px] font-bold text-white/50">
                            {burger.stock === -1 ? '∞' : burger.stock}
                          </span>
                        </div>

                        {/* Name + price at bottom */}
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className="text-[11px] sm:text-xs font-bold text-white/80 tracking-wider"
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                          >
                            {burger.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#FF6B35]">
                            {formatPrice(burger.price)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded: full banner */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8"
                      >
                        {/* Tags + Stock */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {burger.category && (
                            <span className="rounded-md bg-[#FF6B35]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                              {burger.category.name}
                            </span>
                          )}
                          {/* Stock indicator */}
                          {burger.stock === 0 ? (
                            <span className="flex items-center gap-1 rounded-md bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                              <Package className="h-3 w-3" /> Agotado
                            </span>
                          ) : burger.stock > 0 && burger.stock < 5 ? (
                            <span className="flex items-center gap-1 rounded-md bg-[#D62828]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white animate-pulse">
                              <Package className="h-3 w-3" /> Ultimas {burger.stock}!
                            </span>
                          ) : burger.stock > 0 ? (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-600/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                              <Package className="h-3 w-3" /> Stock: {burger.stock}
                            </span>
                          ) : null}
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
                          {burger.name}
                        </h1>

                        {/* Description */}
                        <p className="mt-2 text-xs sm:text-sm lg:text-base text-white/60 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg">
                          {burger.description}
                        </p>

                        {/* Extras */}
                        {burger.extras.length > 0 && (
                          <div className="mt-2.5 hidden sm:flex flex-wrap gap-1.5">
                            {burger.extras.map((extra) => (
                              <span
                                key={extra.id}
                                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/50 backdrop-blur-sm"
                              >
                                + {extra.name} {formatPrice(extra.price)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price + CTA */}
                        <div className="mt-4 flex items-center gap-3 sm:gap-4">
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FF6B35]">
                            {formatPrice(burger.price)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBurger(burger);
                            }}
                            className="flex h-10 sm:h-11 items-center gap-2 rounded-xl bg-[#FF6B35] px-4 sm:px-6 text-xs sm:text-sm font-bold text-white cursor-pointer transition-colors hover:bg-[#e55e2e] shadow-lg shadow-[#FF6B35]/25"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Pedir ahora
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Counter badge on active */}
                  {isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-[#FF6B35]">{i + 1}</span>
                      <span className="text-[9px] text-white/30">/</span>
                      <span className="text-[10px] text-white/40">{allBurgers.length}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bottom bar: dots + CTAs */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {allBurgers.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-1 rounded-full transition-all duration-400 cursor-pointer',
                    i === activeIndex
                      ? 'w-6 bg-[#FF6B35]'
                      : 'w-1.5 bg-white/15 hover:bg-white/30',
                  )}
                  aria-label={b.name}
                />
              ))}
            </div>

            <div className="flex gap-2.5">
              <Link href="/menu">
                <Button icon={<ArrowRight className="h-4 w-4" />}>
                  Ver Menu
                </Button>
              </Link>
              <Link href="/nosotros" className="hidden sm:block">
                <Button
                  variant="secondary"
                  className="border-white/15 text-white hover:bg-white/10"
                >
                  Nosotros
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====== Stats Bar ====== */}
      <section className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-4 divide-x divide-[var(--border-color)]">
            {[
              { icon: Flame, value: stats ? formatStatValue(stats.burgersSold) : '---', label: 'Burgers vendidas', color: '#FF6B35' },
              { icon: Star, value: stats?.avgRating ? String(stats.avgRating) : (totalReviews > 0 ? avgRating : '---'), label: 'Rating promedio', color: '#F5CB5C' },
              { icon: Users, value: stats ? formatStatValue(stats.totalCustomers) : '---', label: 'Clientes felices', color: '#2D6A4F' },
              { icon: Timer, value: stats ? formatStatValue(stats.totalOrders) : '---', label: 'Pedidos totales', color: '#D62828' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center gap-1 py-5 sm:py-6 sm:flex-row sm:gap-3 sm:justify-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: stat.color }} />
                <div className="text-center sm:text-left">
                  <span className="block text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                    {stat.value}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-[var(--text-muted)]">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Reviews from real customers ====== */}
      {reviews.length > 0 && (
        <section className="bg-[var(--bg-primary)] py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div
              className="mb-8 sm:mb-10 flex items-end justify-between"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                  Lo que dicen nuestros clientes
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {totalReviews} resena{totalReviews !== 1 ? 's' : ''} reales de nuestros clientes
                </p>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 sm:p-6"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={cn(
                          'h-3.5 w-3.5',
                          si < r.rating
                            ? 'fill-[#F5CB5C] text-[#F5CB5C]'
                            : 'text-[var(--border-color)]',
                        )}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 pt-1 border-t border-[var(--border-color)]">
                    {r.user.avatarUrl ? (
                      <Image
                        src={r.user.avatarUrl}
                        alt={r.user.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#D62828] text-xs font-bold text-white">
                        {r.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {r.user.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="h-16 md:hidden" />

      <AnimatePresence>
        {selectedBurger && (
          <BurgerModal
            product={selectedBurger}
            onClose={() => setSelectedBurger(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
