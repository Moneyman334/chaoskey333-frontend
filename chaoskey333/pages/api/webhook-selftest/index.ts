import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/ops/auth';
import { runSystemHealthCheck } from '../../../lib/ops/selftest';
import { logHealthReport } from '../../../lib/ops/kv';

/**
 * Passive status scan endpoint
 * Performs comprehensive health checks without mutations
 * Requires X-Admin-Token header
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Run comprehensive health check
    const report = await runSystemHealthCheck();
    
    // Log the report to KV (non-blocking)
    try {
      await logHealthReport(report);
    } catch (kvError) {
      console.warn('Failed to log health report to KV:', kvError);
      // Don't fail the whole request if KV logging fails
    }

    // Return appropriate HTTP status based on overall health
    let statusCode = 200;
    if (report.overall_status === 'degraded') {
      statusCode = 207; // Multi-Status (partial success)
    } else if (report.overall_status === 'down') {
      statusCode = 503; // Service Unavailable
    }

    return res.status(statusCode).json({
      status: 'success',
      data: report,
      message: `System health check completed - ${report.overall_status}`
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export default requireAdminAuth(handler);