import { test, expect } from '@playwright/test';

test.describe('Basic Server Tests', () => {
  test('should have server running', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('alive');
  });

  test('should serve main page', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('html');
  });

  test('should handle stripe config endpoint', async ({ request }) => {
    const response = await request.get('/config');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('publicKey');
  });
});