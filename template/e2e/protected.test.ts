import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Browser, Page } from 'puppeteer';
import { launchBrowser, createPage, CLIENT_URL } from './setup';

describe('Protected routes (e2e)', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();
    // No explicit timeout — inherit the config's 60s hookTimeout so a slow
    // Chrome launch on a contended CI runner doesn't abort the whole suite.
  });

  afterAll(async () => {
    await browser?.close();
  }, 10000);

  beforeEach(async () => {
    page = await createPage(browser);
  });

  afterEach(async () => {
    await page?.close();
  });

  it('redirects an unauthenticated visitor from /dashboard to /login', async () => {
    await page.goto(`${CLIENT_URL}/dashboard`);
    // The client-side guard redirects once the store rehydrates with no session.
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  it('redirects an unauthenticated visitor from /profile to /login', async () => {
    await page.goto(`${CLIENT_URL}/profile`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
