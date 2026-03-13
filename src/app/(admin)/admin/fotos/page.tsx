'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui';
import api from '@/lib/api';

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
  isApproved: boolean;
  likes: number;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminFotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    api.get('/photos/admin')
      .then((res) => setPhotos(res.data.data ?? []))
      .catch(() => setPhotos([]));
  }, []);

  async function handleApprove(id: string) {
    await api.patch(`/photos/${id}`, { isApproved: true });
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isApproved: true } : p)),
    );
  }

  async function handleReject(id: string) {
    await api.patch(`/photos/${id}`, { isApproved: false });
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isApproved: false } : p)),
    );
  }

  async function handleDelete(id: string) {
    await api.delete(`/photos/${id}`);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = photos.filter((p) => {
    if (filter === 'pending') return !p.isApproved;
    if (filter === 'approved') return p.isApproved;
    return true;
  });

  const pendingCount = photos.filter((p) => !p.isApproved).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Fotos de la Comunidad
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {pendingCount > 0
              ? `${pendingCount} foto${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''} de aprobacion`
              : 'Todas las fotos estan moderadas'}
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Aprobadas'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Camera className="h-12 w-12 text-[var(--text-muted)] opacity-40" />
          <p className="mt-4 text-[var(--text-muted)]">No hay fotos para mostrar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]"
            >
              <div
                className="aspect-square w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${photo.imageUrl})` }}
              />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {photo.user.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(photo.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      photo.isApproved
                        ? 'bg-emerald-600/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {photo.isApproved ? 'Aprobada' : 'Pendiente'}
                  </span>
                </div>

                {photo.caption && (
                  <p className="mb-2 text-xs text-[var(--text-secondary)] line-clamp-2">
                    {photo.caption}
                  </p>
                )}

                <div className="flex gap-2">
                  {!photo.isApproved && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(photo.id)}
                      icon={<Check className="h-3.5 w-3.5" />}
                    >
                      Aprobar
                    </Button>
                  )}
                  {photo.isApproved && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleReject(photo.id)}
                      icon={<X className="h-3.5 w-3.5" />}
                    >
                      Ocultar
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
