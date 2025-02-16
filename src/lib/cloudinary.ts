const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'optimage';
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '579152629793474';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio-images';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'portfolio-images');
  formData.append('cloud_name', 'optimage');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/optimage/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const optimizeImage = (url: string, width: number = 500, height: number = 500): string => {
  if (!url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/c_fill,w_${width},h_${height}/${parts[1]}`;
};