import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Ingredient, IngredientType, SelectedIngredient } from '@/types';

interface BuilderState {
  selectedIngredients: Map<IngredientType, SelectedIngredient[]>;
  currentStep: number;
  totalPrice: number;
  addIngredient: (ingredient: Ingredient, qty: number) => void;
  removeIngredient: (ingredientId: string) => void;
  setStep: (n: number) => void;
  reset: () => void;
}

function computePrice(ingredients: Map<IngredientType, SelectedIngredient[]>): number {
  let total = 0;
  ingredients.forEach((items) => {
    for (const item of items) {
      total += item.ingredient.price * item.quantity;
    }
  });
  return total;
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set) => ({
      selectedIngredients: new Map(),
      currentStep: 0,
      totalPrice: 0,

      addIngredient: (ingredient: Ingredient, qty: number) =>
        set((state) => {
          const updated = new Map(state.selectedIngredients);
          const typeItems = [...(updated.get(ingredient.type) ?? [])];

          const existingIdx = typeItems.findIndex(
            (i) => i.ingredient.id === ingredient.id,
          );

          if (existingIdx >= 0) {
            typeItems[existingIdx] = {
              ...typeItems[existingIdx],
              quantity: typeItems[existingIdx].quantity + qty,
            };
          } else {
            typeItems.push({ ingredient, quantity: qty });
          }

          updated.set(ingredient.type, typeItems);
          return { selectedIngredients: updated, totalPrice: computePrice(updated) };
        }, false, 'addIngredient'),

      removeIngredient: (ingredientId: string) =>
        set((state) => {
          const updated = new Map(state.selectedIngredients);
          for (const [type, items] of updated.entries()) {
            const filtered = items.filter(
              (i) => i.ingredient.id !== ingredientId,
            );
            if (filtered.length === 0) {
              updated.delete(type);
            } else if (filtered.length !== items.length) {
              updated.set(type, filtered);
            }
          }
          return { selectedIngredients: updated, totalPrice: computePrice(updated) };
        }, false, 'removeIngredient'),

      setStep: (n: number) => set({ currentStep: n }, false, 'setStep'),

      reset: () =>
        set(
          { selectedIngredients: new Map(), currentStep: 0, totalPrice: 0 },
          false,
          'reset',
        ),
    }),
    { name: 'BuilderStore' },
  ),
);
