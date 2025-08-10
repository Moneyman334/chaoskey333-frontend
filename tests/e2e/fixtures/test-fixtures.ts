import { test as base, expect } from '@playwright/test';
import { PaymentMocks, BlockchainMocks, APIMocks } from '../mocks/payment-mocks';

// Mock wallet data
export const mockWallet = {
  address: '0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e',
  privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  type: 'coinbase',
  connected: true
};

// Mock transaction data
export const mockTransaction = {
  hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockNumber: 123456,
  status: 'success',
  gasUsed: '21000',
  gasPrice: '20000000000'
};

// Mock payment session data
export const mockPaymentSession = {
  sessionId: 'cs_test_1234567890abcdef',
  amount: 3333, // $33.33 in cents
  currency: 'usd',
  status: 'complete',
  metadata: {
    walletAddress: mockWallet.address,
    connectedWalletType: mockWallet.type
  }
};

// Mock relic data
export const mockRelic = {
  tokenId: '1',
  name: 'ChaosKey333 Relic',
  description: 'Frankenstein Vault Relic for test wallet',
  image: 'https://example.com/relic.png',
  attributes: [
    { trait_type: 'Rarity', value: 'Legendary' },
    { trait_type: 'Power', value: '333' },
    { trait_type: 'Type', value: 'ChaosKey' }
  ]
};

// Test fixtures
type TestFixtures = {
  mockWalletSetup: void;
  mockPaymentSetup: void;
  mockTransactionSetup: void;
  mockAPISetup: void;
};

export const test = base.extend<TestFixtures>({
  mockWalletSetup: async ({ page }, use) => {
    // Setup comprehensive blockchain mocks
    await BlockchainMocks.setupBlockchainMocks(page);
    await use();
  },

  mockPaymentSetup: async ({ page }, use) => {
    // Get payment provider from environment
    const provider = process.env.TEST_PAYMENT_PROVIDER as 'coinbase' | 'stripe' | 'paypal' || 'coinbase';
    
    // Setup payment provider mocks
    await PaymentMocks.setupProviderMocks(page, provider);
    await use();
  },

  mockTransactionSetup: async ({ page }, use) => {
    // This is now handled by BlockchainMocks.setupBlockchainMocks
    await BlockchainMocks.setupBlockchainMocks(page);
    await use();
  },

  mockAPISetup: async ({ page }, use) => {
    // Setup API endpoint mocks
    await APIMocks.setupAPIMocks(page);
    await use();
  }
});

export { expect };