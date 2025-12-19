import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().transform(Number).default('4000'),
  MAGENTO_GRAPHQL_URL: z.string().url(),
  REDIS_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nRequired environment variables:');
      console.error('  - PORT (default: 4000)');
      console.error('  - MAGENTO_GRAPHQL_URL (e.g., http://localhost:8080/graphql)');
      console.error('  - REDIS_URL (e.g., redis://localhost:6379)');
      console.error('\nCopy .env.example to .env and fill in the values.');
    }
    process.exit(1);
  }
}
