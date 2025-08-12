import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHmac } from 'crypto';

interface ReplayRollup {
  broadcastId: string;
  relicId: string;
  rollupData: any;
  timestamp: number;
  signature?: string;
}

interface EvolutionJob {
  relicId: string;
  rollupCount: number;
  lastUpdated: number;
  mutationSeed: string;
}

function generateMutationSeed(rollupData: any[]): string {
  // Create deterministic seed from rollup data
  const dataString = JSON.stringify(rollupData.sort());
  return createHmac('sha256', process.env.REPLAY_SIGNING_SECRET || 'default')
    .update(dataString)
    .digest('hex')
    .substring(0, 16);
}

function validateHmacSignature(payload: any, signature: string): boolean {
  if (!process.env.REPLAY_SIGNING_SECRET) {
    return false;
  }
  
  const expectedSignature = createHmac('sha256', process.env.REPLAY_SIGNING_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

async function checkRateLimit(relicId: string): Promise<boolean> {
  const hourlyKey = `evolution:ratelimit:${relicId}:${Math.floor(Date.now() / 3600000)}`;
  const current = await kv.get(hourlyKey) || 0;
  const maxPerHour = parseInt(process.env.EVOLUTION_MAX_PER_HOUR || '10');
  
  return (current as number) < maxPerHour;
}

async function updateRateLimit(relicId: string): Promise<void> {
  const hourlyKey = `evolution:ratelimit:${relicId}:${Math.floor(Date.now() / 3600000)}`;
  await kv.incr(hourlyKey);
  await kv.expire(hourlyKey, 3600); // Expire after 1 hour
}

export async function POST(request: NextRequest) {
  try {
    // Check if auto-feed is enabled
    if (process.env.EVOLUTION_AUTO_FEED !== 'true') {
      return NextResponse.json(
        { error: 'Auto-evolution is disabled' },
        { status: 503 }
      );
    }

    const rollup: ReplayRollup = await request.json();

    // Validate required fields
    if (!rollup.broadcastId || !rollup.relicId || !rollup.rollupData) {
      return NextResponse.json(
        { error: 'Missing required fields: broadcastId, relicId, rollupData' },
        { status: 400 }
      );
    }

    // Validate HMAC signature if provided
    if (rollup.signature && !validateHmacSignature(rollup, rollup.signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check rate limits
    if (!(await checkRateLimit(rollup.relicId))) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Check cooldown period
    const lastEvolution = await kv.get(`evolution:last:${rollup.relicId}`);
    const cooldownSec = parseInt(process.env.EVOLUTION_COOLDOWN_SEC || '300');
    
    if (lastEvolution && (Date.now() - (lastEvolution as number)) < cooldownSec * 1000) {
      return NextResponse.json(
        { error: 'Cooldown period active' },
        { status: 429 }
      );
    }

    // Store rollup data
    const rollupKey = `replay:rollups:${rollup.broadcastId}`;
    await kv.lpush(rollupKey, JSON.stringify({
      ...rollup,
      timestamp: Date.now()
    }));

    // Set expiration for rollup data (7 days)
    await kv.expire(rollupKey, 604800);

    // Get current rollup count for this relic
    const rollupPattern = `replay:rollups:*`;
    const allRollupKeys = await kv.keys(rollupPattern);
    
    let relicRollupCount = 0;
    const rollupData = [];
    
    for (const key of allRollupKeys) {
      const rollups = await kv.lrange(key, 0, -1);
      for (const rollupStr of rollups) {
        const r = JSON.parse(rollupStr as string);
        if (r.relicId === rollup.relicId) {
          relicRollupCount++;
          rollupData.push(r);
        }
      }
    }

    // Check if minimum signals threshold is met
    const minSignals = parseInt(process.env.EVOLUTION_MIN_SIGNALS || '3');
    
    if (relicRollupCount >= minSignals) {
      // Generate mutation seed
      const mutationSeed = generateMutationSeed(rollupData);
      
      // Create or update evolution job
      const evolutionJob: EvolutionJob = {
        relicId: rollup.relicId,
        rollupCount: relicRollupCount,
        lastUpdated: Date.now(),
        mutationSeed
      };

      // Add to evolution queue
      await kv.lpush('evolution:queue', JSON.stringify(evolutionJob));

      // Update rate limit
      await updateRateLimit(rollup.relicId);

      // Log audit entry
      await kv.lpush(`evolution:audit:${rollup.relicId}`, JSON.stringify({
        action: 'queued',
        rollupCount: relicRollupCount,
        mutationSeed,
        timestamp: Date.now(),
        broadcastId: rollup.broadcastId
      }));

      return NextResponse.json({
        success: true,
        message: 'Rollup processed and evolution queued',
        rollupCount: relicRollupCount,
        mutationSeed,
        relicId: rollup.relicId
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Rollup processed',
      rollupCount: relicRollupCount,
      relicId: rollup.relicId,
      minSignalsRequired: minSignals
    });

  } catch (error) {
    console.error('Error processing replay rollup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}