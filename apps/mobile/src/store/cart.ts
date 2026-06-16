import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product, ReplacementPreference } from '@shopy/shared';

export interface CartItem {
  productId: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeLogo: string;
  name: string;
  brand?: string | null;
  size?: string | null;
  image: string;
  priceMinor: number;
  compareAtMinor?: number | null;
  byWeight: boolean;
  qty: number;
  replacement: ReplacementPreference;
}

interface CartState {
  items: Record<string, CartItem>;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  setReplacement: (productId: string, pref: ReplacementPreference) => void;
  clear: () => void;
  clearStore: (storeId: string) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items[product.id];
          const store = product.store;
          const item: CartItem = existing
            ? { ...existing, qty: existing.qty + qty }
            : {
                productId: product.id,
                storeId: product.storeId,
                storeSlug: store?.slug ?? '',
                storeName: store?.name ?? 'Store',
                storeLogo: store?.logo ?? '🛍️',
                name: product.name,
                brand: product.brand,
                size: product.size,
                image: product.image,
                priceMinor: product.priceMinor,
                compareAtMinor: product.compareAtMinor,
                byWeight: product.byWeight,
                qty,
                replacement: 'BEST_MATCH',
              };
          return { items: { ...state.items, [product.id]: item } };
        }),

      setQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next };
          }
          const existing = state.items[productId];
          if (!existing) return state;
          return {
            items: { ...state.items, [productId]: { ...existing, qty } },
          };
        }),

      increment: (productId) =>
        set((state) => {
          const existing = state.items[productId];
          if (!existing) return state;
          return {
            items: {
              ...state.items,
              [productId]: { ...existing, qty: existing.qty + 1 },
            },
          };
        }),

      decrement: (productId) =>
        set((state) => {
          const existing = state.items[productId];
          if (!existing) return state;
          const qty = existing.qty - 1;
          if (qty <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next };
          }
          return {
            items: { ...state.items, [productId]: { ...existing, qty } },
          };
        }),

      remove: (productId) =>
        set((state) => {
          const next = { ...state.items };
          delete next[productId];
          return { items: next };
        }),

      setReplacement: (productId, pref) =>
        set((state) => {
          const existing = state.items[productId];
          if (!existing) return state;
          return {
            items: {
              ...state.items,
              [productId]: { ...existing, replacement: pref },
            },
          };
        }),

      clear: () => set({ items: {} }),

      clearStore: (storeId) =>
        set((state) => {
          const next = Object.fromEntries(
            Object.entries(state.items).filter(
              ([, i]) => i.storeId !== storeId,
            ),
          );
          return { items: next };
        }),
    }),
    {
      name: 'shopy-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// --- Selectors (use with useCart(selector)) --------------------------------
export const selectItemList = (s: CartState): CartItem[] =>
  Object.values(s.items);

export const selectCount = (s: CartState): number =>
  Object.values(s.items).reduce((n, i) => n + i.qty, 0);

export const selectSubtotal = (s: CartState): number =>
  Object.values(s.items).reduce((n, i) => n + i.priceMinor * i.qty, 0);

export function selectQtyFor(productId: string) {
  return (s: CartState): number => s.items[productId]?.qty ?? 0;
}
