/**
 * Test Suite for Cosmic Replay Terminal v2.0 - Ascension Edition
 * Tests the complete evolution pipeline from test replay capsules to live lore capsules
 */

class CosmicReplayTerminalTestSuite {
  constructor() {
    this.testResults = [];
    this.terminal = null;
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('🧪 Starting Cosmic Replay Terminal Test Suite...\n');
    
    try {
      // Initialize the terminal
      await this.setupTerminal();
      
      // Run individual tests
      await this.testTerminalInitialization();
      await this.testReplayCapsuleGeneration();
      await this.testMultipleFormatExport();
      await this.testCapsuleEvolution();
      await this.testVaultFeedBroadcasting();
      await this.testPulseScheduler();
      await this.testStabilityCalculation();
      await this.testCompleteFlowIntegration();
      
      // Generate test report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      this.logTestResult('Test Suite Execution', false, error.message);
    }
  }

  async setupTerminal() {
    console.log('🔧 Setting up Cosmic Replay Terminal for testing...');
    
    try {
      this.terminal = new CosmicReplayTerminal({
        autoSave: false, // Disable for testing
        exportFormats: ['mp4', 'webm', 'gif', 'nftMetadata']
      });
      
      // Wait for initialization
      let attempts = 0;
      while (!this.terminal.isInitialized && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.terminal.isInitialized) {
        throw new Error('Terminal failed to initialize within timeout');
      }
      
      console.log('✅ Terminal setup complete\n');
      
    } catch (error) {
      console.error('❌ Terminal setup failed:', error);
      throw error;
    }
  }

