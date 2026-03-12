'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Crown, Star, ShoppingBag,
  MapPin, Gift, LogOut, Edit3, Check, X,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { mockUser } from '@/lib/mock-data';
import { cn, getVipColor } from '@/lib/utils';
import type { VipLevel } from '@/types';

const vipThresholds: Record<string, { next: string | null; points: number; nextPoints: number }> = {
  BRONZE: { next: 'SILVER', points: 0, nextPoints: 200 },
  SILVER: { next: 'GOLD', points: 200, nextPoints: 500 },
  GOLD: { next: 'PLATINUM', points: 500, nextPoints: 1000 },
  PLATINUM: { next: null, points: 1000, nextPoints: 1000 },
};

const vipBgColors: Record<string, string> = {
  BRONZE: 'bg-amber-100 dark:bg-amber-900/30',
  SILVER: 'bg-gray-100 dark:bg-gray-800/50',
  GOLD: 'bg-yellow-100 dark:bg-yellow-900/30',
  PLATINUM: 'bg-purple-100 dark:bg-purple-900/30',
};

const quickLinks = [
  { href: '/cuenta/pedidos', icon: ShoppingBag, label: 'Mis Pedidos', desc: 'Historial y reorden' },
  { href: '/cuenta/direcciones', icon: MapPin, label: 'Direcciones', desc: 'Gestionar direcciones' },
  { href: '/cuenta/puntos', icon: Gift, label: 'Puntos', desc: 'Canjear recompensas' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CuentaPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const user = authUser ?? mockUser;
  const vip = vipThresholds[user.vipLevel] ?? vipThresholds.BRONZE;
  const progressPercent =
    vip.next === null
      ? 100
      : Math.min(100, ((user.loyaltyPoints - vip.points) / (vip.nextPoints - vip.points)) * 100);

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user.name);
  const [formPhone, setFormPhone] = useState(user.phone ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    addNotification({ type: 'success', title: 'Perfil actualizado', message: 'Tus datos se guardaron correctamente' });
    setSaving(false);
    setEditing(false);
  }

  function handleLogout() {
    logout();
    addNotification({ type: 'info', title: 'Sesion cerrada', message: 'Hasta la proxima!' });
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mi cuenta</h1>
          <p className="text-sm text-[var(--text-muted)]">Gestiona tu perfil y preferencias</p>
        </motion.div>

        {/* Profile card */}
        <motion.div variants={item}>
          <Card hover={false} className="overflow-hidden">
            {/* VIP banner */}
            <div className={cn(
              'flex items-center justify-between px-6 py-3',
              vipBgColors[user.vipLevel],
            )}>
              <div className="flex items-center gap-2">
                <Crown className={cn('h-5 w-5', getVipColor(user.vipLevel))} />
                <span className={cn('text-sm font-bold', getVipColor(user.vipLevel))}>
                  VIP {user.vipLevel}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-[#F5CB5C]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {user.loyaltyPoints} pts
                </span>
              </div>
            </div>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Nombre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      iconLeft={<User className="h-4 w-4" />}
                    />
                    <Input
                      label="Telefono"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      iconLeft={<Phone className="h-4 w-4" />}
                    />
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        loading={saving}
                        icon={<Check className="h-4 w-4" />}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditing(false); setFormName(user.name); setFormPhone(user.phone ?? ''); }}
                        icon={<X className="h-4 w-4" />}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                          <User className="h-8 w-8" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-lg font-bold text-[var(--text-primary)]">{user.name}</h2>
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                              <Phone className="h-3.5 w-3.5" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(true)}
                        icon={<Edit3 className="h-4 w-4" />}
                      >
                        Editar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loyalty progress */}
        <motion.div variants={item}>
          <Card hover={false} className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Progreso VIP</h3>
              {vip.next ? (
                <Badge variant="info" size="sm">
                  Siguiente: {vip.next}
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Nivel maximo!
                </Badge>
              )}
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F5CB5C]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
              <span>{user.loyaltyPoints} pts</span>
              {vip.next && <span>{vip.nextPoints} pts para {vip.next}</span>}
            </div>
          </Card>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={item}>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:border-[#FF6B35]/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{link.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{link.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item} className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            icon={<LogOut className="h-4 w-4" />}
            className="text-[#D62828] hover:bg-[#D62828]/10 hover:text-[#D62828]"
          >
            Cerrar sesion
          </Button>
        </motion.div>
      </motion.div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
