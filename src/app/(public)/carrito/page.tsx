'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Tag,
  X,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

const itemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -300, scale: 0.8, transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export default function CarritoPage() {
  const {
    items,
    couponCode,
    discount,
    subtotal,
    total,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Ingresa un codigo de cupon');
      return;
    }
    if (code === 'VLADI10' || code === 'BURGER20') {
      applyCoupon(code);
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Cupon invalido o expirado');
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ShoppingCart className="h-24 w-24 text-[var(--text-muted)] opacity-40" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35]/10"
            >
              <UtensilsCrossed className="h-5 w-5 text-[#FF6B35]" />
            </motion.div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Tu carrito esta vacio
            </h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Agrega tus hamburguesas favoritas y vuelve para hacer tu pedido
            </p>
          </div>

          <Link href="/menu">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />}>
              Ver menu
            </Button>
          </Link>
        </motion.div>

        {/* Mobile bottom nav spacer */}
        <div className="h-16 md:hidden" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <ShoppingCart className="h-7 w-7 text-[#FF6B35]" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Tu carrito</h1>
        <span className="rounded-full bg-[#FF6B35] px-3 py-0.5 text-sm font-semibold text-white">
          {items.reduce((sum, i) => sum + i.quantity, 0)}
        </span>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                exit="exit"
                className="flex gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-secondary)] sm:h-28 sm:w-28">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UtensilsCrossed className="h-8 w-8 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] leading-tight">
                      {item.name}
                    </h3>
                    {item.extras.length > 0 && (
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        + {item.extras.map((e) => e.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <span className="w-8 text-center font-semibold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Price + remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#FF6B35]">
                        {formatPrice(
                          (item.price + item.extras.reduce((s, e) => s + e.price, 0)) *
                            item.quantity,
                        )}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => removeItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-[#D62828] dark:hover:bg-red-900/20"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar: Coupon + Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          {/* Coupon */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#FF6B35]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Cupon de descuento</h3>
            </div>

            {couponCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between rounded-xl bg-[#2D6A4F]/10 px-4 py-3"
              >
                <div>
                  <span className="font-semibold text-[#2D6A4F]">{couponCode}</span>
                  <span className="ml-2 text-sm text-[#2D6A4F]/70">
                    -{formatPrice(discount)}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={removeCoupon}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#2D6A4F] hover:bg-[#2D6A4F]/20"
                  aria-label="Quitar cupon"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: VLADI10"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  error={couponError}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyCoupon();
                  }}
                />
                <Button variant="secondary" size="md" onClick={handleApplyCoupon}>
                  Aplicar
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Resumen del pedido</h3>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-between text-[#2D6A4F]"
                >
                  <span>Descuento</span>
                  <span>-{formatPrice(discount)}</span>
                </motion.div>
              )}

              <div className="border-t border-[var(--border-color)] pt-3">
                <div className="flex justify-between text-lg font-bold text-[var(--text-primary)]">
                  <span>Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.2, color: '#FF6B35' }}
                    animate={{ scale: 1, color: 'var(--text-primary)' }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatPrice(total)}
                  </motion.span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="mt-6 block">
              <Button size="lg" className="w-full" icon={<ArrowRight className="h-5 w-5" />}>
                Ir al checkout
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
