import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateCustomer } from '@/app/actions/customers';
import Link from 'next/link';

interface CustomerDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({
  params
}: CustomerDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from('customers')
    .select(
      `
      *,
      orders ( id, total, status, created_at )
    `
    )
    .eq('id', id)
    .single();

  if (error || !customer) notFound();

  const orders = customer.orders?.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalSpent =
    orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) ||
    0;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href='/dashboard/customer'
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            marginBottom: '16px',
            display: 'inline-block'
          }}
        >
          ← Back to customers
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Customer Details
        </h1>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <h2
          style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}
        >
          Edit Customer
        </h2>
        <form
          action={updateCustomer}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <input type='hidden' name='customerId' value={customer.id} />
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}
            >
              Name
            </label>
            <input
              type='text'
              name='name'
              defaultValue={customer.name || ''}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}
            >
              Email
            </label>
            <input
              type='email'
              name='email'
              defaultValue={customer.email}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}
            >
              Phone
            </label>
            <input
              type='tel'
              name='phone'
              defaultValue={customer.phone || ''}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}
            >
              Address
            </label>
            <textarea
              name='address'
              rows={3}
              defaultValue={customer.address || ''}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type='submit'
              style={{
                padding: '8px 16px',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Customer
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Order History</h2>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Total spent: ₦{totalSpent.toLocaleString()}
          </div>
        </div>
        {orders && orders.length > 0 ? (
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    {order.id.slice(0, 8)}…
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {new Date(order.created_at).toLocaleDateString()}
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
                    <Link
                      href={`/dashboard/order/${order.id}`}
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      View Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}
          >
            No orders found for this customer
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
