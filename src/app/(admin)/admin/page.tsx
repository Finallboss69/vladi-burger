'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Star,
  Users,
  CalendarDays,
  Plus,
  ClipboardList,
  ChefHat,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn, formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';

interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgRating: number;
  activeCustomers: number;
  popularProducts: Array<{ name: string; count: number }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const defaultStats: DashboardStats = {
  ordersToday: 0,
  revenueToday: 0,
  revenueWeek: 0,
  revenueMonth: 0,
  avgRating: 0,
  activeCustomers: 0,
  popularProducts: [],
};

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => {
        const data = res.data.data;
        setDashboardStats(data ?? defaultStats);
        setRecentOrders(data?.recentOrders ?? []);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: 'Pedidos hoy',
      value: dashboardStats.ordersToday,
      format: (v: number) => v.toString(),
      icon: ShoppingBag,
      color: '#FF6B35',
      bg: 'bg-[#FF6B35]/10',
    },
    {
      label: 'Ingresos hoy',
      value: dashboardStats.revenueToday,
      format: formatPrice,
      icon: DollarSign,
      color: '#2D6A4F',
      bg: 'bg-[#2D6A4F]/10',
    },
    {
      label: 'Ingresos semana',
      value: dashboardStats.revenueWeek,
      format: formatPrice,
      icon: TrendingUp,
      color: '#F5CB5C',
      bg: 'bg-[#F5CB5C]/10',
    },
    {
      label: 'Ingresos mes',
      value: dashboardStats.revenueMonth,
      format: formatPrice,
      icon: CalendarDays,
      color: '#3E2723',
      bg: 'bg-[#3E2723]/10 dark:bg-[#F5CB5C]/10',
    },
    {
      label: 'Rating promedio',
      value: dashboardStats.avgRating,
      format: (v: number) => v.toFixed(1),
      icon: Star,
      color: '#F5CB5C',
      bg: 'bg-[#F5CB5C]/10',
    },
    {
      label: 'Clientes activos',
      value: dashboardStats.activeCustomers,
      format: (v: number) => v.toString(),
      icon: Users,
      color: '#D62828',
      bg: 'bg-[#D62828]/10',
    },
  ];

  const maxProductCount = Math.max(
    1,
    ...dashboardStats.popularProducts.map((p) => p.count),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      {/* Page Title */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Resumen general de Vladi.burger
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card hover={false} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl mb-3', stat.bg)}>
                    <Icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] truncate">
                    {stat.format(stat.value)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Products Chart */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Productos populares</h2>
              <p className="text-xs text-[var(--text-muted)]">Top productos del mes</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardStats.popularProducts.map((product, i) => {
                const percentage = (product.count / maxProductCount) * 100;
                const barColors = [
                  'bg-[#FF6B35]',
                  'bg-[#D62828]',
                  'bg-[#F5CB5C]',
                  'bg-[#2D6A4F]',
                  'bg-[#3E2723] dark:bg-[#8D6E63]',
                ];
                return (
                  <div key={product.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--text-primary)]">
                        {product.name}
                      </span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {product.count} vendidos
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', barColors[i % barColors.length])}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Pedidos recientes</h2>
                <p className="text-xs text-[var(--text-muted)]">Ultimos 5 pedidos</p>
              </div>
              <Link href="/admin/pedidos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35] font-bold text-sm shrink-0">
                    #{order.orderNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {formatPrice(order.total)}
                    </p>
                    <span className={cn('inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card hover={false}>
          <CardHeader>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Acciones rápidas</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/productos">
              <Button variant="primary" icon={<Plus className="h-5 w-5" />}>
                Nuevo producto
              </Button>
            </Link>
            <Link href="/admin/pedidos">
              <Button variant="secondary" icon={<ClipboardList className="h-5 w-5" />}>
                Ver pedidos
              </Button>
            </Link>
            <Link href="/cocina">
              <Button variant="secondary" icon={<ChefHat className="h-5 w-5" />}>
                Ir a cocina
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
