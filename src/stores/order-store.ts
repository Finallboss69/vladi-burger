import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderStatus } from '@/types';

interface OrderState {
  activeOrderId: string | null;
  orderStatus: OrderStatus | null;
  setActiveOrder: (id: string, status: OrderStatus) => void;
  updateStatus: (status: OrderStatus) => void;
  clearActiveOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  devtools(
    (set) => ({
      activeOrderId: null,
      orderStatus: null,

      setActiveOrder: (id: string, status: OrderStatus) =>
        set({ activeOrderId: id, orderStatus: status }, false, 'setActiveOrder'),

      updateStatus: (status: OrderStatus) =>
        set({ orderStatus: status }, false, 'updateStatus'),

      clearActiveOrder: () =>
        set({ activeOrderId: null, orderStatus: null }, false, 'clearActiveOrder'),
    }),
    { name: 'OrderStore' },
  ),
);
