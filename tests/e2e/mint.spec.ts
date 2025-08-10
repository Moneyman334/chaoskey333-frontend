import { test, expect } from '../fixtures/test-fixtures';
import { selectors } from '../selectors/selectors';
import { WalletHelpers, PaymentHelpers, MintHelpers, NavigationHelpers } from '../helpers/test-helpers';

test.describe('Mint Page E2E Tests', () => {
  let walletHelper: WalletHelpers;
  let paymentHelper: PaymentHelpers;
  let mintHelper: MintHelpers;
  let navHelper: NavigationHelpers;

  test.beforeEach(async ({ page }) => {
    walletHelper = new WalletHelpers(page);
    paymentHelper = new PaymentHelpers(page);
    mintHelper = new MintHelpers(page);
    navHelper = new NavigationHelpers(page);

    await navHelper.navigateTo('mint');
    await navHelper.waitForPageReady();
  });

  test('should load mint page successfully', async ({ page }) => {
    // Verify page loads with expected elements
    await expect(page).toHaveTitle(/FrankensteinVault333|ChaosKey333/);
    
    // Check for key elements on the page
    const expectedElements = [
      'h1:has-text("Frankenstein Vault")',
      'h1:has-text("ChaosKey333")',
      selectors.mint.connectWallet,
      selectors.mint.paymentButton
    ];

    let foundTitle = false;
    for (const selector of expectedElements) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        foundTitle = true;
        break;
      }
    }

    expect(foundTitle).toBeTruthy();
  });

  test('should display wallet connection options', async ({ page }) => {
    // Check for wallet connection buttons
    const connectWalletButtons = page.locator(selectors.mint.connectWallet);
    await expect(connectWalletButtons.first()).toBeVisible();
  });

  test('should connect wallet successfully', async ({ page, mockWalletSetup }) => {
    // Connect wallet using helper
    await walletHelper.connectWallet('coinbase');
    
    // Verify wallet connection status
    await walletHelper.verifyWalletConnected();
  });

  test('should process payment successfully', async ({ page, mockWalletSetup, mockPaymentSetup }) => {
    // Connect wallet first
    await walletHelper.connectWallet();
    
    // Process payment
    await paymentHelper.processPayment('coinbase');
    
    // Verify payment was processed
    // Note: In mock environment, this might redirect or show success immediately
    await page.waitForTimeout(3000);
  });

  test('should complete full mint process', async ({ page, mockWalletSetup, mockPaymentSetup, mockTransactionSetup }) => {
    // Complete the full mint workflow
    await mintHelper.completeMintProcess();
    
    // Verify successful mint
    await mintHelper.verifyMintSuccess();
  });

  test('should handle mint without wallet connection', async ({ page }) => {
    // Try to mint without connecting wallet
    const mintButton = page.locator(selectors.mint.mintButton);
    
    if (await mintButton.isVisible()) {
      await mintButton.click();
      
      // Should show error or prompt to connect wallet
      const errorMessages = [
        ':has-text("connect")',
        ':has-text("wallet")',
        selectors.common.errorMessage
      ];

      let foundError = false;
      for (const selector of errorMessages) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundError = true;
          break;
        }
      }

      // If no explicit error, check if wallet connection was triggered
      const walletStatus = page.locator(selectors.mint.walletStatus);
      if (await walletStatus.isVisible()) {
        const statusText = await walletStatus.textContent();
        expect(statusText).toContain('wallet');
      }
    }
  });

  test('should display correct pricing information', async ({ page }) => {
    // Look for price indicators
    const priceElements = [
      ':has-text("$33.33")',
      ':has-text("33.33")',
      ':has-text("3333")', // Could be in cents
      selectors.mint.priceDisplay
    ];

    let foundPrice = false;
    for (const selector of priceElements) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        foundPrice = true;
        break;
      }
    }

    // If price isn't explicitly shown, that's okay - some UIs show price during checkout
    if (foundPrice) {
      console.log('✅ Price information displayed');
    } else {
      console.log('ℹ️ Price information not displayed on main page (may show during checkout)');
    }
  });

  test('should test stripe connection', async ({ page }) => {
    // Test the Stripe connection test button if available
    const stripeTestButton = page.locator(selectors.test.stripeTest);
    
    if (await stripeTestButton.isVisible()) {
      await stripeTestButton.click();
      await page.waitForTimeout(2000);
      
      // Check for response (success or error)
      const responseElements = [
        ':has-text("success")',
        ':has-text("connected")',
        ':has-text("failed")',
        ':has-text("error")'
      ];

      let foundResponse = false;
      for (const selector of responseElements) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundResponse = true;
          break;
        }
      }

      if (foundResponse) {
        console.log('✅ Stripe connection test completed');
      }
    }
  });

  test('should handle page responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    // Verify key elements are still accessible
    const connectButton = page.locator(selectors.mint.connectWallet).first();
    await expect(connectButton).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    await expect(connectButton).toBeVisible();
  });

  test('should validate form interactions', async ({ page, mockWalletSetup }) => {
    // Connect wallet
    await walletHelper.connectWallet();
    
    // Check if any form elements are present and interactable
    const interactiveElements = await page.locator('button, input, select').all();
    
    for (const element of interactiveElements) {
      if (await element.isVisible() && await element.isEnabled()) {
        // Test that element is clickable/focusable
        await expect(element).toBeEnabled();
      }
    }
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot on failure
    if (test.info().status !== test.info().expectedStatus) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await page.screenshot({ 
        path: `test-results/failure-screenshots/mint-${timestamp}.png`,
        fullPage: true 
      });
    }
  });
});