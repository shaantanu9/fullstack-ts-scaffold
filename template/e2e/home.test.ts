import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Browser, Page } from 'puppeteer';
import { launchBrowser, createPage, CLIENT_URL } from './setup';
import { elementWithTextExists } from './helpers';

describe('Home page (e2e)', () => {
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

  it('should load the home page and show branding', async () => {
    await page.goto(CLIENT_URL);
    await page.waitForSelector('h1', { timeout: 10000 });

    const heading = await page.$eval('h1', (el) => el.textContent);
    expect(heading).toContain('Boilerplate');

    const hasSignIn = await elementWithTextExists(page, 'Sign In');
    const hasGetStarted = await elementWithTextExists(page, 'Get Started');
    expect(hasSignIn).toBe(true);
    expect(hasGetStarted).toBe(true);
  });

  it('should serve the login page directly', async () => {
    await page.goto(`${CLIENT_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
  });
});
