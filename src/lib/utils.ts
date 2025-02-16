export const generateProductId = (name: string): string => {
  const timestamp = Date.now().toString(36);
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${sanitizedName}-${timestamp}`;
};