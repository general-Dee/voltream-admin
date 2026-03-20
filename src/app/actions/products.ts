'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const description = formData.get('description') as string;

  const { error } = await supabase
    .from('products')
    .insert([{ name, category, price, stock, description }]);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/product');
  redirect('/dashboard/product');
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const description = formData.get('description') as string;

  const { error } = await supabase
    .from('products')
    .update({ name, category, price, stock, description })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/product');
  redirect('/dashboard/product');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/product');
}
