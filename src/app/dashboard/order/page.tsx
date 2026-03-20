import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      total,
      status,
      created_at,
      customers ( name, email )
    `
    )
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders</h1>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Order ID
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Customer
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Total
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>
                  {order.id.slice(0, 8)}…
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {order.customers?.[0]?.name ||
                    order.customers?.[0]?.email ||
                    'Guest'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  ₦{order.total.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
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
          <div
            style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}
          >
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'pending':
      return '#f59e0b';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}
