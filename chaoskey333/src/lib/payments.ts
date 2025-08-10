export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'chaos-vault-basic',
    name: 'ChaosKey333 Vault - Basic',
    description: 'Secure digital asset storage with basic features',
    price: 99,
    currency: 'USD',
    image: '/images/vault-basic.png'
  },
  {
    id: 'chaos-vault-premium',
    name: 'ChaosKey333 Vault - Premium',
    description: 'Advanced vault with premium security features',
    price: 199,
    currency: 'USD',
    image: '/images/vault-premium.png'
  },
  {
    id: 'chaos-vault-enterprise',
    name: 'ChaosKey333 Vault - Enterprise',
    description: 'Enterprise-grade security and management tools',
    price: 499,
    currency: 'USD',
    image: '/images/vault-enterprise.png'
  }
];

/**
 * Create Coinbase Commerce charge
 */
export async function createCoinbaseCharge(product: Product, orderId: string) {
  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  if (!apiKey) throw new Error('Coinbase Commerce API key not configured');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  const chargeData = {
    name: product.name,
    description: product.description,
    pricing_type: 'fixed_price',
    local_price: {
      amount: product.price.toString(),
      currency: product.currency
    },
    metadata: {
      order_id: orderId,
      product_id: product.id
    },
    redirect_url: `${baseUrl}/store/success?order=${orderId}`,
    cancel_url: `${baseUrl}/store/cancel?order=${orderId}`
  };

  // In production, make actual API call to Coinbase Commerce
  // For development, return mock response
  if (process.env.NODE_ENV === 'development') {
    return {
      id: `coinbase_charge_${orderId}`,
      hosted_url: `${baseUrl}/store/success?order=${orderId}&mock=coinbase`,
      code: `CB${orderId.slice(-8).toUpperCase()}`
    };
  }

  try {
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
      throw new Error(`Coinbase API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Coinbase charge creation failed:', error);
    throw error;
  }
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(product: Product, orderId: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  
  if (!clientId || !secret) throw new Error('PayPal credentials not configured');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const paypalBaseUrl = mode === 'sandbox' ? 
    'https://api-m.sandbox.paypal.com' : 
    'https://api-m.paypal.com';

  // Get access token
  const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!authResponse.ok) {
    throw new Error('PayPal authentication failed');
  }

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  // Create order
  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderId,
      amount: {
        currency_code: product.currency,
        value: product.price.toString()
      },
      description: product.description
    }],
    application_context: {
      return_url: `${baseUrl}/store/success?order=${orderId}`,
      cancel_url: `${baseUrl}/store/cancel?order=${orderId}`,
      brand_name: 'ChaosKey333 Vault',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW'
    }
  };

  // In development, return mock response
  if (process.env.NODE_ENV === 'development') {
    return {
      id: `paypal_order_${orderId}`,
      links: [{
        rel: 'approve',
        href: `${baseUrl}/store/success?order=${orderId}&mock=paypal`
      }]
    };
  }

  try {
    const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': orderId
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`PayPal API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('PayPal order creation failed:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export function getProduct(productId: string): Product | null {
  return PRODUCTS.find(p => p.id === productId) || null;
}