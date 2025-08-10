const axios = require('axios');

/**
 * Simple test script for Coinbase Commerce integration
 */
async function testCoinbaseCommerceIntegration() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Coinbase Commerce Integration...\n');

  // Test 1: Health check
  console.log('1. Testing server health...');
  try {
    const response = await axios.get(`${baseUrl}/health`);
    console.log('✅ Server health:', response.data);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return;
  }

  // Test 2: Test create charge endpoint (without API keys)
  console.log('\n2. Testing create charge endpoint...');
  try {
    const response = await axios.post(`${baseUrl}/api/commerce/create-charge`, {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      amount: '19.99',
      currency: 'USD',
      productName: 'Superman Relic'
    });
    console.log('✅ Charge created:', response.data);
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error?.includes('not configured')) {
      console.log('✅ Expected error (no API keys configured):', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test 3: Test webhook endpoint
  console.log('\n3. Testing webhook endpoint...');
  try {
    const response = await axios.post(`${baseUrl}/api/commerce/webhook`, {
      type: 'charge:confirmed',
      data: {
        id: 'test-charge-id',
        metadata: {
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
        },
        payments: [{
          value: {
            local: {
              amount: '19.99',
              currency: 'USD'
            }
          }
        }]
      }
    }, {
      headers: {
        'x-cc-webhook-signature': 'test-signature'
      }
    });
    console.log('✅ Webhook processed:', response.data);
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error?.includes('not configured')) {
      console.log('✅ Expected error (no webhook secret configured):', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('\n🎉 Integration tests completed!');
  console.log('💡 To enable full functionality, set COINBASE_API_KEY and COINBASE_WEBHOOK_SECRET in your .env file');
}

// Run tests if this script is executed directly
if (require.main === module) {
  testCoinbaseCommerceIntegration().catch(console.error);
}

module.exports = testCoinbaseCommerceIntegration;