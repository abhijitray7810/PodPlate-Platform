import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCart: (items: CartItem[], totalItems: number, totalAmount: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  
  addItem: (itemData) => {
    const item: CartItem = { id: Date.now().toString(), ...itemData };
    set((state) => {
      const existing = state.items.find(i => i.name === item.name);
      let items, totalItems, totalAmount;
      
      if (existing) {
        items = state.items.map(i => 
          i.name === item.name 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        items = [...state.items, item];
      }
      
      totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      
      return { items, totalItems, totalAmount };
    });
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => {
      const items = state.items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, totalItems, totalAmount };
    });
  },
  
  removeItem: (id) => {
    set((state) => {
      const items = state.items.filter(item => item.id !== id);
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, totalItems, totalAmount };
    });
  },
  
  clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0 }),
  
  setCart: (items, totalItems, totalAmount) => 
    set({ items, totalItems, totalAmount })
}));
