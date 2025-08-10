import { kv } from '@vercel/kv';

export interface HealthReport {
  timestamp: string;
  status: 'pass' | 'fail' | 'warn';
  component: string;
  details: any;
  duration?: number;
}

export interface SystemReport {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'down';
  checks: HealthReport[];
  metadata: {
    version: string;
    environment: string;
    uptime: number;
  };
}

/**
 * Log a timestamped health report to KV storage
 */
export async function logHealthReport(report: SystemReport): Promise<void> {
  try {
    const key = `system:selftest:${formatTimestamp(new Date())}`;
    await kv.set(key, report, { ex: 7 * 24 * 60 * 60 }); // Expire after 7 days
    
    // Also update the latest report
    await kv.set('system:selftest:latest', report, { ex: 24 * 60 * 60 }); // Expire after 1 day
  } catch (error) {
    console.error('Failed to log health report to KV:', error);
    throw error;
  }
}

/**
 * Retrieve recent health reports from KV storage
 */
export async function getRecentHealthReports(limit: number = 10): Promise<SystemReport[]> {
  try {
    const pattern = 'system:selftest:2*'; // Match timestamps starting with 2
    const keys = await kv.keys(pattern);
    
    // Sort keys in descending order (newest first)
    const sortedKeys = keys
      .filter(key => key !== 'system:selftest:latest')
      .sort((a, b) => b.localeCompare(a))
      .slice(0, limit);
    
    const reports: SystemReport[] = [];
    for (const key of sortedKeys) {
      const report = await kv.get<SystemReport>(key);
      if (report) {
        reports.push(report);
      }
    }
    
    return reports;
  } catch (error) {
    console.error('Failed to retrieve health reports from KV:', error);
    return [];
  }
}

/**
 * Get the latest health report
 */
export async function getLatestHealthReport(): Promise<SystemReport | null> {
  try {
    return await kv.get<SystemReport>('system:selftest:latest');
  } catch (error) {
    console.error('Failed to retrieve latest health report from KV:', error);
    return null;
  }
}

/**
 * Test KV connectivity
 */
export async function testKVConnection(): Promise<HealthReport> {
  const start = Date.now();
  
  try {
    const testKey = 'system:health-check';
    const testValue = { timestamp: new Date().toISOString(), test: true };
    
    await kv.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds
    const retrieved = await kv.get(testKey);
    
    if (!retrieved) {
      throw new Error('Failed to retrieve test value from KV');
    }
    
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'pass',
      component: 'kv',
      details: { message: 'KV connection successful', latency_ms: duration },
      duration
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'fail',
      component: 'kv',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: duration 
      },
      duration
    };
  }
}

/**
 * Format timestamp for KV key
 */
function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-').replace('T', '-').substring(0, 16);
}

/**
 * Check if KV is properly configured
 */
export function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}