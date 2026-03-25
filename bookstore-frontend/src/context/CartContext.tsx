import { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  bookID: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (book: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (bookID: number) => void;
  updateQuantity: (bookID: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem('bookstore-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem('bookstore-cart', JSON.stringify(items));
  }, [items]);

  function addToCart(book: Omit<CartItem, 'quantity'>) {
    setItems(prev => {
      const existing = prev.find(i => i.bookID === book.bookID);
      if (existing) {
        return prev.map(i =>
          i.bookID === book.bookID ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  }

  function removeFromCart(bookID: number) {
    setItems(prev => prev.filter(i => i.bookID !== bookID));
  }

  function updateQuantity(bookID: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(bookID);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.bookID === bookID ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
