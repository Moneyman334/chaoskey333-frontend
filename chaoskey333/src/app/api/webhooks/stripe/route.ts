import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { updateOrder, getOrder } from '@/lib/kv';
import { verifyWebhookSignature, generateIdempotencyKey } from '@/lib/security';
import { checkIdempotency, recordIdempotency } from '@/lib/kv';
import { initializeStripe } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret, 'stripe');
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const stripe = initializeStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle payment success
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error('No order ID in session metadata');
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
      }

      // Check idempotency
      const idempotencyKey = generateIdempotencyKey(orderId, 'stripe_payment_completed');
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
        paymentId: session.id,
      });

      // Record idempotency
      await recordIdempotency(idempotencyKey, { orderId, sessionId: session.id });

      console.log(`Payment completed for order: ${orderId}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}