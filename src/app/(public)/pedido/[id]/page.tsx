'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  MapPin,
  Home,
  UtensilsCrossed,
  ArrowLeft,
  Phone,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { Button, Badge, StarRating } from '@/components/ui';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';

const ORDER_STEPS: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    status: 'PENDING' as OrderStatus,
    label: 'Pendiente',
    icon: Clock,
    description: 'Tu pedido fue recibido',
  },
  {
    status: 'CONFIRMED' as OrderStatus,
    label: 'Confirmado',
    icon: CheckCircle2,
    description: 'El local confirmo tu pedido',
  },
  {
    status: 'PREPARING' as OrderStatus,
    label: 'En preparacion',
    icon: ChefHat,
    description: 'Tu pedido se esta preparando',
  },
  {
    status: 'READY' as OrderStatus,
    label: 'Listo',
    icon: Package,
    description: 'Tu pedido esta listo',
  },
  {
    status: 'DELIVERING' as OrderStatus,
    label: 'En camino',
    icon: Truck,
    description: 'Un repartidor lleva tu pedido',
  },
  {
    status: 'DELIVERED' as OrderStatus,
    label: 'Entregado',
    icon: Home,
    description: 'Pedido entregado. Buen provecho!',
  },
];

function getStepIndex(status: OrderStatus): number {
  const idx = ORDER_STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

function getEstimatedTime(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return '35-45 min';
    case 'CONFIRMED':
      return '30-40 min';
    case 'PREPARING':
      return '20-30 min';
    case 'READY':
      return '10-15 min';
    case 'DELIVERING':
      return '5-10 min';
    case 'DELIVERED':
      return 'Entregado';
    default:
      return '--';
  }
}

