import { Controller, Get } from '@nestjs/common';

@Controller('api/config')
export class ConfigController {
  @Get()
  getConfig() {
    return { bffVersion: '0.1.0' };
  }
}
