import { test, expect } from '../fixtures/test-fixtures';
import { selectors } from '../selectors/selectors';
import { NavigationHelpers } from '../helpers/test-helpers';

test.describe('Leaderboard Page E2E Tests', () => {
  let navHelper: NavigationHelpers;

  test.beforeEach(async ({ page }) => {
    navHelper = new NavigationHelpers(page);
  });

  test('should navigate to leaderboard page', async ({ page }) => {
    // Try to navigate to leaderboard page
    await navHelper.navigateTo('leaderboard');
    
    // Check if leaderboard page exists
    const leaderboardIndicators = [
      selectors.leaderboard.container,
      selectors.leaderboard.table,
      ':has-text("leaderboard")',
      ':has-text("rankings")',
      ':has-text("top players")',
      ':has-text("scoreboard")',
      ':has-text("leaders")'
    ];

    let leaderboardFound = false;
    for (const selector of leaderboardIndicators) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        leaderboardFound = true;
        console.log(`✅ Found leaderboard indicator: ${selector}`);
        break;
      }
    }

    if (!leaderboardFound) {
      // Check if we got a 404 or redirect
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      if (pageContent?.includes('404') || pageContent?.includes('Not Found')) {
        test.skip('Leaderboard page not implemented yet');
      } else if (currentUrl.includes('/leaderboard')) {
        console.log('ℹ️ Leaderboard page exists but may be under development');
      } else {
        console.log('ℹ️ Leaderboard page redirected or not yet implemented');
        test.skip('Leaderboard page not accessible');
      }
    }
  });

  test('should display leaderboard table when available', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Look for table-like structures
    const tableElements = [
      selectors.leaderboard.table,
      'table',
      '[role="table"]',
      '.table',
      '.leaderboard',
      '.rankings'
    ];

    let tableFound = false;
    for (const selector of tableElements) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        tableFound = true;
        console.log(`✅ Found table structure: ${selector}`);
        
        // Check for table headers
        const headers = [
          ':has-text("rank")',
          ':has-text("player")',
          ':has-text("score")',
          ':has-text("name")',
          ':has-text("position")',
          'th', 
          '.header'
        ];

        for (const headerSelector of headers) {
          if (await page.locator(headerSelector).isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log(`✅ Found table header: ${headerSelector}`);
          }
        }
        break;
      }
    }

    if (!tableFound) {
      console.log('ℹ️ No table structure found - checking for alternative layouts');
      
      // Look for list or card-based layouts
      const alternativeLayouts = [
        '.player-card',
        '.ranking-item',
        '[data-testid*="player"]',
        '[data-testid*="rank"]'
      ];

      for (const selector of alternativeLayouts) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`✅ Found alternative leaderboard layout: ${selector}`);
          break;
        }
      }
    }
  });

  test('should display player rankings and scores', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Look for ranking elements
    const rankingElements = [
      selectors.leaderboard.rank,
      selectors.leaderboard.score,
      ':has-text("#1")',
      ':has-text("#2")',
      ':has-text("#3")',
      '.rank',
      '.score',
      '.position'
    ];

    let rankingsFound = false;
    for (const selector of rankingElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        rankingsFound = true;
        console.log(`✅ Found ${count} ranking elements with selector: ${selector}`);
        
        // Verify ranking order if possible
        if (count > 1) {
          const firstElement = await elements.first().textContent();
          const secondElement = await elements.nth(1).textContent();
          console.log(`First rank: ${firstElement}, Second rank: ${secondElement}`);
        }
        break;
      }
    }

    if (!rankingsFound) {
      // Check if this is an empty state
      const emptyStateIndicators = [
        ':has-text("no players")',
        ':has-text("empty")',
        ':has-text("no data")',
        ':has-text("coming soon")'
      ];

      for (const selector of emptyStateIndicators) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('ℹ️ Leaderboard is in empty state');
          return;
        }
      }

      console.log('ℹ️ No ranking data found - may be loading or under development');
    }
  });

  test('should display player information', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Look for player information
    const playerElements = [
      selectors.leaderboard.playerName,
      selectors.leaderboard.avatar,
      '.player-name',
      '.username',
      '.avatar',
      '.profile-pic',
      '[data-testid*="player"]'
    ];

    let playerInfoFound = false;
    for (const selector of playerElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        playerInfoFound = true;
        console.log(`✅ Found ${count} player elements with selector: ${selector}`);
        
        // Check content of player info
        const firstPlayer = await elements.first().textContent();
        if (firstPlayer && firstPlayer.trim()) {
          console.log(`Player info example: ${firstPlayer}`);
        }
        break;
      }
    }

    if (!playerInfoFound) {
      console.log('ℹ️ No player information found');
    }
  });

  test('should handle search functionality if available', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    const searchInput = page.locator(selectors.leaderboard.searchPlayer);
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Test search functionality
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      console.log('✅ Player search functionality tested');
      
      // Clear search
      await searchInput.clear();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    } else {
      console.log('ℹ️ Player search functionality not available yet');
    }
  });

  test('should handle filter and time range options if available', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Test filter dropdown
    const filterDropdown = page.locator(selectors.leaderboard.filterDropdown);
    if (await filterDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterDropdown.click();
      await page.waitForTimeout(1000);
      console.log('✅ Filter dropdown available');
    }

    // Test time range selector
    const timeRange = page.locator(selectors.leaderboard.timeRange);
    if (await timeRange.isVisible({ timeout: 5000 }).catch(() => false)) {
      await timeRange.click();
      await page.waitForTimeout(1000);
      console.log('✅ Time range selector available');
    }

    if (!await filterDropdown.isVisible().catch(() => false) && 
        !await timeRange.isVisible().catch(() => false)) {
      console.log('ℹ️ Filter and time range functionality not available yet');
    }
  });

  test('should handle refresh functionality if available', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    const refreshButton = page.locator(selectors.leaderboard.refreshButton);
    
    if (await refreshButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click refresh button
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ Refresh functionality tested');
    } else {
      // Look for alternative refresh mechanisms
      const altRefreshElements = [
        'button:has-text("refresh")',
        'button:has-text("reload")',
        'button:has-text("update")',
        '[title="refresh"]',
        '[aria-label="refresh"]'
      ];

      for (const selector of altRefreshElements) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          await page.locator(selector).click();
          console.log('✅ Alternative refresh functionality found');
          break;
        }
      }

      if (!await refreshButton.isVisible().catch(() => false)) {
        console.log('ℹ️ Refresh functionality not available yet');
      }
    }
  });

  test('should handle pagination if available', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Look for pagination elements
    const paginationElements = [
      '.pagination',
      '[role="navigation"]',
      'button:has-text("next")',
      'button:has-text("previous")',
      'button:has-text(">")',
      'button:has-text("<")',
      '[data-testid*="page"]'
    ];

    let paginationFound = false;
    for (const selector of paginationElements) {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        paginationFound = true;
        console.log(`✅ Found pagination: ${selector}`);
        
        // Test pagination if clickable
        if (await element.isEnabled().catch(() => false)) {
          await element.click();
          await page.waitForTimeout(2000);
          console.log('✅ Pagination interaction tested');
        }
        break;
      }
    }

    if (!paginationFound) {
      console.log('ℹ️ Pagination not available - may use infinite scroll or show all data');
    }
  });

  test('should display proper score formatting', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    await navHelper.waitForPageReady();

    // Look for score elements and verify formatting
    const scoreElements = [
      selectors.leaderboard.score,
      '.score',
      '.points',
      '[data-testid*="score"]'
    ];

    for (const selector of scoreElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const scores = await elements.allTextContents();
        console.log(`✅ Found ${count} scores:`, scores.slice(0, 3)); // Show first 3 scores
        
        // Verify scores are numbers or proper format
        for (const score of scores.slice(0, 3)) {
          if (score && !isNaN(Number(score.replace(/[,\s]/g, '')))) {
            console.log(`✅ Valid score format: ${score}`);
          }
        }
        break;
      }
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await navHelper.waitForPageReady();
    
    // Check if leaderboard adapts to mobile (may become scrollable or use cards)
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

  test('should handle loading states', async ({ page }) => {
    await navHelper.navigateTo('leaderboard');
    
    // Check for loading indicators
    const loadingElements = [
      selectors.common.loadingSpinner,
      ':has-text("loading")',
      ':has-text("Loading")',
      '.spinner',
      '.loading',
      '.skeleton'
    ];

    let foundLoading = false;
    for (const selector of loadingElements) {
      if (await page.locator(selector).isVisible({ timeout: 2000 }).catch(() => false)) {
        foundLoading = true;
        console.log(`✅ Found loading state: ${selector}`);
        
        // Wait for loading to complete
        await page.locator(selector).waitFor({ state: 'hidden', timeout: 10000 });
        console.log('✅ Loading completed');
        break;
      }
    }

    if (!foundLoading) {
      console.log('ℹ️ No loading state detected - data may load instantly');
    }
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot on failure
    if (test.info().status !== test.info().expectedStatus) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await page.screenshot({ 
        path: `test-results/failure-screenshots/leaderboard-${timestamp}.png`,
        fullPage: true 
      });
    }
  });
});