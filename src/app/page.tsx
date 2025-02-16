'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types/product';
import type { Category } from '@/types/product';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroImage, setHeroImage] = useState('/hero-image.jpg');

  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    const loadHeroImage = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'hero'));
        if (docSnap.exists()) {
          setHeroImage(docSnap.data().imageUrl);
        }
      } catch (error) {
        console.error('Error loading hero image:', error);
      }
    };
  
    loadHeroImage();

    loadCategories();
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('featured', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      }
    };

    loadFeaturedProducts();
  }, []);
  return (
    <main className="min-h-screen">
      {/* Cart Button - Add this at the top */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/cart"
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-all"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          unoptimized={heroImage.startsWith('http')}
        />
        <div className="relative z-10 text-center px-4 text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Handcrafted Decor</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Transform your space with unique, handmade pieces that tell a story.</p>
          <Link 
            href="/products" 
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Browse Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-lg"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10"></div>
              <img
                src={category.imageUrl}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories available
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-black/50 duration-200 transition-all">
                  <img
                    src={product.coverImage || (product.images && product.images.length > 0 ? product.images[0] : '')}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-opacity hover:scale-110 duration-300 transition-transform"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">${product.price}</p>
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-4 block w-full bg-foreground text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {featuredProducts.length === 0 && (
              <div className="col-span-4 text-center py-12 text-gray-500">
                No featured products available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Subscribe to our newsletter for new products and special offers.</p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700"
            />
            <button 
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
