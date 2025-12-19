'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFromBff, ProductDetails, BffError } from '@repo/shared';
import { bffUrl } from '@/lib/config';
import { useStorefrontPrefs } from '@/store/preferences';
import { use } from 'react';

export default function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = use(params);
  const { preferredCurrency } = useStorefrontPrefs();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<ProductDetails, BffError>({
    queryKey: ['product', sku],
    queryFn: () => fetchFromBff<ProductDetails>(bffUrl, `/api/products/${sku}`),
    retry: 1,
  });

  const formatPrice = (price: number, currency?: string | null) => {
    const curr = currency || preferredCurrency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <a href="/products" className="text-blue-600 hover:underline">
          ← Back to Products
        </a>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Error Loading Product</h2>
          <p className="mt-2 text-red-700">{error.message}</p>
          {error.hint && (
            <p className="mt-2 text-sm text-red-600">
              <strong>Hint:</strong> {error.hint}
            </p>
          )}
          {error.statusCode === 404 && (
            <p className="mt-4 text-red-700">
              This product might not exist. Please check the SKU or browse our{' '}
              <a href="/products" className="font-medium underline">
                product catalog
              </a>
              .
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <a href="/products" className="text-blue-600 hover:underline">
        ← Back to Products
      </a>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          {product.images.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-96 w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="overflow-hidden rounded border">
                      <img src={img} alt={`${product.name} ${idx + 2}`} className="h-20 w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center rounded-lg border bg-gray-100">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-sm text-gray-600">SKU: {product.sku}</p>
          </div>

          {product.price > 0 && (
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price, product.currency)}
            </div>
          )}

          {product.description && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <div
                className="prose mt-4 max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Add to Cart (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
