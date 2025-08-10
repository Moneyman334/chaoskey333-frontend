const PaymentProvider = require('./PaymentProvider');
const axios = require('axios');
const crypto = require('crypto');

class CoinbaseProvider extends PaymentProvider {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://api.commerce.coinbase.com';
    this.apiKey = config.apiKey;
  }

  async createCheckoutSession(orderData) {
    const { amount, currency, productName, productDescription, walletAddress, connectedWalletType, successUrl, cancelUrl } = orderData;

    // Convert cents to dollars for Coinbase
    const dollarAmount = (amount / 100).toFixed(2);

    const chargeData = {
      name: productName,
      description: productDescription,
      pricing_type: 'fixed_price',
      local_price: {
        amount: dollarAmount,
        currency: currency?.toUpperCase() || 'USD'
      },
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
        provider: 'coinbase'
      },
      redirect_url: successUrl,
      cancel_url: cancelUrl
    };

    try {
      const response = await axios.post(`${this.baseUrl}/charges`, chargeData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': this.apiKey,
          'X-CC-Version': '2018-03-22'
        }
      });

      const charge = response.data.data;

      return {
        sessionId: charge.id,
        sessionUrl: charge.hosted_url,
        provider: 'coinbase'
      };
    } catch (error) {
      throw new Error(`Coinbase Commerce error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async verifyWebhook(payload, signature) {
    const secret = this.config.webhookSecret;
    
    if (!secret) {
      throw new Error('Coinbase webhook secret not configured');
    }

    // Coinbase Commerce webhook verification
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    if (computedSignature !== signature) {
      throw new Error('Webhook signature verification failed');
    }

    try {
      return JSON.parse(payload);
    } catch (err) {
      throw new Error('Invalid webhook payload');
    }
  }

  async handlePaymentSuccess(paymentData) {
    const { event } = paymentData;
    
    if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
      const charge = event.data;
      
      return {
        paymentId: charge.id,
        walletAddress: charge.metadata?.walletAddress,
        connectedWalletType: charge.metadata?.connectedWalletType,
        amount: Math.round(parseFloat(charge.pricing.local.amount) * 100), // Convert back to cents
        currency: charge.pricing.local.currency.toLowerCase(),
        status: 'completed',
        provider: 'coinbase'
      };
    }
    
    return null;
  }
}

module.exports = CoinbaseProvider;