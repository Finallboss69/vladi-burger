'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn, formatPrice, formatDate, generateId } from '@/lib/utils';
import api from '@/lib/api';
import type { Coupon } from '@/types';


interface CouponForm {
  code: string;
  discount: string;
  isPercent: boolean;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
}

const emptyForm: CouponForm = {
  code: '',
  discount: '',
  isPercent: true,
  minOrder: '',
  maxUses: '',
  expiresAt: '',
};

export default function AdminCupones() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  useEffect(() => {
    api.get('/coupons')
      .then((res) => setCoupons(res.data.data ?? []))
      .catch(() => setCoupons([]));
  }, []);

  function toggleActive(couponId: string) {
    const coupon = coupons.find((c) => c.id === couponId);
    if (!coupon) return;
    api.patch(`/coupons/${couponId}`, { isActive: !coupon.isActive }).catch(() => {});
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId ? { ...c, isActive: !c.isActive } : c,
      ),
    );
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discount: coupon.discount.toString(),
      isPercent: coupon.isPercent,
      minOrder: coupon.minOrder.toString(),
      maxUses: coupon.maxUses.toString(),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  }

  function deleteCoupon(couponId: string) {
    api.delete(`/coupons/${couponId}`).catch(() => {});
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.discount) return;

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount: Number(form.discount),
      isPercent: form.isPercent,
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || 999,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    try {
      if (editingCoupon) {
        const res = await api.patch(`/coupons/${editingCoupon.id}`, payload);
        const updated = res.data.data;
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...updated } : c)),
        );
      } else {
        const res = await api.post('/coupons', payload);
        const newCoupon = res.data.data;
        setCoupons((prev) => [newCoupon, ...prev]);
      }
    } catch {
      // error handled silently
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingCoupon(null);
  }

  function updateField(field: keyof CouponForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cupones</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gestiona los cupones de descuento
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingCoupon(null);
              setForm(emptyForm);
            } else {
              setEditingCoupon(null);
              setForm(emptyForm);
              setShowForm(true);
            }
          }}
        >
          {showForm ? 'Cancelar' : 'Nuevo cupón'}
        </Button>
      </div>

      {/* Create Form */}
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
                  {editingCoupon ? 'Editar cupón' : 'Crear cupón'}
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Código"
                      placeholder="Ej: DESCUENTO20"
                      value={form.code}
                      onChange={(e) => updateField('code', e.target.value)}
                      required
                      className="uppercase"
                      iconLeft={<Hash className="h-4 w-4" />}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        Tipo de descuento
                      </label>
                      <div className="flex h-10 rounded-xl border border-[var(--border-color)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateField('isPercent', true)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1 text-sm font-medium transition-colors',
                            form.isPercent
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                          )}
                        >
                          <Percent className="h-4 w-4" />
                          Porcentaje
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('isPercent', false)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1 text-sm font-medium transition-colors',
                            !form.isPercent
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                          )}
                        >
                          <DollarSign className="h-4 w-4" />
                          Fijo
                        </button>
                      </div>
                    </div>

                    <Input
                      label={form.isPercent ? 'Descuento (%)' : 'Descuento ($)'}
                      type="number"
                      placeholder={form.isPercent ? '10' : '500'}
                      value={form.discount}
                      onChange={(e) => updateField('discount', e.target.value)}
                      required
                      min="0"
                      max={form.isPercent ? '100' : undefined}
                    />

                    <Input
                      label="Pedido mínimo ($)"
                      type="number"
                      placeholder="3000"
                      value={form.minOrder}
                      onChange={(e) => updateField('minOrder', e.target.value)}
                      min="0"
                    />

                    <Input
                      label="Usos máximos"
                      type="number"
                      placeholder="100"
                      value={form.maxUses}
                      onChange={(e) => updateField('maxUses', e.target.value)}
                      min="1"
                    />

                    <Input
                      label="Fecha de expiración"
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => updateField('expiresAt', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowForm(false);
                        setForm(emptyForm);
                        setEditingCoupon(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingCoupon ? 'Guardar cambios' : 'Crear cupón'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons Table */}
      <Card hover={false}>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Pedido mín.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Expira
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
                  {coupons.map((coupon) => {
                    const isExpired = coupon.expiresAt
                      ? new Date(coupon.expiresAt) < new Date()
                      : false;
                    const isMaxed = coupon.usedCount >= coupon.maxUses;
                    return (
                      <motion.tr
                        key={coupon.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          'transition-colors hover:bg-[var(--bg-tertiary)]',
                          (!coupon.isActive || isExpired || isMaxed) && 'opacity-60',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-[#FF6B35]" />
                            <span className="font-mono font-bold text-[var(--text-primary)]">
                              {coupon.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                          {coupon.isPercent
                            ? `${coupon.discount}%`
                            : formatPrice(coupon.discount)}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {coupon.minOrder > 0
                            ? formatPrice(coupon.minOrder)
                            : 'Sin mínimo'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--text-primary)]">
                              {coupon.usedCount}/{coupon.maxUses}
                            </span>
                            {/* Progress bar */}
                            <div className="h-1.5 w-16 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  isMaxed
                                    ? 'bg-[#D62828]'
                                    : coupon.usedCount / coupon.maxUses > 0.8
                                      ? 'bg-[#F5CB5C]'
                                      : 'bg-[#2D6A4F]',
                                )}
                                style={{
                                  width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {coupon.expiresAt ? (
                            <span className={cn(isExpired && 'text-[#D62828]')}>
                              {formatDate(coupon.expiresAt)}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">Sin vencimiento</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isExpired ? (
                            <Badge variant="danger" size="sm">Expirado</Badge>
                          ) : isMaxed ? (
                            <Badge variant="warning" size="sm">Agotado</Badge>
                          ) : coupon.isActive ? (
                            <Badge variant="success" size="sm">Activo</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Inactivo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(coupon)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleActive(coupon.id)}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                coupon.isActive
                                  ? 'text-[#2D6A4F] hover:bg-[#2D6A4F]/10'
                                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]',
                              )}
                              title={coupon.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {coupon.isActive ? (
                                <ToggleRight className="h-5 w-5" />
                              ) : (
                                <ToggleLeft className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteCoupon(coupon.id)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[var(--border-color)]">
            <AnimatePresence>
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt
                  ? new Date(coupon.expiresAt) < new Date()
                  : false;
                const isMaxed = coupon.usedCount >= coupon.maxUses;
                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'p-4 space-y-3',
                      (!coupon.isActive || isExpired || isMaxed) && 'opacity-60',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-[#FF6B35]" />
                        <span className="font-mono font-bold text-lg text-[var(--text-primary)]">
                          {coupon.code}
                        </span>
                      </div>
                      {isExpired ? (
                        <Badge variant="danger" size="sm">Expirado</Badge>
                      ) : isMaxed ? (
                        <Badge variant="warning" size="sm">Agotado</Badge>
                      ) : coupon.isActive ? (
                        <Badge variant="success" size="sm">Activo</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Inactivo</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Descuento</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {coupon.isPercent
                            ? `${coupon.discount}%`
                            : formatPrice(coupon.discount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Pedido mín.</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {coupon.minOrder > 0
                            ? formatPrice(coupon.minOrder)
                            : 'Sin mínimo'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Usos</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {coupon.usedCount}/{coupon.maxUses}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Expira</p>
                        <p
                          className={cn(
                            'font-medium',
                            isExpired
                              ? 'text-[#D62828]'
                              : 'text-[var(--text-primary)]',
                          )}
                        >
                          {coupon.expiresAt
                            ? formatDate(coupon.expiresAt)
                            : 'Nunca'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => toggleActive(coupon.id)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          coupon.isActive
                            ? 'text-[#2D6A4F] bg-[#2D6A4F]/10'
                            : 'text-[var(--text-muted)] bg-[var(--bg-tertiary)]',
                        )}
                      >
                        {coupon.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4" /> Activo
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" /> Inactivo
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[#D62828] bg-[#D62828]/10 transition-colors hover:bg-[#D62828]/20"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {coupons.length === 0 && (
            <div className="py-16 text-center">
              <Ticket className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-[var(--text-muted)]">No hay cupones creados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
