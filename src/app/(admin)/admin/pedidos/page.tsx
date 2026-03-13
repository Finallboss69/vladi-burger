'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Package,
  ArrowRight,
  Truck,
  Store,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  cn,
  formatPrice,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';

type FilterTab = 'ALL' | string;

const filterTabs: Array<{ key: FilterTab; label: string }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendiente' },
  { key: 'PREPARING', label: 'Preparando' },
  { key: 'READY', label: 'Listo' },
  { key: 'DELIVERED', label: 'Entregado' },
  { key: 'CANCELLED', label: 'Cancelado' },
];

const statusFlow: Record<string, OrderStatus | null> = {
  PENDING: 'PREPARING' as OrderStatus,
  CONFIRMED: 'PREPARING' as OrderStatus,
  PREPARING: 'READY' as OrderStatus,
  READY: 'DELIVERING' as OrderStatus,
  DELIVERING: 'DELIVERED' as OrderStatus,
  DELIVERED: null,
  CANCELLED: null,
};

const sourceLabels: Record<string, { label: string; color: string }> = {
  WEB: { label: 'Web', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  RAPPI: { label: 'Rappi', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  PEDIDOSYA: { label: 'PedidosYa', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

export default function AdminPedidos() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setAllOrders(res.data.data ?? []))
      .catch(() => setAllOrders([]));
  }, []);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let result = allOrders;

    if (activeFilter !== 'ALL') {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toString().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [allOrders, activeFilter, searchQuery]);

  function advanceStatus(orderId: string) {
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) return;
    const nextStatus = statusFlow[order.status];
    if (!nextStatus) return;
    api.patch(`/orders/${orderId}`, { status: nextStatus }).catch(() => {});
    setAllOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return { ...o, status: nextStatus, updatedAt: new Date().toISOString() };
      }),
    );
  }

  function cancelOrder(orderId: string) {
    api.patch(`/orders/${orderId}`, { status: 'CANCELLED' }).catch(() => {});
    setAllOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return { ...o, status: 'CANCELLED' as OrderStatus, updatedAt: new Date().toISOString() };
      }),
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pedidos</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Gestiona todos los pedidos del local
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar por # de orden o producto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconLeft={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filterTabs.map((tab) => {
          const count =
            tab.key === 'ALL'
              ? allOrders.length
              : allOrders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeFilter === tab.key
                  ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Package className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-[var(--text-muted)]">
                No hay pedidos con este filtro
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const nextStatus = statusFlow[order.status];
              const source = sourceLabels[order.source];
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card hover={false} className="overflow-hidden">
                    {/* Row */}
                    <button
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                      className="w-full text-left"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Order Number */}
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] font-bold text-sm shrink-0">
                            #{order.orderNumber}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-[140px]">
                            <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                              <span className="text-xs text-[var(--text-muted)]">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Items count */}
                          <div className="hidden sm:block text-center px-3">
                            <p className="text-xs text-[var(--text-muted)]">Items</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">
                              {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                            </p>
                          </div>

                          {/* Source */}
                          {source && (
                            <span
                              className={cn(
                                'hidden md:inline-flex text-xs px-2 py-0.5 rounded-full font-medium',
                                source.color,
                              )}
                            >
                              {source.label}
                            </span>
                          )}

                          {/* Total */}
                          <div className="text-right min-w-[80px]">
                            <p className="text-sm font-bold text-[var(--text-primary)]">
                              {formatPrice(order.total)}
                            </p>
                          </div>

                          {/* Status */}
                          <span
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap',
                              getStatusColor(order.status),
                            )}
                          >
                            {getStatusLabel(order.status)}
                          </span>

                          {/* Expand icon */}
                          <div className="shrink-0 text-[var(--text-muted)]">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-[var(--border-color)] pt-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Items List */}
                              <div>
                                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                                  Detalle de items
                                </h4>
                                <div className="space-y-2">
                                  {order.items.map((orderItem) => (
                                    <div
                                      key={orderItem.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-primary)]"
                                    >
                                      <div>
                                        <span className="text-sm text-[var(--text-primary)]">
                                          {orderItem.quantity}x {orderItem.name}
                                        </span>
                                        {orderItem.extras && orderItem.extras.length > 0 && (
                                          <p className="text-xs text-[var(--text-muted)]">
                                            + {orderItem.extras.map((e) => e.name).join(', ')}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                                        {formatPrice(orderItem.price * orderItem.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-3 pt-3 border-t border-dashed border-[var(--border-color)] space-y-1">
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
                                  <div className="flex justify-between text-sm font-bold text-[var(--text-primary)]">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Order Info */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                                  Información del pedido
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    {order.deliveryType === 'DELIVERY' ? (
                                      <Truck className="h-4 w-4 text-[var(--text-muted)]" />
                                    ) : (
                                      <Store className="h-4 w-4 text-[var(--text-muted)]" />
                                    )}
                                    <span className="text-[var(--text-secondary)]">
                                      {order.deliveryType === 'DELIVERY'
                                        ? 'Delivery'
                                        : 'Retira en local'}
                                    </span>
                                  </div>
                                  {source && (
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-[var(--text-muted)]" />
                                      <span className="text-[var(--text-secondary)]">
                                        Fuente: {source.label}
                                      </span>
                                    </div>
                                  )}
                                  {order.notes && (
                                    <div className="p-2 rounded-lg bg-[#F5CB5C]/10 border border-[#F5CB5C]/30">
                                      <p className="text-xs font-medium text-[#F5CB5C] mb-0.5">
                                        Notas:
                                      </p>
                                      <p className="text-sm text-[var(--text-primary)]">
                                        {order.notes}
                                      </p>
                                    </div>
                                  )}
                                  {order.scheduledAt && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                                      <span className="text-[var(--text-secondary)]">
                                        Programado: {formatDate(order.scheduledAt)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {nextStatus && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => advanceStatus(order.id)}
                                      icon={<ArrowRight className="h-4 w-4" />}
                                    >
                                      Pasar a {getStatusLabel(nextStatus)}
                                    </Button>
                                  )}
                                  {order.status !== 'CANCELLED' &&
                                    order.status !== 'DELIVERED' && (
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => cancelOrder(order.id)}
                                      >
                                        Cancelar
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
