import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { verifyPayPalSignature, generateClaimToken } from '@/lib/crypto';
import { getOrder, storeOrder, storeClaim, Claim } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    // Verify webhook signature
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyPayPalSignature(body, headers, webhookId);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    
    // Handle payment capture completed event
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const orderId = resource.purchase_units?.[0]?.reference_id;
      
      if (!orderId) {
        console.error('No order ID in PayPal event');
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
        provider: 'paypal'
      });

      // In a real implementation, you would trigger analytics here
      // trackPaymentCompleted({ orderId, amount: order.amount, currency: order.currency, provider: 'paypal' });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}