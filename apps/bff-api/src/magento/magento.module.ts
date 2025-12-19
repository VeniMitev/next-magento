import { Module } from '@nestjs/common';
import { MagentoService } from './magento.service';

@Module({
  providers: [MagentoService],
  exports: [MagentoService],
})
export class MagentoModule {}
