'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MAIN_CATEGORIES = ['Gadgets', 'Fitness', 'Clothing', 'Shoes'];

const SUBCATEGORIES: Record<string, string[]> = {
  Gadgets: [
    'Phones', 'Tablets', 'Laptops', 'Headphones',
    'Speakers', 'Smart Watches', 'Solar Solutions'
  ],
  Fitness: [],
  Clothing: [],
  Shoes: [],
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const [product, setProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [mainCategory, setMainCategory] = useState('Gadgets');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    sub_category: '',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params;
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        setMainCategory(data.main_category || 'Gadgets');
        setFormData({
          name: data.name,
          price: data.price.toString(),
          stock: data.stock.toString(),
          description: data.description || '',
          sub_category: data.sub_category || '',
        });
        setImageUrl(data.image_url || '');
      }
    };
    fetchProduct();
  }, [params, supabase]);

  const handleChange = (e: any) => {
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

    const updates = {
      name: formData.name,
      main_category: mainCategory,
      sub_category: formData.sub_category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      description: formData.description,
      image_url: imageUrl || null,
    };

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id);

    if (error) {
      alert(error.message);
      return;
    }
    router.push('/dashboard/product');
    router.refresh();
  };

  if (!product) return <div>Loading...</div>;

  const subcategoryOptions = SUBCATEGORIES[mainCategory] || [];

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Edit Product</h1>
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

        {/* Main Category */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Main Category</label>
          <select
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          >
            {MAIN_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subcategory</label>
          {subcategoryOptions.length > 0 ? (
            <select
              name="sub_category"
              value={formData.sub_category}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">Select a subcategory</option>
              {subcategoryOptions.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="sub_category"
              placeholder="Enter subcategory (optional)"
              value={formData.sub_category}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          )}
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
            Update
          </button>
        </div>
      </form>
    </div>
  );
}