import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentPage = parseInt(params.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query with search filter
  let query = supabase.from('customers').select('*, orders(total)', { count: 'exact' });

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  }

  const { count: totalCount } = await query;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const { data: customers } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Process stats
  const customersWithStats = customers?.map(customer => ({
    ...customer,
    orderCount: customer.orders?.length || 0,
    totalSpent: customer.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
  }));

  // Helper to build pagination URLs while keeping filters
  const buildPaginationUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.set('search', params.search);
    if (page > 1) urlParams.set('page', page.toString());
    return `/dashboard/customer${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  };

  // Page number range
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Customers</h1>
      </div>

      {/* Search filter */}
      <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Search by name or email</label>
        <input
          type="text"
          defaultValue={params.search || ''}
          placeholder="Search..."
          onChange={(e) => {
            const value = e.target.value;
            const url = value ? `/dashboard/customer?search=${encodeURIComponent(value)}` : '/dashboard/customer';
            window.location.href = url;
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Customers table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Orders</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Spent</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Joined</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Actions</th>
             </tr>
          </thead>
          <tbody>
            {customersWithStats?.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>{customer.name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{customer.email}</td>
                <td style={{ padding: '12px 16px' }}>{customer.phone || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{customer.orderCount}</td>
                <td style={{ padding: '12px 16px' }}>₦{customer.totalSpent.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link
                    href={`/dashboard/customer/${customer.id}`}
                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers?.length && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No customers found
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