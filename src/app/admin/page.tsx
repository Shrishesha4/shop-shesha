'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '@/types/product';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';
import CategoryManager from '@/components/admin/CategoryManager';

import Dashboard from '@/components/admin/Dashboard';

import SiteSettings from '@/components/admin/SiteSettings';

const ADMIN_UID = 'wTBlAksY1bhZyfYTqA6OGgxP8qG3';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
      if (user) loadProducts();
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.uid !== ADMIN_UID) {
        await auth.signOut();
        setError('Unauthorized access');
        return;
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  const loadProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== ADMIN_UID) {
        setError('Unauthorized access');
        return;
      }
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Firestore error:', error);
      setError('Error loading products: Insufficient permissions');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">Admin Login</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex space-x-4">
            {activeTab === 'products' && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Product
              </button>
            )}
            <button
              onClick={() => auth.signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
    
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              Settings
            </button>
            
            {activeTab === 'settings' && <SiteSettings />}
          </nav>
        </div>
    
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && (
          <>
            {showAddProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
                  <ProductForm
                    onSubmit={() => {
                      setShowAddProduct(false);
                      loadProducts();
                    }}
                    onCancel={() => setShowAddProduct(false)}
                  />
                </div>
              </div>
            )}
            <ProductList products={products} onProductUpdate={loadProducts} />
          </>
        )}
        {activeTab === 'categories' && <CategoryManager />}
      </div>
    </div>
  );
}