import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/commerce/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeLine: (productSlug: string) => void;
  setQuantity: (productSlug: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const clampQty = (n: number) => Math.max(0, Math.min(99, Math.floor(n)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,

      addLine: (incoming) => {
        const qty = clampQty(incoming.quantity ?? 1);
        if (qty === 0) return;
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productSlug === incoming.productSlug,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productSlug === incoming.productSlug
                  ? { ...l, quantity: clampQty(l.quantity + qty) }
                  : l,
              ),
            };
          }
          const { quantity: _omit, ...rest } = incoming;
          void _omit;
          const newLine: CartLine = { ...rest, quantity: qty };
          return { lines: [...state.lines, newLine] };
        });
      },

      removeLine: (productSlug) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productSlug !== productSlug),
        })),

      setQuantity: (productSlug, quantity) => {
        const qty = clampQty(quantity);
        set((state) => {
          if (qty === 0) {
            return {
              lines: state.lines.filter((l) => l.productSlug !== productSlug),
            };
          }
          return {
            lines: state.lines.map((l) =>
              l.productSlug === productSlug ? { ...l, quantity: qty } : l,
            ),
          };
        });
      },

      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "berman-cart-v1" },
  ),
);

export const subtotal = (state: CartState): number =>
  state.lines.reduce((acc, l) => acc + l.price * l.quantity, 0);

export const totalItems = (state: CartState): number =>
  state.lines.reduce((acc, l) => acc + l.quantity, 0);
