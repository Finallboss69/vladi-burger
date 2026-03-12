import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'En preparación',
    READY: 'Listo',
    DELIVERING: 'En camino',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PREPARING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    READY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DELIVERING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    DELIVERED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getVipColor(level: string): string {
  const colors: Record<string, string> = {
    BRONZE: 'text-amber-700',
    SILVER: 'text-gray-400',
    GOLD: 'text-yellow-500',
    PLATINUM: 'text-purple-500',
  };
  return colors[level] ?? 'text-gray-500';
}
