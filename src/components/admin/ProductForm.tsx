'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';
import type { Product } from '@/types/product';
import type { Category } from '@/types/product';
import { generateProductId } from '@/lib/utils';

interface ProductFormProps {
  product?: Product;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  // Add new state for categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Add useEffect to load categories
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
        setError('Failed to load categories');
      }
    };

    loadCategories();
  }, []);

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [featured, setFeatured] = useState(product?.featured || false);

  // Add new state for cover image
  const [coverImage, setCoverImage] = useState<string>(product?.coverImage || '');

  // Modify handleImageUpload to handle both cover and product images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    setError('');
    
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImage(file);
      if (isCover) {
        setCoverImage(imageUrl);
      } else {
        setImages([...images, imageUrl]);
      }
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Update handleSubmit to include coverImage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (!coverImage) {
      setError('Cover image is required');
      return;
    }
  
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        coverImage,
        images,
        featured,
        createdAt: product?.createdAt || new Date(),
        updatedAt: new Date()
      };
  
      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        const productId = generateProductId(name);
        await setDoc(doc(db, 'products', productId), productData);
      }
  
      onSubmit?.();
    } catch (error) {
      setError('Failed to save product');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Update the JSX for image section
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-center">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stock</label>
          <input
            type="number"
            required
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="featured" className="text-sm font-medium">
          Featured Product (will appear on home page)
        </label>
      </div>

      {/* Cover Image Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Cover Image (Required)</label>
        <div className="mb-4">
          {coverImage ? (
            <div className="relative group w-full h-48">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900 dark:file:text-blue-200
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
          )}
        </div>
      </div>

      {/* Additional Images Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Additional Images</label>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, false)}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}