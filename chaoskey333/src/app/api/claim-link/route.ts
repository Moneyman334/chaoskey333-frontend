import { NextRequest, NextResponse } from 'next/server';
import { generateClaimLink } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimToken } = body;

    if (!claimToken) {
      return NextResponse.json(
        { error: 'Claim token is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Base URL not configured' },
        { status: 500 }
      );
    }

    // Generate claim link
    const claimLink = generateClaimLink(claimToken, baseUrl);

    return NextResponse.json({
      claimLink,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

  } catch (error) {
    console.error('Claim link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate claim link' },
      { status: 500 }
    );
  }
}