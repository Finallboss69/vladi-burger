'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { formatPrice, generateId } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { mockProducts } from '@/lib/mock-data';
import type { ProductExtra } from '@/types';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const product = mockProducts.find((p) => p.slug === params.slug);

  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return mockProducts
      .filter(
        (p) =>
          p.categoryId === product.categoryId &&
          p.id !== product.id &&
          p.isActive,
      )
      .slice(0, 4);
  }, [product]);

  const isLowStock = product ? product.stock > 0 && product.stock < 5 : false;
  const isOutOfStock = product ? product.stock === 0 : true;

  function toggleExtra(extraId: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(extraId)) {
        next.delete(extraId);
      } else {
        next.add(extraId);
      }
      return next;
    });
  }

  const chosenExtras: ProductExtra[] = product
    ? product.extras.filter((e) => selectedExtras.has(e.id))
    : [];
  const extrasTotal = chosenExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = product ? (product.price + extrasTotal) * quantity : 0;

  function handleAddToCart() {
    if (!product || isOutOfStock) return;

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

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-[var(--text-primary)]">
          Producto no encontrado
        </p>
        <Link href="/menu">
          <Button variant="secondary">Volver al menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back button */}
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al menu
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            className="relative aspect-square overflow-hidden rounded-3xl shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--bg-tertiary)]">
                <span className="text-7xl">🍔</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {isLowStock && (
                <Badge variant="lowStock">
                  Quedan {product.stock}!
                </Badge>
              )}
              {isOutOfStock && <Badge variant="danger">Agotado</Badge>}
              {product.isCombo && <Badge variant="success">Combo</Badge>}
            </div>
          </motion.div>

          {/* Product details */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {product.category && (
              <span className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#FF6B35]">
                {product.category.name}
              </span>
            )}

            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
              {product.description}
            </p>

            {/* Combo items */}
            {product.isCombo && product.comboItems && (
              <div className="mt-4 rounded-xl bg-[var(--bg-tertiary)] p-4">
                <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  Incluye:
                </p>
                <ul className="space-y-1">
                  {product.comboItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <Check className="h-4 w-4 text-[#2D6A4F]" />
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extras */}
            {product.extras.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Extras
                </h3>
                <div className="flex flex-col gap-2">
                  {product.extras.map((extra) => {
                    const isSelected = selectedExtras.has(extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                          isSelected
                            ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[#FF6B35]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                              isSelected
                                ? 'border-[#FF6B35] bg-[#FF6B35]'
                                : 'border-[var(--border-color)]'
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
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

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Quantity */}
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center text-lg font-bold text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                icon={
                  added ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )
                }
                onClick={handleAddToCart}
              >
                {added ? 'Agregado!' : `Agregar al carrito`}
              </Button>
            </div>

            {/* Total price */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-sm text-[var(--text-muted)]">Total:</span>
              <span className="text-3xl font-extrabold text-[#FF6B35]">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl font-extrabold text-[var(--text-primary)]">
              Tambien te puede gustar
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
