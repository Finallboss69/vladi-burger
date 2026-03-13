'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Circle,
  Target,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Modal } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import api from '@/lib/api';

/* ── Types ─────────────────────────────────────────────── */

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  activeOrders: number;
  createdAt: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  deliveryFee: number;
  isActive: boolean;
}

interface DriverForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface ZoneForm {
  name: string;
  lat: string;
  lng: string;
  radiusKm: string;
  deliveryFee: string;
}

const emptyDriverForm: DriverForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
};

const emptyZoneForm: ZoneForm = {
  name: '',
  lat: '',
  lng: '',
  radiusKm: '',
  deliveryFee: '',
};

type TabKey = 'drivers' | 'zones';

/* ── Component ─────────────────────────────────────────── */

export default function AdminDelivery() {
  const [activeTab, setActiveTab] = useState<TabKey>('drivers');

  /* Drivers state */
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverForm, setDriverForm] = useState<DriverForm>(emptyDriverForm);
  const [deleteDriverConfirm, setDeleteDriverConfirm] = useState<string | null>(null);

  /* Zones state */
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneForm>(emptyZoneForm);
  const [deleteZoneConfirm, setDeleteZoneConfirm] = useState<string | null>(null);

  /* ── Fetch ──────────────────────────────────────────── */

  useEffect(() => {
    api.get('/admin/drivers')
      .then((res) => setDrivers(res.data.data ?? []))
      .catch(() => setDrivers([]));
    api.get('/admin/zones')
      .then((res) => setZones(res.data.data ?? []))
      .catch(() => setZones([]));
  }, []);

  /* ── Driver Handlers ────────────────────────────────── */

  function openCreateDriver() {
    setEditingDriver(null);
    setDriverForm(emptyDriverForm);
    setDriverModalOpen(true);
  }

  function openEditDriver(driver: Driver) {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      email: driver.email,
      password: '',
      phone: driver.phone,
    });
    setDriverModalOpen(true);
  }

  async function handleDriverSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driverForm.name.trim() || !driverForm.email.trim()) return;

    const payload = {
      name: driverForm.name,
      email: driverForm.email,
      phone: driverForm.phone,
      ...(driverForm.password ? { password: driverForm.password } : {}),
    };

    try {
      if (editingDriver) {
        const res = await api.put(`/admin/drivers/${editingDriver.id}`, payload);
        const updated = res.data.data;
        setDrivers((prev) =>
          prev.map((d) => (d.id === editingDriver.id ? { ...d, ...updated } : d)),
        );
      } else {
        const res = await api.post('/admin/drivers', {
          ...payload,
          password: driverForm.password,
        });
        const newDriver = res.data.data;
        setDrivers((prev) => [{ ...newDriver, activeOrders: 0 }, ...prev]);
      }
    } catch {
      // error
    }

    setDriverModalOpen(false);
    setDriverForm(emptyDriverForm);
    setEditingDriver(null);
  }

  async function deleteDriver(driverId: string) {
    try {
      await api.delete(`/admin/drivers/${driverId}`);
      setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    } catch {
      // error
    }
    setDeleteDriverConfirm(null);
  }

  /* ── Zone Handlers ──────────────────────────────────── */

  function openCreateZone() {
    setEditingZone(null);
    setZoneForm(emptyZoneForm);
    setZoneModalOpen(true);
  }

  function openEditZone(zone: DeliveryZone) {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      lat: zone.lat.toString(),
      lng: zone.lng.toString(),
      radiusKm: zone.radiusKm.toString(),
      deliveryFee: zone.deliveryFee.toString(),
    });
    setZoneModalOpen(true);
  }

  async function handleZoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneForm.name.trim() || !zoneForm.lat || !zoneForm.lng || !zoneForm.radiusKm) return;

    const payload = {
      name: zoneForm.name,
      lat: Number(zoneForm.lat),
      lng: Number(zoneForm.lng),
      radiusKm: Number(zoneForm.radiusKm),
      deliveryFee: Number(zoneForm.deliveryFee) || 0,
    };

    try {
      if (editingZone) {
        const res = await api.put(`/admin/zones/${editingZone.id}`, payload);
        const updated = res.data.data;
        setZones((prev) =>
          prev.map((z) => (z.id === editingZone.id ? { ...z, ...updated } : z)),
        );
      } else {
        const res = await api.post('/admin/zones', payload);
        const newZone = res.data.data;
        setZones((prev) => [{ ...newZone, isActive: true }, ...prev]);
      }
    } catch {
      // error
    }

    setZoneModalOpen(false);
    setZoneForm(emptyZoneForm);
    setEditingZone(null);
  }

  async function deleteZone(zoneId: string) {
    try {
      await api.delete(`/admin/zones/${zoneId}`);
      setZones((prev) => prev.filter((z) => z.id !== zoneId));
    } catch {
      // error
    }
    setDeleteZoneConfirm(null);
  }

  /* ── Render ─────────────────────────────────────────── */

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'drivers', label: 'Repartidores' },
    { key: 'zones', label: 'Zona de cobertura' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Delivery</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gestiona repartidores y zonas de cobertura
          </p>
        </div>
        {activeTab === 'drivers' ? (
          <Button variant="primary" icon={<Plus className="h-5 w-5" />} onClick={openCreateDriver}>
            Nuevo repartidor
          </Button>
        ) : (
          <Button variant="primary" icon={<Plus className="h-5 w-5" />} onClick={openCreateZone}>
            Nueva zona
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
            )}
          >
            {tab.key === 'drivers' ? (
              <User className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'drivers' ? (
          <motion.div
            key="drivers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Drivers Grid */}
            {drivers.length === 0 ? (
              <div className="py-16 text-center">
                <Truck className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-muted)]">No hay repartidores registrados</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {drivers.map((driver) => (
                    <motion.div
                      key={driver.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card hover className="overflow-hidden relative">
                        <CardContent>
                          {/* Status indicator */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                                  {driver.name}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <Circle
                                    className={cn(
                                      'h-2 w-2 fill-current',
                                      driver.isActive ? 'text-[#2D6A4F]' : 'text-[var(--text-muted)]',
                                    )}
                                  />
                                  <span className="text-xs text-[var(--text-muted)]">
                                    {driver.isActive ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {driver.activeOrders > 0 && (
                              <Badge variant="warning" size="sm">
                                {driver.activeOrders} pedido{driver.activeOrders !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          {/* Contact info */}
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                              <span className="truncate">{driver.email}</span>
                            </div>
                            {driver.phone && (
                              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                <span>{driver.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Active orders indicator */}
                          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-[var(--bg-primary)]">
                            <Package className="h-4 w-4 text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">
                              Pedidos activos:{' '}
                              <span
                                className={cn(
                                  'font-bold',
                                  driver.activeOrders > 0
                                    ? 'text-[#FF6B35]'
                                    : 'text-[var(--text-primary)]',
                                )}
                              >
                                {driver.activeOrders}
                              </span>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              icon={<Edit2 className="h-4 w-4" />}
                              onClick={() => openEditDriver(driver)}
                            >
                              Editar
                            </Button>
                            <button
                              onClick={() => setDeleteDriverConfirm(driver.id)}
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
          </motion.div>
        ) : (
          <motion.div
            key="zones"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Zones Grid */}
            {zones.length === 0 ? (
              <div className="py-16 text-center">
                <MapPin className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-muted)]">No hay zonas de cobertura configuradas</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {zones.map((zone) => (
                    <motion.div
                      key={zone.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card hover className="overflow-hidden relative">
                        <CardContent>
                          {/* Zone visual */}
                          <div className="relative h-32 mb-3 -mx-4 -mt-4 overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center">
                            {/* Simple circle visualization */}
                            <div className="relative">
                              {/* Grid lines */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-28 h-28 border border-dashed border-[var(--border-color)] rounded-full opacity-30" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 border border-dashed border-[var(--border-color)] rounded-full opacity-20" />
                              </div>
                              {/* Zone circle */}
                              <div
                                className="relative flex items-center justify-center rounded-full bg-[#FF6B35]/15 border-2 border-[#FF6B35]/40"
                                style={{
                                  width: `${Math.min(Math.max(zone.radiusKm * 20, 40), 120)}px`,
                                  height: `${Math.min(Math.max(zone.radiusKm * 20, 40), 120)}px`,
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <Target className="h-4 w-4 text-[#FF6B35]" />
                                  <span className="text-[10px] font-bold text-[#FF6B35] mt-0.5">
                                    {zone.radiusKm} km
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Zone info */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                              {zone.name}
                            </h3>
                            <Badge
                              variant={zone.isActive ? 'success' : 'warning'}
                              size="sm"
                            >
                              {zone.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                              <span className="truncate text-xs">
                                {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <Target className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                              <span>Radio: {zone.radiusKm} km</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                              <span className="font-medium text-[#FF6B35]">
                                Envio: {formatPrice(zone.deliveryFee)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              icon={<Edit2 className="h-4 w-4" />}
                              onClick={() => openEditZone(zone)}
                            >
                              Editar
                            </Button>
                            <button
                              onClick={() => setDeleteZoneConfirm(zone.id)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Driver Modals ──────────────────────────────── */}

      {/* Delete Driver Confirmation */}
      <Modal
        open={!!deleteDriverConfirm}
        onOpenChange={() => setDeleteDriverConfirm(null)}
        title="Eliminar repartidor"
        description="Esta accion no se puede deshacer. Se eliminara el repartidor y se desasignaran sus pedidos activos."
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteDriverConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="!bg-[#D62828] hover:!bg-[#B71C1C]"
            onClick={() => deleteDriverConfirm && deleteDriver(deleteDriverConfirm)}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      {/* Create/Edit Driver Modal */}
      <Modal
        open={driverModalOpen}
        onOpenChange={setDriverModalOpen}
        title={editingDriver ? 'Editar repartidor' : 'Nuevo repartidor'}
        description={
          editingDriver
            ? 'Modifica los datos del repartidor'
            : 'Completa los datos del nuevo repartidor'
        }
      >
        <form onSubmit={handleDriverSubmit} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Juan Perez"
            value={driverForm.name}
            onChange={(e) => setDriverForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="juan@ejemplo.com"
            value={driverForm.email}
            onChange={(e) => setDriverForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label={editingDriver ? 'Nueva contraseña (dejar vacio para no cambiar)' : 'Contraseña'}
            type="password"
            placeholder="********"
            value={driverForm.password}
            onChange={(e) => setDriverForm((prev) => ({ ...prev, password: e.target.value }))}
            required={!editingDriver}
          />
          <Input
            label="Telefono"
            type="tel"
            placeholder="+54 11 1234 5678"
            value={driverForm.phone}
            onChange={(e) => setDriverForm((prev) => ({ ...prev, phone: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDriverModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingDriver ? 'Guardar cambios' : 'Crear repartidor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Zone Modals ────────────────────────────────── */}

      {/* Delete Zone Confirmation */}
      <Modal
        open={!!deleteZoneConfirm}
        onOpenChange={() => setDeleteZoneConfirm(null)}
        title="Eliminar zona"
        description="Esta accion no se puede deshacer. Se eliminara la zona de cobertura."
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteZoneConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="!bg-[#D62828] hover:!bg-[#B71C1C]"
            onClick={() => deleteZoneConfirm && deleteZone(deleteZoneConfirm)}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      {/* Create/Edit Zone Modal */}
      <Modal
        open={zoneModalOpen}
        onOpenChange={setZoneModalOpen}
        title={editingZone ? 'Editar zona' : 'Nueva zona de cobertura'}
        description={
          editingZone
            ? 'Modifica los datos de la zona'
            : 'Configura una nueva zona de cobertura para delivery'
        }
      >
        <form onSubmit={handleZoneSubmit} className="space-y-4">
          <Input
            label="Nombre de la zona"
            placeholder="Ej: Centro, Palermo, etc."
            value={zoneForm.name}
            onChange={(e) => setZoneForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitud"
              type="number"
              step="any"
              placeholder="-34.6037"
              value={zoneForm.lat}
              onChange={(e) => setZoneForm((prev) => ({ ...prev, lat: e.target.value }))}
              required
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              placeholder="-58.3816"
              value={zoneForm.lng}
              onChange={(e) => setZoneForm((prev) => ({ ...prev, lng: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Radio (km)"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="3"
              value={zoneForm.radiusKm}
              onChange={(e) => setZoneForm((prev) => ({ ...prev, radiusKm: e.target.value }))}
              required
            />
            <Input
              label="Costo de envio ($)"
              type="number"
              min="0"
              placeholder="500"
              value={zoneForm.deliveryFee}
              onChange={(e) => setZoneForm((prev) => ({ ...prev, deliveryFee: e.target.value }))}
              required
            />
          </div>

          {/* Zone preview */}
          {zoneForm.radiusKm && (
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">Vista previa de la zona</p>
              <div className="flex items-center justify-center h-24">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border border-dashed border-[var(--border-color)] rounded-full opacity-30" />
                  </div>
                  <div
                    className="relative flex items-center justify-center rounded-full bg-[#FF6B35]/15 border-2 border-[#FF6B35]/40"
                    style={{
                      width: `${Math.min(Math.max(Number(zoneForm.radiusKm) * 16, 32), 96)}px`,
                      height: `${Math.min(Math.max(Number(zoneForm.radiusKm) * 16, 32), 96)}px`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <Target className="h-3 w-3 text-[#FF6B35]" />
                      <span className="text-[9px] font-bold text-[#FF6B35] mt-0.5">
                        {zoneForm.radiusKm} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setZoneModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingZone ? 'Guardar cambios' : 'Crear zona'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
