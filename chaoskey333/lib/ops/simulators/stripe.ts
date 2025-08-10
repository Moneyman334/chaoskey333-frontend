/**
 * Stripe test payload generator
 */
export function generateStripeTestPayload() {
  return {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_payment_intent',
        object: 'payment_intent',
        amount: 1000, // $10.00 in cents
        currency: 'usd',
        status: 'succeeded',
        client_secret: 'pi_test_payment_intent_client_secret',
        metadata: {
          test_mode: 'true',
          order_id: 'test_order_' + Date.now()
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_request',
      idempotency_key: null
    },
    type: 'payment_intent.succeeded'
  };
}

/**
 * Generate test charge payload for Stripe
 */
export function generateStripeChargePayload() {
  return {
    id: 'evt_test_charge',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'ch_test_charge',
        object: 'charge',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        payment_method: 'pm_card_visa',
        metadata: {
          test_mode: 'true',
          product: 'chaoskey_relic'
        }
      }
    },
    livemode: false,
    type: 'charge.succeeded'
  };
}