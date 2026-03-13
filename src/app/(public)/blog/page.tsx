'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import { useNotificationStore } from '@/stores/notification-store';
import type { BlogPost } from '@/types';

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const date = new Date(post.createdAt).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden p-0">
        {/* Image */}
        <div className="relative h-48 overflow-hidden sm:h-52">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${post.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.createdAt}>{date}</time>
          </div>

          <h2 className="text-lg font-bold leading-tight text-[var(--text-primary)] transition-colors group-hover:text-[#FF6B35] sm:text-xl">
            {post.title}
          </h2>

          <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3">
            {post.content}
          </p>

          <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#FF6B35] transition-all group-hover:gap-2">
            <span>Leer mas</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [publishedPosts, setPublishedPosts] = useState<BlogPost[]>([]);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    api.get('/blog')
      .then((res) => {
        const posts: BlogPost[] = res.data.data ?? [];
        setPublishedPosts(posts.filter((p) => p.isPublished));
      })
      .catch(() => setPublishedPosts([]));
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addNotification({
        type: 'error',
        title: 'Email requerido',
        message: 'Ingresa tu email para suscribirte',
        duration: 3000,
      });
      return;
    }
    addNotification({
      type: 'success',
      title: 'Suscripcion exitosa',
      message: 'Te enviamos un email de confirmacion. Gracias por suscribirte!',
      duration: 4000,
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#F5CB5C] py-12 text-white sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Blog Vladi
          </h1>
          <p className="mt-3 text-base text-white/80 sm:text-lg">
            Novedades, recetas y todo sobre el mundo burger
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
      </section>

      {/* Blog grid */}
      <section className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {publishedPosts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {publishedPosts.length === 0 && (
          <div className="py-20 text-center">
            <span className="text-5xl">📝</span>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Proximamente nuevos articulos.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-[var(--bg-secondary)] py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-lg px-4 text-center"
        >
          <span className="text-4xl">📬</span>
          <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
            No te pierdas nada
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Suscribite para recibir las ultimas novedades, promociones y recetas.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#FF6B35]/90 cursor-pointer"
            >
              Suscribirme
            </motion.button>
          </form>
        </motion.div>
      </section>

      {/* Mobile bottom spacing */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
