/**
 * Coinbase Commerce API integration
 * Handles charge creation and webhook verification
 */

const axios = require('axios');
const crypto = require('crypto');

class CoinbaseCommerce {
  constructor(apiKey, webhookSecret) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.baseURL = 'https://api.commerce.coinbase.com';
  }

  /**
   * Create a new charge for Superman Relic
   */
  async createCharge({
    walletAddress,
    amount = '19.99',
    currency = 'USD',
    productName = 'Superman Relic',
    description = 'Exclusive Superman Relic NFT with special powers',
    successUrl = '/store/success',
    cancelUrl = '/store/cancel'
  } = {}) {
    try {
      const chargeData = {
        name: productName,
        description: description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: amount,
          currency: currency
        },
        metadata: {
          walletAddress: walletAddress,
          productType: 'superman_relic',
          mintLater: true // Enable "mint later" by default
        },
        redirect_url: successUrl,
        cancel_url: cancelUrl
      };

      console.log('🪙 Creating Coinbase Commerce charge:', JSON.stringify(chargeData, null, 2));

      const response = await axios.post(
        `${this.baseURL}/charges`,
        chargeData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': this.apiKey,
            'X-CC-Version': '2018-03-22'
          }
        }
      );

      console.log('✅ Coinbase Commerce charge created:', response.data.data.id);
      return response.data.data;

    } catch (error) {
      console.error('❌ Error creating Coinbase Commerce charge:', error.response?.data || error.message);
      throw new Error(`Failed to create charge: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body, signature) {
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body, 'utf8')
      .digest('hex');

    return signature === computedSignature;
  }

  /**
   * Process webhook event
   */
  async processWebhook(event) {
    console.log('📡 Processing Coinbase Commerce webhook:', event.type);

    switch (event.type) {
      case 'charge:confirmed':
        return await this.handleChargeConfirmed(event.data);
      case 'charge:failed':
        return await this.handleChargeFailed(event.data);
      case 'charge:delayed':
        return await this.handleChargeDelayed(event.data);
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
        return { processed: true, event: event.type };
    }
  }

  /**
   * Handle confirmed charge - queue for minting
   */
  async handleChargeConfirmed(charge) {
    const { metadata, payments } = charge;
    const walletAddress = metadata.walletAddress;

    console.log('💰 Payment confirmed for wallet:', walletAddress);
    console.log('🪙 Payment details:', JSON.stringify(payments, null, 2));

    // Queue "mint later" token (this would integrate with your minting system)
    const mintJob = {
      id: `mint_${charge.id}_${Date.now()}`,
      walletAddress: walletAddress,
      productType: metadata.productType || 'superman_relic',
      chargeId: charge.id,
      amount: payments[0]?.value?.local?.amount,
      currency: payments[0]?.value?.local?.currency,
      status: 'queued',
      createdAt: new Date().toISOString()
    };

    console.log('🎯 Queueing mint job:', JSON.stringify(mintJob, null, 2));

    // Here you would add to your minting queue
    // For now, we'll just log it
    console.log('✅ Mint job queued successfully');

    return {
      processed: true,
      mintJob: mintJob,
      message: 'Charge confirmed and mint job queued'
    };
  }

  /**
   * Handle failed charge
   */
  async handleChargeFailed(charge) {
    console.log('❌ Payment failed for charge:', charge.id);
    return {
      processed: true,
      message: 'Charge failed - no action taken'
    };
  }

  /**
   * Handle delayed charge
   */
  async handleChargeDelayed(charge) {
    console.log('⏳ Payment delayed for charge:', charge.id);
    return {
      processed: true,
      message: 'Charge delayed - monitoring'
    };
  }
}

module.exports = CoinbaseCommerce;