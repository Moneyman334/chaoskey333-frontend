import { kv } from '@vercel/kv';

export interface Order {
  id: string;
  walletAddress?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'minted' | 'failed';
  paymentProvider: string;
  paymentId: string;
  claimToken?: string;
  claimTokenExpiry?: number;
  createdAt: number;
  updatedAt: number;
  mintTxHash?: string;
  supermanRelicId?: string;
}

export interface IdempotencyRecord {
  key: string;
  processed: boolean;
  result?: any;
  createdAt: number;
}

/**
 * Store order in KV
 */
export async function storeOrder(order: Order): Promise<void> {
  await kv.set(`order:${order.id}`, order);
  
  // Also store in a list for admin access
  const ordersList = await kv.lrange('orders:list', 0, -1) || [];
  ordersList.unshift(order.id);
  
  // Keep only last 1000 orders in the list
  const trimmedList = ordersList.slice(0, 1000);
  await kv.del('orders:list');
  if (trimmedList.length > 0) {
    await kv.lpush('orders:list', ...trimmedList);
  }
}

/**
 * Get order from KV
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const order = await kv.get(`order:${orderId}`);
  return order as Order | null;
}

/**
 * Update order in KV
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  const existingOrder = await getOrder(orderId);
  if (!existingOrder) {
    throw new Error(`Order ${orderId} not found`);
  }

  const updatedOrder: Order = {
    ...existingOrder,
    ...updates,
    updatedAt: Date.now()
  };

  await storeOrder(updatedOrder);
}

/**
 * Get recent orders for admin
 */
export async function getRecentOrders(limit: number = 50): Promise<Order[]> {
  const orderIds = await kv.lrange('orders:list', 0, limit - 1) || [];
  const orders: Order[] = [];
  
  for (const orderId of orderIds) {
    const order = await getOrder(orderId as string);
    if (order) {
      orders.push(order);
    }
  }
  
  return orders;
}

/**
 * Check and record idempotency
 */
export async function checkIdempotency(key: string): Promise<IdempotencyRecord | null> {
  const record = await kv.get(`idempotency:${key}`);
  return record as IdempotencyRecord | null;
}

/**
 * Record idempotency result
 */
export async function recordIdempotency(key: string, result: any): Promise<void> {
  const record: IdempotencyRecord = {
    key,
    processed: true,
    result,
    createdAt: Date.now()
  };
  
  // Store with 24 hour expiry
  await kv.setex(`idempotency:${key}`, 86400, record);
}

/**
 * Store claim token mapping
 */
export async function storeClaimToken(token: string, orderId: string, expiresAt: number): Promise<void> {
  // Store with automatic expiry
  const ttl = Math.floor((expiresAt - Date.now()) / 1000);
  if (ttl > 0) {
    await kv.setex(`claim:${token}`, ttl, orderId);
  }
}

/**
 * Get order ID from claim token
 */
export async function getOrderIdFromClaimToken(token: string): Promise<string | null> {
  const orderId = await kv.get(`claim:${token}`);
  return orderId as string | null;
}

/**
 * Delete claim token (after use)
 */
export async function deleteClaimToken(token: string): Promise<void> {
  await kv.del(`claim:${token}`);
}