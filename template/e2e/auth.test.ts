import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Browser, Page } from 'puppeteer';
import { launchBrowser, createPage, CLIENT_URL } from './setup';
import { waitForUrl, waitForText, elementWithTextExists } from './helpers';

describe('Authentication flow (e2e)', () => {
  let browser: Browser;
  let page: Page;
  const uniqueEmail = `e2e-user-${Date.now()}@example.com`;

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
    // Start every test unauthenticated. Cookies are shared at the browser level,
    // so the session cookie set by the register test would otherwise persist and
    // the route middleware would bounce /login → /dashboard, hiding the form.
    const client = await page.createCDPSession();
    await client.send('Network.clearBrowserCookies');
  });

  afterEach(async () => {
    await page?.close();
  });

  it('should register a new user and redirect to the dashboard', async () => {
    await page.goto(`${CLIENT_URL}/register`);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', uniqueEmail);
    await page.type('input[type="password"]', 'SecureP@ssw0rd1');
    await page.type('input#name', 'E2E User');

    await page.click('button[type="submit"]');
    await waitForUrl(page, CLIENT_URL + '/dashboard');

    const currentUrl = page.url();
    expect(currentUrl).toBe(CLIENT_URL + '/dashboard');

    const userEmail = await page.$eval('[data-testid="user-email"]', (el) => el.textContent).catch(
      () => null,
    );
    expect(userEmail).toBe(uniqueEmail);
  }, 30000);

  it('should login an existing user', async () => {
    await page.goto(`${CLIENT_URL}/login`);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'Admin@123456');

    await page.click('button[type="submit"]');
    await waitForUrl(page, CLIENT_URL + '/dashboard');

    const currentUrl = page.url();
    expect(currentUrl).toBe(CLIENT_URL + '/dashboard');
  }, 30000);

  it('should show error for invalid login', async () => {
    await page.goto(`${CLIENT_URL}/login`);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'notfound@example.com');
    await page.type('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');
    await waitForText(page, 'Invalid');

    const errorText = await page.$eval('.text-red-600', (el) => el.textContent);
    expect(errorText?.toLowerCase()).toContain('invalid');
  }, 30000);

  it('should logout and show login button', async () => {
    await page.goto(`${CLIENT_URL}/login`);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');

    await waitForUrl(page, CLIENT_URL + '/dashboard');

    await page.waitForSelector('[data-testid="logout-button"]', { timeout: 10000 });
    await page.click('[data-testid="logout-button"]');

    await page.waitForSelector('button', { timeout: 10000 });
    await waitForText(page, 'Login');

    const hasLogin = await elementWithTextExists(page, 'Login');
    expect(hasLogin).toBe(true);
  }, 30000);
});
