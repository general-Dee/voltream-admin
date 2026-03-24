import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import ProductFilters from './ProductFilters'; // <-- import the client component

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

  // Build the product query
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

      {/* Client‑side filter component */}
      <ProductFilters
        initialSearch={params.search || ''}
        initialCategory={params.category || 'all'}
        initialMinPrice={params.minPrice || ''}
        initialMaxPrice={params.maxPrice || ''}
        categories={uniqueCategories}
      />

      {/* Products table (unchanged) */}
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