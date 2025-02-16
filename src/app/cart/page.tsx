'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your cart is empty</p>
            <a href="/products" className="text-blue-600 hover:underline">
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-6">
                  <div className="flex items-center space-x-6">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">${item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t pt-8">
              <div className="flex justify-between items-center text-xl font-semibold mb-6">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={clearCart}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}