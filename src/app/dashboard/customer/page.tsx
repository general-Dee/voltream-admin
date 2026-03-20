import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select(
      `
      *,
      orders ( total )
    `
    )
    .order('created_at', { ascending: false });

  const customersWithStats = customers?.map((customer) => ({
    ...customer,
    orderCount: customer.orders?.length || 0,
    totalSpent:
      customer.orders?.reduce(
        (sum: number, order: any) => sum + (order.total || 0),
        0
      ) || 0
  }));

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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Customers</h1>
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
                Name
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
                Email
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
                Phone
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
                Orders
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
                Total Spent
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
                Joined
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
            {customersWithStats?.map((customer) => (
              <tr
                key={customer.id}
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <td style={{ padding: '12px 16px' }}>{customer.name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{customer.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  {customer.phone || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>{customer.orderCount}</td>
                <td style={{ padding: '12px 16px' }}>
                  ₦{customer.totalSpent.toLocaleString()}
                </td>
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
          <div
            style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}
          >
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
