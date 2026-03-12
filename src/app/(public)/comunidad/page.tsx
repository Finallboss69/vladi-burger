'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, ChefHat, Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';
import { mockCreations, mockPhotos } from '@/lib/mock-data';
import { cn, formatPrice } from '@/lib/utils';
import type { BurgerCreation, CustomerPhoto } from '@/types';

function CreationCard({ creation }: { creation: BurgerCreation }) {
  const [votes, setVotes] = useState(creation.voteCount ?? 0);
  const [hasVoted, setHasVoted] = useState(creation.hasVoted ?? false);

  function handleVote() {
    if (hasVoted) {
      setVotes((v) => v - 1);
      setHasVoted(false);
    } else {
      setVotes((v) => v + 1);
      setHasVoted(true);
    }
  }

  return (
    <Card className="flex flex-col gap-4 overflow-hidden">
      {/* Burger emoji hero */}
      <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#F5CB5C]/10">
        <motion.span
          className="text-6xl"
          initial={{ rotate: -10 }}
          whileHover={{ rotate: 10, scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          🍔
        </motion.span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {creation.name}
          </h3>
          <Badge variant="success" size="sm">
            {formatPrice(creation.totalPrice)}
          </Badge>
        </div>
        {creation.description && (
          <p className="text-sm text-[var(--text-secondary)]">
            {creation.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
            <ChefHat className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            por <span className="font-medium text-[var(--text-primary)]">{creation.user?.name}</span>
          </span>
        </div>
      </div>

      {/* Vote */}
      <div className="mt-auto flex items-center justify-between border-t border-[var(--border-color)] pt-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleVote}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer',
            hasVoted
              ? 'bg-[#FF6B35] text-white'
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35]',
          )}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={hasVoted ? 'voted' : 'not-voted'}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <ThumbsUp className={cn('h-4 w-4', hasVoted && 'fill-current')} />
            </motion.span>
          </AnimatePresence>
          <span>{votes}</span>
        </motion.button>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date(creation.createdAt).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
    </Card>
  );
}

function PhotoCard({ photo }: { photo: CustomerPhoto }) {
  const [likes, setLikes] = useState(photo.likes);
  const [hasLiked, setHasLiked] = useState(photo.hasLiked ?? false);

  function handleLike() {
    if (hasLiked) {
      setLikes((l) => l - 1);
      setHasLiked(false);
    } else {
      setLikes((l) => l + 1);
      setHasLiked(true);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl"
    >
      <div
        className="aspect-square w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${photo.imageUrl})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <p className="text-sm font-medium text-white">{photo.caption}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-white/70">{photo.user?.name}</span>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm transition-colors hover:bg-white/30 cursor-pointer"
          >
            <Heart
              className={cn('h-3.5 w-3.5', hasLiked && 'fill-[#D62828] text-[#D62828]')}
            />
            <span className="text-xs font-medium">{likes}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ComunidadPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3E2723] to-[#2D6A4F] py-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Comunidad Vladi
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Compartimos la pasion por las burgers. Vota, inspira y crea.
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
      </section>

      {/* Creaciones */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Creaciones de la Comunidad
            </h2>
            <p className="mt-1 text-[var(--text-secondary)]">
              Las mejores burgers creadas por nuestros fans
            </p>
          </div>
          <Link href="/arma-tu-burger">
            <Button icon={<ArrowRight className="h-4 w-4" />}>
              Arma la tuya
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockCreations.map((creation, i) => (
            <motion.div
              key={creation.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <CreationCard creation={creation} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fotos */}
      <section className="bg-[var(--bg-secondary)] py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Fotos de Clientes
              </h2>
              <p className="mt-1 text-[var(--text-secondary)]">
                Momentos deliciosos compartidos por nuestra comunidad
              </p>
            </div>
            <Link href="/fotos">
              <Button variant="secondary" icon={<Camera className="h-4 w-4" />}>
                Ver todas
              </Button>
            </Link>
          </motion.div>

          {/* Masonry-style grid */}
          <div className="columns-2 gap-4 sm:columns-3">
            {mockPhotos.map((photo, i) => (
              <div key={photo.id} className="mb-4 break-inside-avoid">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PhotoCard photo={photo} />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md"
        >
          <span className="text-5xl">🔥</span>
          <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
            Crea tu propia obra maestra
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Usa nuestro builder para armar la burger de tus suenos y compartila con la comunidad.
          </p>
          <Link href="/arma-tu-burger">
            <Button size="lg" className="mt-6">
              Arma tu Burger
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Mobile bottom spacing */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
