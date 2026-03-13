'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  Globe,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import api from '@/lib/api';

interface SourceData {
  source: string;
  label: string;
  count: number;
  color: string;
}

interface DayRevenue {
  day: string;
  value: number;
}

interface StatsData {
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgRating: number;
  activeCustomers: number;
  popularProducts: Array<{ name: string; count: number }>;
  ordersBySource: SourceData[];
  revenueByDay: DayRevenue[];
}

type TimeFilter = 'today' | 'week' | 'month';

const timeFilters: Array<{ key: TimeFilter; label: string }> = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const defaultStats: StatsData = {
  ordersToday: 0,
  ordersWeek: 0,
  ordersMonth: 0,
  revenueToday: 0,
  revenueWeek: 0,
  revenueMonth: 0,
  avgRating: 0,
  activeCustomers: 0,
  popularProducts: [],
  ordersBySource: [],
  revenueByDay: [],
};

export default function AdminEstadisticas() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [stats, setStats] = useState<StatsData>(defaultStats);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  const revenue = timeFilter === 'today' ? stats.revenueToday : timeFilter === 'week' ? stats.revenueWeek : stats.revenueMonth;
  const orders = timeFilter === 'today' ? stats.ordersToday : timeFilter === 'week' ? stats.ordersWeek : stats.ordersMonth;
  const avgTicket = orders > 0 ? Math.round(revenue / orders) : 0;

  const maxRevenue = Math.max(...(stats.revenueByDay.length > 0 ? stats.revenueByDay.map((d) => d.value) : [1]));
  const totalSourceOrders = stats.ordersBySource.reduce((sum, s) => sum + s.count, 0);

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

        <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
          {timeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
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
          { label: 'Ingresos', value: formatPrice(revenue), icon: TrendingUp, color: '#2D6A4F' },
          { label: 'Pedidos', value: orders.toString(), icon: ShoppingBag, color: '#FF6B35' },
          { label: 'Ticket promedio', value: formatPrice(avgTicket), icon: Award, color: '#F5CB5C' },
          { label: 'Clientes activos', value: stats.activeCustomers.toString(), icon: Globe, color: '#D62828' },
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
              <p className="text-xs text-[var(--text-muted)]">Semana actual</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {stats.revenueByDay.map((day, i) => {
                  const height = maxRevenue > 0 ? (day.value / maxRevenue) * 100 : 0;
                  const isToday = i === new Date().getDay();
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
                        {formatPrice(day.value)}
                      </span>
                      <div className="w-full relative" style={{ height: '140px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                          className={cn(
                            'absolute bottom-0 w-full rounded-t-lg',
                            isToday ? 'bg-[#FF6B35]' : 'bg-[#FF6B35]/30 dark:bg-[#FF6B35]/20',
                          )}
                        />
                      </div>
                      <span className={cn('text-xs font-medium', isToday ? 'text-[#FF6B35]' : 'text-[var(--text-muted)]')}>
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
              <div className="flex items-center justify-center mb-6">
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return stats.ordersBySource.map((source) => {
                        const percent = totalSourceOrders > 0 ? (source.count / totalSourceOrders) * 100 : 0;
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
                            animate={{ strokeDasharray: `${dashLength} ${dashGap}` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
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

              <div className="space-y-3">
                {stats.ordersBySource.map((source) => {
                  const percent = totalSourceOrders > 0 ? Math.round((source.count / totalSourceOrders) * 100) : 0;
                  return (
                    <div key={source.source} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                      <span className="text-sm font-medium text-[var(--text-primary)] flex-1">{source.label}</span>
                      <span className="text-sm tabular-nums text-[var(--text-secondary)]">{source.count} pedidos</span>
                      <span className="text-sm font-bold tabular-nums text-[var(--text-primary)] w-12 text-right">{percent}%</span>
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Top productos</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Productos más vendidos</p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.popularProducts.map((product, i) => {
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
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{product.count} vendidos</p>
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
