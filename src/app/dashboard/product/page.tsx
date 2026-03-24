import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build the query
  let query = supabase.from('products').select('*');

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  if (params.minPrice) {
    query = query.gte('price', parseFloat(params.minPrice));
  }
  if (params.maxPrice) {
    query = query.lte('price', parseFloat(params.maxPrice));
  }

  const { data: products } = await query.order('created_at', { ascending: false });

  // Get distinct categories
  const { data: categories } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null)
    .order('category');
  const uniqueCategories = categories
    ? categories.filter((item, index, self) => self.findIndex(i => i.category === item.category) === index)
    : [];

  // Helper to build URL with current filters
  const buildUrl = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams();
    if (params.search && updates.search !== undefined) newParams.set('search', params.search);
    if (params.category && updates.category !== undefined) newParams.set('category', params.category);
    if (params.minPrice && updates.minPrice !== undefined) newParams.set('minPrice', params.minPrice);
    if (params.maxPrice && updates.maxPrice !== undefined) newParams.set('maxPrice', params.maxPrice);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    const queryString = newParams.toString();
    return `/dashboard/product${queryString ? `?${queryString}` : ''}`;
  };

  const hasFilters = params.search || (params.category && params.category !== 'all') || params.minPrice || params.maxPrice;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Products</h1>
        <Link
          href="/dashboard/product/new"
          style={{
            backgroundColor: '#f97316',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          Add Product
        </Link>
      </div>

      {/* Filters section */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search box */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Search</label>
          <input
            type="text"
            defaultValue={params.search || ''}
            placeholder="Product name..."
            onChange={(e) => {
              const value = e.target.value;
              window.location.href = buildUrl({ search: value || undefined });
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '200px',
            }}
          />
        </div>

        {/* Category filter */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Category</label>
          <select
            value={params.category || 'all'}
            onChange={(e) => {
              const newCategory = e.target.value === 'all' ? undefined : e.target.value;
              window.location.href = buildUrl({ category: newCategory });
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="all">All categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Min Price (₦)</label>
          <input
            type="number"
            placeholder="Min"
            value={params.minPrice || ''}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = buildUrl({ minPrice: val || undefined });
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '100px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Max Price (₦)</label>
          <input
            type="number"
            placeholder="Max"
            value={params.maxPrice || ''}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = buildUrl({ maxPrice: val || undefined });
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '100px',
            }}
          />
        </div>

        {hasFilters && (
          <Link
            href="/dashboard/product"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              alignSelf: 'center',
            }}
          >
            Clear filters
          </Link>
        )}
      </div>

      {/* Products table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Image</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Stock</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Actions</th>
              </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>No image</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>{product.name}</td>
                <td style={{ padding: '12px 16px' }}>{product.category}</td>
                <td style={{ padding: '12px 16px' }}>₦{product.price.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>{product.stock}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/dashboard/product/${product.id}/edit`}
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      Edit
                    </Link>
                    <DeleteButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products?.length && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No products found
          </div>
        )}
      </div>
    </div>
  );
}