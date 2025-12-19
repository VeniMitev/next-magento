import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [HealthModule, ProductsModule, ConfigModule],
})
export class AppModule {}
