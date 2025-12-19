import { z } from 'zod';

export const ProductListItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  urlKey: z.string().optional().nullable(),
  price: z.number(),
  currency: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type ProductListItem = z.infer<typeof ProductListItemSchema>;

export const ProductDetailsSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.number(),
  currency: z.string().optional().nullable(),
  images: z.array(z.string()),
});

export type ProductDetails = z.infer<typeof ProductDetailsSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  hint: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export class BffError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public hint?: string,
  ) {
    super(message);
    this.name = 'BffError';
  }
}

export async function fetchFromBff<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      throw new BffError(response.status, 'FETCH_ERROR', 'Failed to fetch from BFF');
    }

    throw new BffError(
      response.status,
      errorData.error || 'UNKNOWN_ERROR',
      errorData.message || 'An error occurred',
      errorData.hint,
    );
  }

  return response.json();
}
