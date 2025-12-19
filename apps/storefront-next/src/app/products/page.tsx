'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFromBff, ProductListItem, BffError } from '@repo/shared';
import { bffUrl } from '@/lib/config';
import { useStorefrontPrefs } from '@/store/preferences';

export default function ProductsPage() {
  const { gridMode, setGridMode, preferredCurrency, setPreferredCurrency } = useStorefrontPrefs();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<ProductListItem[], BffError>({
    queryKey: ['products'],
    queryFn: () => fetchFromBff<ProductListItem[]>(bffUrl, '/api/products'),
    retry: 1,
  });

  const formatPrice = (price: number, currency?: string | null) => {
    const curr = currency || preferredCurrency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>

        <div className="flex gap-4">
          {/* Currency Selector */}
          <select
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setGridMode('grid')}
              className={`px-4 py-2 ${
                gridMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setGridMode('list')}
              className={`px-4 py-2 ${
                gridMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Error Loading Products</h2>
          <p className="mt-2 text-red-700">{error.message}</p>
          {error.hint && (
            <p className="mt-2 text-sm text-red-600">
              <strong>Hint:</strong> {error.hint}
            </p>
          )}
        </div>
      )}

      {!isLoading && !error && products && products.length === 0 && (
        <div className="rounded-lg border bg-yellow-50 p-6 text-center">
          <p className="text-lg font-medium text-yellow-900">No products found</p>
          <p className="mt-2 text-yellow-700">
            Run <code className="rounded bg-yellow-100 px-2 py-1">npm run magento:seed</code> to
            create sample products.
          </p>
        </div>
      )}

      {!isLoading && !error && products && products.length > 0 && (
        <div
          className={
            gridMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {products.map((product) => (
            <a
              key={product.sku}
              href={`/products/${product.sku}`}
              className={`block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                gridMode === 'list' ? 'flex gap-4' : ''
              }`}
            >
              {product.imageUrl && (
                <div
                  className={`mb-4 overflow-hidden rounded ${
                    gridMode === 'list' ? 'mb-0 h-24 w-24 flex-shrink-0' : 'h-48'
                  }`}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                {product.price > 0 && (
                  <p className="mt-2 text-xl font-bold text-blue-600">
                    {formatPrice(product.price, product.currency)}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
