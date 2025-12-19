import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  // Validate environment variables
  const env = validateEnv();

  const logger = new Logger('Bootstrap');

  // Create Fastify adapter
  const adapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS for development
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const port = env.PORT;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 BFF API is running on: http://localhost:${port}`);
  logger.log(`   Health check: http://localhost:${port}/health`);
  logger.log(`   Products API: http://localhost:${port}/api/products`);
  logger.log(`   Config API: http://localhost:${port}/api/config`);
}

bootstrap();
