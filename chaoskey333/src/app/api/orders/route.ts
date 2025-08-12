import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { storeOrder, Order } from '@/lib/kv';
import { createPaymentSession, PAYMENT_CONFIG } from '@/lib/payments';
import { generateClaimToken, generateIdempotencyKey } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, paymentProvider } = body;

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Create order record
    const order: Order = {
      id: orderId,
      walletAddress,
      amount: PAYMENT_CONFIG.supermanRelicPrice,
      currency: PAYMENT_CONFIG.currency,
      status: 'pending',
      paymentProvider: paymentProvider || 'coinbase',
      paymentId: '', // Will be updated when payment is processed
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Generate claim token for wallet-less users
    if (!walletAddress) {
      const { token, expiresAt } = generateClaimToken(orderId);
      order.claimToken = token;
      order.claimTokenExpiry = expiresAt;
    }

    // Store order in KV
    await storeOrder(order);

    // Create payment session
    const paymentUrl = await createPaymentSession(orderId, paymentProvider);

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl,
      claimToken: order.claimToken
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}