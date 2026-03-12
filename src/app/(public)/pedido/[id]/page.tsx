'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import { mockOrders } from '@/lib/mock-data';
import type { OrderStatus } from '@/types';

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

export default function PedidoPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Use first mock order as data
  const order = mockOrders[0];

  // Simulate status progression
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const currentStepIdx = getStepIndex(currentStatus);

  // Simulate live status updates
  useEffect(() => {
    const statusOrder: OrderStatus[] = [
      'PENDING' as OrderStatus,
      'CONFIRMED' as OrderStatus,
      'PREPARING' as OrderStatus,
      'READY' as OrderStatus,
      'DELIVERING' as OrderStatus,
      'DELIVERED' as OrderStatus,
    ];

    let idx = statusOrder.indexOf(currentStatus);
    if (idx < 0 || idx >= statusOrder.length - 1) return;

    const timer = setInterval(() => {
      idx += 1;
      if (idx < statusOrder.length) {
        setCurrentStatus(statusOrder[idx]);
      }
      if (idx >= statusOrder.length - 1) {
        clearInterval(timer);
      }
    }, 8000);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

          {/* Map Placeholder (for delivery) */}
          {order.deliveryType === 'DELIVERY' && (
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
                      <div
                        key={i}
                        className="border border-[var(--border-color)]"
                      />
                    ))}
                  </div>
                </div>

                {/* Animated delivery pin */}
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                  }}
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

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
