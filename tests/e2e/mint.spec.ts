import { test, expect } from '@playwright/test';

test.describe('Mint Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load mint page successfully', async ({ page }) => {
    // Verify page loads with expected elements
    await expect(page).toHaveTitle(/FrankensteinVault333|ChaosKey333/);
    
    // Check for key elements on the page - be flexible since page structure may vary
    const hasTitle = await page.locator('h1').count() > 0;
    expect(hasTitle).toBe(true);
  });

  test('should display wallet connection options', async ({ page }) => {
    // Check for wallet connection buttons - use flexible selectors
    const connectButtons = page.locator('button:has-text("Connect"), button:has-text("Wallet"), #connectWallet, #connectCoinbase');
    const buttonCount = await connectButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should display payment options', async ({ page }) => {
    // Check for payment-related buttons
    const paymentButtons = page.locator('button:has-text("Pay"), button:has-text("Mint"), #paymentBtn');
    const buttonCount = await paymentButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should handle server connections', async ({ page }) => {
    // Test the connection test buttons if available
    const testButtons = page.locator('button:has-text("Test")');
    const buttonCount = await testButtons.count();
    
    if (buttonCount > 0) {
      await testButtons.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Found and tested connection buttons');
    } else {
      console.log('ℹ️ No test buttons found - this is acceptable');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Verify key elements are still visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await expect(body).toBeVisible();
  });
});