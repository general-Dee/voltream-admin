'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateCustomer(formData: FormData) {
  const supabase = await createClient();

  const customerId = formData.get('customerId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  const { error } = await supabase
    .from('customers')
    .update({ name, email, phone, address })
    .eq('id', customerId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/customer/${customerId}`);
  redirect(`/dashboard/customer/${customerId}`);
}
