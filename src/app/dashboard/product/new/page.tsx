'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    setImageUrl(publicUrl);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare product data with image_url
    const product = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image_url: imageUrl || null,
    };

    const { error } = await supabase.from('products').insert([product]);
    if (error) {
      alert(error.message);
      return;
    }
    router.push('/dashboard/product');
    router.refresh();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Add New Product</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
        {/* Category */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
        {/* Price */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Price (₦)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
        {/* Stock */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
        {/* Image Upload */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          {uploading && <p>Uploading...</p>}
          {imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <img src={imageUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <a
            href="/dashboard/product"
            style={{ padding: '8px 16px', backgroundColor: '#9ca3af', color: 'white', borderRadius: '4px', textDecoration: 'none' }}
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={uploading}
            style={{ padding: '8px 16px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}