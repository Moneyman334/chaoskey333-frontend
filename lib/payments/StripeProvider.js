const PaymentProvider = require('./PaymentProvider');
const stripe = require('stripe');

class StripeProvider extends PaymentProvider {
  constructor(config) {
    super(config);
    this.stripe = stripe(config.secretKey);
  }

  async createCheckoutSession(orderData) {
    const { amount, currency, productName, productDescription, walletAddress, connectedWalletType, successUrl, cancelUrl } = orderData;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
        provider: 'stripe'
      },
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      provider: 'stripe'
    };
  }

  async verifyWebhook(payload, signature) {
    const endpointSecret = this.config.webhookSecret;
    
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }

  async handlePaymentSuccess(paymentData) {
    const { event } = paymentData;
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      return {
        paymentId: session.id,
        walletAddress: session.metadata.walletAddress,
        connectedWalletType: session.metadata.connectedWalletType,
        amount: session.amount_total,
        currency: session.currency,
        status: 'completed',
        provider: 'stripe'
      };
    }
    
    return null;
  }
}

module.exports = StripeProvider;