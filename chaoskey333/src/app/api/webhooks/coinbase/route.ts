import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { updateOrder, getOrder } from '@/lib/kv';
import { verifyWebhookSignature, generateIdempotencyKey } from '@/lib/security';
import { checkIdempotency, recordIdempotency } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('x-cc-webhook-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret, 'coinbase');
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle payment success
    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;

      if (!orderId) {
        console.error('No order ID in charge metadata');
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
      }

      // Check idempotency
      const idempotencyKey = generateIdempotencyKey(orderId, 'coinbase_payment_confirmed');
      const existingRecord = await checkIdempotency(idempotencyKey);
      
      if (existingRecord?.processed) {
        return NextResponse.json({ received: true, cached: true });
      }

      // Get and update order
      const order = await getOrder(orderId);
      if (!order) {
        console.error(`Order not found: ${orderId}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await updateOrder(orderId, {
        status: 'paid',
        paymentId: charge.id,
      });

      // Record idempotency
      await recordIdempotency(idempotencyKey, { orderId, chargeId: charge.id });

      console.log(`Payment confirmed for order: ${orderId}`);
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