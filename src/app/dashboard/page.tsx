import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Charts from '@/components/dashboard/Charts';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch counts
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
  ]);

  // Fetch revenue
  const { data: allOrders } = await supabase
    .from('orders')
    .select('total, created_at, status')
    .order('created_at', { ascending: false });

  const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthRevenue = allOrders?.reduce((sum, order) => {
    const date = new Date(order.created_at);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      return sum + (order.total || 0);
    }
    return sum;
  }, 0) || 0;

  const previousMonthRevenue = allOrders?.reduce((sum, order) => {
    const date = new Date(order.created_at);
    if (date.getMonth() === previousMonth && date.getFullYear() === previousYear) {
      return sum + (order.total || 0);
    }
    return sum;
  }, 0) || 0;

  const revenueChange = previousMonthRevenue === 0
    ? 100
    : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  // Low stock alert
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('stock')
    .lt('stock', 10);
  const lowStockCount = lowStockProducts?.length || 0;

  // Top selling products (requires order_items table)
  let topProducts: Array<{ name: string; quantity: number }> = [];
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_name, quantity');
    if (orderItems) {
      const productMap = new Map<string, number>();
      orderItems.forEach(item => {
        const name = item.product_name || 'Unknown';
        productMap.set(name, (productMap.get(name) || 0) + (item.quantity || 0));
      });
      topProducts = Array.from(productMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    }
  } catch (err) {
    console.warn('Could not fetch order_items (maybe the table does not exist)');
  }

  // Revenue over last 30 days
  const revenueByDay: Record<string, number> = {};
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  allOrders?.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    if (last30Days.includes(date)) {
      revenueByDay[date] = (revenueByDay[date] || 0) + (order.total || 0);
    }
  });

  const revenueData = last30Days.map(date => ({
    date,
    revenue: revenueByDay[date] || 0,
  }));

  // Order status distribution
  const statusCounts: Record<string, number> = {};
  allOrders?.forEach(order => {
    const status = order.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Dashboard
      </h1>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <MetricCard title="Total Products" value={productsCount ?? 0} color="#f97316" />
        <MetricCard title="Total Orders" value={ordersCount ?? 0} color="#3b82f6" />
        <MetricCard title="Total Customers" value={customersCount ?? 0} color="#10b981" />
        <MetricCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} color="#8b5cf6" />
        <MetricCard
          title="This Month Revenue"
          value={`₦${currentMonthRevenue.toLocaleString()}`}
          color="#f97316"
          change={revenueChange}
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockCount}
          color={lowStockCount > 0 ? '#ef4444' : '#10b981'}
        />
      </div>

      {/* Charts */}
      <Charts revenueData={revenueData} statusData={statusData} />

      {/* Top selling products */}
      {topProducts.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '32px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Top Selling Products</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.map((product, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{product.name}</span>
                <span style={{ fontWeight: 'bold' }}>{product.quantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '32px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Orders</h2>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>{order.id.slice(0, 8)}…</td>
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
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No recent orders
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, change }: { title: string; value: string | number; color: string; change?: number }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
      <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>{value}</div>
      {change !== undefined && (
        <div style={{ fontSize: '12px', color: change >= 0 ? '#10b981' : '#ef4444', marginTop: '8px' }}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% from last month
        </div>
      )}
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