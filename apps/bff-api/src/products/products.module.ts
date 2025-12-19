import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { MagentoModule } from '../magento/magento.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [MagentoModule, CacheModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
