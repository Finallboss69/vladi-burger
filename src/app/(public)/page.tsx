'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Flame, Star, Users, Truck, Sparkles } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCreations } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

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
  {
    name: 'Marcos G.',
    text: 'La Vladi Clasica es la mejor hamburguesa que comi en mi vida. La salsa secreta es adictiva.',
    rating: 5,
    avatar: 'M',
  },
  {
    name: 'Lucia R.',
    text: 'La opcion veggie es increible, no pense que una hamburguesa vegana pudiera ser tan rica.',
    rating: 5,
    avatar: 'L',
  },
  {
    name: 'Diego F.',
    text: 'Armar tu propia burger es genial. Ya hice como 10 combinaciones distintas!',
    rating: 4,
    avatar: 'D',
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="flex flex-col">
      {/* ====== Hero ====== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] via-[#FFF0E0] to-[#FF6B35]/20 dark:from-[var(--bg-primary)] dark:via-[var(--bg-secondary)] dark:to-[#FF6B35]/10"
      >
        {/* Decorative circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#FF6B35]/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#F5CB5C]/20 blur-3xl"
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:gap-12 md:flex-row md:py-28 lg:py-32"
        >
          {/* Text */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.span
              className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/10 px-4 py-1.5 text-sm font-semibold text-[#FF6B35]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Nuevas creaciones cada semana
            </motion.span>

            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.1] text-[var(--text-primary)] sm:text-5xl lg:text-6xl xl:text-7xl">
              Hamburguesas que{' '}
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#D62828] bg-clip-text text-transparent">
                cuentan historias
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base text-[var(--text-secondary)] sm:text-lg md:mx-0">
              Ingredientes premium, recetas unicas y el sabor artesanal que nos
              hace diferentes. Pedi online o arma tu propia burger.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 md:justify-start">
              <Link href="/menu">
                <Button size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                  Ver Menu
                </Button>
              </Link>
              <Link href="/arma-tu-burger">
                <Button size="lg" variant="secondary">
                  Arma tu Burger
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            className="relative flex-1"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-3xl shadow-2xl sm:max-w-md">
              <Image
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
                alt="Vladi Burger destacada"
                fill
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 60vw, 50vw"
                className="object-cover"
              />
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating price badge */}
            <motion.div
              className="absolute -bottom-3 left-2 rounded-2xl bg-[var(--bg-secondary)] px-4 py-2.5 shadow-xl sm:-bottom-4 sm:-left-4 sm:px-5 sm:py-3 md:-left-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-[var(--text-muted)]">Desde</p>
              <p className="text-xl font-extrabold text-[#FF6B35] sm:text-2xl">
                {formatPrice(4500)}
              </p>
            </motion.div>

            {/* Floating rating badge */}
            <motion.div
              className="absolute -right-2 top-4 rounded-2xl bg-[var(--bg-secondary)] px-3 py-2 shadow-xl sm:-right-4 sm:top-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#F5CB5C] text-[#F5CB5C]" />
                <span className="text-sm font-bold text-[var(--text-primary)]">4.8</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">12K+ reviews</p>
            </motion.div>
          </motion.div>
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
              Nuestras Estrellas
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
                    {/* Header with avatar */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#D62828] text-sm font-bold text-white">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">{t.name}</p>
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
    </div>
  );
}
