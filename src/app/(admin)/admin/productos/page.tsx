'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Category } from '@/types';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  stock: '',
  imageUrl: '',
};

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/products?active=false')
      .then((res) => setProducts(res.data.data ?? []))
      .catch(() => setProducts([]));
    api.get('/categories')
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.categoryId === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, categoryFilter, search]);

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      imageUrl: product.imageUrl ?? '',
    });
    setModalOpen(true);
  }

  function toggleActive(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    api.patch(`/products/${productId}`, { isActive: !product.isActive }).catch(() => {});
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isActive: !p.isActive } : p,
      ),
    );
  }

  async function deleteProduct(productId: string) {
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      // error
    }
    setDeleteConfirm(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'vladi-burger/products');
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.data.url }));
    } catch {
      // error
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.categoryId) return;

    const category = categories.find((c) => c.id === form.categoryId);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      categoryId: form.categoryId,
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
    };

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct.id}`, payload);
        const updated = res.data.data;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...updated, category: category ?? p.category }
              : p,
          ),
        );
      } else {
        const res = await api.post('/products', payload);
        const newProduct = res.data.data;
        setProducts((prev) => [{ ...newProduct, category }, ...prev]);
      }
    } catch {
      // error handled silently
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingProduct(null);
  }

  function updateField(field: keyof ProductForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Productos</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {products.length} productos en total
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-5 w-5" />} onClick={openCreate}>
          Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              categoryFilter === 'all'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                categoryFilter === cat.id
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-muted)]">
            No se encontraron productos
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  hover
                  className={cn(
                    'overflow-hidden relative',
                    !product.isActive && 'opacity-60',
                  )}
                >
                  {/* Image */}
                  <div className="relative h-40 -mx-4 -mt-4 mb-3 overflow-hidden bg-[var(--bg-tertiary)]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-[var(--text-muted)]" />
                      </div>
                    )}
                    {!product.isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                          INACTIVO
                        </span>
                      </div>
                    )}
                    {product.isCombo && (
                      <span className="absolute top-2 left-2 rounded-full bg-[#F5CB5C] px-2 py-0.5 text-xs font-bold text-[#3E2723]">
                        COMBO
                      </span>
                    )}
                  </div>

                  <CardContent>
                    <p className="text-xs text-[var(--text-muted)] mb-1">
                      {product.category?.name ?? 'Sin categoría'}
                    </p>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-sm font-bold text-[#FF6B35] shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        Stock:{' '}
                        <span
                          className={cn(
                            'font-medium',
                            product.stock === -1
                              ? 'text-[#2D6A4F]'
                              : product.stock <= 5
                                ? 'text-[#D62828]'
                                : 'text-[var(--text-primary)]',
                          )}
                        >
                          {product.stock === -1 ? 'Ilimitado' : product.stock}
                        </span>
                      </span>
                      {product.stock > 0 && product.stock <= 5 && (
                        <Badge variant="danger" size="sm">
                          Bajo stock
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        icon={<Edit2 className="h-4 w-4" />}
                        onClick={() => openEdit(product)}
                      >
                        Editar
                      </Button>
                      <button
                        onClick={() => toggleActive(product.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          product.isActive
                            ? 'text-[#2D6A4F] hover:bg-[#2D6A4F]/10'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]',
                        )}
                        title={product.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {product.isActive ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer. ¿Estás seguro?"
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="!bg-[#D62828] hover:!bg-[#B71C1C]"
            onClick={() => deleteConfirm && deleteProduct(deleteConfirm)}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
        description={
          editingProduct
            ? 'Modifica los datos del producto'
            : 'Completá los datos del nuevo producto'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Imagen
            </label>
            <div className="relative">
              {form.imageUrl ? (
                <div className="relative h-40 rounded-xl overflow-hidden border border-[var(--border-color)]">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-[var(--border-color)] cursor-pointer transition-colors',
                    'hover:border-[#FF6B35] hover:bg-[#FF6B35]/5',
                    uploading && 'pointer-events-none opacity-60',
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-[#FF6B35] animate-spin mb-2" />
                      <span className="text-sm text-[var(--text-muted)]">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[var(--text-muted)] mb-2" />
                      <span className="text-sm text-[var(--text-muted)]">
                        Click para subir imagen
                      </span>
                      <span className="text-xs text-[var(--text-muted)] mt-1">
                        JPG, PNG o WebP
                      </span>
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
          </div>

          <Input
            label="Nombre"
            placeholder="Ej: Vladi Especial"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              className={cn(
                'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1',
                'resize-none',
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio ($)"
              type="number"
              placeholder="4500"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              required
              min="0"
            />
            <Input
              label="Stock (-1 = ilimitado)"
              type="number"
              placeholder="50"
              value={form.stock}
              onChange={(e) => updateField('stock', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Categoría
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField('categoryId', e.target.value)}
              required
              className={cn(
                'h-10 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)]',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1',
                !form.categoryId && 'text-[var(--text-muted)]',
              )}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
