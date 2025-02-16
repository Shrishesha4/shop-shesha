import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem } from '@/types/cart';

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(persist<CartStore>(
    (set) => ({
      items: [],
      total: 0,
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.productId === item.productId);
        if (existingItem) {
          const updatedItems = state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
          return {
            items: updatedItems,
            total: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }
        const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
        const newItems = [...state.items, newItem];
        return {
          items: newItems,
          total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        };
      }),
      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return {
            items: newItems,
            total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity < 1) return state;
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          return {
            items: newItems,
            total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);