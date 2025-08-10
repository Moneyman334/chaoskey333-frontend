import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Verify Coinbase Commerce webhook signature
 */
export function verifyCoinbaseSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Verify PayPal webhook signature
 */
export function verifyPayPalSignature(
  payload: string,
  headers: Record<string, string>,
  webhookId: string
): boolean {
  // PayPal signature verification logic would go here
  // For now, return true for development
  return true;
}

/**
 * Generate a claim token
 */
export function generateClaimToken(orderId: string, amount: string, currency: string): string {
  const secret = process.env.CLAIM_SIGNING_SECRET;
  if (!secret) throw new Error('CLAIM_SIGNING_SECRET not configured');

  const payload = {
    orderId,
    amount,
    currency,
    type: 'claim',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };

  return jwt.sign(payload, secret);
}

/**
 * Verify and decode a claim token
 */
export function verifyClaimToken(token: string): any {
  const secret = process.env.CLAIM_SIGNING_SECRET;
  if (!secret) throw new Error('CLAIM_SIGNING_SECRET not configured');

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid claim token');
  }
}

/**
 * Generate a short-lived server signature for minting
 */
export function generateMintSignature(claimData: any): string {
  const secret = process.env.CLAIM_SIGNING_SECRET;
  if (!secret) throw new Error('CLAIM_SIGNING_SECRET not configured');

  const payload = {
    ...claimData,
    type: 'mint',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
  };

  return jwt.sign(payload, secret);
}

/**
 * Generate a claim link with expiration
 */
export function generateClaimLink(claimToken: string, baseUrl: string): string {
  return `${baseUrl}/mint?claim=${claimToken}`;
}

/**
 * Hash function for consistent IDs
 */
export function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}