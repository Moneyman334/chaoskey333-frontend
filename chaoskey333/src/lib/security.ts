import { createHmac, randomBytes } from 'crypto';

/**
 * Generate HMAC-based claim token with expiry
 */
export function generateClaimToken(orderId: string, walletAddress?: string): {
  token: string;
  expiresAt: number;
} {
  const secret = process.env.HMAC_SECRET_KEY;
  if (!secret) {
    throw new Error('HMAC_SECRET_KEY not configured');
  }

  const expiryHours = parseInt(process.env.CLAIM_TOKEN_EXPIRY_HOURS || '24');
  const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);
  const nonce = randomBytes(16).toString('hex');
  
  const payload = {
    orderId,
    walletAddress: walletAddress || null,
    expiresAt,
    nonce
  };

  const payloadStr = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(payloadStr);
  const signature = hmac.digest('hex');

  const token = Buffer.from(`${payloadStr}.${signature}`).toString('base64url');
  
  return { token, expiresAt };
}

/**
 * Verify and decode claim token
 */
export function verifyClaimToken(token: string): {
  orderId: string;
  walletAddress: string | null;
  expiresAt: number;
  nonce: string;
} | null {
  try {
    const secret = process.env.HMAC_SECRET_KEY;
    if (!secret) {
      throw new Error('HMAC_SECRET_KEY not configured');
    }

    const decoded = Buffer.from(token, 'base64url').toString();
    const [payloadStr, signature] = decoded.split('.');
    
    if (!payloadStr || !signature) {
      return null;
    }

    // Verify HMAC signature
    const hmac = createHmac('sha256', secret);
    hmac.update(payloadStr);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(payloadStr);
    
    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify webhook signature for payment providers
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: 'stripe' | 'coinbase' | 'paypal'
): boolean {
  try {
    switch (provider) {
      case 'stripe':
        // Stripe signature format: t=timestamp,v1=signature
        const stripeElements = signature.split(',');
        const timestampElement = stripeElements.find(el => el.startsWith('t='));
        const signatureElement = stripeElements.find(el => el.startsWith('v1='));
        
        if (!timestampElement || !signatureElement) {
          return false;
        }
        
        const timestamp = timestampElement.split('=')[1];
        const expectedSignature = signatureElement.split('=')[1];
        
        const hmac = createHmac('sha256', secret);
        hmac.update(`${timestamp}.${payload}`);
        const computedSignature = hmac.digest('hex');
        
        return computedSignature === expectedSignature;
        
      case 'coinbase':
        // Coinbase signature is just the HMAC-SHA256 of the payload
        const hmac2 = createHmac('sha256', secret);
        hmac2.update(payload);
        const expectedSignature2 = hmac2.digest('hex');
        
        return signature === expectedSignature2;
        
      case 'paypal':
        // PayPal webhook verification would typically involve their SDK
        // For now, we'll implement basic HMAC verification
        const hmac3 = createHmac('sha256', secret);
        hmac3.update(payload);
        const expectedSignature3 = hmac3.digest('hex');
        
        return signature === expectedSignature3;
        
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(orderId: string, action: string): string {
  return `${action}:${orderId}:${Date.now()}`;
}