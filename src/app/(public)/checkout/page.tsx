'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Store,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  FileText,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { useCartStore } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';
import { useNotificationStore } from '@/stores/notification-store';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import type { DeliveryType, Address, OrderStatus } from '@/types';

interface TimeSlot {
  time: string;
  available: boolean;
  remainingSlots: number;
}

const STEPS = [
  { id: 1, label: 'Entrega', icon: Truck },
  { id: 2, label: 'Direccion', icon: MapPin },
  { id: 3, label: 'Horario', icon: Clock },
  { id: 4, label: 'Pago', icon: CreditCard },
  { id: 5, label: 'Confirmar', icon: CheckCircle2 },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, discount, subtotal, total, clear } = useCartStore();
  const { setActiveOrder } = useOrderStore();
  const { addNotification } = useNotificationStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    api.get('/addresses')
      .then((res) => setSavedAddresses(res.data.data ?? []))
      .catch(() => setSavedAddresses([]));
  }, []);

  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    api.get(`/delivery?dayOfWeek=${dayOfWeek}`)
      .then((res) => setTimeSlots(res.data.data ?? []))
      .catch(() => setTimeSlots([]));
  }, []);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    number: '',
    floor: '',
    apartment: '',
    city: '',
    zipCode: '',
  });

  const canAdvance = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return deliveryType !== null;
      case 2:
        if (deliveryType === 'PICKUP') return true;
        return selectedAddress !== null;
      case 3:
        return selectedTimeSlot !== null;
      case 4:
        return paymentMethod !== null;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, deliveryType, selectedAddress, selectedTimeSlot, paymentMethod]);

  const goNext = () => {
    if (!canAdvance()) return;
    // Skip address step if pickup
    const nextStep = currentStep === 1 && deliveryType === 'PICKUP' ? 3 : currentStep + 1;
    setDirection(1);
    setCurrentStep(Math.min(nextStep, 5));
  };

  const goBack = () => {
    const prevStep = currentStep === 3 && deliveryType === 'PICKUP' ? 1 : currentStep - 1;
    setDirection(-1);
    setCurrentStep(Math.max(prevStep, 1));
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          extras: i.extras,
          isCustom: i.isCustom,
          notes: i.notes,
        })),
        deliveryType,
        addressId: selectedAddress?.id,
        scheduledAt: selectedTimeSlot ? `${new Date().toISOString().split('T')[0]}T${selectedTimeSlot}:00` : null,
        paymentMethod,
        notes,
        couponCode,
      });

      const orderId = res.data.data?.id ?? `o-${Date.now()}`;

      // For MercadoPago and card payments, redirect to MercadoPago checkout
      if (paymentMethod === 'mercadopago' || paymentMethod === 'card') {
        try {
          const mpRes = await api.post('/payments/mercadopago', { orderId });
          const initPoint = mpRes.data.data?.initPoint;
          if (initPoint) {
            clear();
            window.location.href = initPoint;
            return;
          }
        } catch {
          addNotification({
            type: 'error',
            title: 'Error de pago',
            message: 'No se pudo iniciar el pago con MercadoPago. Intenta de nuevo.',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // For cash and transfer, just confirm locally
      setActiveOrder(orderId, 'PENDING' as OrderStatus);
      setOrderConfirmed(true);

      addNotification({
        type: 'success',
        title: 'Pedido confirmado',
        message: 'Tu pedido se realizo con exito. Te avisaremos cuando este listo.',
        duration: 5000,
      });

      setTimeout(() => {
        clear();
        router.push(`/pedido/${orderId}`);
      }, 2500);
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo confirmar el pedido. Intenta de nuevo.',
      });
      setIsSubmitting(false);
    }
  };

  // Success animation overlay
  if (orderConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-[#2D6A4F]/10"
          >
            <CheckCircle2 className="h-16 w-16 text-[#2D6A4F]" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Pedido confirmado</h2>
            <p className="mt-2 text-[var(--text-muted)]">Redirigiendo al seguimiento...</p>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 1.5 }}
            className="h-1 w-48 origin-left rounded-full bg-[#2D6A4F]"
          />
        </motion.div>
      </div>
    );
  }

  // Empty cart guard
  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <UtensilsCrossed className="mx-auto mb-4 h-16 w-16 text-[var(--text-muted)] opacity-40" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            No hay items en el carrito
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">Agrega productos antes de hacer checkout</p>
          <Button className="mt-6" onClick={() => router.push('/menu')}>
            Ir al menu
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold text-[var(--text-primary)]"
      >
        Checkout
      </motion.h1>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isSkipped = step.id === 2 && deliveryType === 'PICKUP';
            const StepIcon = step.icon;

            if (isSkipped) return null;

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      backgroundColor: isCompleted
                        ? '#2D6A4F'
                        : isActive
                          ? '#FF6B35'
                          : 'var(--bg-secondary)',
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <StepIcon
                        className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs font-medium sm:text-sm ${
                      isActive
                        ? 'text-[#FF6B35]'
                        : isCompleted
                          ? 'text-[#2D6A4F]'
                          : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.filter((s) => !(s.id === 2 && deliveryType === 'PICKUP')).length - 1 && (
                  <div className="mx-2 flex-1">
                    <div className="h-0.5 rounded-full bg-[var(--border-color)]">
                      <motion.div
                        animate={{
                          scaleX: isCompleted ? 1 : 0,
                        }}
                        className="h-full origin-left rounded-full bg-[#2D6A4F]"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Step content */}
        <div className="min-h-[400px] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-sm">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Step 1: Delivery Type */}
              {currentStep === 1 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
                    Como queres recibir tu pedido?
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DeliveryOption
                      icon={<Truck className="h-8 w-8" />}
                      title="Delivery"
                      description="Te lo llevamos a tu puerta"
                      selected={deliveryType === 'DELIVERY'}
                      onClick={() => setDeliveryType('DELIVERY' as DeliveryType)}
                    />
                    <DeliveryOption
                      icon={<Store className="h-8 w-8" />}
                      title="Retiro en local"
                      description="Pasalo a buscar cuando este listo"
                      selected={deliveryType === 'PICKUP'}
                      onClick={() => setDeliveryType('PICKUP' as DeliveryType)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
                    Donde te lo enviamos?
                  </h2>

                  <div className="flex flex-col gap-4">
                    {savedAddresses.map((addr) => (
                      <motion.button
                        key={addr.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressForm(false);
                        }}
                        className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                          selectedAddress?.id === addr.id
                            ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                            : 'border-[var(--border-color)] hover:border-[#FF6B35]/40'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            selectedAddress?.id === addr.id
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                          }`}
                        >
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{addr.label}</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {addr.street} {addr.number}
                            {addr.floor ? `, Piso ${addr.floor}` : ''}
                            {addr.apartment ? ` ${addr.apartment}` : ''}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {addr.city} - {addr.zipCode}
                          </p>
                        </div>
                      </motion.button>
                    ))}

                    {/* New address form toggle */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAddressForm(!showAddressForm);
                        setSelectedAddress(null);
                      }}
                      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-color)] p-4 text-[var(--text-muted)] transition-colors hover:border-[#FF6B35]/40 hover:text-[#FF6B35]"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Agregar nueva direccion</span>
                    </motion.button>

                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-4 rounded-xl border border-[var(--border-color)] p-4 sm:grid-cols-2">
                            <Input
                              label="Etiqueta"
                              placeholder="Ej: Casa, Trabajo"
                              value={newAddress.label}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, label: e.target.value })
                              }
                            />
                            <Input
                              label="Calle"
                              placeholder="Av. Corrientes"
                              value={newAddress.street}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, street: e.target.value })
                              }
                            />
                            <Input
                              label="Numero"
                              placeholder="1234"
                              value={newAddress.number}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, number: e.target.value })
                              }
                            />
                            <Input
                              label="Piso (opcional)"
                              placeholder="5"
                              value={newAddress.floor}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, floor: e.target.value })
                              }
                            />
                            <Input
                              label="Depto (opcional)"
                              placeholder="A"
                              value={newAddress.apartment}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, apartment: e.target.value })
                              }
                            />
                            <Input
                              label="Ciudad"
                              placeholder="CABA"
                              value={newAddress.city}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, city: e.target.value })
                              }
                            />
                            <Button
                              variant="secondary"
                              className="sm:col-span-2"
                              onClick={async () => {
                                try {
                                  const res = await api.post('/addresses', newAddress);
                                  const saved = res.data.data;
                                  if (saved) {
                                    setSavedAddresses((prev) => [...prev, saved]);
                                    setSelectedAddress(saved);
                                  } else {
                                    setSelectedAddress({
                                      id: `new-${Date.now()}`,
                                      userId: '',
                                      ...newAddress,
                                    });
                                  }
                                } catch {
                                  setSelectedAddress({
                                    id: `new-${Date.now()}`,
                                    userId: '',
                                    ...newAddress,
                                  });
                                }
                                setShowAddressForm(false);
                              }}
                              disabled={!newAddress.street || !newAddress.number || !newAddress.city}
                            >
                              Usar esta direccion
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 3 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
                    Para cuando lo queres?
                  </h2>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        whileTap={slot.available ? { scale: 0.95 } : undefined}
                        onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                        disabled={!slot.available}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all ${
                          !slot.available
                            ? 'cursor-not-allowed border-[var(--border-color)] opacity-40'
                            : selectedTimeSlot === slot.time
                              ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                              : 'border-[var(--border-color)] hover:border-[#FF6B35]/40'
                        }`}
                      >
                        <Clock
                          className={`h-5 w-5 ${
                            selectedTimeSlot === slot.time
                              ? 'text-[#FF6B35]'
                              : 'text-[var(--text-muted)]'
                          }`}
                        />
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          {slot.time}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {slot.available
                            ? `${slot.remainingSlots} lugares`
                            : 'Agotado'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
                    Como vas a pagar?
                  </h2>

                  <div className="flex flex-col gap-4">
                    {[
                      {
                        id: 'cash',
                        title: 'Efectivo',
                        desc: 'Paga al recibir tu pedido',
                        icon: '💵',
                      },
                      {
                        id: 'card',
                        title: 'Tarjeta de credito/debito',
                        desc: 'Visa, Mastercard, Amex',
                        icon: '💳',
                      },
                      {
                        id: 'mercadopago',
                        title: 'MercadoPago',
                        desc: 'Paga con tu cuenta de MercadoPago',
                        icon: '📱',
                      },
                      {
                        id: 'transfer',
                        title: 'Transferencia bancaria',
                        desc: 'CBU/Alias al confirmar',
                        icon: '🏦',
                      },
                    ].map((method) => (
                      <motion.button
                        key={method.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                          paymentMethod === method.id
                            ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                            : 'border-[var(--border-color)] hover:border-[#FF6B35]/40'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{method.title}</p>
                          <p className="text-sm text-[var(--text-muted)]">{method.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                      <FileText className="h-4 w-4" />
                      Notas para el pedido (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Sin cebolla, tocar timbre..."
                      rows={3}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {currentStep === 5 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
                    Revisa tu pedido
                  </h2>

                  <div className="flex flex-col gap-4">
                    {/* Delivery info */}
                    <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        {deliveryType === 'DELIVERY' ? (
                          <Truck className="h-4 w-4" />
                        ) : (
                          <Store className="h-4 w-4" />
                        )}
                        <span>
                          {deliveryType === 'DELIVERY' ? 'Delivery' : 'Retiro en local'}
                        </span>
                      </div>
                      {selectedAddress && (
                        <p className="mt-1 text-sm text-[var(--text-primary)]">
                          {selectedAddress.street} {selectedAddress.number}
                          {selectedAddress.floor ? `, Piso ${selectedAddress.floor}` : ''}
                          {selectedAddress.apartment ? ` ${selectedAddress.apartment}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <Clock className="h-4 w-4" />
                        <span>Horario</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        Hoy a las {selectedTimeSlot}
                      </p>
                    </div>

                    {/* Payment */}
                    <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <CreditCard className="h-4 w-4" />
                        <span>Metodo de pago</span>
                      </div>
                      <p className="mt-1 text-sm capitalize text-[var(--text-primary)]">
                        {paymentMethod === 'cash'
                          ? 'Efectivo'
                          : paymentMethod === 'card'
                            ? 'Tarjeta'
                            : paymentMethod === 'mercadopago'
                              ? 'MercadoPago'
                              : 'Transferencia'}
                      </p>
                    </div>

                    {/* Notes */}
                    {notes && (
                      <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                          <FileText className="h-4 w-4" />
                          <span>Notas</span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{notes}</p>
                      </div>
                    )}

                    {/* Items list */}
                    <div className="rounded-xl border border-[var(--border-color)] p-4">
                      <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Items</h3>
                      <div className="flex flex-col gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <UtensilsCrossed className="h-4 w-4 text-[var(--text-muted)]" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                  {item.quantity}x {item.name}
                                </p>
                                {item.extras.length > 0 && (
                                  <p className="text-xs text-[var(--text-muted)]">
                                    + {item.extras.map((e) => e.name).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {formatPrice(
                                (item.price +
                                  item.extras.reduce((s, e) => s + e.price, 0)) *
                                  item.quantity,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-[var(--border-color)] pt-6">
            {currentStep > 1 ? (
              <Button
                variant="ghost"
                onClick={goBack}
                icon={<ChevronLeft className="h-5 w-5" />}
              >
                Atras
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                onClick={goNext}
                disabled={!canAdvance()}
                icon={<ChevronRight className="h-5 w-5" />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleConfirmOrder}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon={<Sparkles className="h-5 w-5" />}
                size="lg"
              >
                Confirmar pedido
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar: Order summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-fit rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm lg:sticky lg:top-24"
        >
          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Resumen</h3>

          <div className="mb-4 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatPrice(
                    (item.price + item.extras.reduce((s, e) => s + e.price, 0)) *
                      item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-3">
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-[#2D6A4F]">
                <span className="flex items-center gap-1">
                  Descuento
                  {couponCode && (
                    <Badge variant="success" size="sm">
                      {couponCode}
                    </Badge>
                  )}
                </span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-lg font-bold text-[var(--text-primary)]">
              <span>Total</span>
              <span className="text-[#FF6B35]">{formatPrice(total)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

/* ---- Helper Component ---- */

function DeliveryOption({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all ${
        selected
          ? 'border-[#FF6B35] bg-[#FF6B35]/5 shadow-md'
          : 'border-[var(--border-color)] hover:border-[#FF6B35]/40'
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          selected
            ? 'bg-[#FF6B35] text-white'
            : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
    </motion.button>
  );
}
