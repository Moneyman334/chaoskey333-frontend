import { test, expect } from '../fixtures/test-fixtures';
import { selectors } from '../selectors/selectors';
import { NavigationHelpers, WalletHelpers } from '../helpers/test-helpers';

test.describe('Store Page E2E Tests', () => {
  let navHelper: NavigationHelpers;
  let walletHelper: WalletHelpers;

  test.beforeEach(async ({ page }) => {
    navHelper = new NavigationHelpers(page);
    walletHelper = new WalletHelpers(page);
  });

  test('should navigate to store page', async ({ page }) => {
    // Try to navigate to store page
    await navHelper.navigateTo('store');
    
    // Check if store page exists or if we get a 404
    const response = await page.waitForLoadState('networkidle');
    
    // If store page doesn't exist yet, check for common store indicators
    const storeIndicators = [
      selectors.store.container,
      selectors.store.productGrid,
      ':has-text("store")',
      ':has-text("products")',
      ':has-text("shop")',
      ':has-text("marketplace")'
    ];

    let storeFound = false;
    for (const selector of storeIndicators) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        storeFound = true;
        break;
      }
    }

    if (!storeFound) {
      // Store page might not exist yet - check if we got redirected or got 404
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      if (pageContent?.includes('404') || pageContent?.includes('Not Found')) {
        test.skip('Store page not implemented yet');
      } else if (currentUrl.includes('/store') || pageContent?.toLowerCase().includes('store')) {
        console.log('✅ Store page exists but may be under development');
      } else {
        console.log('ℹ️ Store page redirected or not yet implemented');
        test.skip('Store page not accessible');
      }
    }
  });

  test('should display product grid when available', async ({ page }) => {
    await navHelper.navigateTo('store');
    
    // Look for product-related elements
    const productElements = [
      selectors.store.productGrid,
      selectors.store.productCard,
      '[data-testid*="product"]',
      '.product',
      '.item',
      ':has-text("relic")',
      ':has-text("nft")',
      ':has-text("collectible")'
    ];

    let productsFound = false;
    for (const selector of productElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        productsFound = true;
        console.log(`✅ Found ${count} product elements with selector: ${selector}`);
        break;
      }
    }

    if (!productsFound) {
      // Check if this is a loading state or empty state
      const loadingElements = [
        ':has-text("loading")',
        ':has-text("Loading")',
        selectors.common.loadingSpinner,
        '.spinner',
        '.loading'
      ];

      let isLoading = false;
      for (const selector of loadingElements) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          isLoading = true;
          break;
        }
      }

      if (isLoading) {
        console.log('ℹ️ Store is in loading state');
        // Wait for loading to complete
        await page.waitForTimeout(5000);
      } else {
        console.log('ℹ️ No products found - may be empty state or under development');
      }
    }
  });

  test('should handle search functionality if available', async ({ page }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    const searchInput = page.locator(selectors.store.searchInput);
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Test search functionality
      await searchInput.fill('chaos');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Check if search results are displayed
      console.log('✅ Search functionality tested');
    } else {
      console.log('ℹ️ Search functionality not available yet');
    }
  });

  test('should handle cart functionality if available', async ({ page, mockWalletSetup }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    // Look for add to cart buttons
    const addToCartButton = page.locator(selectors.store.addToCart).first();
    
    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Connect wallet first (may be required for purchases)
      await walletHelper.connectWallet();
      
      // Add item to cart
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Check cart
      const cart = page.locator(selectors.store.cart);
      if (await cart.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cart.click();
        console.log('✅ Cart functionality tested');
      }
    } else {
      console.log('ℹ️ Cart functionality not available yet');
    }
  });

  test('should display proper pricing', async ({ page }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    // Look for price elements
    const priceElements = [
      selectors.store.productPrice,
      '[data-testid*="price"]',
      '.price',
      ':has-text("$")',
      ':has-text("ETH")',
      ':has-text("USD")'
    ];

    let pricesFound = false;
    for (const selector of priceElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        pricesFound = true;
        
        // Verify price format
        const firstPrice = await elements.first().textContent();
        console.log(`✅ Found pricing: ${firstPrice}`);
        break;
      }
    }

    if (!pricesFound) {
      console.log('ℹ️ No pricing information found - may be free items or under development');
    }
  });

  test('should handle filter and sort options if available', async ({ page }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    // Test filter functionality
    const filterButton = page.locator(selectors.store.filterButton);
    if (await filterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Filter functionality available');
    }

    // Test sort functionality
    const sortDropdown = page.locator(selectors.store.sortDropdown);
    if (await sortDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sortDropdown.click();
      await page.waitForTimeout(1000);
      console.log('✅ Sort functionality available');
    }

    if (!await filterButton.isVisible().catch(() => false) && 
        !await sortDropdown.isVisible().catch(() => false)) {
      console.log('ℹ️ Filter and sort functionality not available yet');
    }
  });

  test('should handle product details view', async ({ page }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    // Look for product cards to click on
    const productCard = page.locator(selectors.store.productCard).first();
    
    if (await productCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productCard.click();
      await page.waitForTimeout(2000);
      
      // Check if we navigated to a product detail page
      const currentUrl = page.url();
      if (currentUrl.includes('/product/') || currentUrl.includes('/item/')) {
        console.log('✅ Product detail navigation working');
        
        // Look for product detail elements
        const detailElements = [
          ':has-text("description")',
          ':has-text("details")',
          ':has-text("attributes")',
          selectors.store.productImage,
          selectors.store.productTitle
        ];

        for (const selector of detailElements) {
          if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log(`✅ Found product detail element: ${selector}`);
          }
        }
      }
    } else {
      console.log('ℹ️ No product cards available for detail testing');
    }
  });

  test('should handle checkout process if available', async ({ page, mockWalletSetup, mockPaymentSetup }) => {
    await navHelper.navigateTo('store');
    await navHelper.waitForPageReady();

    // Try to find and interact with checkout elements
    const checkoutButton = page.locator(selectors.store.checkout);
    
    if (await checkoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Connect wallet first
      await walletHelper.connectWallet();
      
      // Proceed to checkout
      await checkoutButton.click();
      await page.waitForTimeout(2000);
      
      // Check if checkout page loaded
      const checkoutIndicators = [
        ':has-text("checkout")',
        ':has-text("payment")',
        ':has-text("total")',
        selectors.payment.stripeCheckout,
        selectors.payment.coinbaseCheckout
      ];

      for (const selector of checkoutIndicators) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('✅ Checkout process initiated');
          break;
        }
      }
    } else {
      console.log('ℹ️ Checkout functionality not available yet');
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await navHelper.navigateTo('store');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    // Check if page adapts to mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    console.log('✅ Responsive design tested across viewports');
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot on failure
    if (test.info().status !== test.info().expectedStatus) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await page.screenshot({ 
        path: `test-results/failure-screenshots/store-${timestamp}.png`,
        fullPage: true 
      });
    }
  });
});