function getTimeSinceUpdate(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 10) return 'Ahora';
  if (secs < 60) return `Hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `Hace ${mins}m`;
  return `Hace ${Math.floor(mins / 60)}h`;
}

/* ---- Live Delivery Map ---- */

interface DeliveryLocationData {
  lat: number;
  lng: number;
  updatedAt: string;
}

function LiveDeliveryMap({
  orderId,
  deliveryAddress,
}: {
  orderId: string;
  deliveryAddress: Order['address'];
}) {
  const [location, setLocation] = useState<DeliveryLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      const res = await api.get('/delivery/location', {
        params: { orderId },
      });
      if (res.data.data) {
        setLocation(res.data.data);
      }
    } catch {
      // Silently ignore - will show fallback
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Poll every 5 seconds
  useEffect(() => {
    fetchLocation();
    pollRef.current = setInterval(fetchLocation, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchLocation]);

  // Update "time since" display every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !location) {
    return <FallbackMap />;
  }

  // Calculate driver position relative to destination for the SVG visualization
  const destLat = deliveryAddress?.lat ?? 0;
  const destLng = deliveryAddress?.lng ?? 0;
  const hasRealDest = destLat !== 0 && destLng !== 0;

  // Compute normalized positions on SVG canvas
  // Driver position and destination shown on a simplified map
  let driverX = 25;
  let driverY = 60;
  const destX = 75;
  const destY = 35;

  if (hasRealDest) {
    // Calculate relative offset between driver and destination
    const dLat = location.lat - destLat;
    const dLng = location.lng - destLng;
    // Scale: ~0.01 degree ~= 1km, map is roughly 4km across
    const scale = 25; // percentage per 0.01 degrees
    driverX = Math.max(8, Math.min(92, destX - dLng * scale * 100));
    driverY = Math.max(8, Math.min(92, destY + dLat * scale * 100));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm"
    >
      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#2D6A4F]/10 via-[var(--bg-secondary)] to-[#FF6B35]/10">
        {/* Map grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid h-full grid-cols-8 grid-rows-6">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-[var(--border-color)]" />
            ))}
          </div>
        </div>

        {/* SVG overlay for route and markers */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Route line */}
          <motion.line
            x1={`${driverX}%`}
            y1={`${driverY}%`}
            x2={`${destX}%`}
            y2={`${destY}%`}
            stroke="#FF6B35"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Driver marker - animated */}
        <motion.div
          animate={{
            left: `${driverX}%`,
            top: `${driverY}%`,
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute z-20"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[#FF6B35]"
            style={{ width: 48, height: 48, marginLeft: -8, marginTop: -8 }}
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg ring-4 ring-[#FF6B35]/20">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div className="mt-1 flex justify-center">
            <div className="h-2 w-6 rounded-full bg-black/10 blur-sm" />
          </div>
        </motion.div>

        {/* Restaurant marker */}
        {hasRealDest && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute z-10"
            style={{
              left: `${Math.max(8, Math.min(92, driverX + (destX - driverX) * 0.1))}%`,
              top: `${Math.max(8, Math.min(92, driverY + (destY - driverY) * 0.1))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D6A4F] shadow">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        )}

        {/* Destination marker */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute z-10"
          style={{
            left: `${destX}%`,
            top: `${destY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D62828] shadow-lg ring-4 ring-[#D62828]/20">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bar with live info */}
      <div className="flex items-center justify-between border-t border-[var(--border-color)] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2D6A4F] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2D6A4F]" />
            </span>
            <span className="font-medium text-[#2D6A4F]">En vivo</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Ultima actualizacion: {getTimeSinceUpdate(location.updatedAt)}
          </span>
        </div>
        <Button variant="ghost" size="sm" icon={<Phone className="h-4 w-4" />}>
          Contactar
        </Button>
      </div>
    </motion.div>
  );
}

/* ---- Fallback decorative map (no location data) ---- */
function FallbackMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm"
    >
      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#2D6A4F]/10 via-[var(--bg-secondary)] to-[#FF6B35]/10">
        {/* Stylized map grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid h-full grid-cols-8 grid-rows-6">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-[var(--border-color)]" />
            ))}
          </div>
        </div>

        {/* Animated delivery pin */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <div className="mt-1 h-3 w-8 rounded-full bg-black/10 blur-sm" />
        </motion.div>

        {/* Origin & destination dots */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute left-[20%] top-[60%] flex h-8 w-8 items-center justify-center rounded-full bg-[#2D6A4F] shadow"
        >
          <UtensilsCrossed className="h-4 w-4 text-white" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute right-[20%] top-[35%] flex h-8 w-8 items-center justify-center rounded-full bg-[#D62828] shadow"
        >
          <MapPin className="h-4 w-4 text-white" />
        </motion.div>

        {/* Dashed route */}
        <svg className="absolute inset-0 h-full w-full">
          <motion.line
            x1="25%"
            y1="62%"
            x2="75%"
            y2="38%"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ delay: 0.8, duration: 1 }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-color)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <MapPin className="h-4 w-4" />
          <span>Seguimiento en tiempo real</span>
        </div>
        <Button variant="ghost" size="sm" icon={<Phone className="h-4 w-4" />}>
          Contactar
        </Button>
      </div>
    </motion.div>
  );
}

/* ---- Review Modal ---- */
function ReviewModal({
  orderId,
  onClose,
  onSubmitted,
}: {
  orderId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', { orderId, rating, comment });
      addNotification({
        type: 'success',
        title: 'Gracias!',
        message: 'Tu resena fue enviada',
      });
      onSubmitted();
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar la resena',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35]/10">
            <MessageSquare className="h-7 w-7 text-[#FF6B35]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            Como estuvo tu pedido?
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Tu opinion nos ayuda a mejorar
          </p>
        </div>

        <div className="flex justify-center mb-5">
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conta tu experiencia... (opcional)"
          rows={3}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#FF6B35] transition-colors"
        />

        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Ahora no
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            loading={submitting}
            disabled={rating === 0 || submitting}
            icon={<Send className="h-4 w-4" />}
          >
            Enviar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PedidoPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('PENDING' as OrderStatus);
  const [showReview, setShowReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${orderId}`)
      .then((res) => {
        const data = res.data.data;
        setOrder(data);
        if (data) {
          setCurrentStatus(data.status);
          setHasReview(!!data.review);
          if (data.status === 'DELIVERED' && !data.review) {
            setShowReview(true);
          }
        }
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Poll for status updates
  useEffect(() => {
    if (!order) return;
    const timer = setInterval(() => {
      api.get(`/orders/${orderId}`)
        .then((res) => {
          const data = res.data.data;
          if (data) {
            const prevStatus = currentStatus;
            setCurrentStatus(data.status);
            // Show review modal when status changes to DELIVERED
            if (data.status === 'DELIVERED' && prevStatus !== 'DELIVERED' && !hasReview) {
              setShowReview(true);
            }
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [order, orderId, currentStatus, hasReview]);

  const currentStepIdx = getStepIndex(currentStatus);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--text-muted)]">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-[var(--text-primary)]">Pedido no encontrado</p>
        <Link href="/cuenta/pedidos">
          <Button variant="secondary">Ver mis pedidos</Button>
        </Link>
      </div>
    );
  }

  const isDelivering = currentStatus === ('DELIVERING' as OrderStatus);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/cuenta"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[#FF6B35]"
        >
          <ArrowLeft className="h-4 w-4" />
          Mis pedidos
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Pedido #{order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge className={getStatusColor(currentStatus)}>
            {getStatusLabel(currentStatus)}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          {/* Estimated time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 rounded-2xl bg-[#FF6B35]/10 p-5"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 3,
                repeat: currentStatus !== ('DELIVERED' as OrderStatus) ? Infinity : 0,
                ease: 'linear',
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/20"
            >
              <Clock className="h-7 w-7 text-[#FF6B35]" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-[#FF6B35]">Tiempo estimado</p>
              <motion.p
                key={currentStatus}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-[var(--text-primary)]"
              >
                {getEstimatedTime(currentStatus)}
              </motion.p>
            </div>
          </motion.div>

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-sm"
          >
            <h2 className="mb-6 text-lg font-bold text-[var(--text-primary)]">
              Estado del pedido
            </h2>

            <div className="relative">
              {ORDER_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIdx;
                const isCurrent = index === currentStepIdx;
                const isFuture = index > currentStepIdx;

                return (
                  <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Vertical line */}
                    {index < ORDER_STEPS.length - 1 && (
                      <div className="absolute left-5 top-12 h-[calc(100%-24px)] w-0.5">
                        <div className="h-full bg-[var(--border-color)]" />
                        <motion.div
                          animate={{
                            scaleY: isCompleted ? 1 : 0,
                          }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="absolute inset-0 origin-top bg-[#2D6A4F]"
                        />
                      </div>
                    )}

                    {/* Icon circle */}
                    <motion.div
                      animate={{
                        scale: isCurrent ? [1, 1.15, 1] : 1,
                        backgroundColor: isCompleted
                          ? '#2D6A4F'
                          : isCurrent
                            ? '#FF6B35'
                            : 'var(--bg-secondary)',
                      }}
                      transition={
                        isCurrent
                          ? { scale: { duration: 1.5, repeat: Infinity } }
                          : { duration: 0.3 }
                      }
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    >
                      <StepIcon
                        className={`h-5 w-5 ${
                          isFuture ? 'text-[var(--text-muted)]' : 'text-white'
                        }`}
                      />
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-[#FF6B35]"
                        />
                      )}
                    </motion.div>

                    {/* Text */}
                    <div className="pt-1.5">
                      <p
                        className={`font-semibold ${
                          isFuture
                            ? 'text-[var(--text-muted)]'
                            : isCurrent
                              ? 'text-[#FF6B35]'
                              : 'text-[#2D6A4F]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-sm ${
                          isFuture ? 'text-[var(--text-muted)] opacity-50' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Map - Live tracking for DELIVERING, fallback for other delivery statuses */}
          {order.deliveryType === 'DELIVERY' && (
            isDelivering ? (
              <LiveDeliveryMap
                orderId={orderId}
                deliveryAddress={order.address}
              />
            ) : (
              <FallbackMap />
            )
          )}
        </div>

        {/* Sidebar: Order details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start"
        >
          {/* Items */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Detalle del pedido</h3>

            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                    {item.product?.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.quantity}x {item.name}
                    </p>
                    {item.extras && item.extras.length > 0 && (
                      <p className="text-xs text-[var(--text-muted)]">
                        + {item.extras.map((e) => e.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatPrice(
                      (item.price + (item.extras?.reduce((s, e) => s + e.price, 0) ?? 0)) *
                        item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3">
                <p className="text-xs font-medium text-[var(--text-muted)]">Notas</p>
                <p className="text-sm text-[var(--text-primary)]">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-[#2D6A4F]">
                  <span className="flex items-center gap-1">
                    Descuento
                    {order.couponCode && (
                      <Badge variant="success" size="sm">
                        {order.couponCode}
                      </Badge>
                    )}
                  </span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--border-color)] pt-2 font-bold text-[var(--text-primary)]">
                <span>Total</span>
                <span className="text-[#FF6B35]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              {order.deliveryType === 'DELIVERY' ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span>
                {order.deliveryType === 'DELIVERY' ? 'Delivery' : 'Retiro en local'}
              </span>
            </div>
            {order.scheduledAt && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Clock className="h-4 w-4" />
                <span>Programado: {formatDate(order.scheduledAt)}</span>
              </div>
            )}
            {order.pointsEarned > 0 && (
              <div className="mt-3 rounded-lg bg-[#F5CB5C]/10 px-3 py-2">
                <p className="text-sm font-medium text-[#3E2723] dark:text-[#F5CB5C]">
                  +{order.pointsEarned} puntos Vladi
                </p>
              </div>
            )}
          </div>

          <Link href="/menu">
            <Button variant="secondary" className="w-full">
              Volver al menu
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Review button for delivered orders without review */}
      {currentStatus === ('DELIVERED' as OrderStatus) && !hasReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Button
            className="w-full"
            onClick={() => setShowReview(true)}
            icon={<MessageSquare className="h-4 w-4" />}
          >
            Dejar una resena
          </Button>
        </motion.div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <ReviewModal
            orderId={orderId}
            onClose={() => setShowReview(false)}
            onSubmitted={() => {
              setShowReview(false);
              setHasReview(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
