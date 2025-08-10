import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { verifyCoinbaseSignature, generateClaimToken } from '@/lib/crypto';
import { getOrder, storeOrder, storeClaim, Claim } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyCoinbaseSignature(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    
    // Handle charge confirmed event
    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      const orderId = charge.metadata?.order_id;
      
      if (!orderId) {
        console.error('No order ID in charge metadata');
        return NextResponse.json({ received: true });
      }

      // Get order
      const order = await getOrder(orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return NextResponse.json({ received: true });
      }

      // Update order status
      order.status = 'completed';
      order.completedAt = new Date().toISOString();

      // Generate claim token
      const claimToken = generateClaimToken(
        orderId,
        order.amount,
        order.currency
      );
      order.claimToken = claimToken;

      // Store updated order
      await storeOrder(order);

      // Create claim record
      const claim: Claim = {
        id: uuidv4(),
        orderId,
        token: claimToken,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await storeClaim(claim);

      // Trigger data layer event for tracking
      console.log('Payment completed:', {
        orderId,
        amount: order.amount,
        currency: order.currency,
        provider: 'coinbase'
      });

      // In a real implementation, you would trigger analytics here
      // trackPaymentCompleted({ orderId, amount: order.amount, currency: order.currency, provider: 'coinbase' });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Coinbase webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}