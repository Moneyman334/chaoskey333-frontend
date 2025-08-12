import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getRecentOrders } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const orders = await getRecentOrders(limit);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
}