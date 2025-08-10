/**
 * Coinbase Commerce test payload generator
 */
export function generateCoinbaseTestPayload() {
  return {
    id: Math.floor(Math.random() * 1000000),
    scheduled_for: new Date().toISOString(),
    attempt_number: 1,
    event: {
      id: 'test-event-' + Date.now(),
      resource: 'event',
      type: 'charge:confirmed',
      api_version: '2018-03-22',
      created_at: new Date().toISOString(),
      data: {
        id: 'test-charge-' + Date.now(),
        resource: 'charge',
        code: 'TEST' + Math.random().toString(36).substring(7).toUpperCase(),
        name: 'ChaosKey Relic Purchase (Test)',
        description: 'Test purchase of ChaosKey relic',
        hosted_url: 'https://commerce.coinbase.com/charges/test',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        confirmed_at: new Date().toISOString(),
        checkout: {
          id: 'test-checkout-' + Date.now()
        },
        timeline: [
          {
            time: new Date().toISOString(),
            status: 'NEW'
          },
          {
            time: new Date().toISOString(),
            status: 'CONFIRMED'
          }
        ],
        metadata: {
          test_mode: true,
          order_id: 'test_order_' + Date.now()
        },
        pricing_type: 'fixed_price',
        pricing: {
          local: {
            amount: '10.00',
            currency: 'USD'
          },
          bitcoin: {
            amount: '0.00025000',
            currency: 'BTC'
          },
          ethereum: {
            amount: '0.005000',
            currency: 'ETH'
          }
        },
        payments: [
          {
            network: 'ethereum',
            transaction_id: '0xtest' + Math.random().toString(36).substring(7),
            status: 'CONFIRMED',
            value: {
              local: {
                amount: '10.00',
                currency: 'USD'
              },
              crypto: {
                amount: '0.005000',
                currency: 'ETH'
              }
            }
          }
        ]
      }
    }
  };
}

/**
 * Generate Coinbase charge created payload
 */
export function generateCoinbaseChargeCreatedPayload() {
  return {
    id: Math.floor(Math.random() * 1000000),
    scheduled_for: new Date().toISOString(),
    attempt_number: 1,
    event: {
      id: 'test-event-created-' + Date.now(),
      resource: 'event',
      type: 'charge:created',
      api_version: '2018-03-22',
      created_at: new Date().toISOString(),
      data: {
        id: 'test-charge-created-' + Date.now(),
        resource: 'charge',
        code: 'TESTCR' + Math.random().toString(36).substring(7).toUpperCase(),
        name: 'ChaosKey Relic Purchase (Test Created)',
        description: 'Test charge creation for ChaosKey relic',
        hosted_url: 'https://commerce.coinbase.com/charges/test-created',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        timeline: [
          {
            time: new Date().toISOString(),
            status: 'NEW'
          }
        ],
        metadata: {
          test_mode: true,
          order_id: 'test_order_created_' + Date.now()
        },
        pricing_type: 'fixed_price'
      }
    }
  };
}