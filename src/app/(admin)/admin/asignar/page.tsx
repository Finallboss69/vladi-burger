'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  User,
  Check,
  Navigation,
  Circle,
  ArrowRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';

/* ── Types ─────────────────────────────────────────────── */

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  activeOrders: number;
}

interface RouteStop {
  orderId: string;
  orderNumber: number;
  address: string;
  sequence: number;
}

/* ── Component ─────────────────────────────────────────── */

export default function AdminAsignar() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[] | null>(null);

  /* ── Fetch ──────────────────────────────────────────── */

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    api.get('/orders?status=READY&deliveryType=DELIVERY&unassigned=true')
      .then((res) => setOrders(res.data.data ?? []))
      .catch(() => setOrders([]));
    api.get('/admin/drivers?active=true')
      .then((res) => setDrivers(res.data.data ?? []))
      .catch(() => setDrivers([]));
  }

  /* ── Derived ────────────────────────────────────────── */

  const readyOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'READY' && o.deliveryType === 'DELIVERY',
    );
  }, [orders]);

  /* ── Handlers ───────────────────────────────────────── */

  function toggleOrderSelection(orderId: string) {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
    setOptimizedRoute(null);
  }

  function selectDriver(driverId: string) {
    setSelectedDriver((prev) => (prev === driverId ? null : driverId));
    setOptimizedRoute(null);
  }

  async function handleAssign() {
    if (!selectedDriver || selectedOrders.size === 0) return;

    setAssigning(true);
    try {
      await api.post('/admin/orders/assign', {
        driverId: selectedDriver,
        orderIds: Array.from(selectedOrders),
      });

      // Remove assigned orders from list
      setOrders((prev) => prev.filter((o) => !selectedOrders.has(o.id)));

      // Update driver active orders count
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === selectedDriver
            ? { ...d, activeOrders: d.activeOrders + selectedOrders.size }
            : d,
        ),
      );

      setSelectedOrders(new Set());
      setSelectedDriver(null);
      setOptimizedRoute(null);
    } catch {
      // error
    }
    setAssigning(false);
  }

  async function handleOptimizeRoute() {
    if (!selectedDriver || selectedOrders.size === 0) return;

    setOptimizing(true);
    try {
      const res = await api.post('/admin/orders/optimize-route', {
        driverId: selectedDriver,
        orderIds: Array.from(selectedOrders),
      });
      setOptimizedRoute(res.data.data?.stops ?? []);
    } catch {
      // Fallback: create a simple sequential route from selected orders
      const stops: RouteStop[] = Array.from(selectedOrders).map((orderId, idx) => {
        const order = readyOrders.find((o) => o.id === orderId);
        return {
          orderId,
          orderNumber: order?.orderNumber ?? 0,
          address: order?.address
            ? `${order.address.street} ${order.address.number}, ${order.address.city}`
            : 'Direccion no disponible',
          sequence: idx + 1,
        };
      });
      setOptimizedRoute(stops);
    }
    setOptimizing(false);
  }

  function clearSelection() {
    setSelectedOrders(new Set());
    setSelectedDriver(null);
    setOptimizedRoute(null);
  }

  const canAssign = selectedDriver && selectedOrders.size > 0;

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Asignar Pedidos</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Asigna pedidos listos a repartidores disponibles
          </p>
        </div>
        <div className="flex gap-2">
          {(selectedOrders.size > 0 || selectedDriver) && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={clearSelection}
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={loadData}
          >
            Refrescar
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      <AnimatePresence>
        {canAssign && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card hover={false} className="border-[#FF6B35]/30 bg-[#FF6B35]/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="warning" size="sm">
                      {selectedOrders.size} pedido{selectedOrders.size !== 1 ? 's' : ''}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-[var(--text-muted)] hidden sm:block" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {drivers.find((d) => d.id === selectedDriver)?.name ?? 'Sin repartidor'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={
                        optimizing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Navigation className="h-4 w-4" />
                        )
                      }
                      onClick={handleOptimizeRoute}
                      disabled={optimizing}
                    >
                      Optimizar ruta
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={
                        assigning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )
                      }
                      onClick={handleAssign}
                      disabled={assigning}
                    >
                      Asignar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimized Route Result */}
      <AnimatePresence>
        {optimizedRoute && optimizedRoute.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card hover={false}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-[#2D6A4F]" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Ruta optimizada
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimizedRoute
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((stop, idx) => (
                      <div
                        key={stop.orderId}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold text-sm shrink-0">
                          {stop.sequence}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Pedido #{stop.orderNumber}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[var(--text-muted)]" />
                            <p className="text-xs text-[var(--text-muted)] truncate">
                              {stop.address}
                            </p>
                          </div>
                        </div>
                        {idx < optimizedRoute.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-[var(--text-muted)] shrink-0 hidden sm:block" />
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Layout: Orders + Drivers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Pedidos listos
            </h2>
            <Badge variant="warning" size="sm">
              {readyOrders.length}
            </Badge>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {readyOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <Package className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No hay pedidos listos para asignar
                  </p>
                </motion.div>
              ) : (
                readyOrders.map((order) => {
                  const isSelected = selectedOrders.has(order.id);
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => toggleOrderSelection(order.id)}
                        className="w-full text-left"
                      >
                        <Card
                          hover
                          className={cn(
                            'overflow-hidden transition-all duration-200',
                            isSelected &&
                              'ring-2 ring-[#FF6B35] border-[#FF6B35]/30 bg-[#FF6B35]/5',
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {/* Checkbox-like indicator */}
                              <div
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all shrink-0',
                                  isSelected
                                    ? 'bg-[#FF6B35] border-[#FF6B35] text-white'
                                    : 'border-[var(--border-color)] bg-[var(--bg-primary)]',
                                )}
                              >
                                {isSelected && <Check className="h-4 w-4" />}
                              </div>

                              {/* Order number */}
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] font-bold text-sm shrink-0">
                                #{order.orderNumber}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                                  {order.items
                                    .map((i) => `${i.quantity}x ${i.name}`)
                                    .join(', ')}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  {order.address && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-[var(--text-muted)]" />
                                      <span className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                                        {order.address.street} {order.address.number}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)]">
                                      {formatDate(order.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Total */}
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                  {formatPrice(order.total)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Drivers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-[#2D6A4F]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Repartidores disponibles
            </h2>
            <Badge variant="success" size="sm">
              {drivers.filter((d) => d.isActive).length}
            </Badge>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {drivers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <Truck className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No hay repartidores disponibles
                  </p>
                </motion.div>
              ) : (
                drivers.map((driver) => {
                  const isSelected = selectedDriver === driver.id;
                  return (
                    <motion.div
                      key={driver.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => selectDriver(driver.id)}
                        className="w-full text-left"
                        disabled={!driver.isActive}
                      >
                        <Card
                          hover
                          className={cn(
                            'overflow-hidden transition-all duration-200',
                            isSelected &&
                              'ring-2 ring-[#2D6A4F] border-[#2D6A4F]/30 bg-[#2D6A4F]/5',
                            !driver.isActive && 'opacity-50',
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {/* Radio-like indicator */}
                              <div
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0',
                                  isSelected
                                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                                    : 'border-[var(--border-color)] bg-[var(--bg-primary)]',
                                )}
                              >
                                {isSelected && <Check className="h-4 w-4" />}
                              </div>

                              {/* Avatar */}
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
                                <User className="h-5 w-5" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                    {driver.name}
                                  </h3>
                                  <Circle
                                    className={cn(
                                      'h-2 w-2 fill-current shrink-0',
                                      driver.isActive
                                        ? 'text-[#2D6A4F]'
                                        : 'text-[var(--text-muted)]',
                                    )}
                                  />
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {driver.phone || driver.email}
                                </p>
                              </div>

                              {/* Active orders */}
                              <div className="text-right shrink-0">
                                <div
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                                    driver.activeOrders === 0
                                      ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                                      : driver.activeOrders >= 3
                                        ? 'bg-[#D62828]/10 text-[#D62828]'
                                        : 'bg-[#F5CB5C]/10 text-[#F5CB5C]',
                                  )}
                                >
                                  <Package className="h-3 w-3" />
                                  {driver.activeOrders}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                  pedidos activos
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
