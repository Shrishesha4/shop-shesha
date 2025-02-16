'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <circle className="opacity-25" cx="24" cy="24" r="20" strokeWidth="4" />
            <path
              className="opacity-75"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M14 24l8 8 16-16"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your payment was successful. We'll send you an email confirmation shortly.
        </p>

        <div className="space-y-4">
          <Link
            href="/products"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}