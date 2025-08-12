import Stripe from 'stripe';

export interface PaymentConfig {
  supermanRelicPrice: number;
  currency: string;
  description: string;
}

export const PAYMENT_CONFIG: PaymentConfig = {
  supermanRelicPrice: 50, // $50 USD
  currency: 'usd',
  description: 'Superman Relic - ChaosKey333 Vault'
};

/**
 * Initialize Stripe
 */
export function initializeStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

/**
 * Create Stripe checkout session
 */
export async function createStripeCheckoutSession(orderId: string): Promise<string> {
  const stripe = initializeStripe();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: PAYMENT_CONFIG.currency,
          product_data: {
            name: 'Superman Relic',
            description: PAYMENT_CONFIG.description,
          },
          unit_amount: PAYMENT_CONFIG.supermanRelicPrice * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
      product: 'superman_relic',
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store?cancelled=true`,
  });

  return session.url!;
}

/**
 * Create Coinbase Commerce charge (manual implementation since SDK is deprecated)
 */
export async function createCoinbaseCharge(orderId: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY;
  if (!apiKey) {
    throw new Error('Coinbase Commerce API key not configured');
  }

  const chargeData = {
    name: 'Superman Relic',
    description: PAYMENT_CONFIG.description,
    pricing_type: 'fixed_price',
    local_price: {
      amount: PAYMENT_CONFIG.supermanRelicPrice.toString(),
      currency: PAYMENT_CONFIG.currency.toUpperCase()
    },
    metadata: {
      orderId,
      product: 'superman_relic'
    },
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store/success?order_id=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store?cancelled=true`
  };

  const response = await fetch('https://api.commerce.coinbase.com/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': apiKey,
      'X-CC-Version': '2018-03-22'
    },
    body: JSON.stringify(chargeData)
  });

  if (!response.ok) {
    throw new Error(`Coinbase Commerce API error: ${response.statusText}`);
  }

  const charge = await response.json();
  return charge.data.hosted_url;
}

/**
 * Get primary payment provider from environment
 */
export function getPrimaryPaymentProvider(): 'stripe' | 'coinbase' | 'paypal' {
  const provider = process.env.NEXT_PUBLIC_PRIMARY_PAYMENT_PROVIDER;
  if (provider === 'stripe' || provider === 'coinbase' || provider === 'paypal') {
    return provider;
  }
  return 'coinbase'; // Default to Coinbase
}

/**
 * Create payment session based on provider
 */
export async function createPaymentSession(orderId: string, provider?: string): Promise<string> {
  const paymentProvider = provider || getPrimaryPaymentProvider();
  
  switch (paymentProvider) {
    case 'stripe':
      return await createStripeCheckoutSession(orderId);
    case 'coinbase':
      return await createCoinbaseCharge(orderId);
    case 'paypal':
      // PayPal implementation would go here
      throw new Error('PayPal integration not yet implemented');
    default:
      throw new Error(`Unsupported payment provider: ${paymentProvider}`);
  }
}