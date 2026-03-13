'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  FileText,
  Calendar,
  Image,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { BlogPost } from '@/types';

interface BlogForm {
  title: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

const emptyForm: BlogForm = {
  title: '',
  content: '',
  imageUrl: '',
  isPublished: false,
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);

  useEffect(() => {
    api.get('/admin/blog')
      .then((res) => setPosts(res.data.data ?? []))
      .catch(() => setPosts([]));
  }, []);

  function togglePublished(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    api.put(`/admin/blog/${postId}`, { isPublished: !post.isPublished }).catch(() => {});
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isPublished: !p.isPublished } : p,
      ),
    );
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl ?? '',
      isPublished: post.isPublished,
    });
    setShowForm(true);
  }

  function deletePost(postId: string) {
    api.delete(`/admin/blog/${postId}`).catch(() => {});
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      isPublished: form.isPublished,
    };

    try {
      if (editingPost) {
        const res = await api.put(`/admin/blog/${editingPost.id}`, payload);
        const updated = res.data.data;
        setPosts((prev) =>
          prev.map((p) => (p.id === editingPost.id ? { ...p, ...updated } : p)),
        );
      } else {
        const res = await api.post('/admin/blog', payload);
        const newPost = res.data.data;
        setPosts((prev) => [newPost, ...prev]);
      }
    } catch {
      // error handled silently
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingPost(null);
  }

  function updateField(field: keyof BlogForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Blog</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gestiona los articulos del blog
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingPost(null);
              setForm(emptyForm);
            } else {
              setEditingPost(null);
              setForm(emptyForm);
              setShowForm(true);
            }
          }}
        >
          {showForm ? 'Cancelar' : 'Nuevo articulo'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card hover={false}>
              <CardHeader>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {editingPost ? 'Editar articulo' : 'Crear articulo'}
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Titulo"
                      placeholder="Ej: La mejor hamburguesa del mundo"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      required
                      iconLeft={<FileText className="h-4 w-4" />}
                    />

                    <Input
                      label="URL de imagen"
                      placeholder="https://..."
                      value={form.imageUrl}
                      onChange={(e) => updateField('imageUrl', e.target.value)}
                      iconLeft={<Image className="h-4 w-4" />}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      Contenido
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) => updateField('content', e.target.value)}
                      placeholder="Escribe el contenido del articulo..."
                      required
                      rows={6}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-y"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('isPublished', !form.isPublished)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                        form.isPublished
                          ? 'text-[#2D6A4F] bg-[#2D6A4F]/10'
                          : 'text-[var(--text-muted)] bg-[var(--bg-tertiary)]',
                      )}
                    >
                      {form.isPublished ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                      {form.isPublished ? 'Publicado' : 'Borrador'}
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowForm(false);
                        setForm(emptyForm);
                        setEditingPost(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingPost ? 'Guardar cambios' : 'Crear articulo'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Table */}
      <Card hover={false}>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Titulo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        'transition-colors hover:bg-[var(--bg-tertiary)]',
                        !post.isPublished && 'opacity-60',
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#FF6B35] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium text-[var(--text-primary)] block truncate max-w-xs">
                              {post.title}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] block truncate max-w-xs">
                              {post.content.slice(0, 80)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {post.isPublished ? (
                          <Badge variant="success" size="sm">Publicado</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Borrador</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => togglePublished(post.id)}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              post.isPublished
                                ? 'text-[#2D6A4F] hover:bg-[#2D6A4F]/10'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]',
                            )}
                            title={post.isPublished ? 'Despublicar' : 'Publicar'}
                          >
                            {post.isPublished ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[var(--border-color)]">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'p-4 space-y-3',
                    !post.isPublished && 'opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-5 w-5 text-[#FF6B35] shrink-0" />
                      <span className="font-medium text-[var(--text-primary)] truncate">
                        {post.title}
                      </span>
                    </div>
                    {post.isPublished ? (
                      <Badge variant="success" size="sm">Publicado</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Borrador</Badge>
                    )}
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {post.content.slice(0, 120)}...
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Fecha</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Slug</p>
                      <p className="font-mono text-xs text-[var(--text-primary)] truncate">
                        {post.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openEdit(post)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[#FF6B35] bg-[#FF6B35]/10 transition-colors hover:bg-[#FF6B35]/20"
                    >
                      <Edit2 className="h-4 w-4" /> Editar
                    </button>
                    <button
                      onClick={() => togglePublished(post.id)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        post.isPublished
                          ? 'text-[#2D6A4F] bg-[#2D6A4F]/10'
                          : 'text-[var(--text-muted)] bg-[var(--bg-tertiary)]',
                      )}
                    >
                      {post.isPublished ? (
                        <>
                          <ToggleRight className="h-4 w-4" /> Publicado
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" /> Borrador
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[#D62828] bg-[#D62828]/10 transition-colors hover:bg-[#D62828]/20"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {posts.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-[var(--text-muted)]">No hay articulos creados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
