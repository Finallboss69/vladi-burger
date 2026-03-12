'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  Globe,
  Award,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import { mockDashboardStats, mockOrders, mockKitchenOrders } from '@/lib/mock-data';

type TimeFilter = 'today' | 'week' | 'month';

const timeFilters: Array<{ key: TimeFilter; label: string }> = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

// Mock revenue by day of week
const revenueByDay = [
  { day: 'Lun', value: 180000 },
  { day: 'Mar', value: 145000 },
  { day: 'Mié', value: 210000 },
  { day: 'Jue', value: 195000 },
  { day: 'Vie', value: 320000 },
  { day: 'Sáb', value: 480000 },
  { day: 'Dom', value: 320000 },
];

// Orders by source
const allOrders = [...mockOrders, ...mockKitchenOrders];
const ordersBySource = [
  {
    source: 'WEB',
    label: 'Web',
    count: allOrders.filter((o) => o.source === 'WEB').length,
    color: '#FF6B35',
    extraCount: 28,
  },
  {
    source: 'RAPPI',
    label: 'Rappi',
    count: allOrders.filter((o) => o.source === 'RAPPI').length,
    color: '#D62828',
    extraCount: 12,
  },
  {
    source: 'PEDIDOSYA',
    label: 'PedidosYa',
    count: allOrders.filter((o) => o.source === 'PEDIDOSYA').length,
    color: '#F5CB5C',
    extraCount: 7,
  },
];

const totalSourceOrders = ordersBySource.reduce(
  (sum, s) => sum + s.count + s.extraCount,
  0,
);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AdminEstadisticas() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.value));

  const revenueMultiplier: Record<TimeFilter, number> = {
    today: 0.14,
    week: 1,
    month: 4.2,
  };

  const ordersMultiplier: Record<TimeFilter, number> = {
    today: 1,
    week: 7,
    month: 30,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 lg:pb-0"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Estadísticas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Análisis y métricas de rendimiento
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
          {timeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                timeFilter === f.key
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos',
            value: formatPrice(
              Math.round(mockDashboardStats.revenueWeek * revenueMultiplier[timeFilter]),
            ),
            icon: TrendingUp,
            color: '#2D6A4F',
            change: '+12.5%',
          },
          {
            label: 'Pedidos',
            value: Math.round(
              mockDashboardStats.ordersToday * ordersMultiplier[timeFilter],
            ).toString(),
            icon: ShoppingBag,
            color: '#FF6B35',
            change: '+8.3%',
          },
          {
            label: 'Ticket promedio',
            value: formatPrice(
              Math.round(
                (mockDashboardStats.revenueWeek * revenueMultiplier[timeFilter]) /
                  (mockDashboardStats.ordersToday * ordersMultiplier[timeFilter]),
              ),
            ),
            icon: Award,
            color: '#F5CB5C',
            change: '+3.2%',
          },
          {
            label: 'Clientes activos',
            value: Math.round(
              mockDashboardStats.activeCustomers * revenueMultiplier[timeFilter],
            ).toString(),
            icon: Globe,
            color: '#D62828',
            change: '+5.1%',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card hover={false}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs font-medium text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                  <p className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#FF6B35]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Ingresos por día
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Desglose semanal</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {revenueByDay.map((day, i) => {
                  const height = (day.value / maxRevenue) * 100;
                  const isToday = i === new Date().getDay() - 1;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
                        {formatPrice(Math.round(day.value * revenueMultiplier[timeFilter]))}
                      </span>
                      <div className="w-full relative" style={{ height: '140px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.08,
                            ease: 'easeOut',
                          }}
                          className={cn(
                            'absolute bottom-0 w-full rounded-t-lg',
                            isToday
                              ? 'bg-[#FF6B35]'
                              : 'bg-[#FF6B35]/30 dark:bg-[#FF6B35]/20',
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isToday
                            ? 'text-[#FF6B35]'
                            : 'text-[var(--text-muted)]',
                        )}
                      >
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders by Source */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#FF6B35]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Pedidos por fuente
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Distribución de canales</p>
            </CardHeader>
            <CardContent>
              {/* Donut-like display */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return ordersBySource.map((source) => {
                        const total = source.count + source.extraCount;
                        const percent = (total / totalSourceOrders) * 100;
                        const circumference = 2 * Math.PI * 40;
                        const dashLength = (percent / 100) * circumference;
                        const dashGap = circumference - dashLength;
                        const currentOffset = offset;
                        offset += percent;
                        return (
                          <motion.circle
                            key={source.source}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={source.color}
                            strokeWidth="12"
                            strokeDasharray={`${dashLength} ${dashGap}`}
                            strokeDashoffset={`${-(currentOffset / 100) * circumference}`}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{
                              strokeDasharray: `${dashLength} ${dashGap}`,
                            }}
                            transition={{
                              duration: 0.8,
                              delay: 0.2,
                              ease: 'easeOut',
                            }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {totalSourceOrders}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Total</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {ordersBySource.map((source) => {
                  const total = source.count + source.extraCount;
                  const percent = Math.round((total / totalSourceOrders) * 100);
                  return (
                    <div key={source.source} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm font-medium text-[var(--text-primary)] flex-1">
                        {source.label}
                      </span>
                      <span className="text-sm tabular-nums text-[var(--text-secondary)]">
                        {total} pedidos
                      </span>
                      <span className="text-sm font-bold tabular-nums text-[var(--text-primary)] w-12 text-right">
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div variants={item}>
        <Card hover={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#FF6B35]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Top productos
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Productos más vendidos</p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {mockDashboardStats.popularProducts.map((product, i) => {
                const medals = ['bg-[#F5CB5C]', 'bg-gray-300 dark:bg-gray-600', 'bg-amber-700'];
                return (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                        i < 3
                          ? `${medals[i]} text-[var(--bg-primary)]`
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {Math.round(product.count * revenueMultiplier[timeFilter])} vendidos
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
