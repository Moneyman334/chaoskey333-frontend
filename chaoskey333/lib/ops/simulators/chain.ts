/**
 * Blockchain mint hook test payload generator
 */
export function generateChainMintPayload() {
  return {
    id: 'mint-test-' + Date.now(),
    event_type: 'relic.mint_requested',
    timestamp: new Date().toISOString(),
    test_mode: true,
    data: {
      transaction: {
        hash: '0xtest' + Math.random().toString(36).substring(7).padEnd(56, '0'),
        from: '0xtest' + Math.random().toString(36).substring(7).padEnd(38, '0'),
        to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xcontract123456789',
        value: '0',
        gas_used: 150000,
        block_number: Math.floor(Math.random() * 1000000) + 18000000,
        block_hash: '0xblock' + Math.random().toString(36).substring(7).padEnd(58, '0'),
        status: 'success'
      },
      relic: {
        token_id: Math.floor(Math.random() * 10000) + 1,
        rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 5)],
        attributes: {
          power: Math.floor(Math.random() * 100) + 1,
          chaos_level: Math.floor(Math.random() * 10) + 1,
          element: ['fire', 'water', 'earth', 'air', 'chaos'][Math.floor(Math.random() * 5)]
        },
        metadata_uri: `https://api.chaoskey333.com/metadata/test-${Date.now()}`,
        minted_at: new Date().toISOString()
      },
      payment: {
        source: 'test',
        amount: '10.00',
        currency: 'USD',
        payment_id: 'test-payment-' + Date.now()
      }
    },
    webhook: {
      endpoint: '/api/relic/evolve',
      retry_count: 0,
      next_retry: null
    }
  };
}

/**
 * Generate blockchain evolution hook payload
 */
export function generateChainEvolutionPayload() {
  return {
    id: 'evolution-test-' + Date.now(),
    event_type: 'relic.evolution_triggered',
    timestamp: new Date().toISOString(),
    test_mode: true,
    data: {
      transaction: {
        hash: '0xevo' + Math.random().toString(36).substring(7).padEnd(58, '0'),
        from: '0xuser' + Math.random().toString(36).substring(7).padEnd(36, '0'),
        to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xcontract123456789',
        value: '0',
        gas_used: 200000,
        block_number: Math.floor(Math.random() * 1000000) + 18000000,
        status: 'success'
      },
      relic: {
        token_id: Math.floor(Math.random() * 10000) + 1,
        previous_rarity: 'common',
        new_rarity: 'rare',
        evolution_type: 'chaos_infusion',
        attributes_before: {
          power: 25,
          chaos_level: 3,
          element: 'fire'
        },
        attributes_after: {
          power: 75,
          chaos_level: 7,
          element: 'chaos'
        },
        evolved_at: new Date().toISOString()
      },
      trigger: {
        method: 'manual_evolution',
        cost: '0.05',
        currency: 'ETH',
        success: true
      }
    },
    webhook: {
      endpoint: '/api/relic/evolve',
      retry_count: 0,
      next_retry: null
    }
  };
}