import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface AuditEntry {
  action: string;
  relicId: string;
  rollupCount?: number;
  mutationSeed?: string;
  timestamp: number;
  broadcastId?: string;
  isDryRun?: boolean;
  success?: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relicId = searchParams.get('relicId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let auditEntries: AuditEntry[] = [];

    if (relicId) {
      // Get audit entries for a specific relic
      const entries = await kv.lrange(`evolution:audit:${relicId}`, 0, limit - 1);
      auditEntries = entries.map(entry => JSON.parse(entry as string));
    } else {
      // Get audit entries for all relics (this is more expensive)
      const auditKeys = await kv.keys('evolution:audit:*');
      
      for (const key of auditKeys.slice(0, 20)) { // Limit to first 20 relics for performance
        const entries = await kv.lrange(key, 0, 9); // Get up to 10 entries per relic
        const parsedEntries = entries.map(entry => JSON.parse(entry as string));
        auditEntries.push(...parsedEntries);
      }
      
      // Sort by timestamp descending
      auditEntries.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit results
      auditEntries = auditEntries.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      entries: auditEntries,
      count: auditEntries.length,
      relicId
    });

  } catch (error) {
    console.error('Error fetching evolution audit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}