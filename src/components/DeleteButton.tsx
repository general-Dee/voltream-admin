'use client';

import { useTransition } from 'react';
import { deleteProduct } from '@/app/actions/products';

interface DeleteButtonProps {
  productId: string;
}

export default function DeleteButton({ productId }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(() => {
        deleteProduct(productId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}