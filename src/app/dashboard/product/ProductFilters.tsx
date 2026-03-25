'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductFiltersProps {
  initialSearch: string;
  initialMainCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  categories: string[];
}

export default function ProductFilters({
  initialSearch,
  initialMainCategory,
  initialMinPrice,
  initialMaxPrice,
  categories,
}: ProductFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [mainCategory, setMainCategory] = useState(initialMainCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (mainCategory && mainCategory !== 'all') params.set('main_category', mainCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const query = params.toString();
    return `/dashboard/product${query ? `?${query}` : ''}`;
  };

  useEffect(() => {
    window.location.href = buildUrl();
  }, [search, mainCategory, minPrice, maxPrice]);

  const hasFilters = search || (mainCategory && mainCategory !== 'all') || minPrice || maxPrice;

  return (
    <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Product name..."
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '200px',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Main Category</label>
        <select
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
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
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Min Price (₦)</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min"
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
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max"
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
        <Link
          href="/dashboard/product"
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            alignSelf: 'center',
          }}
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}