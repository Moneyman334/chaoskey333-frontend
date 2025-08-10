import { NextApiRequest, NextApiResponse } from 'next';
import { logHealthReport, SystemReport } from '../../../lib/ops/kv';

interface RelicEvolutionData {
  transaction: {
    hash: string;
    from: string;
    to: string;
    value: string;
    gas_used: number;
    block_number: number;
    block_hash?: string;
    status: string;
  };
  relic: {
    token_id: number;
    previous_rarity?: string;
    new_rarity?: string;
    rarity?: string;
    evolution_type?: string;
    attributes?: any;
    attributes_before?: any;
    attributes_after?: any;
    metadata_uri?: string;
    minted_at?: string;
    evolved_at?: string;
  };
  payment?: {
    source: string;
    amount: string;
    currency: string;
    payment_id: string;
  };
  trigger?: {
    method: string;
    cost: string;
    currency: string;
    success: boolean;
  };
}

interface RelicEventPayload {
  id: string;
  event_type: 'relic.mint_requested' | 'relic.evolution_triggered';
  timestamp: string;
  test_mode?: boolean;
  data: RelicEvolutionData;
  webhook?: {
    endpoint: string;
    retry_count: number;
    next_retry: string | null;
  };
}

/**
 * Relic evolution webhook endpoint
 * Processes post-decode mutations and broadcasts updates
 * This endpoint handles both mint and evolution events
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const payload: RelicEventPayload = req.body;

    // Validate payload structure
    if (!payload.id || !payload.event_type || !payload.data) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'Missing required fields: id, event_type, or data'
      });
    }

    // Validate relic data
    if (!payload.data.relic || !payload.data.relic.token_id) {
      return res.status(400).json({
        error: 'Invalid relic data',
        message: 'Missing relic information or token_id'
      });
    }

    // Validate transaction data
    if (!payload.data.transaction || !payload.data.transaction.hash) {
      return res.status(400).json({
        error: 'Invalid transaction data',
        message: 'Missing transaction information or hash'
      });
    }

    const startTime = Date.now();
    const results: any[] = [];

    // Process based on event type
    if (payload.event_type === 'relic.mint_requested') {
      // Handle mint event
      try {
        await processMintEvent(payload);
        results.push({
          component: 'mint_processor',
          status: 'pass',
          message: 'Mint event processed successfully',
          details: {
            token_id: payload.data.relic.token_id,
            rarity: payload.data.relic.rarity,
            transaction_hash: payload.data.transaction.hash
          }
        });
      } catch (error) {
        results.push({
          component: 'mint_processor',
          status: 'fail',
          message: 'Failed to process mint event',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    } else if (payload.event_type === 'relic.evolution_triggered') {
      // Handle evolution event
      try {
        await processEvolutionEvent(payload);
        results.push({
          component: 'evolution_processor',
          status: 'pass',
          message: 'Evolution event processed successfully',
          details: {
            token_id: payload.data.relic.token_id,
            previous_rarity: payload.data.relic.previous_rarity,
            new_rarity: payload.data.relic.new_rarity,
            transaction_hash: payload.data.transaction.hash
          }
        });
      } catch (error) {
        results.push({
          component: 'evolution_processor',
          status: 'fail',
          message: 'Failed to process evolution event',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    } else {
      return res.status(400).json({
        error: 'Unknown event type',
        message: `Unsupported event type: ${payload.event_type}`
      });
    }

    // Broadcast update (placeholder - implement according to your needs)
    try {
      await broadcastRelicUpdate(payload);
      results.push({
        component: 'broadcast',
        status: 'pass',
        message: 'Relic update broadcasted successfully',
        details: { event_id: payload.id }
      });
    } catch (error) {
      results.push({
        component: 'broadcast',
        status: 'fail',
        message: 'Failed to broadcast relic update',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'pass').length;
    const failureCount = results.filter(r => r.status === 'fail').length;

    // Log the processing results to KV if not in test mode
    if (!payload.test_mode) {
      try {
        const report: SystemReport = {
          timestamp: new Date().toISOString(),
          overall_status: failureCount === 0 ? 'healthy' : 'degraded',
          checks: results.map(r => ({
            timestamp: new Date().toISOString(),
            status: r.status,
            component: r.component,
            details: r.details,
            duration: undefined
          })),
          metadata: {
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime()
          }
        };
        
        await logHealthReport(report);
      } catch (kvError) {
        console.warn('Failed to log evolution processing to KV:', kvError);
      }
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      message: `Relic ${payload.event_type} processed successfully`,
      data: {
        event_id: payload.id,
        event_type: payload.event_type,
        token_id: payload.data.relic.token_id,
        transaction_hash: payload.data.transaction.hash,
        processing_time_ms: totalDuration,
        results_summary: {
          successful: successCount,
          failed: failureCount,
          total: results.length
        },
        test_mode: payload.test_mode || false
      }
    });

  } catch (error) {
    console.error('Relic evolution processing failed:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process relic evolution event',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Process mint event - record new relic creation
 */
async function processMintEvent(payload: RelicEventPayload): Promise<void> {
  // In a real implementation, you would:
  // 1. Update your database with the new relic
  // 2. Generate metadata if needed
  // 3. Update relic tracking systems
  // 4. Send notifications to relevant systems
  
  console.log(`Processing mint event for token ${payload.data.relic.token_id}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Validate required mint data
  if (!payload.data.relic.rarity) {
    throw new Error('Mint event missing rarity information');
  }
  
  if (!payload.data.payment) {
    throw new Error('Mint event missing payment information');
  }
}

/**
 * Process evolution event - record relic transformation
 */
async function processEvolutionEvent(payload: RelicEventPayload): Promise<void> {
  // In a real implementation, you would:
  // 1. Update the relic's attributes in your database
  // 2. Record the evolution history
  // 3. Update metadata URIs if needed
  // 4. Notify relic holders of the evolution
  
  console.log(`Processing evolution event for token ${payload.data.relic.token_id}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Validate required evolution data
  if (!payload.data.relic.previous_rarity || !payload.data.relic.new_rarity) {
    throw new Error('Evolution event missing rarity change information');
  }
  
  if (!payload.data.trigger) {
    throw new Error('Evolution event missing trigger information');
  }
}

/**
 * Broadcast relic update to interested systems
 */
async function broadcastRelicUpdate(payload: RelicEventPayload): Promise<void> {
  // In a real implementation, you would:
  // 1. Send updates to WebSocket clients
  // 2. Trigger cache invalidation
  // 3. Update real-time dashboards
  // 4. Send notifications to mobile apps
  // 5. Update third-party integrations
  
  console.log(`Broadcasting update for relic ${payload.data.relic.token_id}`);
  
  // Simulate broadcast time
  await new Promise(resolve => setTimeout(resolve, 50));
}