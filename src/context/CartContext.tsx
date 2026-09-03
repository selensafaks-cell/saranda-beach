"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartLine } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  setLineNote: (productId: string, note: string) => void;
  clear: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "saranda_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore cart if the page refreshes (beach wifi drops happen)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupted cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage full / unavailable - cart just won't persist, non-fatal
    }
  }, [lines, hydrated]);

  function addItem(line: Omit<CartLine, "quantity">, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === line.product_id);
      if (existing) {
        return prev.map((l) =>
          l.product_id === line.product_id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, { ...line, quantity }];
    });
  }

  function increment(productId: string) {
    setLines((prev) =>
      prev.map((l) => (l.product_id === productId ? { ...l, quantity: l.quantity + 1 } : l))
    );
  }

  function decrement(productId: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.product_id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.product_id !== productId));
  }

  function setLineNote(productId: string, note: string) {
    setLines((prev) =>
      prev.map((l) => (l.product_id === productId ? { ...l, line_note: note } : l))
    );
  }

  function clear() {
    setLines([]);
  }

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  return (
    <CartContext.Provider
      value={{ lines, addItem, increment, decrement, remove, setLineNote, clear, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
