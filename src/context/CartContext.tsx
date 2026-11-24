"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PurchaseMode = "CASH" | "INSTALLMENT";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  imageUrl: string;
  brand: string;
  category: string;
  cashPrice: number;
  installmentPrice: number | null;
  installmentMonths: number | null;
  purchaseMode: PurchaseMode;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, purchaseMode: PurchaseMode) => void;
  updateQuantity: (productId: string, purchaseMode: PurchaseMode, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "vdf_clone_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartItem[];
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch {
        // ignore storage errors
      } finally {
        setIsHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, isHydrated]);

  const addItem = useCallback((incoming: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === incoming.productId && i.purchaseMode === incoming.purchaseMode
      );
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item
        );
      }
      return [...prev, { ...incoming, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const removeItem = useCallback((productId: string, purchaseMode: PurchaseMode) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.purchaseMode === purchaseMode))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, purchaseMode: PurchaseMode, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, purchaseMode);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.purchaseMode === purchaseMode
            ? { ...i, quantity: Math.min(10, quantity) }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => {
      const unit =
        i.purchaseMode === "INSTALLMENT" && i.installmentPrice
          ? i.installmentPrice
          : i.cashPrice;
      return sum + unit * i.quantity;
    }, 0);
    return {
      items,
      totalCount,
      totalAmount,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, isHydrated, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
