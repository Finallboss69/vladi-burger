'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  User, Mail, Phone, ShoppingBag,
  MapPin, Gift, LogOut, Edit3, Check, X,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';

const quickLinks = [
  { href: '/cuenta/pedidos', icon: ShoppingBag, label: 'Mis Pedidos', desc: 'Historial y reorden' },
  { href: '/cuenta/direcciones', icon: MapPin, label: 'Direcciones', desc: 'Gestionar direcciones' },
  { href: '/cuenta/puntos', icon: Gift, label: 'Tarjeta de Vladis', desc: 'Junta Vladis y gana premios' },
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

interface StampData {
  config: {
    stampsRequired: number;
    prizeName: string;
    prizeDescription: string;
    prizeDiscount: number;
  } | null;
  card: {
    stamps: number;
    completed: number;
    lastStampAt: string | null;
  } | null;
  canRedeem: boolean;
}

export default function CuentaPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const user = authUser;

  const [stampData, setStampData] = useState<StampData | null>(null);
  const [stampLoading, setStampLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user?.name ?? '');
  const [formPhone, setFormPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStamps() {
      try {
        const res = await api.get('/stamps');
        if (!cancelled) {
          setStampData(res.data?.data ?? res.data ?? null);
        }
      } catch {
        // Stamp data not available — leave null
      } finally {
        if (!cancelled) setStampLoading(false);
      }
    }
    if (user) fetchStamps();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    router.push('/login');
    return null;
  }

  const currentStamps = stampData?.card?.stamps ?? 0;
  const requiredStamps = stampData?.config?.stampsRequired ?? 10;
  const canRedeem = stampData?.canRedeem ?? false;
  const stampsRemaining = Math.max(0, requiredStamps - currentStamps);
  const stampProgress = requiredStamps > 0
    ? Math.min(100, (currentStamps / requiredStamps) * 100)
    : 0;

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/users/me', { name: formName, phone: formPhone });
      addNotification({ type: 'success', title: 'Perfil actualizado', message: 'Tus datos se guardaron correctamente' });
      setEditing(false);
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar el perfil' });
    } finally {
      setSaving(false);
    }
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
            {/* Vladis banner */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#FF6B35]/10">
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5 shrink-0">
                  <Image src="/logo.png" alt="Vladi" fill className="object-contain" sizes="20px" />
                </div>
                <span className="text-sm font-bold text-[#FF6B35]">
                  {currentStamps}/{requiredStamps} Vladis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[#FF6B35]/20">
                  <motion.div
                    className="h-full rounded-full bg-[#FF6B35]"
                    initial={{ width: 0 }}
                    animate={{ width: `${stampProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                {canRedeem && (
                  <Badge variant="success" size="sm">
                    Premio!
                  </Badge>
                )}
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

        {/* Vladis card progress */}
        <motion.div variants={item}>
          <Card hover={false} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Tarjeta de Vladis</h3>
              {canRedeem ? (
                <Badge variant="success" size="sm">
                  Premio disponible!
                </Badge>
              ) : (
                <Badge variant="info" size="sm">
                  {currentStamps}/{requiredStamps} Vladis
                </Badge>
              )}
            </div>

            {/* Vladis grid */}
            {!stampLoading && stampData?.config && (
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                {Array.from({ length: requiredStamps }).map((_, i) => {
                  const isFilled = i < currentStamps;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        isFilled
                          ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                          : 'border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <motion.div
                        className="relative h-7 w-7"
                        initial={isFilled ? { scale: 0, rotate: -20 } : {}}
                        animate={isFilled ? { scale: 1, rotate: 0 } : {}}
                        transition={isFilled ? { delay: 0.1 + i * 0.04 + 0.1, type: 'spring', stiffness: 400, damping: 15 } : {}}
                      >
                        <Image
                          src="/logo.png"
                          alt={isFilled ? 'Vladi completado' : `Vladi ${i + 1}`}
                          fill
                          className={`object-contain transition-all duration-500 ${
                            isFilled ? 'grayscale-0 opacity-100' : 'grayscale opacity-20'
                          }`}
                          sizes="28px"
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {stampLoading && (
              <div className="mb-4 flex justify-center">
                <div className="h-9 w-48 animate-pulse rounded-lg bg-[var(--bg-tertiary)]" />
              </div>
            )}

            {/* Progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F5CB5C]"
                initial={{ width: 0 }}
                animate={{ width: `${stampProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>

            {/* Status text */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">
                {canRedeem ? (
                  <span className="font-semibold text-[#2D6A4F]">
                    Canjea tu premio!
                  </span>
                ) : (
                  <span>
                    Te faltan <span className="font-semibold text-[#FF6B35]">{stampsRemaining} Vladis</span> para tu premio
                  </span>
                )}
              </span>
              <Link
                href="/cuenta/puntos"
                className="text-sm font-medium text-[#FF6B35] hover:underline"
              >
                Ver detalles
              </Link>
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
