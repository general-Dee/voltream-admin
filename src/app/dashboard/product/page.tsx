import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import ProductFilters from './ProductFilters';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    main_category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ProductPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentPage = parseInt(params.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build the product query
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  if (params.main_category && params.main_category !== 'all') {
    query = query.eq('main_category', params.main_category);
  }
  if (params.minPrice) {
    query = query.gte('price', parseFloat(params.minPrice));
  }
  if (params.maxPrice) {
    query = query.lte('price', parseFloat(params.maxPrice));
  }

  const { count: totalCount } = await query;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const { data: products } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Get distinct main categories for the dropdown
  const { data: categories } = await supabase
    .from('products')
    .select('main_category')
    .not('main_category', 'is', null)
    .order('main_category');
  const uniqueCategories = categories
    ? categories.filter((item, index, self) => self.findIndex(i => i.main_category === item.main_category) === index)
    : [];

  const buildPaginationUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.set('search', params.search);
    if (params.main_category && params.main_category !== 'all') urlParams.set('main_category', params.main_category);
    if (params.minPrice) urlParams.set('minPrice', params.minPrice);
    if (params.maxPrice) urlParams.set('maxPrice', params.maxPrice);
    if (page > 1) urlParams.set('page', page.toString());
    return `/dashboard/product${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  };

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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

      {/* Filters */}
      <ProductFilters
        initialSearch={params.search || ''}
        initialMainCategory={params.main_category || 'all'}
        initialMinPrice={params.minPrice || ''}
        initialMaxPrice={params.maxPrice || ''}
        categories={uniqueCategories.map(c => c.main_category)}
      />

      {/* Products table with horizontal scroll */}
      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Image</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Main Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Subcategory</th>
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
                <td style={{ padding: '12px 16px' }}>{product.main_category || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{product.sub_category || '—'}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {currentPage > 1 && (
            <Link
              href={buildPaginationUrl(currentPage - 1)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                textDecoration: 'none',
                color: '#374151',
              }}
            >
              ← Previous
            </Link>
          )}
          {pageNumbers.map((page) => (
            <Link
              key={page}
              href={buildPaginationUrl(page)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: page === currentPage ? '#f97316' : 'white',
                color: page === currentPage ? 'white' : '#374151',
                textDecoration: 'none',
              }}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildPaginationUrl(currentPage + 1)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                textDecoration: 'none',
                color: '#374151',
              }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}