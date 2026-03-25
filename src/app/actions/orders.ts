'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/order/${orderId}`);
  revalidatePath('/dashboard/order');
}

export async function bulkUpdateOrders(formData: FormData) {
  const supabase = await createClient();
  const orderIds = formData.getAll('order_ids') as string[];
  const status = formData.get('status') as string;

  if (!orderIds.length) {
    throw new Error('No orders selected');
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .in('id', orderIds);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/order');
}