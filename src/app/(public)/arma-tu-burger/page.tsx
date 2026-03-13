'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Trash2,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useBuilderStore } from '@/stores/builder-store';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';
import { cn, formatPrice, generateId } from '@/lib/utils';
import type { Ingredient, IngredientType } from '@/types';

const STEPS: { label: string; type: IngredientType; emoji: string; required: boolean }[] = [
  { label: 'Pan', type: 'BUN' as IngredientType, emoji: '🍞', required: true },
  { label: 'Carne', type: 'MEAT' as IngredientType, emoji: '🥩', required: true },
  { label: 'Queso', type: 'CHEESE' as IngredientType, emoji: '🧀', required: false },
  { label: 'Vegetales', type: 'VEGETABLE' as IngredientType, emoji: '🥬', required: false },
  { label: 'Salsas', type: 'SAUCE' as IngredientType, emoji: '🔥', required: false },
  { label: 'Toppings', type: 'TOPPING' as IngredientType, emoji: '🥓', required: false },
  { label: 'Resumen', type: 'BUN' as IngredientType, emoji: '🍔', required: false },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

function IngredientCard({
  ingredient,
  isSelected,
  onToggle,
}: {
  ingredient: Ingredient;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors cursor-pointer',
        'bg-[var(--bg-secondary)]',
        isSelected
          ? 'border-[#FF6B35] shadow-lg shadow-[#FF6B35]/20'
          : 'border-[var(--border-color)] hover:border-[#FF6B35]/50',
      )}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] text-white"
        >
          <Check className="h-3.5 w-3.5" />
        </motion.div>
      )}
      <span className="text-4xl" role="img" aria-label={ingredient.name}>
        {ingredient.imageUrl}
      </span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {ingredient.name}
      </span>
      <span
        className={cn(
          'text-xs font-medium',
          ingredient.price === 0
            ? 'text-[#2D6A4F]'
            : 'text-[var(--text-secondary)]',
        )}
      >
        {ingredient.price === 0 ? 'Incluido' : `+ ${formatPrice(ingredient.price)}`}
      </span>
    </motion.button>
  );
}

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2 sm:gap-2">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < currentStep;
        return (
          <button
            key={step.label}
            onClick={() => onStepClick(idx)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium transition-all sm:px-3 sm:text-sm cursor-pointer',
              isActive
                ? 'bg-[#FF6B35] text-white shadow-md'
                : isPast
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
            )}
          >
            <span className="hidden sm:inline">{step.emoji}</span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SelectedSidebar() {
  const { selectedIngredients, totalPrice, removeIngredient } = useBuilderStore();

  const allItems = useMemo(() => {
    const items: { id: string; name: string; emoji: string; price: number; qty: number }[] = [];
    selectedIngredients.forEach((selections) => {
      for (const sel of selections) {
        items.push({
          id: sel.ingredient.id,
          name: sel.ingredient.name,
          emoji: sel.ingredient.imageUrl ?? '',
          price: sel.ingredient.price,
          qty: sel.quantity,
        });
      }
    });
    return items;
  }, [selectedIngredients]);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] p-6 text-center">
        <span className="text-3xl">🍔</span>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Tu burger esta vacia. Empeza a agregar ingredientes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <h3 className="text-sm font-bold text-[var(--text-primary)]">Tu Burger</h3>
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {allItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-primary)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {item.name}
                  {item.qty > 1 && (
                    <span className="ml-1 text-[var(--text-muted)]">x{item.qty}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  {item.price === 0 ? 'Gratis' : formatPrice(item.price * item.qty)}
                </span>
                <button
                  onClick={() => removeIngredient(item.id)}
                  className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[var(--border-color)] pt-3">
        <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
        <span className="text-lg font-bold text-[#FF6B35]">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}

export default function ArmaTuBurgerPage() {
  const {
    selectedIngredients,
    currentStep,
    totalPrice,
    addIngredient,
    removeIngredient,
    setStep,
    reset,
  } = useBuilderStore();
  const addToCart = useCartStore((s) => s.addItem);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [direction, setDirection] = useState(0);
  const [burgerName, setBurgerName] = useState('');
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    api.get('/ingredients')
      .then((res) => setAllIngredients(res.data.data ?? []))
      .catch(() => setAllIngredients([]));
  }, []);

  const isLastStep = currentStep === STEPS.length - 1;

  const currentStepConfig = STEPS[currentStep];

  const filteredIngredients = useMemo(
    () =>
      isLastStep
        ? []
        : allIngredients.filter((i) => i.type === currentStepConfig.type && i.isActive),
    [currentStep, isLastStep, currentStepConfig.type, allIngredients],
  );

  const selectedIdsForStep = useMemo(() => {
    if (isLastStep) return new Set<string>();
    const items = selectedIngredients.get(currentStepConfig.type) ?? [];
    return new Set(items.map((i) => i.ingredient.id));
  }, [selectedIngredients, currentStep, isLastStep, currentStepConfig.type]);

  function toggleIngredient(ingredient: Ingredient) {
    if (selectedIdsForStep.has(ingredient.id)) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient, 1);
    }
  }

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setStep(currentStep + 1);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setStep(currentStep - 1);
    }
  }

  function handleStepClick(step: number) {
    setDirection(step > currentStep ? 1 : -1);
    setStep(step);
  }

  function handleAddToCart() {
    const name = burgerName.trim() || 'Mi Burger Custom';
    const allSelected: { ingredient: { id: string; name: string; price: number }; quantity: number }[] = [];
    selectedIngredients.forEach((items) => {
      for (const item of items) {
        allSelected.push(item);
      }
    });

    if (allSelected.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Burger vacia',
        message: 'Agrega al menos un ingrediente antes de agregar al carrito.',
      });
      return;
    }

    addToCart({
      id: generateId(),
      name,
      price: totalPrice,
      quantity: 1,
      extras: [],
      isCustom: true,
      customIngredients: allSelected.map((s) => ({
        ingredient: {
          id: s.ingredient.id,
          name: s.ingredient.name,
          price: s.ingredient.price,
          type: 'BUN' as IngredientType,
          isActive: true,
        },
        quantity: s.quantity,
      })),
    });

    addNotification({
      type: 'success',
      title: 'Agregada al carrito',
      message: `"${name}" fue agregada a tu carrito.`,
    });

    reset();
    setBurgerName('');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#D62828] py-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Arma Tu Burger
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Elegí cada ingrediente y creá tu hamburguesa perfecta
          </p>
        </motion.div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {isLastStep ? (
                  /* Review step */
                  <div className="flex flex-col gap-6">
                    <div className="text-center">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="inline-block text-6xl"
                      >
                        🍔
                      </motion.span>
                      <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
                        Tu burger esta lista!
                      </h2>
                      <p className="mt-1 text-[var(--text-secondary)]">
                        Dale un nombre y agregala al carrito
                      </p>
                    </div>

                    <Input
                      label="Nombre de tu burger"
                      placeholder="Ej: La Monstruosa"
                      value={burgerName}
                      onChange={(e) => setBurgerName(e.target.value)}
                      iconLeft={<Sparkles className="h-4 w-4" />}
                    />

                    {/* Summary */}
                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                      <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                        Resumen de ingredientes
                      </h3>
                      <div className="flex flex-col gap-3">
                        {Array.from(selectedIngredients.entries()).map(
                          ([type, items]) => (
                            <div key={type}>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                {type === 'BUN'
                                  ? 'Pan'
                                  : type === 'MEAT'
                                    ? 'Carne'
                                    : type === 'CHEESE'
                                      ? 'Queso'
                                      : type === 'VEGETABLE'
                                        ? 'Vegetales'
                                        : type === 'SAUCE'
                                          ? 'Salsas'
                                          : 'Toppings'}
                              </p>
                              {items.map((sel) => (
                                <div
                                  key={sel.ingredient.id}
                                  className="flex items-center justify-between py-1"
                                >
                                  <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                    <span>{sel.ingredient.imageUrl}</span>
                                    {sel.ingredient.name}
                                    {sel.quantity > 1 && (
                                      <span className="text-[var(--text-muted)]">
                                        x{sel.quantity}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm text-[var(--text-secondary)]">
                                    {sel.ingredient.price === 0
                                      ? 'Gratis'
                                      : formatPrice(sel.ingredient.price * sel.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          Total
                        </span>
                        <span className="text-2xl font-extrabold text-[#FF6B35]">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      icon={<ShoppingCart className="h-5 w-5" />}
                      onClick={handleAddToCart}
                      className="w-full"
                    >
                      Agregar al carrito
                    </Button>
                  </div>
                ) : (
                  /* Ingredient selection step */
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-3xl">{currentStepConfig.emoji}</span>
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          Elegí tu {currentStepConfig.label}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {currentStepConfig.required
                            ? 'Selecciona al menos una opcion'
                            : 'Opcional - podes seleccionar varias'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {filteredIngredients.map((ingredient) => (
                        <IngredientCard
                          key={ingredient.id}
                          ingredient={ingredient}
                          isSelected={selectedIdsForStep.has(ingredient.id)}
                          onToggle={() => toggleIngredient(ingredient)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={goPrev}
                disabled={currentStep === 0}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Anterior
              </Button>

              {!isLastStep && (
                <Button
                  onClick={goNext}
                  icon={<ChevronRight className="h-4 w-4" />}
                >
                  {currentStep === STEPS.length - 2 ? 'Revisar' : 'Siguiente'}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="order-first lg:order-last">
            <div className="sticky top-24">
              <SelectedSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
