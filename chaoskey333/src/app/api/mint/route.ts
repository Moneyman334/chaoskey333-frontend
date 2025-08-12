import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '@/lib/kv';
import { generateIdempotencyKey } from '@/lib/security';
import { checkIdempotency, recordIdempotency } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, walletAddress, txHash } = body;

    if (!orderId || !walletAddress || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check idempotency
    const idempotencyKey = generateIdempotencyKey(orderId, 'mint_completed');
    const existingRecord = await checkIdempotency(idempotencyKey);
    
    if (existingRecord?.processed) {
      return NextResponse.json({
        success: true,
        cached: true,
        txHash: existingRecord.result?.txHash
      });
    }

    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order is paid
    if (order.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order must be paid before minting' },
        { status: 400 }
      );
    }

    // Update order with mint information
    await updateOrder(orderId, {
      status: 'minted',
      mintTxHash: txHash,
      walletAddress: walletAddress
    });

    // Record idempotency
    await recordIdempotency(idempotencyKey, { txHash, walletAddress });

    return NextResponse.json({
      success: true,
      txHash,
      orderId
    });

  } catch (error) {
    console.error('Mint confirmation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to confirm mint' 
      },
      { status: 500 }
    );
  }
}