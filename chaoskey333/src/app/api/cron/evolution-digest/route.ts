import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

interface EvolutionJob {
  relicId: string;
  rollupCount: number;
  lastUpdated: number;
  mutationSeed: string;
}

interface RelicTrait {
  name: string;
  value: string;
  rarity: number;
}

interface MutationResult {
  relicId: string;
  newTraits: RelicTrait[];
  mutationSeed: string;
  timestamp: number;
  rollupCount: number;
}

function generateTraitsFromSeed(seed: string, rollupCount: number): RelicTrait[] {
  const hash = createHash('sha256').update(seed).digest('hex');
  const traits: RelicTrait[] = [];
  
  // Define possible trait categories and values
  const traitCategories = {
    'Energy': ['Chaotic', 'Stable', 'Volatile', 'Harmonized', 'Amplified'],
    'Resonance': ['Low', 'Medium', 'High', 'Extreme', 'Transcendent'],
    'Purity': ['Raw', 'Refined', 'Crystallized', 'Perfected', 'Cosmic'],
    'Attunement': ['Earth', 'Water', 'Fire', 'Air', 'Void', 'Light', 'Shadow'],
    'Power': ['Dormant', 'Awakening', 'Active', 'Surging', 'Legendary']
  };

  // Use seed to deterministically select traits
  let seedIndex = 0;
  for (const [category, values] of Object.entries(traitCategories)) {
    const hashPart = hash.substring(seedIndex * 4, (seedIndex + 1) * 4);
    const index = parseInt(hashPart, 16) % values.length;
    
    // Higher rollup counts can unlock rarer traits
    const rarityBonus = Math.min(rollupCount / 10, 0.5);
    const adjustedIndex = Math.min(
      index + Math.floor(rarityBonus * values.length),
      values.length - 1
    );
    
    const rarity = (adjustedIndex / (values.length - 1)) * 100;
    
    traits.push({
      name: category,
      value: values[adjustedIndex],
      rarity: Math.round(rarity)
    });
    
    seedIndex++;
  }

  return traits;
}

async function processEvolutionJob(job: EvolutionJob): Promise<MutationResult> {
  const newTraits = generateTraitsFromSeed(job.mutationSeed, job.rollupCount);
  
  const result: MutationResult = {
    relicId: job.relicId,
    newTraits,
    mutationSeed: job.mutationSeed,
    timestamp: Date.now(),
    rollupCount: job.rollupCount
  };

  // In dry-run mode, just log without applying
  if (process.env.EVOLUTION_DRY_RUN === 'true') {
    console.log('[DRY RUN] Would apply mutation:', result);
    
    // Log to audit trail with dry-run flag
    await kv.lpush(`evolution:audit:${job.relicId}`, JSON.stringify({
      action: 'dry_run_mutation',
      ...result,
      isDryRun: true
    }));
    
    return result;
  }

  // Apply the mutation (in a real implementation, this would update the relic NFT metadata)
  await kv.set(`relic:traits:${job.relicId}`, JSON.stringify(newTraits));
  
  // Update last evolution timestamp
  await kv.set(`evolution:last:${job.relicId}`, Date.now());
  
  // Log successful mutation to audit trail
  await kv.lpush(`evolution:audit:${job.relicId}`, JSON.stringify({
    action: 'mutation_applied',
    ...result,
    success: true
  }));

  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by Vercel Cron (optional security check)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if auto-feed is enabled
    if (process.env.EVOLUTION_AUTO_FEED !== 'true') {
      return NextResponse.json(
        { success: true, message: 'Auto-evolution is disabled' }
      );
    }

    // Process evolution queue in batches
    const batchSize = 10;
    const jobs: EvolutionJob[] = [];
    
    // Get jobs from queue
    for (let i = 0; i < batchSize; i++) {
      const jobStr = await kv.rpop('evolution:queue');
      if (!jobStr) break;
      
      try {
        const job = JSON.parse(jobStr as string);
        jobs.push(job);
      } catch (error) {
        console.error('Failed to parse evolution job:', error);
      }
    }

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No jobs in queue'
      });
    }

    const results: MutationResult[] = [];
    const errors: string[] = [];

    // Process each job
    for (const job of jobs) {
      try {
        // Check cooldown period again (in case of race conditions)
        const lastEvolution = await kv.get(`evolution:last:${job.relicId}`);
        const cooldownSec = parseInt(process.env.EVOLUTION_COOLDOWN_SEC || '300');
        
        if (lastEvolution && (Date.now() - (lastEvolution as number)) < cooldownSec * 1000) {
          // Re-queue the job for later
          await kv.lpush('evolution:queue', JSON.stringify(job));
          continue;
        }

        const result = await processEvolutionJob(job);
        results.push(result);
        
      } catch (error) {
        console.error(`Failed to process evolution for relic ${job.relicId}:`, error);
        errors.push(`Relic ${job.relicId}: ${error}`);
        
        // Log error to audit trail
        await kv.lpush(`evolution:audit:${job.relicId}`, JSON.stringify({
          action: 'mutation_failed',
          relicId: job.relicId,
          error: String(error),
          timestamp: Date.now()
        }));
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results: results.map(r => ({
        relicId: r.relicId,
        traitCount: r.newTraits.length,
        rollupCount: r.rollupCount
      })),
      isDryRun: process.env.EVOLUTION_DRY_RUN === 'true'
    });

  } catch (error) {
    console.error('Error in evolution digest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Evolution digest endpoint is active',
    autoFeed: process.env.EVOLUTION_AUTO_FEED === 'true',
    dryRun: process.env.EVOLUTION_DRY_RUN === 'true',
    timestamp: new Date().toISOString()
  });
}