import { create } from 'zustand';

export interface FlyEvent {
  id: number;
  x: number;
  y: number;
  image?: string;
}

interface FlyState {
  event: FlyEvent | null;
  play: (x: number, y: number, image?: string) => void;
  clear: () => void;
}

let counter = 0;

/** Triggers the add-to-cart "fly to cart" animation (FlyOverlay in _layout). */
export const useFly = create<FlyState>((set) => ({
  event: null,
  play: (x, y, image) => set({ event: { id: ++counter, x, y, image } }),
  clear: () => set({ event: null }),
}));
