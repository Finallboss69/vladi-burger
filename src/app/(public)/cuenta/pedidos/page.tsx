'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, ChevronUp, ShoppingBag,
  Clock, RotateCcw, Hash, Package,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Order, CartItem } from '@/types';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addNotification = useNotificationStore((s) => s.addNotification);

  function handleReorder() {
    for (const orderItem of order.items) {
      const cartItem: CartItem = {
        id: `reorder-${orderItem.id}-${Date.now()}`,
        name: orderItem.name,
        price: orderItem.price,
        quantity: orderItem.quantity,
        extras: orderItem.extras ?? [],
        isCustom: orderItem.isCustom,
      };
      addItem(cartItem);
    }
    addNotification({
      type: 'success',
      title: 'Agregado al carrito',
      message: `Los items del pedido #${order.orderNumber} se agregaron al carrito`,
    });
  }

  const itemsSummary = order.items
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(', ');

  return (
    <Card hover={false} className="overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--bg-tertiary)]/50"
      >
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6B35]/10 text-[#FF6B35]">
              <Hash className="h-4 w-4" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(order.createdAt)}
          </div>

          <Badge
            className={cn('w-fit', getStatusColor(order.status))}
            size="sm"
          >
            {getStatusLabel(order.status)}
          </Badge>

          <span className="font-semibold text-[var(--text-primary)]">
            {formatPrice(order.total)}
          </span>
        </div>

        <div className="ml-2 text-[var(--text-muted)]">
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Summary line when collapsed */}
      {!expanded && (
        <div className="border-t border-[var(--border-color)] px-4 py-2">
          <p className="truncate text-sm text-[var(--text-muted)]">
            {itemsSummary}
          </p>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border-color)] p-4">
              {/* Items list */}
              <div className="flex flex-col gap-3">
                {order.items.map((orderItem) => {
                  const extrasTotal = (orderItem.extras ?? []).reduce(
                    (sum, e) => sum + e.price,
                    0,
                  );
                  return (
                    <div
                      key={orderItem.id}
                      className="flex items-center justify-between rounded-xl bg-[var(--bg-tertiary)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {orderItem.quantity}x {orderItem.name}
                          </p>
                          {(orderItem.extras ?? []).length > 0 && (
                            <p className="text-xs text-[var(--text-muted)]">
                              + {(orderItem.extras ?? []).map((e) => e.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {formatPrice((orderItem.price + extrasTotal) * orderItem.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-4 flex flex-col gap-1 border-t border-[var(--border-color)] pt-3">
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-[#2D6A4F]">
                    <span>Descuento {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1">
                  {order.deliveryType === 'DELIVERY' ? 'Delivery' : 'Retiro en local'}
                </span>
                <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1">
                  +{order.pointsEarned} pts ganados
                </span>
                {order.notes && (
                  <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1">
                    Nota: {order.notes}
                  </span>
                )}
              </div>

              {/* Reorder button */}
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleReorder}
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  Volver a pedir
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.data ?? []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center gap-3">
          <Link href="/cuenta">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis pedidos</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-4 py-16"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
              <ShoppingBag className="h-10 w-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-lg font-medium text-[var(--text-muted)]">
              Todavia no hiciste ningun pedido
            </p>
            <Link href="/menu">
              <Button>Ver menu</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <motion.div key={order.id} variants={item}>
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
