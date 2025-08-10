// Simple in-memory storage for development (replace with Vercel KV in production)
const storage = new Map<string, any>();

export interface Order {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentProvider: 'coinbase' | 'paypal';
  paymentId: string;
  claimToken?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Claim {
  id: string;
  orderId: string;
  token: string;
  status: 'active' | 'consumed';
  createdAt: string;
  consumedAt?: string;
  mintSignature?: string;
}

/**
 * Store order data
 */
export async function storeOrder(order: Order): Promise<void> {
  try {
    // In production, use Vercel KV
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      await kv.set(`order:${order.id}`, order);
    } else {
      // Development: use in-memory storage
      storage.set(`order:${order.id}`, order);
    }
  } catch (error) {
    console.error('Failed to store order:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      return await kv.get(`order:${orderId}`);
    } else {
      return storage.get(`order:${orderId}`) || null;
    }
  } catch (error) {
    console.error('Failed to get order:', error);
    return null;
  }
}

/**
 * Store claim data
 */
export async function storeClaim(claim: Claim): Promise<void> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      await kv.set(`claim:${claim.id}`, claim);
    } else {
      storage.set(`claim:${claim.id}`, claim);
    }
  } catch (error) {
    console.error('Failed to store claim:', error);
    throw error;
  }
}

/**
 * Get claim by token
 */
export async function getClaimByToken(token: string): Promise<Claim | null> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      // In production, you'd need to index by token or scan
      // For now, this is a simplified implementation
      const claims = await kv.keys('claim:*');
      for (const key of claims) {
        const claim = await kv.get(key) as Claim | null;
        if (claim && claim.token === token) {
          return claim;
        }
      }
      return null;
    } else {
      for (const [key, value] of storage.entries()) {
        if (key.startsWith('claim:') && value.token === token) {
          return value;
        }
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to get claim by token:', error);
    return null;
  }
}

/**
 * Update claim status
 */
export async function updateClaim(claimId: string, updates: Partial<Claim>): Promise<void> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      const existing = await kv.get(`claim:${claimId}`) as Claim | null;
      if (existing) {
        await kv.set(`claim:${claimId}`, { ...existing, ...updates });
      }
    } else {
      const existing = storage.get(`claim:${claimId}`);
      if (existing) {
        storage.set(`claim:${claimId}`, { ...existing, ...updates });
      }
    }
  } catch (error) {
    console.error('Failed to update claim:', error);
    throw error;
  }
}

/**
 * Get all orders (for admin dashboard)
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      const keys = await kv.keys('order:*');
      const orders = await Promise.all(keys.map(key => kv.get(key))) as (Order | null)[];
      return orders.filter(Boolean) as Order[];
    } else {
      const orders = [];
      for (const [key, value] of storage.entries()) {
        if (key.startsWith('order:')) {
          orders.push(value);
        }
      }
      return orders;
    }
  } catch (error) {
    console.error('Failed to get all orders:', error);
    return [];
  }
}

/**
 * Get all claims (for admin dashboard)
 */
export async function getAllClaims(): Promise<Claim[]> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      const keys = await kv.keys('claim:*');
      const claims = await Promise.all(keys.map(key => kv.get(key))) as (Claim | null)[];
      return claims.filter(Boolean) as Claim[];
    } else {
      const claims = [];
      for (const [key, value] of storage.entries()) {
        if (key.startsWith('claim:')) {
          claims.push(value);
        }
      }
      return claims;
    }
  } catch (error) {
    console.error('Failed to get all claims:', error);
    return [];
  }
}