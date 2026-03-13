'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  Package,
  Navigation,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  FileText,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { formatPrice, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';
import { Role } from '@/types';

const AUTO_REFRESH_INTERVAL = 30_000;

function getTimeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hours < 24) {
    return remainMins > 0 ? `Hace ${hours}h ${remainMins}min` : `Hace ${hours}h`;
  }
  return `Hace ${Math.floor(hours / 24)}d`;
}

function buildMapsUrl(address: Order['address']): string | null {
  if (!address) return null;
  if (address.lat && address.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`;
  }
  const query = encodeURIComponent(
    `${address.street} ${address.number}, ${address.city}`,
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

function formatFullAddress(address: Order['address']): string {
  if (!address) return 'Sin direccion';
  const parts = [`${address.street} ${address.number}`];
  if (address.floor) parts.push(`Piso ${address.floor}`);
  if (address.apartment) parts.push(`Depto ${address.apartment}`);
  parts.push(address.city);
  return parts.join(', ');
}

export default function DeliveryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && user.role !== Role.DELIVERY && user.role !== Role.ADMIN) {
      addNotification({
        type: 'error',
        title: 'Acceso denegado',
        message: 'No tienes permisos para acceder a esta pagina.',
      });
      router.replace('/');
    }
  }, [isAuthenticated, user, router, addNotification]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders', {
        params: { status: 'READY,DELIVERING' },
      });
      setOrders(res.data.data ?? []);
      setLastRefresh(new Date());
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los pedidos.',
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (!user || (user.role !== Role.DELIVERY && user.role !== Role.ADMIN)) return;

    fetchOrders();

    intervalRef.current = setInterval(fetchOrders, AUTO_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchOrders]);

  // Time-since ticker (re-render every minute)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: 'DELIVERING' | 'DELIVERED',
  ) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      addNotification({
        type: 'success',
        title: 'Estado actualizado',
        message: `Pedido marcado como "${getStatusLabel(newStatus)}".`,
      });
      // Refresh list
      await fetchOrders();
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado del pedido.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Don't render until auth is checked
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user.role !== Role.DELIVERY && user.role !== Role.ADMIN) {
    return null;
  }

  const readyOrders = orders.filter((o) => o.status === 'READY');
  const deliveringOrders = orders.filter((o) => o.status === 'DELIVERING');

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
              <Truck className="h-6 w-6 text-[#FF6B35]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Entregas
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                {orders.length === 0
                  ? 'Sin pedidos pendientes'
                  : `${orders.length} pedido${orders.length !== 1 ? 's' : ''} activo${orders.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Ultima actualizacion:{' '}
          {lastRefresh.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          &middot; Auto-refresh cada 30s
        </p>
      </motion.div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-[var(--text-muted)]">Cargando pedidos...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[40vh] flex-col items-center justify-center text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
            <Package className="h-10 w-10 text-[var(--text-muted)]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
            No hay pedidos activos
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Los nuevos pedidos listos apareceran aqui automaticamente.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Ready orders section */}
          {readyOrders.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="success" size="md">
                  <Package className="h-3.5 w-3.5" />
                  Listos para retirar ({readyOrders.length})
                </Badge>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {readyOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      updatingId={updatingId}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Delivering orders section */}
          {deliveringOrders.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="info" size="md">
                  <Truck className="h-3.5 w-3.5" />
                  En camino ({deliveringOrders.length})
                </Badge>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {deliveringOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      updatingId={updatingId}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Order Card Component ─── */

interface OrderCardProps {
  order: Order;
  index: number;
  updatingId: string | null;
  onStatusUpdate: (
    orderId: string,
    status: 'DELIVERING' | 'DELIVERED',
  ) => Promise<void>;
}

function OrderCard({ order, index, updatingId, onStatusUpdate }: OrderCardProps) {
  const mapsUrl = buildMapsUrl(order.address);
  const isUpdating = updatingId === order.id;
  const isReady = order.status === 'READY';
  const isDelivering = order.status === 'DELIVERING';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        hover={false}
        className={
          isReady
            ? 'border-[#2D6A4F]/30 bg-[#2D6A4F]/5'
            : 'border-[#FF6B35]/30 bg-[#FF6B35]/5'
        }
      >
        <CardHeader>
          {/* Order header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${
                  isReady ? 'bg-[#2D6A4F]' : 'bg-[#FF6B35]'
                }`}
              >
                <Hash className="h-4 w-4" />
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--text-primary)]">
                  Pedido #{order.orderNumber}
                </span>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Clock className="h-3 w-3" />
                  {getTimeSince(order.createdAt)}
                </div>
              </div>
            </div>
            <Badge variant={isReady ? 'success' : 'info'} size="sm">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer info */}
          <div className="space-y-2">
            {order.user && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <User className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                <span className="font-medium">{order.user.name}</span>
              </div>
            )}
            {order.user?.phone && (
              <a
                href={`tel:${order.user.phone}`}
                className="flex items-center gap-2 text-sm text-[#FF6B35] hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>{order.user.phone}</span>
              </a>
            )}
          </div>

          {/* Address */}
          {order.address && (
            <div className="rounded-xl bg-[var(--bg-tertiary)] p-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D62828]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatFullAddress(order.address)}
                  </p>
                  {order.address.label && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {order.address.label}
                    </p>
                  )}
                </div>
              </div>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 rounded-lg bg-[#2D6A4F] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2D6A4F]/90"
                >
                  <Navigation className="h-4 w-4" />
                  Navegar con Google Maps
                </a>
              )}
            </div>
          )}

          {/* Order items */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              <Package className="h-3.5 w-3.5" />
              Items del pedido
            </p>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--text-secondary)]">
                    <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-primary)]">
                      {item.quantity}
                    </span>
                    {item.name}
                    {item.extras && item.extras.length > 0 && (
                      <span className="ml-1 text-xs text-[var(--text-muted)]">
                        (+{item.extras.map((e) => e.name).join(', ')})
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Total
            </span>
            <span className="text-lg font-bold text-[#FF6B35]">
              {formatPrice(order.total)}
            </span>
          </div>

          {/* Delivery notes */}
          {order.notes && (
            <div className="flex items-start gap-2 rounded-lg bg-[#F5CB5C]/10 p-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#F5CB5C]" />
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Notas del pedido
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {isReady && (
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={isUpdating}
                icon={<Truck className="h-5 w-5" />}
                onClick={() => onStatusUpdate(order.id, 'DELIVERING')}
              >
                Marcar en camino
              </Button>
            )}

            {isDelivering && (
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-[#2D6A4F] hover:bg-[#2D6A4F]/90"
                loading={isUpdating}
                icon={<CheckCircle className="h-5 w-5" />}
                onClick={() => onStatusUpdate(order.id, 'DELIVERED')}
              >
                Marcar entregado
              </Button>
            )}

            {order.user?.phone && (
              <a href={`tel:${order.user.phone}`} className="shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Phone className="h-5 w-5" />}
                />
              </a>
            )}

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Navigation className="h-5 w-5" />}
                />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
