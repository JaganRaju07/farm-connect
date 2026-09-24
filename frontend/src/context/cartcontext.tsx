// frontend/src/context/CartContext.tsx

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Product } from '@/lib/api/products';
import { useToast } from '@/context/ToastContext';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number, productName?: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'farmconnect_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { success, error } = useToast();

  // Load cart from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setMounted(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setItems(current => {
      const idx = current.findIndex(i => String(i.product.id) === String(product.id));
      if (idx >= 0) {
        const updated = [...current];
        const newQ = updated[idx].quantity + quantity;
        const finalQ = Math.min(newQ, product.stockAvailable);
        updated[idx] = { ...updated[idx], quantity: finalQ };
        return updated;
      }
      return [...current, { product, quantity }];
    });
    
    // Side effects should not be inside the state updater function
    // In React 18 Strict Mode, the updater runs twice, causing double toasts.
    // Since page.tsx also fires a toast, we don't strictly need them here, 
    // but we can fire a generic one if we wanted to. We'll leave it to the caller.
  }, []);

  const removeFromCart = useCallback((productId: number, productName?: string) => {
    setItems(current => current.filter(i => String(i.product.id) !== String(productId)));
    if (productName) {
      success(`Removed ${productName} from cart`);
    }
  }, [success]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        String(item.product.id) === String(productId)
          ? { ...item, quantity: Math.min(quantity, item.product.stockAvailable) }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
