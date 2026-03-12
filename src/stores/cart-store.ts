import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  subtotal: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clear: () => void;
}

function computeTotals(items: CartItem[], discount: number) {
  const subtotal = items.reduce(
    (sum, item) => {
      const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
      return sum + (item.price + extrasTotal) * item.quantity;
    },
    0,
  );
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        couponCode: null,
        discount: 0,
        subtotal: 0,
        total: 0,

        addItem: (item: CartItem) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            const updatedItems = existing
              ? state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i,
                )
              : [...state.items, item];
            return { items: updatedItems, ...computeTotals(updatedItems, state.discount) };
          }, false, 'addItem'),

        removeItem: (id: string) =>
          set((state) => {
            const updatedItems = state.items.filter((i) => i.id !== id);
            return { items: updatedItems, ...computeTotals(updatedItems, state.discount) };
          }, false, 'removeItem'),

        updateQuantity: (id: string, qty: number) =>
          set((state) => {
            if (qty <= 0) {
              const updatedItems = state.items.filter((i) => i.id !== id);
              return { items: updatedItems, ...computeTotals(updatedItems, state.discount) };
            }
            const updatedItems = state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i,
            );
            return { items: updatedItems, ...computeTotals(updatedItems, state.discount) };
          }, false, 'updateQuantity'),

        applyCoupon: (code: string) =>
          set((state) => {
            const discount = Math.round(state.subtotal * 0.1);
            return {
              couponCode: code,
              discount,
              ...computeTotals(state.items, discount),
            };
          }, false, 'applyCoupon'),

        removeCoupon: () =>
          set((state) => ({
            couponCode: null,
            discount: 0,
            ...computeTotals(state.items, 0),
          }), false, 'removeCoupon'),

        clear: () =>
          set(
            { items: [], couponCode: null, discount: 0, subtotal: 0, total: 0 },
            false,
            'clear',
          ),
      }),
      { name: 'vladi-cart' },
    ),
    { name: 'CartStore' },
  ),
);
