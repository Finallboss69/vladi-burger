'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Upload,
  X,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

interface CategoryForm {
  name: string;
  description: string;
  imageUrl: string;
}

const emptyForm: CategoryForm = { name: '', description: '', imageUrl: '' };

export default function AdminCategorias() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryData | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CategoryData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cat: CategoryData) {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      imageUrl: cat.imageUrl ?? '',
    });
    setModalOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'vladi-burger/categories');
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.data.url }));
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    };

    try {
      if (editing) {
        const res = await api.put(`/categories/${editing.id}`, payload);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editing.id ? { ...c, ...res.data.data } : c,
          ),
        );
      } else {
        const res = await api.post('/categories', payload);
        setCategories((prev) => [...prev, { ...res.data.data, productCount: 0 }]);
      }
    } catch {}

    setModalOpen(false);
    setForm(emptyForm);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/categories/${deleteConfirm.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
    } catch {}
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categorías</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {categories.length} categorías en total
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-5 w-5" />} onClick={openCreate}>
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="py-16 text-center">
          <Layers className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-muted)]">No hay categorías</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card hover className="overflow-hidden">
                  <div className="relative h-32 -mx-4 -mt-4 mb-3 overflow-hidden bg-[var(--bg-tertiary)]">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Layers className="h-10 w-10 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <CardContent>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{cat.name}</h3>
                      <Badge variant="info" size="sm">
                        {cat.productCount} prod.
                      </Badge>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                        {cat.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mb-3 font-mono">
                      /{cat.slug}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        icon={<Edit2 className="h-4 w-4" />}
                        onClick={() => openEdit(cat)}
                      >
                        Editar
                      </Button>
                      <button
                        onClick={() => setDeleteConfirm(cat)}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Eliminar categoría"
        description={
          deleteConfirm && deleteConfirm.productCount > 0
            ? `No se puede eliminar "${deleteConfirm.name}" porque tiene ${deleteConfirm.productCount} productos asociados.`
            : `¿Eliminar "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`
        }
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          {deleteConfirm && deleteConfirm.productCount === 0 && (
            <Button
              variant="primary"
              className="!bg-[#D62828] hover:!bg-[#B71C1C]"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          )}
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        description={editing ? 'Modifica los datos de la categoría' : 'Completá los datos'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Imagen</label>
            {form.imageUrl ? (
              <div className="relative h-32 rounded-xl overflow-hidden border border-[var(--border-color)]">
                <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className={cn(
                'flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-[var(--border-color)] cursor-pointer transition-colors',
                'hover:border-[#FF6B35] hover:bg-[#FF6B35]/5',
                uploading && 'pointer-events-none opacity-60',
              )}>
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-[#FF6B35] animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-[var(--text-muted)] mb-1" />
                    <span className="text-sm text-[var(--text-muted)]">Subir imagen</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <Input
            label="Nombre"
            placeholder="Ej: Hamburguesas"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la categoría..."
              rows={2}
              className={cn(
                'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1 resize-none',
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editing ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
