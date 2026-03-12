'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Flame, Star, Users, Truck, ChevronLeft, ChevronRight,
  ShoppingCart, Minus, Plus, Check, X,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCreations } from '@/lib/mock-data';
import { formatPrice, generateId, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { Product, ProductExtra } from '@/types';

/* ---- Data ---- */

const heroBurgers = mockProducts
  .filter((p) => p.categoryId === '1' && p.isActive)
  .slice(0, 3);

const featuredProducts = mockProducts
  .filter((p) => p.categoryId === '1' && p.isActive)
  .slice(0, 4);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const stats = [
  { icon: Flame, value: '50K+', label: 'Burgers vendidas' },
  { icon: Star, value: '4.8', label: 'Rating promedio' },
  { icon: Users, value: '12K+', label: 'Clientes felices' },
  { icon: Truck, value: '30 min', label: 'Delivery promedio' },
];

const testimonials = [
  { name: 'Marcos G.', text: 'La Vladi Clasica es la mejor hamburguesa que comi en mi vida. La salsa secreta es adictiva.', rating: 5, avatar: 'M' },
  { name: 'Lucia R.', text: 'La opcion veggie es increible, no pense que una hamburguesa vegana pudiera ser tan rica.', rating: 5, avatar: 'L' },
  { name: 'Diego F.', text: 'Armar tu propia burger es genial. Ya hice como 10 combinaciones distintas!', rating: 4, avatar: 'D' },
];

/* ---- Slide Variants ---- */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
};

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--bg-primary)] shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        <div className="relative h-56 w-full sm:h-64">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Name + price overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-white/80">{product.description}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          {/* Extras */}
          {product.extras.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Personaliza tu burger
              </h4>
              <div className="flex flex-col gap-2">
                {product.extras.map((extra) => {
                  const isSelected = selectedExtras.has(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all',
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[#FF6B35]/40',
                      )}
                    >
                      <div className="flex items-center gap-3">
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
                        <span className="font-medium text-[var(--text-primary)]">
                          {extra.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-muted)]">
                        +{formatPrice(extra.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Price + Add */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center text-[var(--text-muted)] hover:text-[#FF6B35]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center text-lg font-bold text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center text-[var(--text-muted)] hover:text-[#FF6B35]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Price */}
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
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---- Main Page ---- */

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedBurger, setSelectedBurger] = useState<Product | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide],
  );

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroBurgers.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(
      (prev) => (prev - 1 + heroBurgers.length) % heroBurgers.length,
    );
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || selectedBurger) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide, selectedBurger]);

  const currentBurger = heroBurgers[currentSlide];

  return (
    <div className="flex flex-col">
      {/* ====== Hero Burger Slider ====== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2a1508] to-[#3E2723]"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#F5CB5C]/10 blur-[100px]" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20 lg:py-24"
        >
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            {/* Left: Slider */}
            <div
              className="relative flex w-full flex-1 flex-col items-center"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* Main image container */}
              <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl shadow-black/40 sm:aspect-[16/10]">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSelectedBurger(currentBurger)}
                  >
                    {currentBurger.imageUrl ? (
                      <Image
                        src={currentBurger.imageUrl}
                        alt={currentBurger.name}
                        fill
                        priority
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 60vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#2a1508]">
                        <span className="text-8xl">🍔</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Text on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="mb-2 inline-block rounded-full bg-[#FF6B35]/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                          {currentBurger.stock > 0 && currentBurger.stock < 5
                            ? `Quedan ${currentBurger.stock}!`
                            : 'Destacada'}
                        </span>
                        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                          {currentBurger.name}
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-white/80 sm:text-base">
                          {currentBurger.description}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <span className="text-3xl font-extrabold text-[#FF6B35] drop-shadow sm:text-4xl">
                            {formatPrice(currentBurger.price)}
                          </span>
                          <span className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                            Toca para personalizar
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:h-12 sm:w-12"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:h-12 sm:w-12"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* Dot indicators */}
              <div className="mt-5 flex items-center gap-2.5">
                {heroBurgers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={cn(
                      'h-2.5 cursor-pointer rounded-full transition-all duration-300',
                      i === currentSlide
                        ? 'w-8 bg-[#FF6B35]'
                        : 'w-2.5 bg-white/30 hover:bg-white/50',
                    )}
                    aria-label={`Ir a burger ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Thumbnail previews + CTA */}
            <div className="flex w-full flex-1 flex-col gap-5 lg:max-w-sm">
              <h3 className="text-center text-lg font-bold text-white/60 lg:text-left">
                Nuestras estrellas
              </h3>

              {/* Burger thumbnails */}
              <div className="flex gap-3 lg:flex-col">
                {heroBurgers.map((burger, i) => (
                  <motion.button
                    key={burger.id}
                    onClick={() => {
                      goToSlide(i);
                      setSelectedBurger(null);
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border p-2.5 transition-all sm:p-3 lg:flex-initial',
                      i === currentSlide
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                    )}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16">
                      {burger.imageUrl ? (
                        <Image
                          src={burger.imageUrl}
                          alt={burger.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#2a1508] text-2xl">
                          🍔
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={cn(
                          'truncate text-sm font-bold sm:text-base',
                          i === currentSlide ? 'text-[#FF6B35]' : 'text-white',
                        )}
                      >
                        {burger.name}
                      </p>
                      <p className="text-sm font-semibold text-white/50">
                        {formatPrice(burger.price)}
                      </p>
                    </div>
                    {i === currentSlide && (
                      <motion.div
                        layoutId="thumb-indicator"
                        className="h-2 w-2 shrink-0 rounded-full bg-[#FF6B35]"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/menu" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full"
                    icon={<ArrowRight className="h-5 w-5" />}
                  >
                    Ver todo el menu
                  </Button>
                </Link>
                <Link href="/arma-tu-burger" className="flex-1">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    icon={<Flame className="h-5 w-5" />}
                  >
                    Arma tu Burger
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====== Featured Products ====== */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mb-10 text-center sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
              Mas del Menu
            </h2>
            <p className="mt-3 text-[var(--text-muted)]">
              Las hamburguesas mas pedidas por nuestros clientes
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <motion.div
            className="mt-8 text-center sm:mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/menu">
              <Button variant="secondary" size="lg">
                Ver menu completo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ====== Arma tu Burger Teaser ====== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#3E2723] to-[#5D4037] py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FF6B35]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-[#F5CB5C]/10 blur-3xl" />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:gap-12 md:flex-row">
          <motion.div
            className="flex-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Arma tu propia{' '}
              <span className="text-[#FF6B35]">Burger</span>
            </h2>
            <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
              Elegi el pan, la carne, los quesos, vegetales, salsas y toppings.
              Crea tu combinacion perfecta y compartila con la comunidad.
            </p>

            <motion.div
              className="mt-6 flex flex-wrap gap-2 sm:gap-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {['Pan Brioche', 'Carne 200g', 'Cheddar', 'Bacon', 'Salsa Vladi'].map(
                (item, i) => (
                  <motion.span
                    key={item}
                    variants={fadeUp}
                    custom={i}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/20"
                  >
                    {item}
                  </motion.span>
                ),
              )}
            </motion.div>

            <div className="mt-8">
              <Link href="/arma-tu-burger">
                <Button size="lg" icon={<Flame className="h-5 w-5" />}>
                  Empezar a crear
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex w-full flex-1 flex-col gap-3 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
              Creaciones de la comunidad
            </p>
            {mockCreations.slice(0, 3).map((creation, i) => (
              <motion.div
                key={creation.id}
                variants={fadeUp}
                custom={i + 1}
              >
                <Card className="border-white/10 bg-white/5 backdrop-blur transition-colors hover:bg-white/10">
                  <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/20 text-lg sm:h-12 sm:w-12 sm:text-xl">
                      🍔
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">
                        {creation.name}
                      </p>
                      <p className="truncate text-xs text-white/60 sm:text-sm">
                        por {creation.user?.name} &middot;{' '}
                        {creation.voteCount} votos
                      </p>
                    </div>
                    <span className="shrink-0 text-base font-bold text-[#FF6B35] sm:text-lg">
                      {formatPrice(creation.totalPrice)}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== Stats ====== */}
      <section className="bg-[var(--bg-primary)] py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-center shadow-sm sm:p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10 sm:h-14 sm:w-14">
                  <stat.icon className="h-6 w-6 text-[#FF6B35] sm:h-7 sm:w-7" />
                </div>
                <span className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-xs text-[var(--text-muted)] sm:text-sm">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Testimonials ====== */}
      <section className="bg-[var(--bg-tertiary)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.h2
            className="mb-10 text-center text-3xl font-extrabold text-[var(--text-primary)] sm:mb-12 sm:text-4xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Lo que dicen nuestros clientes
          </motion.h2>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#D62828] text-sm font-bold text-white">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {t.name}
                        </p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star
                              key={si}
                              className={`h-3.5 w-3.5 ${
                                si < t.rating
                                  ? 'fill-[#F5CB5C] text-[#F5CB5C]'
                                  : 'text-[var(--border-color)]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
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
