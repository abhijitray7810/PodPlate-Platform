'use client';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Trash2, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import api from '@/lib/api';

export default function CartPage() {
  const { items, totalItems, totalAmount, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    // Sync cart with backend
    const syncCart = async () => {
      if (items.length > 0) {
        try {
          const response = await api.get('/cart');
          // Update store with server cart
        } catch (error) {
          console.log('Cart sync failed');
        }
      }
    };
    syncCart();
  }, []);

  if (totalItems === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-8">🛒</div>
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products or food to get started</p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="space-y-6 mb-12">
        {items.map((item: CartItem) => (
          <div key={item.id} className="flex gap-6 bg-white p-6 rounded-2xl shadow-lg">
            <img 
              src={item.image || '/placeholder.jpg'} 
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl sticky bottom-0">
        <div className="flex justify-between items-center mb-6">
          <span className="text-2xl font-bold">Total: ₹{totalAmount.toLocaleString()}</span>
          <span className="text-lg text-gray-600">
            {totalItems} items
          </span>
        </div>
        <Link href="/checkout">
          <Button className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}