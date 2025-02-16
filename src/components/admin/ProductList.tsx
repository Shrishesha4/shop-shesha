'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { optimizeImage } from '@/lib/cloudinary';
import type { Product } from '@/types/product';
import ProductForm from './ProductForm';

interface ProductListProps {
  products: Product[];
  onProductUpdate: () => void;
}

export default function ProductList({ products, onProductUpdate }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      onProductUpdate();
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  if (editingProduct) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
          <ProductForm
            product={editingProduct}
            onSubmit={() => {
              setEditingProduct(null);
              onProductUpdate();
            }}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border dark:border-gray-700 rounded-lg p-4">
            <div className="relative">
              <img
                src={optimizeImage(product.coverImage || product.images[0], 400, 300)}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              {product.featured && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">${product.price}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Stock: {product.stock}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}