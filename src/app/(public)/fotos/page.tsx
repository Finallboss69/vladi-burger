'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CustomerPhoto } from '@/types';

function PhotoGridItem({
  photo,
  index,
  onClick,
}: {
  photo: CustomerPhoto;
  index: number;
  onClick: () => void;
}) {
  const [likes, setLikes] = useState(photo.likes);
  const [hasLiked, setHasLiked] = useState(photo.hasLiked ?? false);

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    api.post(`/photos/${photo.id}/like`).catch(() => {});
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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl"
      onClick={onClick}
    >
      <div
        className="aspect-square w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${photo.imageUrl})` }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="p-4">
          {photo.caption && (
            <p className="mb-2 text-sm font-medium text-white">{photo.caption}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">{photo.user?.name}</span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                hasLiked
                  ? 'bg-[#D62828] text-white'
                  : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30',
              )}
            >
              <Heart
                className={cn('h-3.5 w-3.5', hasLiked && 'fill-current')}
              />
              {likes}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Always-visible like count on mobile */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-sm sm:hidden">
        <Heart
          className={cn(
            'h-3 w-3',
            hasLiked && 'fill-[#D62828] text-[#D62828]',
          )}
        />
        <span className="text-xs font-medium">{likes}</span>
      </div>
    </motion.div>
  );
}

function PhotoLightbox({
  photo,
  onClose,
}: {
  photo: CustomerPhoto;
  onClose: () => void;
}) {
  const [likes, setLikes] = useState(photo.likes);
  const [hasLiked, setHasLiked] = useState(photo.hasLiked ?? false);

  function handleLike() {
    api.post(`/photos/${photo.id}/like`).catch(() => {});
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-[var(--bg-secondary)]"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="aspect-video w-full max-w-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(${photo.imageUrl})` }}
        />

        <div className="flex items-center justify-between p-4">
          <div>
            {photo.caption && (
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {photo.caption}
              </p>
            )}
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              por {photo.user?.name} &middot;{' '}
              {new Date(photo.createdAt).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer',
              hasLiked
                ? 'bg-[#D62828] text-white'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[#D62828]/10 hover:text-[#D62828]',
            )}
          >
            <Heart className={cn('h-4 w-4', hasLiked && 'fill-current')} />
            {likes}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FotosPage() {
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/photos')
      .then((res) => setPhotos(res.data.data ?? []))
      .catch(() => setPhotos([]));
  }, []);

  async function handleUpload() {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      // Upload image to Cloudinary via our API
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadFile);
      });

      const uploadRes = await api.post('/upload', { image: base64 });
      const imageUrl = uploadRes.data.data?.url;
      if (!imageUrl) throw new Error('No image URL returned');

      // Create photo record
      const photoRes = await api.post('/photos', {
        imageUrl,
        caption: uploadCaption.trim() || null,
      });

      // Add to local state (pending approval)
      const newPhoto = photoRes.data.data;
      if (newPhoto) {
        setPhotos((prev) => [{ ...newPhoto, hasLiked: false }, ...prev]);
      }

      setShowUploadModal(false);
      setUploadCaption('');
      setUploadPreview(null);
      setUploadFile(null);
    } catch {
      // Could show error notification here
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setShowUploadModal(true);
  }

  const approvedPhotos = photos.filter((p) => p.isApproved);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#D62828] to-[#FF6B35] py-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <Camera className="mx-auto h-10 w-10 text-white/80" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Fotos de la Comunidad
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Los mejores momentos compartidos por nuestros clientes
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
      </section>

      {/* Upload CTA */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 sm:flex-row"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10">
              <Upload className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                Comparti tu foto
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Subi una foto de tu pedido y mostrala a la comunidad
              </p>
            </div>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              icon={<Camera className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Subir Foto
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Photo grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {approvedPhotos.map((photo, i) => (
              <PhotoGridItem
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
        </div>

        {approvedPhotos.length === 0 && (
          <div className="py-20 text-center">
            <span className="text-5xl">📸</span>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Todavia no hay fotos. Se el primero en compartir!
            </p>
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isUploading && setShowUploadModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--bg-secondary)] p-6"
            >
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Subir foto</h3>

              {uploadPreview && (
                <div
                  className="mb-4 aspect-video w-full rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${uploadPreview})` }}
                />
              )}

              <input
                type="text"
                placeholder="Agrega una descripcion (opcional)"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                className="mb-4 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#FF6B35]"
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadPreview(null);
                    setUploadFile(null);
                    setUploadCaption('');
                  }}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpload}
                  loading={isUploading}
                  disabled={isUploading}
                  icon={<Upload className="h-4 w-4" />}
                >
                  {isUploading ? 'Subiendo...' : 'Subir'}
                </Button>
              </div>

              <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                Tu foto sera revisada antes de publicarse
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoLightbox
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
