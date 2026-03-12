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
import { mockProducts, mockCreations } from '@/lib/mock-data';
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
                            'flex h-4.5 w-4.5 items-center justify-center rounded border-2 transition-colors',
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
            icon={
              added ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )
            }
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
      {/* ====== Hero Accordion ====== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#0d0705]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,53,0.12)_0%,transparent_60%)]" />

        <motion.div
          style={{ y: heroY }}
          className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16"
        >
          {/* Desktop Accordion */}
          <div className="hidden md:flex gap-2 h-[420px] lg:h-[480px]">
            {allBurgers.map((burger, i) => {
              const isActive = i === activeIndex;
              const isLowStock = burger.stock > 0 && burger.stock < 5;

              return (
                <motion.div
                  key={burger.id}
                  layout
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative cursor-pointer overflow-hidden rounded-2xl transition-shadow duration-500',
                    isActive
                      ? 'shadow-2xl shadow-black/50'
                      : 'shadow-lg shadow-black/20 hover:shadow-xl',
                  )}
                  animate={{
                    flex: isActive ? 4 : 0.6,
                  }}
                  transition={{
                    layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                    flex: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {/* Image */}
                  {burger.imageUrl ? (
                    <Image
                      src={burger.imageUrl}
                      alt={burger.name}
                      fill
                      sizes={isActive ? '60vw' : '10vw'}
                      className="object-cover"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#2a1508] text-5xl">
                      🍔
                    </div>
                  )}

                  {/* Gradient */}
                  <div
                    className={cn(
                      'absolute inset-0 transition-opacity duration-500',
                      isActive
                        ? 'bg-gradient-to-t from-black/70 via-black/10 to-black/20'
                        : 'bg-gradient-to-t from-black/80 via-black/40 to-black/30',
                    )}
                  />

                  {/* Collapsed state: vertical name */}
                  <AnimatePresence>
                    {!isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex flex-col items-center justify-end pb-5"
                      >
                        <span
                          className="text-xs font-bold text-white/90 tracking-wider"
                          style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                          }}
                        >
                          {burger.name}
                        </span>
                        <span className="mt-2 text-[10px] font-semibold text-[#FF6B35]">
                          {formatPrice(burger.price)}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded state: full info */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8"
                      >
                        {isLowStock && (
                          <span className="mb-2 inline-flex w-fit rounded-md bg-[#D62828]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Quedan {burger.stock}!
                          </span>
                        )}
                        <h2 className="text-3xl font-extrabold text-white lg:text-4xl">
                          {burger.name}
                        </h2>
                        <p className="mt-1.5 max-w-sm text-sm text-white/70 leading-relaxed line-clamp-2">
                          {burger.description}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <span className="text-2xl font-extrabold text-[#FF6B35] lg:text-3xl">
                            {formatPrice(burger.price)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBurger(burger);
                            }}
                            className="flex h-10 items-center gap-2 rounded-xl bg-[#FF6B35] px-5 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-[#e55e2e]"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Agregar
                          </motion.button>
                        </div>

                        {burger.extras.length > 0 && (
                          <div className="mt-3 flex gap-1.5">
                            {burger.extras.map((extra) => (
                              <span
                                key={extra.id}
                                className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60"
                              >
                                +{extra.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: Horizontal scroll accordion */}
          <div className="flex md:hidden gap-2 h-[340px] overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
            {allBurgers.map((burger, i) => {
              const isActive = i === activeIndex;
              const isLowStock = burger.stock > 0 && burger.stock < 5;

              return (
                <motion.div
                  key={burger.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl snap-start',
                    isActive ? 'shadow-xl' : 'shadow-md',
                  )}
                  animate={{
                    width: isActive ? '75vw' : '52px',
                  }}
                  transition={{
                    width: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {burger.imageUrl ? (
                    <Image
                      src={burger.imageUrl}
                      alt={burger.name}
                      fill
                      sizes={isActive ? '75vw' : '52px'}
                      className="object-cover"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#2a1508] text-4xl">
                      🍔
                    </div>
                  )}

                  <div
                    className={cn(
                      'absolute inset-0',
                      isActive
                        ? 'bg-gradient-to-t from-black/70 via-transparent to-black/10'
                        : 'bg-gradient-to-t from-black/80 via-black/40 to-black/20',
                    )}
                  />

                  {/* Collapsed */}
                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                      <span
                        className="text-[10px] font-bold text-white/80 tracking-wider"
                        style={{
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                        }}
                      >
                        {burger.name}
                      </span>
                    </div>
                  )}

                  {/* Expanded */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="absolute inset-0 flex flex-col justify-end p-4"
                      >
                        {isLowStock && (
                          <span className="mb-1.5 inline-flex w-fit rounded-md bg-[#D62828]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                            Quedan {burger.stock}!
                          </span>
                        )}
                        <h2 className="text-2xl font-extrabold text-white">
                          {burger.name}
                        </h2>
                        <p className="mt-1 text-xs text-white/60 line-clamp-2">
                          {burger.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xl font-extrabold text-[#FF6B35]">
                            {formatPrice(burger.price)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBurger(burger);
                            }}
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#FF6B35] px-3.5 text-xs font-semibold text-white cursor-pointer"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Agregar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* CTAs below accordion */}
          <div className="mt-6 flex items-center justify-between">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {allBurgers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    i === activeIndex
                      ? 'w-5 bg-[#FF6B35]'
                      : 'w-1.5 bg-white/20 hover:bg-white/40',
                  )}
                  aria-label={`${allBurgers[i].name}`}
                />
              ))}
            </div>

            <div className="flex gap-2.5">
              <Link href="/menu">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                  Ver Menu
                </Button>
              </Link>
              <Link href="/arma-tu-burger" className="hidden sm:block">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/15 text-white hover:bg-white/10"
                  icon={<Flame className="h-4 w-4" />}
                >
                  Crear Burger
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

      {/* ====== Arma tu Burger ====== */}
      <section className="relative overflow-hidden bg-[var(--bg-primary)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-14">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                <Flame className="h-3 w-3" />
                Builder
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl leading-[1.1]">
                Arma tu propia{' '}
                <span className="text-[#FF6B35]">Burger</span>
              </h2>
              <p className="mt-3 max-w-md text-[var(--text-secondary)] leading-relaxed">
                Elegi el pan, la carne, los quesos, vegetales, salsas y toppings.
                Crea tu combinacion perfecta y compartila con la comunidad.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Pan Brioche', 'Carne 200g', 'Cheddar', 'Bacon', 'Salsa Vladi'].map(
                  (item, i) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-lg bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                    >
                      {item}
                    </motion.span>
                  ),
                )}
              </div>

              <div className="mt-6">
                <Link href="/arma-tu-burger">
                  <Button size="lg" icon={<Flame className="h-4 w-4" />}>
                    Empezar a crear
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="w-full flex-1 flex flex-col gap-2.5"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Creaciones de la comunidad
              </p>
              {mockCreations.slice(0, 3).map((creation, i) => (
                <motion.div
                  key={creation.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 transition-colors hover:border-[#FF6B35]/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6B35]/10 text-base">
                      🍔
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {creation.name}
                      </p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        por {creation.user?.name} · {creation.voteCount} votos
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#FF6B35]">
                      {formatPrice(creation.totalPrice)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== Testimonials ====== */}
      <section className="bg-[var(--bg-secondary)] py-14 sm:py-18 border-t border-[var(--border-color)]">
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
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 sm:p-6"
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

      {/* Bottom spacer for mobile nav */}
      <div className="h-16 md:hidden" />

      {/* ====== Product Modal ====== */}
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
