import { Page } from 'puppeteer';

export const waitForUrl = async (
  page: Page,
  expectedUrl: string | RegExp,
  timeout = 15000,
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const url = page.url();
    const matches =
      expectedUrl instanceof RegExp ? expectedUrl.test(url) : url === expectedUrl;
    if (matches) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for URL ${expectedUrl}. Current: ${page.url()}`);
};

const findElementByText = (searchText: string): HTMLElement | null => {
  const elements = Array.from(document.querySelectorAll('*'));
  return (
    elements.find((el) => {
      const text = el.textContent?.trim() ?? '';
      return text === searchText || text.includes(searchText);
    }) ?? null
  );
};

export const clickByText = async (page: Page, text: string): Promise<void> => {
  const clicked = await page.evaluate((searchText) => {
    const findClickable = (el: HTMLElement): HTMLElement | null => {
      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.getAttribute('role') === 'button' ||
        el.onclick
      ) {
        return el;
      }
      const parent = el.parentElement as HTMLElement | null;
      return parent ? findClickable(parent) : null;
    };

    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find((el) => {
      const nodeText = el.childNodes.length === 1 ? el.textContent?.trim() ?? '' : '';
      return nodeText === searchText;
    }) as HTMLElement | undefined;

    if (!target) return false;

    const clickable = findClickable(target);
    if (clickable) {
      clickable.click();
      clickable.focus();
      return true;
    }
    target.click();
    return true;
  }, text);

  if (!clicked) {
    throw new Error(`Element with text "${text}" not found`);
  }
};

export const waitForText = async (
  page: Page,
  text: string,
  timeout = 10000,
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const found = await page.evaluate((searchText) => {
      return document.body.innerText.toLowerCase().includes(searchText.toLowerCase());
    }, text);
    if (found) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for text "${text}"`);
};

export const elementWithTextExists = async (page: Page, text: string): Promise<boolean> => {
  return page.evaluate((searchText) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.some((el) => {
      const nodeText = el.textContent?.trim() ?? '';
      return nodeText === searchText || nodeText.includes(searchText);
    });
  }, text);
};
