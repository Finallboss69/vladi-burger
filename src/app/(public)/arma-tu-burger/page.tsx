'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Trash2,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useBuilderStore } from '@/stores/builder-store';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import api from '@/lib/api';
import { cn, formatPrice, generateId } from '@/lib/utils';
import { IngredientType } from '@/types';
import type { Ingredient } from '@/types';

const STEPS: { label: string; type: IngredientType; emoji: string; required: boolean; description: string }[] = [
  { label: 'Pan', type: 'BUN' as IngredientType, emoji: '🍞', required: true, description: 'La base de todo' },
  { label: 'Carne', type: 'MEAT' as IngredientType, emoji: '🥩', required: true, description: 'El corazon de tu burger' },
  { label: 'Queso', type: 'CHEESE' as IngredientType, emoji: '🧀', required: false, description: 'Ese toque cremoso' },
  { label: 'Vegetales', type: 'VEGETABLE' as IngredientType, emoji: '🥬', required: false, description: 'Frescura y crunch' },
  { label: 'Salsas', type: 'SAUCE' as IngredientType, emoji: '🔥', required: false, description: 'Dale sabor unico' },
  { label: 'Toppings', type: 'TOPPING' as IngredientType, emoji: '🥓', required: false, description: 'El toque final' },
  { label: 'Listo', type: 'BUN' as IngredientType, emoji: '🍔', required: false, description: 'Tu obra maestra' },
];

const TYPE_LABELS: Record<string, string> = {
  BUN: 'Pan', MEAT: 'Carne', CHEESE: 'Queso',
  VEGETABLE: 'Vegetales', SAUCE: 'Salsas', TOPPING: 'Toppings',
};

/* ---- Ingredient Card ---- */

