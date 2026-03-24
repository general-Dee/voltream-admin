'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProductFiltersProps {
  initialSearch?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  categories: { category: string }[];
}

export default function ProductFilters({
  initialSearch = '',
  initialCategory = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  categories,
}: ProductFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  // Update URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const queryString = params.toString();
    router.push(`/dashboard/product${queryString ? `?${queryString}` : ''}`);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    router.push('/dashboard/product');
  };

  const hasFilters = search || (category !== 'all') || minPrice || maxPrice;

  return (
    <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Search box */}
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Search</label>
        <input
          type="text"
          placeholder="Product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '200px',
          }}
        />
      </div>

      {/* Category filter */}
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Min Price (₦)</label>
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100px',
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Max Price (₦)</label>
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100px',
          }}
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            alignSelf: 'center',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}