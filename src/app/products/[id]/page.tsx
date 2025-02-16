'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/types/product';
import CartModal from '@/components/cart/CartModal';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', params.id as string));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          setProduct(productData);
          setSelectedImage(productData.coverImage || productData.images[0]);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        setError('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.coverImage || product.images[0]
    });
    setShowCart(true);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[product.coverImage, ...product.images].map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === image ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold">${product.price}</p>
            <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
            <div className="space-y-4">
              <p className="text-sm">Category: {product.category}</p>
              <p className="text-sm">Stock: {product.stock} available</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-foreground text-background px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}