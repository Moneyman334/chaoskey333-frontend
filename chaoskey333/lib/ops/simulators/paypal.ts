/**
 * PayPal test payload generator
 */
export function generatePayPalTestPayload() {
  return {
    id: 'WH-test-' + Date.now() + '-' + Math.random().toString(36).substring(7),
    event_version: '1.0',
    create_time: new Date().toISOString(),
    resource_type: 'checkout-order',
    resource_version: '2.0',
    event_type: 'CHECKOUT.ORDER.APPROVED',
    summary: 'Test checkout order approved',
    resource: {
      id: 'test-order-' + Date.now(),
      intent: 'CAPTURE',
      status: 'APPROVED',
      purchase_units: [
        {
          reference_id: 'test-ref-' + Date.now(),
          amount: {
            currency_code: 'USD',
            value: '10.00',
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: '10.00'
              }
            }
          },
          payee: {
            email_address: 'test-merchant@chaoskey333.com',
            merchant_id: 'TEST_MERCHANT_ID'
          },
          items: [
            {
              name: 'ChaosKey Relic (Test)',
              unit_amount: {
                currency_code: 'USD',
                value: '10.00'
              },
              quantity: '1',
              description: 'Test purchase of ChaosKey relic',
              sku: 'CHAOS-RELIC-TEST',
              category: 'DIGITAL_GOODS'
            }
          ]
        }
      ],
      payer: {
        name: {
          given_name: 'Test',
          surname: 'User'
        },
        email_address: 'test-user@example.com',
        payer_id: 'TEST_PAYER_ID'
      },
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/test-order-' + Date.now(),
          rel: 'self',
          method: 'GET'
        }
      ]
    },
    links: [
      {
        href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-test-' + Date.now(),
        rel: 'self',
        method: 'GET',
        encType: 'application/json'
      }
    ]
  };
}

/**
 * Generate PayPal payment capture payload
 */
export function generatePayPalCapturePayload() {
  return {
    id: 'WH-capture-test-' + Date.now() + '-' + Math.random().toString(36).substring(7),
    event_version: '1.0',
    create_time: new Date().toISOString(),
    resource_type: 'capture',
    resource_version: '2.0',
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    summary: 'Test payment capture completed',
    resource: {
      id: 'test-capture-' + Date.now(),
      status: 'COMPLETED',
      amount: {
        currency_code: 'USD',
        value: '10.00'
      },
      final_capture: true,
      seller_protection: {
        status: 'ELIGIBLE',
        dispute_categories: [
          'ITEM_NOT_RECEIVED',
          'UNAUTHORIZED_TRANSACTION'
        ]
      },
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v2/payments/captures/test-capture-' + Date.now(),
          rel: 'self',
          method: 'GET'
        }
      ]
    }
  };
}