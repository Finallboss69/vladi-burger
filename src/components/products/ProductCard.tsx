'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatPrice, generateId } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      id: generateId(),
      product,
      name: product.name,
      price: product.price,
      quantity: 1,
      extras: [],
      imageUrl: product.imageUrl,
      isCustom: false,
    });

    addNotification({
      type: 'success',
      title: 'Agregado al carrito',
      message: `${product.name} se agrego a tu carrito`,
      duration: 2000,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={`/menu/${product.slug}`} className="block h-full">
        <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-200 hover:border-[#FF6B35]/30 hover:shadow-md">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--bg-tertiary)]">
                <span className="text-4xl">🍔</span>
              </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick add */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B35] text-white opacity-0 shadow-lg group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-[#e55e2e]"
              aria-label={`Agregar ${product.name}`}
            >
              <Plus className="h-4 w-4" />
            </motion.button>

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {isLowStock && (
                <Badge variant="lowStock" size="sm">
                  Quedan {product.stock}!
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="danger" size="sm">
                  Agotado
                </Badge>
              )}
              {product.isCombo && (
                <Badge variant="success" size="sm">
                  Combo
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1 sm:text-base">
              {product.name}
            </h3>
            <p className="mt-0.5 flex-1 text-xs text-[var(--text-muted)] line-clamp-2">
              {product.description}
            </p>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-base font-extrabold text-[#FF6B35] sm:text-lg">
                {formatPrice(product.price)}
              </span>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--bg-tertiary)] px-2.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[#FF6B35] hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
