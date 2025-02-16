'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, CollectionReference, Query } from 'firebase/firestore';
import type { Product } from '@/types/product';
import { useCartStore } from '@/lib/store';
import CartModal from '@/components/cart/CartModal';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      let productsQuery: CollectionReference | Query = collection(db, 'products');
      if (category) {
        productsQuery = query(productsQuery, where('category', '==', category));
      }
      const querySnapshot = await getDocs(productsQuery);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    });
    setShowCart(true);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {category ? `${category} Collection` : 'All Products'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.coverImage || product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">${product.price}</p>
                </div>
              </Link>
              <button
                className="mt-4 w-full bg-foreground text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No products found{category ? ` in ${category}` : ''}.
            </p>
          </div>
        )}

        <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>
    </div>
  );
}