# Commander E2E Harness - Testing Guide

## 🎯 Overview

The Commander E2E Harness is designed to battle-test the Autonomous Campaign Commander end-to-end, ensuring seamless integration of key flows and behaviors before merging into the main branch.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- Git

### Installation & Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Setup test environment:**
   ```bash
   cp .env.test.example .env.test
   # Edit .env.test with your provider preferences if needed
   ```

4. **Run the one-command test suite:**
   ```bash
   pnpm test:e2e-commander
   ```

## 🧪 Test Configuration

### Environment Variables

The test suite supports multiple payment providers and configurations:

```bash
# Default Provider (Coinbase)
TEST_PAYMENT_PROVIDER=coinbase

# Alternative Providers
TEST_PAYMENT_PROVIDER=stripe
TEST_PAYMENT_PROVIDER=paypal

# Mock Settings
MOCK_TRANSACTIONS=true
MOCK_BLOCKCHAIN_CALLS=true
MOCK_PAYMENT_PROCESSING=true
```

### Supported Routes

The harness tests the following routes:
- `/mint` - NFT minting workflow
- `/store` - Marketplace functionality  
- `/leaderboard` - Player rankings
- `/admin` - Administrative interface

## 📋 Test Commands

### Basic Commands
```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with browser visible
pnpm test:e2e-headed

# Debug tests interactively
pnpm test:e2e-debug

# One-command orchestration (recommended)
pnpm test:e2e-commander
```

### Advanced Commands
```bash
# Run specific test file
npx playwright test mint.spec.ts

# Run tests against specific browser
npx playwright test --project=chromium

# Generate test code
pnpm playwright:codegen
```

## 🔧 Test Structure

```
tests/e2e/
├── fixtures/
│   └── test-fixtures.ts      # Mock data and setup
├── selectors/
│   └── selectors.ts          # Page element selectors
├── helpers/
│   └── test-helpers.ts       # Reusable test utilities
├── mint.spec.ts              # Mint functionality tests
├── store.spec.ts             # Store functionality tests
├── leaderboard.spec.ts       # Leaderboard tests
└── admin.spec.ts             # Admin interface tests
```

## 🎭 Mock Layer

### Wallet Mocking
- **MetaMask**: Automatically injected with test wallet
- **Coinbase Wallet**: Pre-configured test provider
- **Transaction Simulation**: No real blockchain calls

### Payment Mocking
- **Stripe**: Mock checkout sessions
- **Coinbase Commerce**: Simulated payments
- **PayPal**: Test payment flow

## 🔍 Test Coverage

### Core Functionality
- ✅ Wallet connection workflows
- ✅ Payment processing (all providers)
- ✅ NFT minting simulation
- ✅ Navigation and routing
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design

### Provider Coverage
- 🔵 **Coinbase** (Default)
- 💳 **Stripe** (Alternative)
- 🅿️ **PayPal** (Alternative)

## 📊 CI/CD Integration

### GitHub Actions
The harness automatically runs on:
- Push to `main` or `develop` branches
- Pull request creation/updates

### Artifacts
- 📸 Screenshots on failure
- 🎬 Video recordings
- 📋 HTML test reports
- 🔍 Playwright traces

## 🛠️ Development Workflow

### Local Development
1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Run tests in watch mode:
   ```bash
   npx playwright test --headed --watch
   ```

3. Debug failing tests:
   ```bash
   pnpm test:e2e-debug
   ```

### Writing New Tests

1. **Use existing fixtures:**
   ```typescript
   import { test, expect } from '../fixtures/test-fixtures';
   ```

2. **Leverage helpers:**
   ```typescript
   import { WalletHelpers, PaymentHelpers } from '../helpers/test-helpers';
   ```

3. **Follow naming conventions:**
   ```typescript
   test.describe('Feature Name E2E Tests', () => {
     test('should perform specific action', async ({ page }) => {
       // Test implementation
     });
   });
   ```

## 🎯 Best Practices

### Test Design
- **Atomic Tests**: Each test should be independent
- **Mock Everything**: No real API calls or blockchain transactions
- **Error Scenarios**: Test both happy and sad paths
- **Responsive Testing**: Verify mobile and desktop layouts

### Debugging Tips
- Use `await page.pause()` to stop execution
- Enable `trace: 'on'` in playwright.config.ts
- Take screenshots with `await page.screenshot()`
- Check console logs with `await page.evaluate(() => console.log())`

## 🔧 Troubleshooting

### Common Issues

**Browser Installation Failed:**
```bash
# Try installing with deps
npx playwright install --with-deps

# Or install specific browser
npx playwright install chromium
```

**Server Won't Start:**
```bash
# Check if port is available
netstat -tlnp | grep :5000

# Kill existing process
pkill -f "node server.js"
```

**Tests Timing Out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  // 60 seconds
```

**Environment Issues:**
```bash
# Verify environment file
cat .env.test

# Reset to defaults
cp .env.test.example .env.test
```

## 📈 Performance Guidelines

### Test Execution Time
- **Target**: < 5 minutes for full suite
- **Individual Tests**: < 30 seconds each
- **Parallel Execution**: Enabled in CI

### Resource Usage
- **Memory**: < 2GB during execution
- **Network**: Mock all external calls
- **Storage**: Clean up artifacts after runs

## 🚀 Integration with Autonomous Campaign Commander

Once this harness is merged and operational:

1. **PR #13 Integration**: The Commander can be tested against these E2E flows
2. **ChaosKey333 Overlays**: Glyph hooks available for PR #10 integration
3. **Continuous Validation**: All future changes are battle-tested

## 📞 Support

### Getting Help
- Check existing test failures in CI
- Review test artifacts for debugging info
- Consult selectors.ts for element targeting
- Use playwright codegen for selector discovery

### Contributing
- Follow existing test patterns
- Add new selectors to selectors.ts
- Update fixtures for new mock data
- Document new test scenarios

---

**Commander E2E Harness** 🎖️ - *Battle-testing the future of ChaosKey333*