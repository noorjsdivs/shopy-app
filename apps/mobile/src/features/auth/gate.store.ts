import { create } from 'zustand';

type PendingAction = (() => void) | null;

interface GateState {
  open: boolean;
  message?: string;
  pending: PendingAction;
  /** Open the AuthSheet, queueing an action to resume on success. */
  show: (action: PendingAction, message?: string) => void;
  /** Dismiss without auth (cancel the pending action). */
  hide: () => void;
  /** Called after successful auth — runs and clears the pending action. */
  resolve: () => void;
}

export const useGate = create<GateState>((set, get) => ({
  open: false,
  message: undefined,
  pending: null,
  show: (action, message) => set({ open: true, pending: action, message }),
  hide: () => set({ open: false, pending: null, message: undefined }),
  resolve: () => {
    const { pending } = get();
    set({ open: false, message: undefined, pending: null });
    // Run after close so navigation/state settle first.
    if (pending) setTimeout(pending, 50);
  },
}));
