import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getProduct, createCoinbaseCharge, createPayPalOrder } from '@/lib/payments';
import { storeOrder, Order } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, paymentProvider } = body;

    if (!productId || !paymentProvider) {
      return NextResponse.json(
        { error: 'Product ID and payment provider are required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate order ID
    const orderId = uuidv4();

    // Create order record
    const order: Order = {
      id: orderId,
      amount: product.price.toString(),
      currency: product.currency,
      status: 'pending',
      paymentProvider: paymentProvider as 'coinbase' | 'paypal',
      paymentId: '',
      createdAt: new Date().toISOString(),
    };

    // Store order
    await storeOrder(order);

    // Create payment based on provider
    let paymentData;
    let paymentUrl;

    if (paymentProvider === 'coinbase') {
      paymentData = await createCoinbaseCharge(product, orderId);
      paymentUrl = paymentData.hosted_url;
      
      // Update order with payment ID
      order.paymentId = paymentData.id;
      await storeOrder(order);
    } else if (paymentProvider === 'paypal') {
      paymentData = await createPayPalOrder(product, orderId);
      const approveLink = paymentData.links?.find((link: any) => link.rel === 'approve');
      paymentUrl = approveLink?.href;
      
      // Update order with payment ID
      order.paymentId = paymentData.id;
      await storeOrder(order);
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId,
      paymentUrl,
      paymentData
    });

  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}