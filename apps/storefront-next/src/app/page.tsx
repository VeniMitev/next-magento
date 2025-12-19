'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFromBff } from '@repo/shared';
import { bffUrl } from '@/lib/config';

export default function HomePage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => fetchFromBff<{ status: string }>(bffUrl, '/health'),
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Next Magento Storefront</h1>
        <p className="mt-4 text-lg text-gray-600">
          A batteries-included headless commerce setup with Adobe Commerce, NestJS BFF, and Next.js
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">BFF Status</h2>
        <div className="mt-4">
          {isLoading ? (
            <p className="text-gray-600">Checking...</p>
          ) : health ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="font-medium text-green-700">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="font-medium text-red-700">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <a
          href="/products"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Browse Products
        </a>
      </div>

      <div className="rounded-lg border bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Start</h2>
        <ol className="list-inside list-decimal space-y-2 text-gray-700">
          <li>Infrastructure is running (Redis + Magento)</li>
          <li>
            Run Magento setup if first time:{' '}
            <code className="rounded bg-gray-200 px-2 py-1">npm run magento:setup</code>
          </li>
          <li>
            Seed products:{' '}
            <code className="rounded bg-gray-200 px-2 py-1">npm run magento:seed</code>
          </li>
          <li>BFF API is running on port 4000</li>
          <li>You&apos;re viewing the storefront on port 3000</li>
        </ol>
      </div>
    </div>
  );
}
