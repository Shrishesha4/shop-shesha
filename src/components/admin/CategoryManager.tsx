'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';
import type { Category } from '@/types/product';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setImageUrl(category.imageUrl);
    setShowForm(true);
  };

  const loadCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      setError('Failed to load categories');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      await loadCategories();
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    setError('');
    
    try {
      const file = e.target.files[0];
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageUrl) {
      setError('Category image is required');
      return;
    }

    try {
      const categoryData = {
        name,
        description,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        imageUrl
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
      }
      
      // Reset form and reload categories
      setName('');
      setDescription('');
      setSlug('');
      setImageUrl('');
      setShowForm(false);
      await loadCategories();
    } catch (error) {
      setError('Failed to create category');
    }
  };

  // Update the return section to conditionally render either the form or the list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        {!editingCategory && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Category'}
          </button>
        )}
      </div>
  
      {error && <div className="text-red-500 text-center">{error}</div>}
  
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto border p-6 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug (optional)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800"
              placeholder="auto-generated-if-empty"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category Image</label>
            {imageUrl && (
              <div className="relative group mb-4">
                <img
                  src={imageUrl}
                  alt="Category preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900 dark:file:text-blue-200
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
            {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
                setName('');
                setDescription('');
                setSlug('');
                setImageUrl('');
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-4">
              <div className="aspect-video relative">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500">Slug: {category.slug}</p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
  
      {categories.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          No categories available. Click "Add Category" to create one.
        </div>
      )}
    </div>
  );
}