'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter, Badge, Button } from '@/components/ui';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/menu/${product.slug}`} className="block h-full">
        <Card className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-xl">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--bg-tertiary)]">
                <span className="text-4xl">🍔</span>
              </div>
            )}

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Quick add button on hover */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35] text-white opacity-0 shadow-lg shadow-[#FF6B35]/30 transition-all duration-300 group-hover:opacity-100 hover:bg-[#FF6B35]/90 cursor-pointer"
              aria-label={`Agregar ${product.name}`}
            >
              <Plus className="h-5 w-5" />
            </motion.button>

            {/* Badges overlay */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
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
          <CardContent className="flex flex-1 flex-col p-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1 sm:text-lg">
              {product.name}
            </h3>
            <p className="mt-1 flex-1 text-xs text-[var(--text-muted)] line-clamp-2 sm:text-sm">
              {product.description}
            </p>

            {product.extras.length > 0 && (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                +{product.extras.length} extras disponibles
              </p>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="justify-between border-t border-[var(--border-color)] px-4 py-3">
            <span className="text-lg font-extrabold text-[#FF6B35] sm:text-xl">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              variant={isOutOfStock ? 'secondary' : 'primary'}
              disabled={isOutOfStock}
              icon={<ShoppingCart className="h-4 w-4" />}
              onClick={handleAddToCart}
            >
              <span className="hidden sm:inline">Agregar</span>
              <span className="sm:hidden">+</span>
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
