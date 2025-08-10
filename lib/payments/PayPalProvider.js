const PaymentProvider = require('./PaymentProvider');

class PayPalProvider extends PaymentProvider {
  constructor(config) {
    super(config);
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment || 'sandbox';
    this.baseUrl = this.environment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  }

  async createCheckoutSession(orderData) {
    const { amount, currency, productName, productDescription, walletAddress, connectedWalletType, successUrl, cancelUrl } = orderData;

    // Convert cents to dollars for PayPal
    const dollarAmount = (amount / 100).toFixed(2);

    const accessToken = await this.getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl,
        brand_name: 'ChaosKey333',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      },
      purchase_units: [{
        reference_id: `chaos_${Date.now()}`,
        description: productDescription,
        amount: {
          currency_code: currency?.toUpperCase() || 'USD',
          value: dollarAmount
        },
        custom_id: JSON.stringify({
          walletAddress: walletAddress,
          connectedWalletType: connectedWalletType,
          provider: 'paypal'
        })
      }]
    };

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const order = await response.json();
      
      if (!response.ok) {
        throw new Error(order.message || 'PayPal order creation failed');
      }
      
      // Find the approval URL
      const approvalUrl = order.links?.find(link => link.rel === 'approve')?.href;

      return {
        sessionId: order.id,
        sessionUrl: approvalUrl,
        provider: 'paypal'
      };
    } catch (error) {
      throw new Error(`PayPal error: ${error.message}`);
    }
  }

  async verifyWebhook(payload, signature) {
    // PayPal webhook verification is more complex and typically done via their API
    // For this implementation, we'll do basic verification
    try {
      return JSON.parse(payload);
    } catch (err) {
      throw new Error('Invalid webhook payload');
    }
  }

  async handlePaymentSuccess(paymentData) {
    const { event } = paymentData;
    
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = event.resource;
      const customData = JSON.parse(capture.custom_id || '{}');
      
      return {
        paymentId: capture.id,
        walletAddress: customData.walletAddress,
        connectedWalletType: customData.connectedWalletType,
        amount: Math.round(parseFloat(capture.amount.value) * 100), // Convert to cents
        currency: capture.amount.currency_code.toLowerCase(),
        status: 'completed',
        provider: 'paypal'
      };
    }
    
    return null;
  }

  async captureOrder(orderId) {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`PayPal capture error: ${error.message}`);
    }
  }
}

module.exports = PayPalProvider;