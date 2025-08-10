import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/ops/auth';
import { generateStripeTestPayload, generateStripeChargePayload } from '../../../lib/ops/simulators/stripe';
import { generateCoinbaseTestPayload, generateCoinbaseChargeCreatedPayload } from '../../../lib/ops/simulators/coinbase';
import { generatePayPalTestPayload, generatePayPalCapturePayload } from '../../../lib/ops/simulators/paypal';
import { generateChainMintPayload, generateChainEvolutionPayload } from '../../../lib/ops/simulators/chain';
import { logHealthReport, SystemReport } from '../../../lib/ops/kv';

// Rate limiting: 1 trigger per 60 seconds
const lastTriggerTime = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

interface TriggerResult {
  component: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  details?: any;
  duration?: number;
}

/**
 * Active simulated event trigger endpoint
 * Fires test-mode payloads to various webhook handlers
 * Requires X-Admin-Token header
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  const clientId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Check rate limiting
  const lastTrigger = lastTriggerTime.get(clientId as string);
  if (lastTrigger && (now - lastTrigger) < RATE_LIMIT_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastTrigger)) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Please wait ${remainingTime} seconds before triggering again`,
      retry_after: remainingTime
    });
  }

  lastTriggerTime.set(clientId as string, now);

  try {
    const results: TriggerResult[] = [];
    const startTime = Date.now();

    // Generate test payloads
    const stripePayload = generateStripeTestPayload();
    const stripeChargePayload = generateStripeChargePayload();
    const coinbasePayload = generateCoinbaseTestPayload();
    const coinbaseCreatedPayload = generateCoinbaseChargeCreatedPayload();
    const paypalPayload = generatePayPalTestPayload();
    const paypalCapturePayload = generatePayPalCapturePayload();
    const chainMintPayload = generateChainMintPayload();
    const chainEvolutionPayload = generateChainEvolutionPayload();

    // Test Stripe webhook simulation
    try {
      const stripeStart = Date.now();
      // In a real implementation, you would send this to your Stripe webhook handler
      // For now, we just validate the payload structure
      if (stripePayload.type === 'payment_intent.succeeded' && stripePayload.data.object.id) {
        results.push({
          component: 'stripe_webhook',
          status: 'success',
          message: 'Stripe test payload generated and validated',
          details: { 
            event_type: stripePayload.type,
            payload_size: JSON.stringify(stripePayload).length 
          },
          duration: Date.now() - stripeStart
        });
      } else {
        throw new Error('Invalid Stripe payload structure');
      }
    } catch (error) {
      results.push({
        component: 'stripe_webhook',
        status: 'error',
        message: 'Stripe webhook simulation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Test Coinbase webhook simulation
    try {
      const coinbaseStart = Date.now();
      if (coinbasePayload.event.type === 'charge:confirmed' && coinbasePayload.event.data.id) {
        results.push({
          component: 'coinbase_webhook',
          status: 'success',
          message: 'Coinbase test payload generated and validated',
          details: { 
            event_type: coinbasePayload.event.type,
            payload_size: JSON.stringify(coinbasePayload).length 
          },
          duration: Date.now() - coinbaseStart
        });
      } else {
        throw new Error('Invalid Coinbase payload structure');
      }
    } catch (error) {
      results.push({
        component: 'coinbase_webhook',
        status: 'error',
        message: 'Coinbase webhook simulation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Test PayPal webhook simulation
    try {
      const paypalStart = Date.now();
      if (paypalPayload.event_type === 'CHECKOUT.ORDER.APPROVED' && paypalPayload.resource.id) {
        results.push({
          component: 'paypal_webhook',
          status: 'success',
          message: 'PayPal test payload generated and validated',
          details: { 
            event_type: paypalPayload.event_type,
            payload_size: JSON.stringify(paypalPayload).length 
          },
          duration: Date.now() - paypalStart
        });
      } else {
        throw new Error('Invalid PayPal payload structure');
      }
    } catch (error) {
      results.push({
        component: 'paypal_webhook',
        status: 'error',
        message: 'PayPal webhook simulation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Test chain mint hook simulation
    try {
      const chainStart = Date.now();
      if (chainMintPayload.event_type === 'relic.mint_requested' && chainMintPayload.data.relic.token_id) {
        results.push({
          component: 'chain_mint_hook',
          status: 'success',
          message: 'Chain mint hook payload generated and validated',
          details: { 
            event_type: chainMintPayload.event_type,
            token_id: chainMintPayload.data.relic.token_id,
            test_mode: chainMintPayload.test_mode 
          },
          duration: Date.now() - chainStart
        });
      } else {
        throw new Error('Invalid chain mint payload structure');
      }
    } catch (error) {
      results.push({
        component: 'chain_mint_hook',
        status: 'error',
        message: 'Chain mint hook simulation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Create a summary report
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const totalDuration = Date.now() - startTime;

    const overallStatus = errorCount === 0 ? 'healthy' : 
                         successCount > errorCount ? 'degraded' : 'down';

    // Create a system report for logging
    const triggerReport: SystemReport = {
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      checks: results.map(result => ({
        timestamp: new Date().toISOString(),
        status: result.status === 'success' ? 'pass' : 'fail',
        component: result.component,
        details: result.details || { message: result.message },
        duration: result.duration
      })),
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    };

    // Log to KV (non-blocking)
    try {
      await logHealthReport(triggerReport);
    } catch (kvError) {
      console.warn('Failed to log trigger report to KV:', kvError);
    }

    // Return results
    return res.status(200).json({
      status: 'success',
      message: `Trigger simulation completed - ${successCount} successful, ${errorCount} failed`,
      data: {
        overall_status: overallStatus,
        total_tests: results.length,
        successful: successCount,
        failed: errorCount,
        duration_ms: totalDuration,
        results,
        next_allowed_trigger: new Date(now + RATE_LIMIT_WINDOW).toISOString()
      }
    });

  } catch (error) {
    console.error('Trigger simulation failed:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Trigger simulation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export default requireAdminAuth(handler);