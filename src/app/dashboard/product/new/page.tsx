import { createProduct } from '@/app/actions/products';
// import { createProduct } from '@/app/actions/products';

export default function NewProductPage() {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1
        style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}
      >
        Add New Product
      </h1>
      <form
        action={createProduct}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div>
          <label
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Name
          </label>
          <input
            type='text'
            name='name'
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
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Category
          </label>
          <input
            type='text'
            name='category'
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
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Price (₦)
          </label>
          <input
            type='number'
            name='price'
            step='0.01'
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
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Stock
          </label>
          <input
            type='number'
            name='stock'
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
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Description
          </label>
          <textarea
            name='description'
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>
        <div
          style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
        >
          <a
            href='/dashboard/product'
            style={{
              padding: '8px 16px',
              backgroundColor: '#9ca3af',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}
          >
            Cancel
          </a>
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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
