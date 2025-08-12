/**
 * 🧪 VAULT PULSE ARCHIVES - INTEGRATION TESTS 🧪
 * 
 * Basic test suite to verify core functionality
 */

class VaultPulseArchivesTests {
  constructor() {
    this.testResults = [];
    this.vaultSystem = null;
  }

  async runTests() {
    console.log('🧪 Starting Vault Pulse Archives integration tests...');
    
    try {
      // Test 1: System initialization
      await this.testSystemInitialization();
      
      // Test 2: Broadcast database
      await this.testBroadcastDatabase();
      
      // Test 3: Glyph search functionality
      await this.testGlyphSearch();
      
      // Test 4: Replay portal creation
      await this.testReplayPortal();
      
      // Test 5: Bookmarking system
      await this.testBookmarkingSystem();
      
      // Test 6: Integration hooks
      await this.testIntegrationHooks();
      
      // Display results
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.push({
        name: 'Test Suite Execution',
        passed: false,
        error: error.message
      });
    }
  }

  async testSystemInitialization() {
    const testName = 'System Initialization';
    try {
      // Create test instance
      this.vaultSystem = new VaultPulseArchives();
      
      // Verify initial state
      const isInitialized = this.vaultSystem.isInitialized === false;
      const hasDatabase = this.vaultSystem.broadcastDatabase instanceof Map;
      const hasGlyphIndex = this.vaultSystem.glyphIndex instanceof Map;
      const hasBookmarks = this.vaultSystem.bookmarkedMoments instanceof Map;
      
      const passed = isInitialized && hasDatabase && hasGlyphIndex && hasBookmarks;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Database: ${hasDatabase}, Glyph Index: ${hasGlyphIndex}, Bookmarks: ${hasBookmarks}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testBroadcastDatabase() {
    const testName = 'Broadcast Database';
    try {
      // Verify broadcast data was loaded
      const broadcastCount = this.vaultSystem.broadcastDatabase.size;
      const hasValidBroadcast = broadcastCount >= 3;
      
      // Check first broadcast structure
      const firstBroadcast = Array.from(this.vaultSystem.broadcastDatabase.values())[0];
      const hasValidStructure = firstBroadcast && 
                               firstBroadcast.id && 
                               firstBroadcast.title && 
                               firstBroadcast.fragments && 
                               firstBroadcast.glyphs;
      
      const passed = hasValidBroadcast && hasValidStructure;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Broadcasts: ${broadcastCount}, Structure: ${hasValidStructure}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testGlyphSearch() {
    const testName = 'Glyph Search Engine';
    try {
      // Test glyph indexing
      const glyphCount = this.vaultSystem.glyphIndex.size;
      const hasGlyphs = glyphCount > 0;
      
      // Test search for specific glyph
      const searchGlyph = '⚡';
      const searchResults = this.vaultSystem.glyphIndex.get(searchGlyph);
      const hasSearchResults = searchResults && searchResults.length > 0;
      
      // Test glyph selector population
      this.vaultSystem.populateGlyphSelector();
      
      const passed = hasGlyphs && hasSearchResults;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Glyphs indexed: ${glyphCount}, Search results: ${hasSearchResults}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testReplayPortal() {
    const testName = 'Replay Portal System';
    try {
      // Test portal opening
      const firstBroadcastId = Array.from(this.vaultSystem.broadcastDatabase.keys())[0];
      this.vaultSystem.openReplayPortal(firstBroadcastId);
      
      const hasCurrentReplay = this.vaultSystem.currentReplay !== null;
      const isPortalActive = this.vaultSystem.replayPortalActive === true;
      
      // Test timeline updates
      this.vaultSystem.updateTimeline();
      this.vaultSystem.updateCurrentFragment();
      this.vaultSystem.updateHUD();
      
      // Test scrubbing
      this.vaultSystem.scrubToTime(100);
      const correctTime = this.vaultSystem.currentReplay.currentTime === 100;
      
      const passed = hasCurrentReplay && isPortalActive && correctTime;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Portal active: ${isPortalActive}, Time scrub: ${correctTime}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testBookmarkingSystem() {
    const testName = 'Bookmarking System';
    try {
      // Test bookmark creation
      const initialCount = this.vaultSystem.bookmarkedMoments.size;
      this.vaultSystem.bookmarkCurrentMoment();
      const newCount = this.vaultSystem.bookmarkedMoments.size;
      
      const bookmarkAdded = newCount > initialCount;
      
      // Test bookmark structure
      const bookmarks = Array.from(this.vaultSystem.bookmarkedMoments.values());
      const lastBookmark = bookmarks[bookmarks.length - 1];
      const validStructure = lastBookmark && 
                            lastBookmark.id && 
                            lastBookmark.glyph && 
                            lastBookmark.title;
      
      const passed = bookmarkAdded && validStructure;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Bookmarks: ${newCount}, Structure: ${validStructure}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testIntegrationHooks() {
    const testName = 'Integration Hooks';
    try {
      // Test evolution chain connection
      this.vaultSystem.connectWithEvolutionChain();
      
      // Test PR #73 chaining
      this.vaultSystem.chainWithCosmicReplayTerminal();
      
      // Test broadcast addition
      const initialBroadcasts = this.vaultSystem.broadcastDatabase.size;
      this.vaultSystem.addEvolutionBroadcast({
        type: 'Test Evolution',
        glyphs: ['🧪'],
        fragments: [{
          time: 0,
          type: 'test',
          glyph: '🧪',
          content: 'Test evolution event',
          decoded: true
        }],
        duration: 300,
        ascensionMoments: [0]
      });
      const newBroadcasts = this.vaultSystem.broadcastDatabase.size;
      
      const broadcastAdded = newBroadcasts > initialBroadcasts;
      
      const passed = broadcastAdded;
      
      this.testResults.push({
        name: testName,
        passed,
        details: `Evolution broadcast added: ${broadcastAdded}`
      });
      
      console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  displayTestResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n🧪 TEST RESULTS SUMMARY:');
    console.log(`════════════════════════`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    // Show detailed results
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      if (result.details) console.log(`    └─ ${result.details}`);
      if (result.error) console.log(`    └─ Error: ${result.error}`);
    });
    
    // Overall status
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! Vault Pulse Archives is ready for deployment.');
    } else {
      console.log(`\n⚠️  ${failedTests} test(s) failed. Review implementation before deployment.`);
    }
  }
}

// Auto-run tests when available
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    // Wait for main system to load
    setTimeout(async () => {
      if (window.VaultPulseArchives) {
        const testSuite = new VaultPulseArchivesTests();
        await testSuite.runTests();
      }
    }, 3000);
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VaultPulseArchivesTests;
}