'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';
import { auth } from '@/lib/firebase';
import { ADMIN_UID } from '@/lib/constants';

export default function SiteSettings() {
  const [heroImage, setHeroImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Current user ID:', user.uid); // For debugging
        if (user.uid === ADMIN_UID) {
          loadSettings();
        } else {
          setError('Unauthorized access');
          setLoading(false);
        }
      } else {
        setError('Unauthorized access');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    setError('');
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'hero'));
      if (docSnap.exists()) {
        setHeroImage(docSnap.data().imageUrl);
      } else {
        await setDoc(doc(db, 'settings', 'hero'), {
          imageUrl: '/hero-image.jpg',
          updatedAt: new Date()
        });
        setHeroImage('/hero-image.jpg');
      }
    } catch (error) {
      console.error('Settings load error:', error);
      setError('Failed to load settings. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const user = auth.currentUser;
    if (!user || user.uid !== ADMIN_UID) {
      setError('Unauthorized access');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const file = e.target.files[0];
      const url = await uploadImage(file);
      setHeroImage(url);
      
      // Save to Firebase
      await setDoc(doc(db, 'settings', 'hero'), {
        imageUrl: url,
        updatedAt: new Date()
      });
      
      setSuccess('Hero image updated successfully!');
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-center">Site Settings</h2>
      
      {error === 'Unauthorized access' ? (
        <div className="text-center py-8">
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading settings...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold mb-4">Hero Image</h3>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    {success}
                  </div>
                )}

                {heroImage && (
                  <div className="relative group mb-6">
                    <img
                      src={heroImage}
                      alt="Hero preview"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => setHeroImage('')}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload New Hero Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      dark:file:bg-blue-900 dark:file:text-blue-200
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploading && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}