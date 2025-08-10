import { Page, expect } from '@playwright/test';
import { selectors } from '../selectors/selectors';

/**
 * Helper functions for common E2E test operations
 */

export class WalletHelpers {
  constructor(private page: Page) {}

  /**
   * Connect wallet (mocked)
   */
  async connectWallet(walletType: 'metamask' | 'coinbase' = 'coinbase') {
    // Look for wallet connect buttons
    const connectButton = this.page.locator(selectors.mint.connectWallet).first();
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
    }

    // Wait for connection status to update
    await expect(this.page.locator(selectors.mint.walletStatus))
      .toContainText('Connected', { timeout: 10000 });
  }

  /**
   * Verify wallet connection status
   */
  async verifyWalletConnected() {
    await expect(this.page.locator(selectors.mint.walletStatus))
      .toContainText('Connected');
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet() {
    const disconnectButton = this.page.locator(selectors.wallet.disconnectButton);
    if (await disconnectButton.isVisible()) {
      await disconnectButton.click();
    }
  }
}

export class PaymentHelpers {
  constructor(private page: Page) {}

  /**
   * Process payment (mocked)
   */
  async processPayment(provider: 'stripe' | 'coinbase' | 'paypal' = 'coinbase') {
    const paymentButton = this.page.locator(selectors.mint.paymentButton).first();
    
    if (await paymentButton.isVisible()) {
      await paymentButton.click();
    }

    // Wait for payment processing
    await this.page.waitForTimeout(2000);
    
    // For mock environment, payment should succeed automatically
    return { success: true, sessionId: 'cs_test_1234567890abcdef' };
  }

  /**
   * Verify payment success
   */
  async verifyPaymentSuccess() {
    // Check for success indicators
    const successElements = [
      this.page.locator(selectors.payment.successPage),
      this.page.locator(selectors.common.successMessage),
      this.page.locator(':has-text("success")')
    ];

    let found = false;
    for (const element of successElements) {
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        found = true;
        break;
      }
    }

    expect(found).toBeTruthy();
  }
}

export class MintHelpers {
  constructor(private page: Page) {}

  /**
   * Complete mint process (wallet + payment + mint)
   */
  async completeMintProcess() {
    const walletHelper = new WalletHelpers(this.page);
    const paymentHelper = new PaymentHelpers(this.page);

    // Step 1: Connect wallet
    await walletHelper.connectWallet();

    // Step 2: Process payment
    await paymentHelper.processPayment();

    // Step 3: Mint relic
    await this.mintRelic();
  }

  /**
   * Mint relic
   */
  async mintRelic() {
    const mintButton = this.page.locator(selectors.mint.mintButton).first();
    
    if (await mintButton.isVisible()) {
      await mintButton.click();
    }

    // Wait for mint completion
    await this.verifyMintSuccess();
  }

  /**
   * Verify mint success
   */
  async verifyMintSuccess() {
    // Look for success indicators
    const successIndicators = [
      ':has-text("minted successfully")',
      ':has-text("Mint Successful")',
      ':has-text("✅")',
      selectors.common.successMessage
    ];

    let found = false;
    for (const selector of successIndicators) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 10000 }).catch(() => false)) {
        found = true;
        break;
      }
    }

    expect(found).toBeTruthy();
  }
}

export class NavigationHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to specific route
   */
  async navigateTo(route: 'mint' | 'store' | 'leaderboard' | 'admin' | 'home') {
    const routes = {
      home: '/',
      mint: '/',  // Currently mint is on home page
      store: '/store',
      leaderboard: '/leaderboard', 
      admin: '/admin'
    };

    await this.page.goto(routes[route]);
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    // Wait for basic page elements to load
    await this.page.waitForLoadState('networkidle');
    
    // Check if there's a loading spinner and wait for it to disappear
    const loadingSpinner = this.page.locator(selectors.common.loadingSpinner);
    if (await loadingSpinner.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
  }

  /**
   * Check for error messages on page
   */
  async checkForErrors() {
    const errorElement = this.page.locator(selectors.common.errorMessage);
    if (await errorElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      const errorText = await errorElement.textContent();
      throw new Error(`Page error detected: ${errorText}`);
    }
  }
}

export class AdminHelpers {
  constructor(private page: Page) {}

  /**
   * Login to admin area
   */
  async login(username: string = 'admin_test', password: string = 'test_password_123') {
    await this.page.fill(selectors.admin.username, username);
    await this.page.fill(selectors.admin.password, password);
    await this.page.click(selectors.admin.loginButton);

    // Wait for dashboard to load
    await expect(this.page.locator(selectors.admin.dashboard))
      .toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify admin access
   */
  async verifyAdminAccess() {
    await expect(this.page.locator(selectors.admin.dashboard)).toBeVisible();
  }
}

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Test server health
   */
  async testServerHealth() {
    await this.page.goto('/health');
    await expect(this.page.locator('body')).toContainText('alive');
  }

  /**
   * Test API connections
   */
  async testAPIConnections() {
    const testButton = this.page.locator(selectors.test.connectionTest);
    if (await testButton.isVisible()) {
      await testButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element with retry
   */
  async waitForElementWithRetry(selector: string, maxRetries: number = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.locator(selector).waitFor({ timeout: 10000 });
        return true;
      } catch (error) {
        lastError = error;
        await this.page.waitForTimeout(2000);
      }
    }
    
    throw lastError;
  }
}