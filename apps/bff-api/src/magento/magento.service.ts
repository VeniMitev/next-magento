import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';

const MagentoProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  url_key: z.string().optional().nullable(),
  small_image: z
    .object({
      url: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  price_range: z
    .object({
      minimum_price: z.object({
        final_price: z.object({
          value: z.number(),
          currency: z.string(),
        }),
      }),
    })
    .optional()
    .nullable(),
});

const MagentoProductDetailSchema = MagentoProductSchema.extend({
  description: z
    .object({
      html: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  media_gallery: z
    .array(z.object({ url: z.string() }))
    .optional()
    .nullable(),
});

const ProductsResponseSchema = z.object({
  products: z.object({
    items: z.array(MagentoProductSchema),
  }),
});

const ProductDetailResponseSchema = z.object({
  products: z.object({
    items: z.array(MagentoProductDetailSchema),
  }),
});

@Injectable()
export class MagentoService {
  private readonly logger = new Logger(MagentoService.name);
  private client: GraphQLClient;

  constructor() {
    const magentoUrl = process.env.MAGENTO_GRAPHQL_URL || 'http://localhost:8080/graphql';
    this.client = new GraphQLClient(magentoUrl);
  }

  async getProducts(pageSize: number = 20) {
    const query = `
      query Products($pageSize: Int!) {
        products(search: "", pageSize: $pageSize) {
          items {
            sku
            name
            url_key
            small_image { url }
            price_range {
              minimum_price {
                final_price {
                  value
                  currency
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.client.request(query, { pageSize });
      const parsed = ProductsResponseSchema.parse(data);
      return parsed.products.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        urlKey: item.url_key,
        price: item.price_range?.minimum_price?.final_price?.value || 0,
        currency: item.price_range?.minimum_price?.final_price?.currency,
        imageUrl: item.small_image?.url,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch products from Magento:', error);
      throw new HttpException(
        {
          error: 'MAGENTO_UNAVAILABLE',
          message: 'Magento GraphQL endpoint unreachable',
          hint: 'Start infra with npm run dev:infra and verify http://localhost:8080/graphql',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getProductBySku(sku: string) {
    const query = `
      query ProductBySku($sku: String!) {
        products(filter: { sku: { eq: $sku } }) {
          items {
            sku
            name
            url_key
            description { html }
            media_gallery { url }
            price_range {
              minimum_price {
                final_price {
                  value
                  currency
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.client.request(query, { sku });
      const parsed = ProductDetailResponseSchema.parse(data);

      if (parsed.products.items.length === 0) {
        throw new HttpException(
          {
            error: 'PRODUCT_NOT_FOUND',
            message: `Product with SKU "${sku}" not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const item = parsed.products.items[0];
      return {
        sku: item.sku,
        name: item.name,
        description: item.description?.html || null,
        price: item.price_range?.minimum_price?.final_price?.value || 0,
        currency: item.price_range?.minimum_price?.final_price?.currency,
        images: item.media_gallery?.map((img) => img.url) || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch product ${sku} from Magento:`, error);
      throw new HttpException(
        {
          error: 'MAGENTO_UNAVAILABLE',
          message: 'Magento GraphQL endpoint unreachable',
          hint: 'Start infra with npm run dev:infra and verify http://localhost:8080/graphql',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
