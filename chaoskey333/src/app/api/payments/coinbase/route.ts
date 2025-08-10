import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { product } = await request.json();

    if (!product || !product.id || !product.price) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll create a mock Coinbase Commerce checkout
    // In production, you would use the actual Coinbase Commerce API
    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?provider=coinbase&product=${product.id}&demo=true`;
    
    // Log the payment attempt (in production, this would be more detailed)
    console.log('Coinbase payment initiated:', {
      productId: product.id,
      amount: product.price,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      provider: 'coinbase',
      transactionId: `coinbase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

  } catch (error) {
    console.error('Coinbase payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}