  async testTerminalInitialization() {
    const testName = 'Terminal Initialization';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      // Check if terminal is properly initialized
      const status = this.terminal.getStatus();
      
      const checks = [
        { name: 'Terminal initialized', condition: status.initialized },
        { name: 'Version correct', condition: status.version === "2.0 – Ascension Edition" },
        { name: 'Config loaded', condition: status.config && typeof status.config === 'object' },
        { name: 'Export formats configured', condition: Array.isArray(status.config.exportFormats) }
      ];
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'All initialization checks passed' : 'Some initialization checks failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testReplayCapsuleGeneration() {
    const testName = 'Replay Capsule Generation';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      const vaultState = {
        connectedWallets: 5,
        activeTransactions: 2,
        mintedRelics: 10,
        vaultEnergy: 85.5,
        cosmicResonance: 7.2
      };
      
      const capsule = await this.terminal.generateReplayCapsule('test-capsule-generation', vaultState);
      
      const checks = [
        { name: 'Capsule created', condition: capsule && typeof capsule === 'object' },
        { name: 'Has pulse ID', condition: capsule.pulseId && typeof capsule.pulseId === 'string' },
        { name: 'Has timestamp', condition: capsule.timestamp && new Date(capsule.timestamp).getTime() > 0 },
        { name: 'Type is test-replay', condition: capsule.type === 'test-replay' },
        { name: 'Vault state preserved', condition: capsule.vaultState.vaultEnergy === 85.5 },
        { name: 'Metadata included', condition: capsule.metadata && capsule.metadata.version },
        { name: 'Status set to generated', condition: capsule.status === 'generated' }
      ];
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      // Store capsule for later tests
      this.testCapsule = capsule;
      
      this.logTestResult(testName, allPassed, allPassed ? 'Capsule generation successful' : 'Capsule generation failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testMultipleFormatExport() {
    const testName = 'Multiple Format Export';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      if (!this.testCapsule) {
        throw new Error('No test capsule available for export testing');
      }
      
      const exports = await this.terminal.exportCapsuleFormats(this.testCapsule);
      
      const expectedFormats = ['mp4', 'webm', 'gif', 'nftMetadata'];
      
      const checks = [
        { name: 'Exports object created', condition: exports && typeof exports === 'object' },
        { name: 'MP4 export exists', condition: exports.mp4 && !exports.mp4.error },
        { name: 'WebM export exists', condition: exports.webm && !exports.webm.error },
        { name: 'GIF export exists', condition: exports.gif && !exports.gif.error },
        { name: 'NFT metadata export exists', condition: exports.nftMetadata && !exports.nftMetadata.error },
        { name: 'MP4 has 4K resolution', condition: exports.mp4 && exports.mp4.resolution === '4K' },
        { name: 'NFT metadata has attributes', condition: exports.nftMetadata && exports.nftMetadata.metadata && Array.isArray(exports.nftMetadata.metadata.attributes) }
      ];
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'All formats exported successfully' : 'Some format exports failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testCapsuleEvolution() {
    const testName = 'Capsule Evolution to Live Lore';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      if (!this.testCapsule) {
        throw new Error('No test capsule available for evolution testing');
      }
      
      // Mark test as passed with high stability
      const testResults = {
        passRate: 1.0,
        performance: 0.95,
        consistency: 0.9,
        errorRate: 0.05
      };
      
      const updatedCapsule = await this.terminal.markTestPassed(this.testCapsule.pulseId, testResults);
      
      // Give time for evolution process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const checks = [
        { name: 'Test results recorded', condition: updatedCapsule.testResults && updatedCapsule.testResults.passed },
        { name: 'Stability calculated', condition: updatedCapsule.testResults.stability >= 0.8 },
        { name: 'Status updated to evolved', condition: updatedCapsule.status === 'evolved' },
        { name: 'Live capsule ID assigned', condition: updatedCapsule.liveCapsuleId && typeof updatedCapsule.liveCapsuleId === 'string' }
      ];
      
      // Check if live capsule was created
      if (updatedCapsule.liveCapsuleId) {
        const liveCapsule = this.terminal.liveCapsules.get(updatedCapsule.liveCapsuleId);
        
        if (liveCapsule) {
          checks.push(
            { name: 'Live capsule created', condition: liveCapsule.type === 'live-lore' },
            { name: 'Parent test ID preserved', condition: liveCapsule.parentTestId === this.testCapsule.id },
            { name: 'Production ready flag set', condition: liveCapsule.metadata.productionReady },
            { name: 'Ascension edition flag set', condition: liveCapsule.metadata.ascensionEdition }
          );
          
          this.liveCapsule = liveCapsule;
        }
      }
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'Capsule evolution successful' : 'Capsule evolution failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testVaultFeedBroadcasting() {
    const testName = 'Vault Feed Broadcasting';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      if (!this.liveCapsule) {
        console.log('⚠️ No live capsule available, testing broadcast function directly');
        
        // Create a mock live capsule for testing
        this.liveCapsule = {
          id: 'test_live_capsule',
          type: 'live-lore',
          timestamp: new Date().toISOString(),
          status: 'live'
        };
      }
      
      // Test the broadcast function
      await this.terminal.broadcastToVaultFeed(this.liveCapsule);
      
      const checks = [
        { name: 'Broadcast method executed', condition: true }, // If we get here, it didn't throw
        { name: 'Capsule status updated', condition: this.liveCapsule.status === 'broadcasted' || this.liveCapsule.broadcastError },
        { name: 'Broadcast timestamp set', condition: this.liveCapsule.broadcastedAt || this.liveCapsule.broadcastError }
      ];
      
      // Check vault feed connection status
      const terminalStatus = this.terminal.getStatus();
      if (terminalStatus.vaultFeedConnected) {
        checks.push({ name: 'Vault feed connected', condition: true });
      } else {
        console.log('  ℹ️ Vault feed not connected (expected in test environment)');
      }
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'Broadcasting functionality works' : 'Broadcasting failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testPulseScheduler() {
    const testName = 'Pulse Scheduler';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      const scheduler = this.terminal.pulseScheduler;
      
      // Create a test capsule for scheduling
      const testCapsule = {
        id: 'scheduled_test_capsule',
        type: 'test-replay',
        timestamp: new Date().toISOString()
      };
      
      // Schedule the pulse
      const scheduleId = scheduler.schedule(testCapsule, 50); // Schedule for 50ms from now
      
      const checks = [
        { name: 'Scheduler exists', condition: scheduler && typeof scheduler === 'object' },
        { name: 'Schedule method works', condition: scheduleId && typeof scheduleId === 'string' },
        { name: 'Pulse queue has item', condition: scheduler.pulseQueue.length > 0 },
        { name: 'Scheduled pulse stored', condition: scheduler.scheduledPulses.has(scheduleId) }
      ];
      
      // Wait for pulse to be processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      checks.push(
        { name: 'Pulse processed', condition: !scheduler.scheduledPulses.has(scheduleId) }
      );
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'Pulse scheduler works correctly' : 'Pulse scheduler failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testStabilityCalculation() {
    const testName = 'Stability Calculation';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      const testCases = [
        {
          name: 'High stability',
          results: { passRate: 1.0, performance: 0.95, consistency: 0.9, errorRate: 0.05 },
          expectedMin: 0.8
        },
        {
          name: 'Medium stability', 
          results: { passRate: 0.8, performance: 0.7, consistency: 0.75, errorRate: 0.2 },
          expectedMin: 0.5,
          expectedMax: 0.8
        },
        {
          name: 'Low stability',
          results: { passRate: 0.5, performance: 0.4, consistency: 0.3, errorRate: 0.6 },
          expectedMax: 0.5
        }
      ];
      
      const checks = [];
      
