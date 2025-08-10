const StripeProvider = require('./StripeProvider');
const CoinbaseProvider = require('./CoinbaseProvider');
const PayPalProvider = require('./PayPalProvider');

class PaymentFactory {
  static createProvider(providerType, config) {
    switch (providerType.toLowerCase()) {
      case 'stripe':
        return new StripeProvider({
          secretKey: config.STRIPE_SECRET_KEY,
          publicKey: config.STRIPE_PUBLIC_KEY,
          webhookSecret: config.STRIPE_WEBHOOK_SECRET
        });

      case 'coinbase':
        return new CoinbaseProvider({
          apiKey: config.COINBASE_COMMERCE_API_KEY,
          webhookSecret: config.COINBASE_COMMERCE_WEBHOOK_SECRET
        });

      case 'paypal':
        return new PayPalProvider({
          clientId: config.PAYPAL_CLIENT_ID,
          clientSecret: config.PAYPAL_CLIENT_SECRET,
          webhookId: config.PAYPAL_WEBHOOK_ID,
          environment: config.NODE_ENV === 'production' ? 'live' : 'sandbox'
        });

      default:
        throw new Error(`Unsupported payment provider: ${providerType}`);
    }
  }

  static getSupportedProviders() {
    return ['stripe', 'coinbase', 'paypal'];
  }

  static getProviderConfig(providerType) {
    const configs = {
      stripe: {
        name: 'Stripe',
        description: 'Credit card payments via Stripe',
        supportedCurrencies: ['usd', 'eur', 'gbp'],
        requiresRedirect: true
      },
      coinbase: {
        name: 'Coinbase Commerce',
        description: 'Cryptocurrency payments via Coinbase Commerce',
        supportedCurrencies: ['usd', 'eur', 'btc', 'eth'],
        requiresRedirect: true
      },
      paypal: {
        name: 'PayPal',
        description: 'PayPal and credit card payments',
        supportedCurrencies: ['usd', 'eur', 'gbp'],
        requiresRedirect: true
      }
    };

    return configs[providerType.toLowerCase()] || null;
  }
}

module.exports = PaymentFactory;