function IngredientCard({
  ingredient,
  isSelected,
  onToggle,
  index,
}: {
  ingredient: Ingredient;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className={cn(
        'group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden',
        isSelected
          ? 'border-[#FF6B35] bg-[#FF6B35]/8 shadow-lg shadow-[#FF6B35]/15'
          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[#FF6B35]/40 hover:bg-[var(--bg-secondary)]',
      )}
    >
      {/* Glow effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 to-transparent pointer-events-none" />
      )}

      {/* Check badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/30 z-10"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      <motion.span
        className="text-4xl sm:text-5xl drop-shadow-sm relative z-[1]"
        animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.4 }}
        role="img"
        aria-label={ingredient.name}
      >
        {ingredient.imageUrl}
      </motion.span>

      {/* Name */}
      <span className={cn(
        'text-sm font-bold transition-colors relative z-[1]',
        isSelected ? 'text-[#FF6B35]' : 'text-[var(--text-primary)]',
      )}>
        {ingredient.name}
      </span>

      {/* Price */}
      <span
        className={cn(
          'text-xs font-semibold rounded-full px-2.5 py-0.5 relative z-[1]',
          ingredient.price === 0
            ? 'bg-emerald-500/10 text-emerald-400'
            : isSelected
              ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
        )}
      >
        {ingredient.price === 0 ? 'Incluido' : `+ ${formatPrice(ingredient.price)}`}
      </span>
    </motion.button>
  );
}

/* ---- Progress Steps (Connected Nodes) ---- */

function ProgressSteps({
  currentStep,
  onStepClick,
  selectedIngredients,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
  selectedIngredients: Map<IngredientType, { ingredient: Ingredient; quantity: number }[]>;
}) {
  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-[var(--border-color)] hidden sm:block" />
      <div className="absolute top-5 left-6 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FF6B35]/50 hidden sm:block transition-all duration-500"
        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 3rem)' }}
      />

      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:gap-0 scrollbar-hide">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const hasItems = idx < STEPS.length - 1 && (selectedIngredients.get(step.type)?.length ?? 0) > 0;
          const itemCount = idx < STEPS.length - 1 ? (selectedIngredients.get(step.type)?.length ?? 0) : 0;

          return (
            <button
              key={step.label}
              onClick={() => onStepClick(idx)}
              className="relative flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
            >
              {/* Node */}
              <motion.div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all z-10',
                  isActive
                    ? 'border-[#FF6B35] bg-[#FF6B35] shadow-lg shadow-[#FF6B35]/30 scale-110'
                    : isPast
                      ? hasItems
                        ? 'border-[#FF6B35] bg-[#FF6B35]/15'
                        : 'border-[#FF6B35]/40 bg-[#FF6B35]/5'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)] group-hover:border-[#FF6B35]/30',
                )}
                whileHover={{ scale: isActive ? 1.1 : 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPast && hasItems ? (
                  <span className="text-xs font-bold text-[#FF6B35]">{itemCount}</span>
                ) : (
                  <span className={isActive ? 'grayscale-0' : 'grayscale-[0.3] opacity-70'}>{step.emoji}</span>
                )}

                {/* Pulse ring on active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#FF6B35]"
                    animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-[#FF6B35]'
                    : isPast
                      ? 'text-[var(--text-secondary)]'
                      : 'text-[var(--text-muted)]',
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Live Burger Stack Preview ---- */

function BurgerStackPreview({
  selectedIngredients,
  totalPrice,
  removeIngredient,
}: {
  selectedIngredients: Map<IngredientType, { ingredient: Ingredient; quantity: number }[]>;
  totalPrice: number;
  removeIngredient: (id: string) => void;
}) {
  const allItems = useMemo(() => {
    const items: { id: string; name: string; emoji: string; price: number; qty: number; type: string }[] = [];
    // Build in burger order: bun top, toppings, cheese, meat, veggies, sauces, bun bottom
    const order = [IngredientType.TOPPING, IngredientType.CHEESE, IngredientType.VEGETABLE, IngredientType.SAUCE, IngredientType.MEAT];
    for (const type of order) {
      const selections = selectedIngredients.get(type) ?? [];
      for (const sel of selections) {
        items.push({
          id: sel.ingredient.id,
          name: sel.ingredient.name,
          emoji: sel.ingredient.imageUrl ?? '',
          price: sel.ingredient.price,
          qty: sel.quantity,
          type,
        });
      }
    }
    return items;
  }, [selectedIngredients]);

  const hasBun = (selectedIngredients.get('BUN' as IngredientType)?.length ?? 0) > 0;
  const bunItem = selectedIngredients.get('BUN' as IngredientType)?.[0];
  const totalItems = allItems.length + (hasBun ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-lg">🍔</span>
          Tu Vlady
        </h3>
        {totalItems > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
            {totalItems} {totalItems === 1 ? 'ingrediente' : 'ingredientes'}
          </span>
        )}
      </div>

      {/* Stack visualization */}
      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-3 opacity-30"
          >
            🍔
          </motion.div>
          <p className="text-sm text-[var(--text-muted)] max-w-[200px]">
            Empeza a elegir ingredientes para armar tu burger
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* Top bun */}
          {hasBun && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center py-1"
            >
              <span className="text-3xl">🍞</span>
            </motion.div>
          )}

          {/* Ingredients stack */}
          <div className="flex flex-col-reverse gap-0.5 items-center">
            <AnimatePresence mode="popLayout">
              {allItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 50 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="group relative w-full"
                >
                  <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[var(--bg-primary)] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[var(--text-primary)] block truncate">
                          {item.name}
                          {item.qty > 1 && (
                            <span className="ml-1 text-[var(--text-muted)]">x{item.qty}</span>
                          )}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {item.price === 0 ? 'Incluido' : formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeIngredient(item.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom bun */}
          {hasBun && bunItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 group hover:bg-[var(--bg-primary)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🍞</span>
                <div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">{bunItem.ingredient.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {bunItem.ingredient.price === 0 ? 'Incluido' : formatPrice(bunItem.ingredient.price)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeIngredient(bunItem.ingredient.id)}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[#D62828]/10 hover:text-[#D62828] transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Total */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 mt-1">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total</span>
          <motion.span
            key={totalPrice}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-black text-[#FF6B35]"
          >
            {formatPrice(totalPrice)}
          </motion.span>
        </div>
      )}
    </div>
  );
}

/* ---- Mobile Bottom Bar ---- */

function MobileBottomBar({
  totalItems,
  totalPrice,
  currentStep,
  onNext,
  onPrev,
  isLastStep,
  stepsLength,
}: {
  totalItems: number;
  totalPrice: number;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  isLastStep: boolean;
  stepsLength: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Price bar */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-3 mb-2 flex items-center justify-between rounded-2xl bg-black/90 backdrop-blur-lg border border-white/10 px-4 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🍔</span>
            <div>
              <span className="text-xs text-white/50 block">Tu Vlady</span>
              <span className="text-xs font-bold text-white">{totalItems} ingredientes</span>
            </div>
          </div>
          <span className="text-lg font-black text-[#FF6B35]">{formatPrice(totalPrice)}</span>
        </motion.div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center gap-2 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border-color)] px-4 py-3">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] disabled:opacity-30 cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Progress dots */}
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentStep
                  ? 'w-6 bg-[#FF6B35]'
                  : i < currentStep
                    ? 'w-1.5 bg-[#FF6B35]/40'
                    : 'w-1.5 bg-[var(--border-color)]',
              )}
            />
          ))}
        </div>

        {!isLastStep && (
          <button
            onClick={onNext}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 text-sm font-bold text-white cursor-pointer transition-colors hover:bg-[#e55e2e]"
          >
            {currentStep === stepsLength - 2 ? 'Revisar' : 'Siguiente'}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- Main Page ---- */

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
  const [addedToCart, setAddedToCart] = useState(false);

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

  const totalItemCount = useMemo(() => {
    let count = 0;
    selectedIngredients.forEach((items) => {
      count += items.length;
    });
    return count;
  }, [selectedIngredients]);

  const toggleIngredient = useCallback((ingredient: Ingredient) => {
    if (selectedIdsForStep.has(ingredient.id)) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient, 1);
    }
  }, [selectedIdsForStep, addIngredient, removeIngredient]);

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
    const name = burgerName.trim() || 'Mi Vlady Custom';
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
        message: 'Agrega al menos un ingrediente.',
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

    setAddedToCart(true);
    setTimeout(() => {
      reset();
      setBurgerName('');
      setAddedToCart(false);
    }, 2000);
  }

  function handleReset() {
    reset();
    setBurgerName('');
  }

  const progressPercent = Math.round((currentStep / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ====== Hero ====== */}
      <section className="relative overflow-hidden bg-black py-10 sm:py-14 lg:py-16">
        {/* Bg effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(255,107,53,0.12)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(214,40,40,0.06)_0%,transparent_50%)]" />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B35]/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Personalizada</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight"
            >
              CREA TU{' '}
              <span className="text-[#FF6B35] relative">
                VLADY
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#FF6B35]/30 rounded-full" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-3 text-sm sm:text-base text-white/40 max-w-md"
            >
              Elegí cada ingrediente, paso a paso, y creá la hamburguesa de tus suenos
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 w-full max-w-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Progreso</span>
                <span className="text-[10px] font-bold text-[#FF6B35]">{progressPercent}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#D62828] rounded-full"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      {/* ====== Builder ====== */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Step indicator */}
        <ProgressSteps
          currentStep={currentStep}
          onStepClick={handleStepClick}
          selectedIngredients={selectedIngredients}
        />

        <div className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {isLastStep ? (
                  /* ====== Review Step ====== */
                  <div className="flex flex-col gap-6">
                    {/* Success animation */}
                    <div className="text-center py-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 mb-4"
                      >
                        <span className="text-5xl">🍔</span>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]"
                      >
                        Tu Vlady esta lista!
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 text-[var(--text-muted)]"
                      >
                        Dale un nombre y sumala al carrito
                      </motion.p>
                    </div>

                    {/* Name input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Input
                        label="Nombre de tu burger"
                        placeholder="Ej: La Monstruosa, La Doble Todo..."
                        value={burgerName}
                        onChange={(e) => setBurgerName(e.target.value)}
                        iconLeft={<Sparkles className="h-4 w-4 text-[#FF6B35]" />}
                      />
                    </motion.div>

                    {/* Summary breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-[var(--border-color)]">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <span className="text-base">📋</span>
                          Resumen de ingredientes
                        </h3>
                      </div>
                      <div className="p-5 space-y-4">
                        {Array.from(selectedIngredients.entries()).map(
                          ([type, items]) => (
                            <div key={type}>
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                                <span className="h-px flex-1 bg-[var(--border-color)]" />
                                {TYPE_LABELS[type] ?? type}
                                <span className="h-px flex-1 bg-[var(--border-color)]" />
                              </p>
                              {items.map((sel) => (
                                <div
                                  key={sel.ingredient.id}
                                  className="flex items-center justify-between py-1.5"
                                >
                                  <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                    <span className="text-lg">{sel.ingredient.imageUrl}</span>
                                    <span className="font-medium">{sel.ingredient.name}</span>
                                    {sel.quantity > 1 && (
                                      <span className="text-[var(--text-muted)] text-xs">x{sel.quantity}</span>
                                    )}
                                  </span>
                                  <span className="text-sm font-semibold text-[var(--text-secondary)]">
                                    {sel.ingredient.price === 0
                                      ? 'Incluido'
                                      : formatPrice(sel.ingredient.price * sel.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex items-center justify-between">
                        <span className="text-base font-bold text-[var(--text-primary)]">Total</span>
                        <span className="text-2xl font-black text-[#FF6B35]">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col gap-3"
                    >
                      <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={addedToCart}
                        className="w-full h-14 text-base"
                        icon={addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                      >
                        {addedToCart ? 'Agregada al carrito!' : 'Agregar al carrito'}
                      </Button>
                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-2"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Empezar de nuevo
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  /* ====== Ingredient Selection Step ====== */
                  <div>
                    {/* Step header */}
                    <div className="mb-5 sm:mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/15 text-2xl">
                          {currentStepConfig.emoji}
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                            {currentStepConfig.label}
                          </h2>
                          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                            {currentStepConfig.description}
                            {currentStepConfig.required && (
                              <span className="ml-1.5 text-[#D62828] text-[10px] font-bold">REQUERIDO</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full hidden sm:block">
                        {filteredIngredients.length} opciones
                      </span>
                    </div>

                    {/* Ingredients grid */}
                    {filteredIngredients.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
                        {filteredIngredients.map((ingredient, i) => (
                          <IngredientCard
                            key={ingredient.id}
                            ingredient={ingredient}
                            isSelected={selectedIdsForStep.has(ingredient.id)}
                            onToggle={() => toggleIngredient(ingredient)}
                            index={i}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-[var(--border-color)]">
                        <span className="text-4xl mb-3 opacity-40">{currentStepConfig.emoji}</span>
                        <p className="text-sm text-[var(--text-muted)]">
                          No hay opciones de {currentStepConfig.label.toLowerCase()} disponibles
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation */}
            <div className="mt-6 sm:mt-8 hidden lg:flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={goPrev}
                disabled={currentStep === 0}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                {totalItemCount > 0 && !isLastStep && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#D62828] transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-[#D62828]/5"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reiniciar
                  </button>
                )}
                {!isLastStep && (
                  <Button
                    onClick={goNext}
                    icon={currentStep === STEPS.length - 2 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  >
                    {currentStep === STEPS.length - 2 ? 'Ver resumen' : 'Siguiente'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — Desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BurgerStackPreview
                selectedIngredients={selectedIngredients}
                totalPrice={totalPrice}
                removeIngredient={removeIngredient}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        totalItems={totalItemCount}
        totalPrice={totalPrice}
        currentStep={currentStep}
        onNext={goNext}
        onPrev={goPrev}
        isLastStep={isLastStep}
        stepsLength={STEPS.length}
      />

      {/* Mobile bottom spacer */}
      <div className="h-28 lg:hidden" />
    </div>
  );
}