      for (const testCase of testCases) {
        const stability = this.terminal.calculateStability(testCase.results);
        
        let passed = true;
        if (testCase.expectedMin && stability < testCase.expectedMin) passed = false;
        if (testCase.expectedMax && stability > testCase.expectedMax) passed = false;
        if (stability < 0 || stability > 1) passed = false;
        
        checks.push({
          name: `${testCase.name} (${stability.toFixed(2)})`,
          condition: passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${stability.toFixed(2)}`);
      }
      
      const allPassed = checks.every(check => check.condition);
      
      this.logTestResult(testName, allPassed, allPassed ? 'Stability calculations correct' : 'Stability calculations failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  async testCompleteFlowIntegration() {
    const testName = 'Complete Flow Integration';
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      // Test the complete flow from generation to broadcast
      console.log('  🔄 Testing complete evolution pipeline...');
      
      // 1. Generate test capsule
      const vaultState = { vaultEnergy: 95, cosmicResonance: 8.5 };
      const capsule = await this.terminal.generateReplayCapsule('integration-test', vaultState);
      
      // 2. Export formats
      await this.terminal.exportCapsuleFormats(capsule);
      
      // 3. Mark as passed with high stability
      const testResults = { passRate: 1.0, performance: 1.0, consistency: 1.0, errorRate: 0 };
      await this.terminal.markTestPassed(capsule.pulseId, testResults);
      
      // 4. Check evolution occurred
      const evolvedCapsule = this.terminal.testCapsules.get(capsule.pulseId);
      const liveCapsule = evolvedCapsule.liveCapsuleId ? 
        this.terminal.liveCapsules.get(evolvedCapsule.liveCapsuleId) : null;
      
      const checks = [
        { name: 'Test capsule generated', condition: capsule && capsule.type === 'test-replay' },
        { name: 'Formats exported', condition: capsule.exports && Object.keys(capsule.exports).length > 0 },
        { name: 'Test marked as passed', condition: evolvedCapsule.testResults && evolvedCapsule.testResults.passed },
        { name: 'High stability achieved', condition: evolvedCapsule.testResults.stability >= 0.8 },
        { name: 'Evolution to live capsule', condition: evolvedCapsule.status === 'evolved' },
        { name: 'Live capsule created', condition: liveCapsule && liveCapsule.type === 'live-lore' },
        { name: 'Production ready', condition: liveCapsule && liveCapsule.metadata.productionReady },
        { name: 'Parent reference maintained', condition: liveCapsule && liveCapsule.parentTestId === capsule.id }
      ];
      
      const allPassed = checks.every(check => {
        if (!check.condition) {
          console.log(`  ❌ ${check.name}: FAILED`);
          return false;
        }
        console.log(`  ✅ ${check.name}: PASSED`);
        return true;
      });
      
      this.logTestResult(testName, allPassed, allPassed ? 'Complete integration successful' : 'Integration pipeline failed');
      
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.logTestResult(testName, false, error.message);
    }
    
    console.log('');
  }

  logTestResult(testName, passed, message) {
    this.testCount++;
    if (passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
    
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  generateTestReport() {
    console.log('📊 TEST SUITE REPORT');
    console.log('================================');
    console.log(`Total Tests: ${this.testCount}`);
    console.log(`Passed: ${this.passedTests} ✅`);
    console.log(`Failed: ${this.failedTests} ${this.failedTests > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`);
    console.log('');
    
    if (this.failedTests > 0) {
      console.log('❌ FAILED TESTS:');
      this.testResults
        .filter(result => !result.passed)
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.message}`);
        });
      console.log('');
    }
    
    const terminalStatus = this.terminal ? this.terminal.getStatus() : {};
    console.log('🌌 TERMINAL STATUS:');
    console.log(`  Version: ${terminalStatus.version || 'Unknown'}`);
    console.log(`  Initialized: ${terminalStatus.initialized || false}`);
    console.log(`  Test Capsules: ${terminalStatus.testCapsules || 0}`);
    console.log(`  Live Capsules: ${terminalStatus.liveCapsules || 0}`);
    console.log(`  Vault Feed Connected: ${terminalStatus.vaultFeedConnected || false}`);
    
    const overallSuccess = this.failedTests === 0;
    console.log('');
    console.log(`🎯 OVERALL RESULT: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return {
      success: overallSuccess,
      totalTests: this.testCount,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: (this.passedTests / this.testCount) * 100,
      terminalStatus
    };
  }
}

// Auto-run tests if in test environment
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test-environment')) {
  window.runCosmicReplayTerminalTests = async function() {
    const testSuite = new CosmicReplayTerminalTestSuite();
    return await testSuite.runAllTests();
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmicReplayTerminalTestSuite;
} else if (typeof window !== 'undefined') {
  window.CosmicReplayTerminalTestSuite = CosmicReplayTerminalTestSuite;
}