'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Plus, Edit3, Trash2,
  Home, Briefcase, Building,
} from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { useNotificationStore } from '@/stores/notification-store';
import { mockAddresses } from '@/lib/mock-data';
import { cn, generateId } from '@/lib/utils';
import type { Address } from '@/types';

const labelIcons: Record<string, typeof Home> = {
  Casa: Home,
  Trabajo: Briefcase,
  Oficina: Building,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface AddressForm {
  label: string;
  street: string;
  number: string;
  floor: string;
  apartment: string;
  city: string;
  zipCode: string;
}

const emptyForm: AddressForm = {
  label: '',
  street: '',
  number: '',
  floor: '',
  apartment: '',
  city: '',
  zipCode: '',
};

export default function DireccionesPage() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof AddressForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      street: address.street,
      number: address.number,
      floor: address.floor ?? '',
      apartment: address.apartment ?? '',
      city: address.city,
      zipCode: address.zipCode,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.label.trim()) newErrors.label = 'Obligatorio';
    if (!form.street.trim()) newErrors.street = 'Obligatorio';
    if (!form.number.trim()) newErrors.number = 'Obligatorio';
    if (!form.city.trim()) newErrors.city = 'Obligatorio';
    if (!form.zipCode.trim()) newErrors.zipCode = 'Obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                label: form.label,
                street: form.street,
                number: form.number,
                floor: form.floor || undefined,
                apartment: form.apartment || undefined,
                city: form.city,
                zipCode: form.zipCode,
              }
            : a,
        ),
      );
      addNotification({ type: 'success', title: 'Direccion actualizada', message: 'Se guardo correctamente' });
    } else {
      const newAddress: Address = {
        id: generateId(),
        userId: 'u1',
        label: form.label,
        street: form.street,
        number: form.number,
        floor: form.floor || undefined,
        apartment: form.apartment || undefined,
        city: form.city,
        zipCode: form.zipCode,
      };
      setAddresses((prev) => [...prev, newAddress]);
      addNotification({ type: 'success', title: 'Direccion agregada', message: 'Nueva direccion guardada' });
    }

    setSaving(false);
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    addNotification({ type: 'info', title: 'Direccion eliminada', message: 'Se elimino la direccion' });
  }

  function getFullAddress(address: Address): string {
    let full = `${address.street} ${address.number}`;
    if (address.floor) full += `, Piso ${address.floor}`;
    if (address.apartment) full += `, Depto ${address.apartment}`;
    full += ` - ${address.city} (${address.zipCode})`;
    return full;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cuenta">
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis direcciones</h1>
              <p className="text-sm text-[var(--text-muted)]">
                {addresses.length} direccion{addresses.length !== 1 ? 'es' : ''} guardada{addresses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={openNew}
            icon={<Plus className="h-4 w-4" />}
          >
            Agregar
          </Button>
        </motion.div>

        {/* Addresses list */}
        {addresses.length === 0 ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-4 py-16"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
              <MapPin className="h-10 w-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-lg font-medium text-[var(--text-muted)]">
              No tenes direcciones guardadas
            </p>
            <Button onClick={openNew} icon={<Plus className="h-4 w-4" />}>
              Agregar direccion
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => {
              const IconComponent = labelIcons[address.label] ?? MapPin;
              return (
                <motion.div key={address.id} variants={item}>
                  <Card hover={false} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[var(--text-primary)]">
                          {address.label}
                        </h3>
                        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                          {getFullAddress(address)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(address)}
                          icon={<Edit3 className="h-4 w-4" />}
                          className="h-9 w-9 p-0"
                          aria-label="Editar"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          className="h-9 w-9 p-0 text-[#D62828] hover:bg-[#D62828]/10 hover:text-[#D62828]"
                          aria-label="Eliminar"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? 'Editar direccion' : 'Nueva direccion'}
        description={editingId ? 'Modifica los datos de tu direccion' : 'Agrega una nueva direccion de entrega'}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Etiqueta"
            placeholder="Ej: Casa, Trabajo, Oficina"
            value={form.label}
            onChange={(e) => updateField('label', e.target.value)}
            error={errors.label}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Calle"
                placeholder="Av. Corrientes"
                value={form.street}
                onChange={(e) => updateField('street', e.target.value)}
                error={errors.street}
              />
            </div>
            <Input
              label="Numero"
              placeholder="1234"
              value={form.number}
              onChange={(e) => updateField('number', e.target.value)}
              error={errors.number}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Piso (opc.)"
              placeholder="5"
              value={form.floor}
              onChange={(e) => updateField('floor', e.target.value)}
            />
            <Input
              label="Depto (opc.)"
              placeholder="A"
              value={form.apartment}
              onChange={(e) => updateField('apartment', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              placeholder="CABA"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={errors.city}
            />
            <Input
              label="Codigo postal"
              placeholder="1043"
              value={form.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              error={errors.zipCode}
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
            >
              {editingId ? 'Guardar cambios' : 'Agregar direccion'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
