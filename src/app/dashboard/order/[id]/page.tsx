import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateOrderStatus } from '@/app/actions/orders';
import Link from 'next/link';

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({
  params
}: OrderDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customers ( name, email, phone ),
      order_items ( * )
    `
    )
    .eq('id', id)
    .single();

  if (error || !order) notFound();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href='/dashboard/order'
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            marginBottom: '16px',
            display: 'inline-block'
          }}
        >
          ← Back to orders
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Order #{order.id.slice(0, 8)}
        </h1>
      </div>

      {/* Order info */}
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
          Order Details
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
              }}
            >
              Date
            </div>
            <div>{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
              }}
            >
              Total
            </div>
            <div
              style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316' }}
            >
              ₦{order.total.toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
              }}
            >
              Status
            </div>
            <div>
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
            </div>
          </div>
          {order.customers && order.customers.length > 0 && (
            <>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}
                >
                  Customer
                </div>
                <div>
                  {order.customers[0]?.name || order.customers[0]?.email}
                </div>
                {order.customers[0]?.phone && (
                  <div style={{ fontSize: '14px' }}>
                    {order.customers[0].phone}
                  </div>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}
                >
                  Email
                </div>
                <div>{order.customers[0]?.email}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order items */}
      {order.order_items && order.order_items.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Items</h2>
          </div>
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
                  Product
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
                  Quantity
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
                  Price
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
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {item.product_name || item.product_id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 16px' }}>
                    ₦{item.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    ₦{(item.quantity * item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update status form */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '20px'
        }}
      >
        <h2
          style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}
        >
          Update Status
        </h2>
        <form
          action={updateOrderStatus}
          style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}
        >
          <input type='hidden' name='orderId' value={order.id} />
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}
            >
              Status
            </label>
            <select
              name='status'
              defaultValue={order.status}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            >
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>
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
            Update Status
          </button>
        </form>
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
