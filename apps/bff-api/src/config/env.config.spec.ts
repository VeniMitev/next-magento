import { validateEnv } from './env.config';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should validate correct environment variables', () => {
    process.env.PORT = '4000';
    process.env.MAGENTO_GRAPHQL_URL = 'http://localhost:8080/graphql';
    process.env.REDIS_URL = 'redis://localhost:6379';

    const config = validateEnv();
    expect(config.PORT).toBe(4000);
    expect(config.MAGENTO_GRAPHQL_URL).toBe('http://localhost:8080/graphql');
    expect(config.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('should fail when MAGENTO_GRAPHQL_URL is missing', () => {
    process.env.PORT = '4000';
    process.env.REDIS_URL = 'redis://localhost:6379';
    delete process.env.MAGENTO_GRAPHQL_URL;

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => validateEnv()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should fail when REDIS_URL is missing', () => {
    process.env.PORT = '4000';
    process.env.MAGENTO_GRAPHQL_URL = 'http://localhost:8080/graphql';
    delete process.env.REDIS_URL;

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => validateEnv()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
