'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import api from '@/lib/api';

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
  imageUrl: string | null;
  isActive: boolean;
}

interface IngredientForm {
  name: string;
  price: string;
  type: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyForm: IngredientForm = {
  name: '',
  price: '',
  type: 'BUN',
  imageUrl: '',
  isActive: true,
};

const TYPES = [
  { value: 'BUN', label: 'Pan', emoji: '🍞' },
  { value: 'MEAT', label: 'Carne', emoji: '🥩' },
  { value: 'CHEESE', label: 'Queso', emoji: '🧀' },
  { value: 'VEGETABLE', label: 'Vegetales', emoji: '🥬' },
  { value: 'SAUCE', label: 'Salsas', emoji: '🔥' },
  { value: 'TOPPING', label: 'Toppings', emoji: '🥓' },
];

function getTypeInfo(type: string) {
  return TYPES.find((t) => t.value === type) ?? { value: type, label: type, emoji: '?' };
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    BUN: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    MEAT: 'bg-red-500/15 text-red-400 border-red-500/20',
    CHEESE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    VEGETABLE: 'bg-green-500/15 text-green-400 border-green-500/20',
    SAUCE: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    TOPPING: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };
  return colors[type] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/20';
}

export default function AdminIngredientes() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IngredientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function fetchIngredients() {
    api.get('/ingredients?all=true')
      .then((res) => setIngredients(res.data.data ?? []))
      .catch(() => {});
  }

  useEffect(() => {
    fetchIngredients();
  }, []);

  const filtered = useMemo(() => {
    return ingredients.filter((i) => {
      if (typeFilter !== 'all' && i.type !== typeFilter) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [ingredients, search, typeFilter]);

  const countByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of ingredients) {
      map[i.type] = (map[i.type] ?? 0) + 1;
    }
    return map;
  }, [ingredients]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      price: String(ingredient.price),
      type: ingredient.type,
      imageUrl: ingredient.imageUrl ?? '',
      isActive: ingredient.isActive,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || form.price === '') return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      type: form.type,
      imageUrl: form.imageUrl.trim() || null,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await api.put(`/ingredients/${editingId}`, payload);
      } else {
        await api.post('/ingredients', payload);
      }
      setModalOpen(false);
      fetchIngredients();
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(ingredient: Ingredient) {
    try {
      await api.patch(`/ingredients/${ingredient.id}`, { isActive: !ingredient.isActive });
      fetchIngredients();
    } catch {
      // Error handled silently
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/ingredients/${id}`);
      fetchIngredients();
    } catch {
      // Error handled silently
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Ingredientes
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Gestiona los ingredientes para &quot;Crea Tu Vlady&quot; ({ingredients.length} total)
          </p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
          Nuevo ingrediente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
              typeFilter === 'all'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            )}
          >
            Todos ({ingredients.length})
          </button>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                typeFilter === t.value
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              )}
            >
              {t.emoji} {t.label} ({countByType[t.value] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((ingredient) => {
            const info = getTypeInfo(ingredient.type);
            return (
              <motion.div
                key={ingredient.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card
                  className={cn(
                    'transition-all',
                    !ingredient.isActive && 'opacity-50',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl shrink-0">
                          {ingredient.imageUrl || info.emoji}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {ingredient.name}
                          </h3>
                          <Badge className={cn('mt-1 text-[10px]', getTypeColor(ingredient.type))}>
                            {info.label}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-[#FF6B35] shrink-0">
                        {ingredient.price === 0 ? 'Gratis' : formatPrice(ingredient.price)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                      <button
                        onClick={() => handleToggleActive(ingredient)}
                        className="flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
                      >
                        {ingredient.isActive ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Activo</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-[var(--text-muted)]" />
                            <span className="text-[var(--text-muted)]">Inactivo</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(ingredient)}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          disabled={deleting === ingredient.id}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deleting === ingredient.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-3">🧂</span>
          <p className="text-[var(--text-muted)]">
            {search || typeFilter !== 'all'
              ? 'No se encontraron ingredientes con esos filtros'
              : 'No hay ingredientes aun. Agrega el primero!'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {editingId ? 'Editar ingrediente' : 'Nuevo ingrediente'}
            </h2>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre"
              placeholder="Ej: Pan brioche"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div>
              <Input
                label="Precio"
                type="number"
                placeholder="0 = incluido / gratis"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">0 = incluido / gratis</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                      form.type === t.value
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#FF6B35]/30',
                    )}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Emoji / Icono"
              placeholder="Ej: 🍞 o URL de imagen"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />

            <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Activo
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="cursor-pointer"
              >
                {form.isActive ? (
                  <ToggleRight className="h-6 w-6 text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-[var(--text-muted)]" />
                )}
              </button>
            </div>

            {/* Preview */}
            {form.name && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Vista previa
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {form.imageUrl || getTypeInfo(form.type).emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{form.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {getTypeInfo(form.type).label} &middot;{' '}
                      {Number(form.price) === 0 ? 'Incluido' : `+ ${formatPrice(Number(form.price))}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || !form.name.trim() || form.price === ''}
              icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear ingrediente'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
