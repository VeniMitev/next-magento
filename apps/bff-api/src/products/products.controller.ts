import { Controller, Get, Param } from '@nestjs/common';
import { MagentoService } from '../magento/magento.service';
import { CacheService } from '../cache/cache.service';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly magentoService: MagentoService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async getProducts() {
    const cacheKey = 'products:list';

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Magento
    const products = await this.magentoService.getProducts(20);

    // Cache for 60 seconds
    await this.cacheService.set(cacheKey, products, 60);

    return products;
  }

  @Get(':sku')
  async getProductBySku(@Param('sku') sku: string) {
    const cacheKey = `products:${sku}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Magento
    const product = await this.magentoService.getProductBySku(sku);

    // Cache for 60 seconds
    await this.cacheService.set(cacheKey, product, 60);

    return product;
  }
}
