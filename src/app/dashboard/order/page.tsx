import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentPage = parseInt(params.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query with filters
  let query = supabase.from('orders').select('*, customers(name, email)', { count: 'exact' });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  const { count: totalCount } = await query;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const { data: orders } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Helper to build pagination URLs while keeping filters
  const buildPaginationUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    if (params.status && params.status !== 'all') urlParams.set('status', params.status);
    if (page > 1) urlParams.set('page', page.toString());
    return `/dashboard/order${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders</h1>
      </div>

      {/* Status filter */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Filter by Status</label>
        <select
          value={params.status || 'all'}
          onChange={(e) => {
            const newStatus = e.target.value === 'all' ? undefined : e.target.value;
            const url = `/dashboard/order${newStatus ? `?status=${newStatus}` : ''}`;
            window.location.href = url;
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
          <option value="all">All orders</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Order ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Customer</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Actions</th>
             </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>{order.id.slice(0, 8)}…</td>
                <td style={{ padding: '12px 16px' }}>
                  {order.customers?.[0]?.name || order.customers?.[0]?.email || 'Guest'}
                </td>
                <td style={{ padding: '12px 16px' }}>₦{order.total.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link
                    href={`/dashboard/order/${order.id}`}
                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No orders found
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
}