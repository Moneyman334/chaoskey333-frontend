import { NextRequest, NextResponse } from 'next/server';

// Mock Vercel KV for demo purposes
// In production, you would use: import { kv } from '@vercel/kv';
const mockKV = {
  async set(key: string, value: any) {
    console.log('KV SET:', key, value);
    return 'OK';
  },
  async get(key: string) {
    console.log('KV GET:', key);
    return null;
  },
  async lpush(key: string, ...values: any[]) {
    console.log('KV LPUSH:', key, values);
    return values.length;
  }
};

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();

    // Validate required fields
    if (!transactionData.productId || !transactionData.provider) {
      return NextResponse.json(
        { error: 'Missing required transaction data' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...transactionData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Store in Vercel KV (mock for demo)
    const kvKey = `transaction:${transaction.id}`;
    await mockKV.set(kvKey, transaction);

    // Also add to a list for easy retrieval
    await mockKV.lpush('transactions:all', transaction.id);
    await mockKV.lpush(`transactions:product:${transaction.productId}`, transaction.id);
    await mockKV.lpush(`transactions:provider:${transaction.provider}`, transaction.id);

    // If wallet address is provided, log it separately
    if (transaction.walletAddress) {
      await mockKV.lpush(`transactions:wallet:${transaction.walletAddress}`, transaction.id);
    }

    console.log('Transaction logged successfully:', transaction);

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: 'Transaction logged successfully',
    });

  } catch (error) {
    console.error('Transaction logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log transaction' },
      { status: 500 }
    );
  }
}