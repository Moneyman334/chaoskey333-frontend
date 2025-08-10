import Stripe from 'stripe';
import { ethers } from 'ethers';
import { HealthReport, SystemReport, testKVConnection, isKVConfigured } from './kv';

/**
 * Check if all required environment variables are present
 */
export function checkEnvironmentVariables(): HealthReport {
  const requiredVars = [
    'TEMP_ADMIN_TOKEN',
    'STRIPE_SECRET_KEY',
    'COINBASE_COMMERCE_API_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'RPC_URL',
    'NEXT_PUBLIC_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_CHAIN_ID'
  ];

  const kvVars = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  
  const missing: string[] = [];
  const present: string[] = [];

  // Check required vars
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  // Check KV vars separately
  const kvConfigured = isKVConfigured();
  if (kvConfigured) {
    present.push(...kvVars);
  } else {
    missing.push(...kvVars);
  }

  const status = missing.length === 0 ? 'pass' : 
                 missing.length <= 2 ? 'warn' : 'fail';

  return {
    timestamp: new Date().toISOString(),
    status,
    component: 'environment',
    details: {
      total_required: requiredVars.length + kvVars.length,
      present_count: present.length,
      missing_count: missing.length,
      missing_vars: missing,
      message: missing.length === 0 ? 
        'All environment variables configured' : 
        `Missing ${missing.length} required environment variables`
    }
  };
}

/**
 * Test Stripe connectivity
 */
export async function testStripeConnection(): Promise<HealthReport> {
  const start = Date.now();
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test with a simple balance retrieve (safe read-only operation)
    await stripe.balance.retrieve();
    
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'pass',
      component: 'stripe',
      details: { 
        message: 'Stripe API connection successful',
        latency_ms: duration
      },
      duration
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'fail',
      component: 'stripe',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: duration
      },
      duration
    };
  }
}

/**
 * Test Coinbase Commerce connectivity (simplified check)
 */
export async function testCoinbaseConnection(): Promise<HealthReport> {
  const start = Date.now();
  
  try {
    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      throw new Error('COINBASE_COMMERCE_API_KEY not configured');
    }

    // Simple connectivity test - just verify the API key format
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
    if (!apiKey.match(/^[a-f0-9-]{36,}$/i)) {
      throw new Error('Invalid Coinbase Commerce API key format');
    }
    
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'pass',
      component: 'coinbase',
      details: { 
        message: 'Coinbase Commerce API key configured',
        latency_ms: duration
      },
      duration
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'fail',
      component: 'coinbase',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: duration
      },
      duration
    };
  }
}

/**
 * Test PayPal connectivity (simplified check)
 */
export async function testPayPalConnection(): Promise<HealthReport> {
  const start = Date.now();
  
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    // Simple validation - check if credentials look valid
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (clientId.length < 10 || clientSecret.length < 10) {
      throw new Error('Invalid PayPal credential format');
    }
    
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'pass',
      component: 'paypal',
      details: { 
        message: 'PayPal credentials configured',
        latency_ms: duration
      },
      duration
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'fail',
      component: 'paypal',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: duration
      },
      duration
    };
  }
}

/**
 * Test RPC and contract connectivity
 */
export async function testRPCAndContract(): Promise<HealthReport> {
  const start = Date.now();
  
  try {
    if (!process.env.RPC_URL) {
      throw new Error('RPC_URL not configured');
    }

    if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS not configured');
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    // Test basic connectivity
    const blockNumber = await provider.getBlockNumber();
    
    // Test contract address format
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!ethers.isAddress(contractAddress)) {
      throw new Error('Invalid contract address format');
    }
    
    // Test contract code existence
    const code = await provider.getCode(contractAddress);
    const hasContract = code !== '0x';
    
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: hasContract ? 'pass' : 'warn',
      component: 'rpc_contract',
      details: { 
        message: hasContract ? 
          'RPC and contract connection successful' : 
          'RPC connected but contract not deployed',
        rpc_url: process.env.RPC_URL,
        contract_address: contractAddress,
        current_block: blockNumber,
        contract_deployed: hasContract,
        latency_ms: duration
      },
      duration
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      timestamp: new Date().toISOString(),
      status: 'fail',
      component: 'rpc_contract',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        rpc_url: process.env.RPC_URL || 'not configured',
        latency_ms: duration
      },
      duration
    };
  }
}

/**
 * Run complete system health check
 */
export async function runSystemHealthCheck(): Promise<SystemReport> {
  const startTime = Date.now();
  
  // Run all health checks in parallel for speed
  const [
    envCheck,
    kvCheck,
    stripeCheck,
    coinbaseCheck,
    paypalCheck,
    rpcCheck
  ] = await Promise.all([
    Promise.resolve(checkEnvironmentVariables()),
    testKVConnection(),
    testStripeConnection(),
    testCoinbaseConnection(),
    testPayPalConnection(),
    testRPCAndContract()
  ]);

  const checks = [envCheck, kvCheck, stripeCheck, coinbaseCheck, paypalCheck, rpcCheck];
  
  // Determine overall status
  const failedChecks = checks.filter(check => check.status === 'fail').length;
  const warnChecks = checks.filter(check => check.status === 'warn').length;
  
  let overallStatus: 'healthy' | 'degraded' | 'down';
  if (failedChecks === 0 && warnChecks === 0) {
    overallStatus = 'healthy';
  } else if (failedChecks === 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'down';
  }

  const totalDuration = Date.now() - startTime;

  return {
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    checks,
    metadata: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }
  };
}