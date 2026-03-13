'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Bell,
  BellOff,
  ChevronRight,
  Truck,
  Store,
  AlertTriangle,
  Package,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';

function getMinutesSince(dateStr: string): number {
  return Math.max(
    0,
    Math.round((Date.now() - new Date(dateStr).getTime()) / 60000),
  );
}

function getTimeColor(minutes: number): string {
  if (minutes < 5) return 'text-[#2D6A4F]';
  if (minutes < 10) return 'text-[#F5CB5C]';
  return 'text-[#D62828]';
}

function getTimeBgColor(minutes: number): string {
  if (minutes < 5) return 'bg-[#2D6A4F]/20 border-[#2D6A4F]/40';
  if (minutes < 10) return 'bg-[#F5CB5C]/20 border-[#F5CB5C]/40';
  return 'bg-[#D62828]/20 border-[#D62828]/40';
}

function getColumnColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'border-[#F5CB5C]/30';
    case 'PREPARING':
      return 'border-[#FF6B35]/30';
    case 'READY':
      return 'border-[#2D6A4F]/30';
    default:
      return 'border-[#333]';
  }
}

function getColumnHeaderColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-[#F5CB5C]/10 text-[#F5CB5C]';
    case 'PREPARING':
      return 'bg-[#FF6B35]/10 text-[#FF6B35]';
    case 'READY':
      return 'bg-[#2D6A4F]/10 text-[#2D6A4F]';
    default:
      return 'bg-[#333] text-white';
  }
}

const columnLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  READY: 'Listo para retirar',
};

const statusFlow: Record<string, OrderStatus | null> = {
  PENDING: 'PREPARING' as OrderStatus,
  PREPARING: 'READY' as OrderStatus,
  READY: null,
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [, setTick] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch kitchen orders from API
  useEffect(() => {
    function fetchOrders() {
      api.get('/orders?status=PENDING,PREPARING,READY')
        .then((res) => setOrders(res.data.data ?? []))
        .catch(() => {});
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render every 30s to update elapsed times
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);


  function playNotification() {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          'data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTIAAAAAAAAA//8AAAAAAAAAAAAA//8AAAAAAAAAAAAA//8AAAAAAAAAAAAA//8AAA==',
        );
      }
      audioRef.current.play().catch(() => {
        // Ignore play errors (user interaction required)
      });
    } catch {
      // Audio not supported
    }
  }

  const advanceStatus = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const nextStatus = statusFlow[o.status];
          if (!nextStatus) return o;
          api.patch(`/orders/${orderId}`, { status: nextStatus }).catch(() => {});
          if (soundEnabled && nextStatus === 'READY') {
            playNotification();
          }
          return { ...o, status: nextStatus, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [soundEnabled],
  );

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const columns = [
    { status: 'PENDING', orders: pendingOrders },
    { status: 'PREPARING', orders: preparingOrders },
    { status: 'READY', orders: readyOrders },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            Kitchen Display System
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#9E9E9E]">
            <span>{orders.length} pedidos activos</span>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            soundEnabled
              ? 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30'
              : 'bg-[#2D2D2D] text-[#9E9E9E] border border-[#333] hover:bg-[#3A3A3A]',
          )}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4" />
              Sonido ON
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" />
              Sonido OFF
            </>
          )}
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {columns.map((col) => (
          <div
            key={col.status}
            className={cn(
              'flex flex-col rounded-2xl border bg-[#222] overflow-hidden',
              getColumnColor(col.status),
            )}
          >
            {/* Column Header */}
            <div
              className={cn(
                'flex items-center justify-between px-4 py-3',
                getColumnHeaderColor(col.status),
              )}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  {columnLabels[col.status]}
                </h2>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                {col.orders.length}
              </span>
            </div>

            {/* Orders */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {col.orders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-[#555]"
                  >
                    <Package className="h-10 w-10 mb-2" />
                    <p className="text-sm">Sin pedidos</p>
                  </motion.div>
                ) : (
                  col.orders.map((order) => {
                    const minutes = getMinutesSince(order.createdAt);
                    const nextStatus = statusFlow[order.status];
                    const nextLabel =
                      order.status === 'PENDING'
                        ? 'Preparar'
                        : order.status === 'PREPARING'
                          ? 'Listo'
                          : null;
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={cn(
                          'rounded-xl border bg-[#2D2D2D] overflow-hidden transition-colors',
                          getTimeBgColor(minutes).split(' ')[1],
                        )}
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#3A3A3A]">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">
                              #{order.orderNumber}
                            </span>
                            {order.deliveryType === 'DELIVERY' ? (
                              <Truck className="h-4 w-4 text-[#9E9E9E]" />
                            ) : (
                              <Store className="h-4 w-4 text-[#9E9E9E]" />
                            )}
                            {order.source !== 'WEB' && (
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-1.5 py-0.5 rounded',
                                  order.source === 'RAPPI'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-red-500/20 text-red-400',
                                )}
                              >
                                {order.source}
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-1 text-sm font-mono font-bold tabular-nums',
                              getTimeColor(minutes),
                            )}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {minutes}m
                            {minutes >= 10 && (
                              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="px-3 py-2 space-y-1.5">
                          {order.items.map((orderItem) => (
                            <div key={orderItem.id} className="flex items-start gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#3A3A3A] text-xs font-bold text-white shrink-0 mt-0.5">
                                {orderItem.quantity}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white leading-tight">
                                  {orderItem.name}
                                </p>
                                {orderItem.extras && orderItem.extras.length > 0 && (
                                  <p className="text-xs text-[#9E9E9E]">
                                    + {orderItem.extras.map((e) => e.name).join(', ')}
                                  </p>
                                )}
                                {orderItem.notes && (
                                  <p className="text-xs text-[#F5CB5C] italic">
                                    &ldquo;{orderItem.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="mx-3 mb-2 p-2 rounded-lg bg-[#F5CB5C]/10 border border-[#F5CB5C]/20">
                            <p className="text-xs text-[#F5CB5C]">
                              <span className="font-bold">Nota:</span> {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        {nextStatus && nextLabel && (
                          <div className="px-3 pb-3">
                            <button
                              onClick={() => advanceStatus(order.id)}
                              className={cn(
                                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95',
                                order.status === 'PENDING'
                                  ? 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 shadow-lg shadow-[#FF6B35]/25'
                                  : 'bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]/90 shadow-lg shadow-[#2D6A4F]/25',
                              )}
                            >
                              {nextLabel}
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
