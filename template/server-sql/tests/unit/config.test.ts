import { describe, it, expect } from 'vitest';
import { appConfig } from '../../src/config/app.config';
import { env } from '../../src/config/env';

describe('appConfig', () => {
  it('should reflect test environment values', () => {
    expect(appConfig.env).toBe('test');
    expect(appConfig.isTest).toBe(true);
    expect(appConfig.isDev).toBe(false);
    expect(appConfig.isProduction).toBe(false);
  });

  it('should expose required auth config', () => {
    expect(appConfig.auth.accessTokenSecret).toBeDefined();
    expect(appConfig.auth.refreshTokenSecret).toBeDefined();
    expect(appConfig.auth.accessTokenSecret.length).toBeGreaterThanOrEqual(32);
    expect(appConfig.auth.refreshTokenSecret.length).toBeGreaterThanOrEqual(32);
  });

  it('should expose database and redis config', () => {
    expect(appConfig.db.url).toBeDefined();
    expect(appConfig.redis.url).toBeDefined();
  });
});

describe('env', () => {
  it('should expose validated environment variables', () => {
    expect(env.NODE_ENV).toBe('test');
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.REDIS_URL).toBeDefined();
  });
});
