'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft, Gift, PartyPopper, Ticket,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
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

export default function PuntosPage() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [data, setData] = useState<StampData | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stamps')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRedeem() {
    setRedeeming(true);
    try {
      const res = await api.post('/stamps');
      const result = res.data.data;
      setCouponCode(result.couponCode);
      setData((prev) =>
        prev
          ? {
              ...prev,
              card: prev.card
                ? {
                    ...prev.card,
                    stamps: result.stampsRemaining,
                    completed: result.timesCompleted,
                  }
                : prev.card,
              canRedeem: false,
            }
          : prev,
      );
      addNotification({
        type: 'success',
        title: 'Premio canjeado!',
        message: `Tu codigo de cupon es: ${result.couponCode}`,
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo canjear el premio',
      });
    } finally {
      setRedeeming(false);
    }
  }

  const config = data?.config;
  const card = data?.card;
  const stamps = card?.stamps ?? 0;
  const required = config?.stampsRequired ?? 5;
  const filledStamps = Math.min(stamps, required);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B35] border-t-transparent" />
        </div>
      </div>
    );
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
        <motion.div variants={item} className="flex items-center gap-3">
          <Link href="/cuenta">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarjeta de Vladis</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {config?.prizeDescription ?? 'Junta tus Vladis y gana premios'}
            </p>
          </div>
        </motion.div>

        {!config ? (
          <motion.div variants={item}>
            <Card hover={false}>
              <CardContent className="p-8 text-center">
                <div className="relative mx-auto mb-3 h-12 w-12 opacity-40 grayscale">
                  <Image src="/logo.png" alt="Vladi" fill className="object-contain" sizes="48px" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  El programa de Vladis no esta disponible en este momento
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Stamp Card Visual */}
            <motion.div variants={item}>
              <Card hover={false} className="overflow-hidden">
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#D62828] p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white/80">Tus Vladis</p>
                      <p className="text-3xl font-black">
                        {filledStamps} / {required}
                      </p>
                    </div>
                    <div className="relative h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm p-1.5">
                      <Image src="/logo.png" alt="Vladi" fill className="object-contain drop-shadow-lg" sizes="56px" />
                    </div>
                  </div>
                  <p className="text-sm text-white/70">
                    {stamps >= required
                      ? 'Tenes suficientes Vladis para canjear tu premio!'
                      : `Te faltan ${required - stamps} ${required - stamps === 1 ? 'Vladi' : 'Vladis'} para tu premio`}
                  </p>
                </div>

                {/* Visual Vladis grid */}
                <CardContent className="p-5">
                  <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: required }).map((_, i) => {
                      const isFilled = i < filledStamps;
                      const isPrize = i === required - 1;
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                          className={cn(
                            'relative flex aspect-square items-center justify-center rounded-xl border-2 transition-all',
                            isFilled
                              ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                              : 'border-dashed border-[var(--border-color)] bg-[var(--bg-tertiary)]/50',
                            isPrize && !isFilled && 'border-[#F5CB5C] bg-[#F5CB5C]/5',
                          )}
                        >
                          {isPrize && !isFilled ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <Gift className="h-5 w-5 text-[#F5CB5C]/60" />
                              <span className="text-[8px] font-bold text-[#F5CB5C]/60">PREMIO</span>
                            </div>
                          ) : (
                            <motion.div
                              className="relative h-[70%] w-[70%]"
                              initial={isFilled ? { scale: 0, rotate: -30 } : { scale: 1 }}
                              animate={isFilled ? { scale: 1, rotate: 0 } : { scale: 1 }}
                              transition={isFilled ? { delay: i * 0.08 + 0.15, type: 'spring', stiffness: 400, damping: 15 } : {}}
                            >
                              <Image
                                src="/logo.png"
                                alt={isFilled ? 'Vladi completado' : `Vladi ${i + 1}`}
                                fill
                                className={cn(
                                  'object-contain transition-all duration-500',
                                  isFilled
                                    ? 'grayscale-0 opacity-100 drop-shadow-md'
                                    : 'grayscale opacity-25',
                                )}
                                sizes="80px"
                              />
                              {isFilled && isPrize && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: i * 0.08 + 0.3, type: 'spring' }}
                                  className="absolute -right-1 -top-1"
                                >
                                  <Gift className="h-4 w-4 text-[#F5CB5C] drop-shadow-sm" />
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F5CB5C]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(filledStamps / required) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prize info */}
            <motion.div variants={item}>
              <Card hover={false}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5CB5C]/20">
                      <Gift className="h-6 w-6 text-[#F5CB5C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--text-primary)]">{config.prizeName}</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {config.prizeDescription}
                      </p>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {config.prizeDiscount === 100
                          ? 'Completamente gratis'
                          : `${config.prizeDiscount}% de descuento`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Redeem button */}
            {data?.canRedeem && !couponCode && (
              <motion.div variants={item}>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRedeem}
                  loading={redeeming}
                  icon={<PartyPopper className="h-5 w-5" />}
                >
                  Canjear premio
                </Button>
              </motion.div>
            )}

            {/* Coupon code display */}
            {couponCode && (
              <motion.div
                variants={item}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card hover={false} className="overflow-hidden">
                  <div className="bg-[#2D6A4F] p-6 text-center text-white">
                    <PartyPopper className="mx-auto mb-2 h-10 w-10" />
                    <h3 className="text-lg font-bold">Felicitaciones!</h3>
                    <p className="text-sm text-white/80 mt-1">
                      Tu cupon de premio esta listo
                    </p>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2D6A4F] bg-[#2D6A4F]/5 p-4">
                      <Ticket className="h-5 w-5 text-[#2D6A4F]" />
                      <span className="text-xl font-black tracking-widest text-[#2D6A4F]">
                        {couponCode}
                      </span>
                    </div>
                    <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
                      Usa este codigo en tu proximo pedido. Valido por 30 dias.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div variants={item}>
              <div className="grid grid-cols-2 gap-4">
                <Card hover={false}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-black text-[#FF6B35]">{stamps}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Vladis juntados</p>
                  </CardContent>
                </Card>
                <Card hover={false}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-black text-[#2D6A4F]">{card?.completed ?? 0}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Premios canjeados</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div variants={item}>
              <Card hover={false}>
                <CardContent className="p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-3">Como funciona?</h3>
                  <div className="space-y-3">
                    {[
                      { step: '1', text: 'Hace tu pedido de burgers como siempre' },
                      { step: '2', text: `Junta ${required} Vladis con cada compra` },
                      { step: '3', text: `Canjea tu premio: ${config.prizeName}` },
                      { step: '4', text: 'Usa el cupon en tu proximo pedido (pedilo con una hamburguesa!)' },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10 text-sm font-bold text-[#FF6B35]">
                          {s.step}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {card?.completed && card.completed > 0 ? (
              <motion.div variants={item}>
                <div className="text-center">
                  <Badge variant="success" size="md">
                    Ya canjeaste {card.completed} {card.completed === 1 ? 'premio' : 'premios'}!
                  </Badge>
                </div>
              </motion.div>
            ) : null}
          </>
        )}
      </motion.div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
