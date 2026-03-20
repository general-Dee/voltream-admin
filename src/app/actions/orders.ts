'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  redirect(`/dashboard/order/${orderId}`);
}
