import { NextRequest, NextResponse } from 'next/server';
import { verifyClaimToken } from '@/lib/crypto';
import { getClaimByToken } from '@/lib/storage';

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

    return NextResponse.json({
      valid: true,
      orderId: claimData.orderId,
      amount: claimData.amount,
      currency: claimData.currency,
      expiresAt: new Date(claimData.exp * 1000).toISOString()
    });

  } catch (error) {
    console.error('Claim check error:', error);
    return NextResponse.json(
      { error: 'Failed to check claim' },
      { status: 500 }
    );
  }
}