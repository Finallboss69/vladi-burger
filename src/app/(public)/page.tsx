'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Flame, Star, Users, Timer,
  ShoppingCart, Minus, Plus, Check, X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { mockProducts } from '@/lib/mock-data';
import { formatPrice, generateId, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { Product, ProductExtra } from '@/types';

/* ---- Data ---- */

const allBurgers = mockProducts.filter((p) => p.categoryId === '1' && p.isActive);

const stats = [
  { icon: Flame, value: '50K+', label: 'Burgers vendidas', color: '#FF6B35' },
  { icon: Star, value: '4.8', label: 'Rating promedio', color: '#F5CB5C' },
  { icon: Users, value: '12K+', label: 'Clientes felices', color: '#2D6A4F' },
  { icon: Timer, value: '30\'', label: 'Delivery promedio', color: '#D62828' },
];

const testimonials = [
  { name: 'Marcos G.', text: 'La Vladi Clasica es la mejor hamburguesa que comi en mi vida. La salsa secreta es adictiva.', rating: 5, avatar: 'M' },
  { name: 'Lucia R.', text: 'La opcion veggie es increible, no pense que una hamburguesa vegana pudiera ser tan rica.', rating: 5, avatar: 'L' },
  { name: 'Diego F.', text: 'Armar tu propia burger es genial. Ya hice como 10 combinaciones distintas!', rating: 4, avatar: 'D' },
];

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
            <h3 className="text-xl font-extrabold text-white drop-shadow-lg sm:text-2xl">
              {product.name}
            </h3>
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedBurger, setSelectedBurger] = useState<Product | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const activeBurger = allBurgers[activeIndex];
  const isLowStock = activeBurger.stock > 0 && activeBurger.stock < 5;

  // Auto-cycle
  useEffect(() => {
    if (!isAutoPlaying || selectedBurger) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allBurgers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, selectedBurger]);

  return (
    <div className="flex flex-col">
      {/* ====== Hero: Accordion + Banner ====== */}
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
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
            {/* Left: Accordion strips */}
            <div className="flex lg:flex-col gap-1.5 sm:gap-2 h-[100px] sm:h-[120px] lg:h-[460px] lg:w-[90px] order-2 lg:order-1">
              {allBurgers.map((burger, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.button
                    key={burger.id}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      'relative cursor-pointer overflow-hidden transition-all duration-500',
                      // Mobile: horizontal strips
                      'flex-1 lg:flex-none rounded-lg lg:rounded-xl',
                      isActive
                        ? 'ring-2 ring-[#FF6B35] ring-offset-1 ring-offset-[#0a0604]'
                        : 'opacity-60 hover:opacity-90',
                    )}
                    animate={{
                      flex: isActive ? 2.5 : 1,
                    }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      // For lg: fixed heights instead of flex
                    }}
                    aria-label={burger.name}
                  >
                    {burger.imageUrl ? (
                      <Image
                        src={burger.imageUrl}
                        alt={burger.name}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#2a1508] flex items-center justify-center text-2xl">🍔</div>
                    )}
                    <div className={cn(
                      'absolute inset-0 transition-all duration-300',
                      isActive
                        ? 'bg-black/10'
                        : 'bg-black/50 hover:bg-black/35',
                    )} />

                    {/* Name on collapsed - mobile */}
                    {!isActive && (
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] sm:text-[9px] font-bold text-white/80 truncate px-0.5 lg:hidden">
                        {burger.name.split(' ')[1] || burger.name}
                      </span>
                    )}

                    {/* Name on collapsed - desktop vertical */}
                    <span
                      className={cn(
                        'absolute inset-0 hidden lg:flex items-center justify-center text-[10px] font-bold tracking-wider transition-opacity duration-300',
                        isActive ? 'opacity-0' : 'text-white/80 opacity-100',
                      )}
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {burger.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Active Burger Banner */}
            <div className="relative flex-1 order-1 lg:order-2 rounded-2xl lg:rounded-3xl overflow-hidden h-[340px] sm:h-[400px] lg:h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBurger.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {/* Background image */}
                  {activeBurger.imageUrl ? (
                    <Image
                      src={activeBurger.imageUrl}
                      alt={activeBurger.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 80vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1a0e08] flex items-center justify-center text-8xl">🍔</div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 sm:from-black/75 sm:via-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Banner Content */}
                  <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-5 sm:p-8 lg:p-10">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className="max-w-md"
                    >
                      {/* Category label */}
                      {activeBurger.category && (
                        <span className="inline-block rounded-md bg-[#FF6B35]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-3">
                          {activeBurger.category.name}
                        </span>
                      )}

                      {isLowStock && (
                        <span className="inline-block ml-2 rounded-md bg-[#D62828]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-3">
                          Ultimas {activeBurger.stock}!
                        </span>
                      )}

                      {/* Name */}
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
                        {activeBurger.name}
                      </h1>

                      {/* Description */}
                      <p className="mt-2.5 text-sm sm:text-base text-white/65 leading-relaxed line-clamp-3">
                        {activeBurger.description}
                      </p>

                      {/* Extras tags */}
                      {activeBurger.extras.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {activeBurger.extras.map((extra) => (
                            <span
                              key={extra.id}
                              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60 backdrop-blur-sm"
                            >
                              + {extra.name} {formatPrice(extra.price)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price + CTA */}
                      <div className="mt-5 flex items-center gap-4">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B35]">
                          {formatPrice(activeBurger.price)}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBurger(activeBurger)}
                          className="flex h-11 items-center gap-2 rounded-xl bg-[#FF6B35] px-6 text-sm font-bold text-white cursor-pointer transition-colors hover:bg-[#e55e2e] shadow-lg shadow-[#FF6B35]/25"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Pedir ahora
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Burger counter */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
                <span className="text-xs font-bold text-[#FF6B35]">{activeIndex + 1}</span>
                <span className="text-[10px] text-white/40">/</span>
                <span className="text-xs text-white/50">{allBurgers.length}</span>
              </div>
            </div>
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
            {stats.map((stat, i) => (
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

      {/* ====== Testimonials ====== */}
      <section className="bg-[var(--bg-primary)] py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
              Lo que dicen nuestros clientes
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
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
                        si < t.rating
                          ? 'fill-[#F5CB5C] text-[#F5CB5C]'
                          : 'text-[var(--border-color)]',
                      )}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 pt-1 border-t border-[var(--border-color)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#D62828] text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {t.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
