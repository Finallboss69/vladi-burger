'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stamp, Save, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

interface StampConfig {
  id: string;
  stampsRequired: number;
  prizeName: string;
  prizeDescription: string;
  prizeDiscount: number;
  prizeProductId: string | null;
  categoryId: string | null;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminSellosPage() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [config, setConfig] = useState<StampConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stampsRequired, setStampsRequired] = useState(5);
  const [prizeName, setPrizeName] = useState('Vladi Burger Gratis');
  const [prizeDescription, setPrizeDescription] = useState('Comprá 5 burgers y la 6ta te la regalamos!');
  const [prizeDiscount, setPrizeDiscount] = useState(100);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/stamps/config').catch(() => ({ data: { data: null } })),
      api.get('/categories').catch(() => ({ data: { data: [] } })),
    ]).then(([configRes, catRes]) => {
      const c = configRes.data.data;
      if (c) {
        setConfig(c);
        setStampsRequired(c.stampsRequired);
        setPrizeName(c.prizeName);
        setPrizeDescription(c.prizeDescription);
        setPrizeDiscount(c.prizeDiscount);
        setCategoryId(c.categoryId ?? '');
      }
      setCategories(catRes.data.data ?? []);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put('/stamps/config', {
        stampsRequired,
        prizeName,
        prizeDescription,
        prizeDiscount,
        categoryId: categoryId || null,
      });
      setConfig(res.data.data);
      addNotification({
        type: 'success',
        title: 'Configuracion guardada',
        message: 'La tarjeta de sellos se actualizo correctamente',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar la configuracion',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B35] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 lg:pb-0"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarjeta de Sellos</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Configura el programa de fidelidad con sellos
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Config Form */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stamp className="h-5 w-5 text-[#FF6B35]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Configuracion</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Sellos necesarios"
                type="number"
                min={1}
                max={20}
                value={stampsRequired}
                onChange={(e) => setStampsRequired(Number(e.target.value))}
              />

              <Input
                label="Nombre del premio"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="Ej: Vladi Burger Gratis"
              />

              <Input
                label="Descripcion del premio"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="Ej: Comprá 5 burgers y la 6ta te la regalamos!"
              />

              <Input
                label="Descuento del premio (%)"
                type="number"
                min={1}
                max={100}
                value={prizeDiscount}
                onChange={(e) => setPrizeDiscount(Number(e.target.value))}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  Categoria que otorga sellos
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                >
                  <option value="">Todas las categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                Guardar configuracion
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview */}
        <motion.div variants={item}>
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#F5CB5C]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Vista previa</h2>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mini stamp card preview */}
              <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#D62828] p-4 text-white">
                  <p className="text-sm font-medium text-white/80">Progreso del cliente</p>
                  <p className="text-2xl font-black">
                    3 / {stampsRequired}
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: stampsRequired }).map((_, i) => {
                      const isFilled = i < 3;
                      const isPrize = i === stampsRequired - 1;
                      return (
                        <div
                          key={i}
                          className={`flex aspect-square items-center justify-center rounded-lg border-2 text-xs font-bold ${
                            isFilled
                              ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                              : isPrize
                                ? 'border-dashed border-[#F5CB5C] bg-[#F5CB5C]/5 text-[#F5CB5C]'
                                : 'border-dashed border-[var(--border-color)] text-[var(--text-muted)]'
                          }`}
                        >
                          {isPrize ? (
                            <Gift className="h-4 w-4" />
                          ) : isFilled ? (
                            'V'
                          ) : (
                            i + 1
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-lg bg-[var(--bg-tertiary)] p-3">
                    <p className="font-bold text-sm text-[var(--text-primary)]">{prizeName}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{prizeDescription}</p>
                    <p className="text-xs text-[#2D6A4F] font-medium mt-1">
                      {prizeDiscount === 100 ? 'Gratis' : `${prizeDiscount}% de descuento`}
                    </p>
                  </div>
                </div>
              </div>

              {config && (
                <div className="mt-4 rounded-lg border border-[var(--border-color)] p-3">
                  <p className="text-xs text-[var(--text-muted)]">Estado actual</p>
                  <p className="text-sm font-medium text-[#2D6A4F]">
                    Programa activo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
