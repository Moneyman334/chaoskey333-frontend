import { NextRequest, NextResponse } from 'next/server';
import { verifyClaimToken, generateMintSignature } from '@/lib/crypto';
import { getClaimByToken, updateClaim } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Claim token is required' },
        { status: 400 }
      );
    }

    // Verify token signature and expiration
    let claimData;
    try {
      claimData = verifyClaimToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired claim token' },
        { status: 401 }
      );
    }

    // Check if claim exists and is active
    const claim = await getClaimByToken(token);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    if (claim.status !== 'active') {
      return NextResponse.json(
        { error: 'Claim has already been consumed' },
        { status: 410 }
      );
    }

    // Generate short-lived mint signature
    const mintSignature = generateMintSignature(claimData);

    // Atomically mark claim as consumed
    await updateClaim(claim.id, {
      status: 'consumed',
      consumedAt: new Date().toISOString(),
      mintSignature
    });

    // Trigger data layer event for tracking
    console.log('Claim consumed:', {
      orderId: claimData.orderId,
      amount: claimData.amount,
      currency: claimData.currency
    });

    // In a real implementation, you would trigger analytics here
    // trackClaimConsumed({ orderId: claimData.orderId, amount: claimData.amount, currency: claimData.currency });

    return NextResponse.json({
      success: true,
      mintSignature,
      orderId: claimData.orderId,
      amount: claimData.amount,
      currency: claimData.currency,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    });

  } catch (error) {
    console.error('Claim consume error:', error);
    return NextResponse.json(
      { error: 'Failed to consume claim' },
      { status: 500 }
    );
  }
}