// Payment Provider Adapter Interface
class PaymentProvider {
  constructor(config) {
    this.config = config;
  }

  async createCheckoutSession(orderData) {
    throw new Error('createCheckoutSession must be implemented');
  }

  async verifyWebhook(payload, signature) {
    throw new Error('verifyWebhook must be implemented');
  }

  async handlePaymentSuccess(paymentData) {
    throw new Error('handlePaymentSuccess must be implemented');
  }
}

module.exports = PaymentProvider;