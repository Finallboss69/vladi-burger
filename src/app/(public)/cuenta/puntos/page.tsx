'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Crown, Star, Gift, Trophy,
  ShoppingBag, Sparkles, Clock, Check,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { mockUser, mockRewards } from '@/lib/mock-data';
import { cn, getVipColor } from '@/lib/utils';

const levels = [
  { name: 'BRONZE', points: 0, icon: Star, color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' },
  { name: 'SILVER', points: 200, icon: Crown, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800/50', border: 'border-gray-300 dark:border-gray-600' },
  { name: 'GOLD', points: 500, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-400 dark:border-yellow-600' },
  { name: 'PLATINUM', points: 1000, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-400 dark:border-purple-600' },
];

const mockHistory = [
  { id: 'h1', date: '2026-03-10', description: 'Pedido #1001', points: 116, type: 'earned' as const },
  { id: 'h2', date: '2026-03-08', description: 'Pedido #998', points: 85, type: 'earned' as const },
  { id: 'h3', date: '2026-03-05', description: 'Canje: Papas Gratis', points: -200, type: 'redeemed' as const },
  { id: 'h4', date: '2026-03-02', description: 'Pedido #985', points: 142, type: 'earned' as const },
  { id: 'h5', date: '2026-02-28', description: 'Pedido #972', points: 95, type: 'earned' as const },
  { id: 'h6', date: '2026-02-25', description: 'Bonus bienvenida', points: 50, type: 'earned' as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PuntosPage() {
  const authUser = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const user = authUser ?? mockUser;

  const [points, setPoints] = useState(user.loyaltyPoints);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const currentLevelIndex = levels.findIndex((l, i) => {
    const next = levels[i + 1];
    return !next || points < next.points;
  });
  const currentLevel = levels[currentLevelIndex] ?? levels[0];
  const nextLevel = levels[currentLevelIndex + 1];

  const progressPercent = nextLevel
    ? Math.min(100, ((points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100)
    : 100;

  async function handleRedeem(rewardId: string, cost: number, rewardName: string) {
    if (points < cost) {
      addNotification({ type: 'warning', title: 'Puntos insuficientes', message: `Necesitas ${cost - points} puntos mas` });
      return;
    }

    setRedeeming(rewardId);
    await new Promise((r) => setTimeout(r, 800));
    setPoints((p) => p - cost);
    addNotification({ type: 'success', title: 'Canje exitoso!', message: `Canjeaste: ${rewardName}` });
    setRedeeming(null);
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
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis puntos</h1>
            <p className="text-sm text-[var(--text-muted)]">Programa de lealtad Vladi.burger</p>
          </div>
        </motion.div>

        {/* Points display */}
        <motion.div variants={item}>
          <Card hover={false} className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#D62828] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Tus puntos</p>
                  <motion.p
                    key={points}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black"
                  >
                    {points}
                  </motion.p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Gift className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* VIP level badge */}
              <div className="mt-4 flex items-center gap-2">
                <currentLevel.icon className="h-5 w-5" />
                <span className="font-bold">Nivel {currentLevel.name}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="p-4">
              {nextLevel ? (
                <>
                  <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{currentLevel.name} ({currentLevel.points} pts)</span>
                    <span>{nextLevel.name} ({nextLevel.points} pts)</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F5CB5C]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                    Te faltan <span className="font-bold text-[#FF6B35]">{nextLevel.points - points}</span> puntos para {nextLevel.name}
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <Badge variant="success" size="md">
                    Nivel maximo alcanzado!
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* VIP levels roadmap */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Niveles VIP</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {levels.map((level) => {
              const isActive = level.name === currentLevel.name;
              const isAchieved = points >= level.points;
              return (
                <Card
                  key={level.name}
                  hover={false}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 text-center transition-all',
                    isActive && `ring-2 ring-[#FF6B35] ${level.bg}`,
                    !isActive && isAchieved && level.bg,
                    !isAchieved && 'opacity-50',
                  )}
                >
                  <level.icon className={cn('h-6 w-6', level.color)} />
                  <p className={cn('text-sm font-bold', level.color)}>
                    {level.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {level.points} pts
                  </p>
                  {isActive && (
                    <Badge variant="warning" size="sm">Actual</Badge>
                  )}
                  {isAchieved && !isActive && (
                    <Check className="h-4 w-4 text-[#2D6A4F]" />
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Available rewards */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Recompensas disponibles</h2>
          <div className="flex flex-col gap-4">
            {mockRewards.map((reward) => {
              const canRedeem = points >= reward.pointsCost;
              const isRedeeming = redeeming === reward.id;
              return (
                <motion.div key={reward.id} variants={item}>
                  <Card hover={false} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      {reward.imageUrl && (
                        <div className="relative h-32 w-full shrink-0 sm:h-auto sm:w-36">
                          <img
                            src={reward.imageUrl}
                            alt={reward.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg-secondary)] sm:bg-gradient-to-l" />
                        </div>
                      )}
                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                        <div>
                          <h3 className="font-bold text-[var(--text-primary)]">{reward.name}</h3>
                          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{reward.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-[#F5CB5C]" />
                            <span className="font-bold text-[var(--text-primary)]">
                              {reward.pointsCost} pts
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRedeem(reward.id, reward.pointsCost, reward.name)}
                            disabled={!canRedeem}
                            loading={isRedeeming}
                            icon={<Gift className="h-4 w-4" />}
                          >
                            {canRedeem ? 'Canjear' : 'Puntos insuficientes'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Points history */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Historial de puntos</h2>
          <Card hover={false} className="divide-y divide-[var(--border-color)] p-0 overflow-hidden">
            {mockHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-tertiary)]/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    entry.type === 'earned'
                      ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                      : 'bg-[#FF6B35]/10 text-[#FF6B35]',
                  )}>
                    {entry.type === 'earned' ? (
                      <ShoppingBag className="h-4 w-4" />
                    ) : (
                      <Gift className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock className="h-3 w-3" />
                      {entry.date}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  'text-sm font-bold',
                  entry.points > 0 ? 'text-[#2D6A4F]' : 'text-[#D62828]',
                )}>
                  {entry.points > 0 ? '+' : ''}{entry.points} pts
                </span>
              </div>
            ))}
          </Card>
        </motion.div>
      </motion.div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
