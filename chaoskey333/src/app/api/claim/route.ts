import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getOrderIdFromClaimToken, deleteClaimToken } from '@/lib/kv';
import { verifyClaimToken } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing claim token' },
        { status: 400 }
      );
    }

    // Verify token format and expiry
    const tokenData = verifyClaimToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired claim token' },
        { status: 401 }
      );
    }

    // Get order ID from KV store
    const orderId = await getOrderIdFromClaimToken(token);
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Claim token not found' },
        { status: 404 }
      );
    }

    // Verify order ID matches token
    if (orderId !== tokenData.orderId) {
      return NextResponse.json(
        { success: false, error: 'Token mismatch' },
        { status: 401 }
      );
    }

    // Get order details
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.createdAt,
        mintTxHash: order.mintTxHash
      }
    });

  } catch (error) {
    console.error('Claim verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to verify claim' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, walletAddress, txHash } = body;

    if (!token || !walletAddress || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = verifyClaimToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired claim token' },
        { status: 401 }
      );
    }

    // Get order ID from KV store
    const orderId = await getOrderIdFromClaimToken(token);
    if (!orderId || orderId !== tokenData.orderId) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim token' },
        { status: 401 }
      );
    }

    // Get order and verify it's paid
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order must be paid before claiming' },
        { status: 400 }
      );
    }

    // Delete claim token to prevent reuse
    await deleteClaimToken(token);

    return NextResponse.json({
      success: true,
      message: 'Claim token verified and consumed',
      orderId
    });

  } catch (error) {
    console.error('Claim processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process claim' 
      },
      { status: 500 }
    );
  }
}