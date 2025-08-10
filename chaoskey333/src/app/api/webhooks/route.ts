import { NextRequest, NextResponse } from 'next/server';

interface WebhookEvent {
  id: string;
  type: 'relic_evolution' | 'vault_sync' | 'nft_update' | 'system_alert';
  timestamp: string;
  data: any;
  targets: string[];
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt?: string;
  nextRetry?: string;
}

// Mock webhook queue storage
const webhookQueue = new Map<string, WebhookEvent>();
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

// Debounce map to prevent duplicate events
const debounceTracker = new Map<string, number>();

function isRateLimited(target: string): boolean {
  const limit = parseInt(process.env.OMNI_RATE_LIMIT_PER_MINUTE || '60');
  const now = Date.now();
  const tracker = rateLimitTracker.get(target);
  
  if (!tracker || now > tracker.resetTime) {
    rateLimitTracker.set(target, { count: 1, resetTime: now + 60000 });
    return false;
  }
  
  if (tracker.count >= limit) {
    return true;
  }
  
  tracker.count++;
  return false;
}

function shouldDebounce(eventKey: string): boolean {
  const debounceMs = parseInt(process.env.OMNI_DEBOUNCE_MS || '1000');
  const now = Date.now();
  const lastEvent = debounceTracker.get(eventKey);
  
  if (!lastEvent || now - lastEvent > debounceMs) {
    debounceTracker.set(eventKey, now);
    return false;
  }
  
  return true;
}

async function sendWebhook(webhook: WebhookEvent, target: string): Promise<boolean> {
  try {
    // In a real implementation, this would make HTTP requests to actual endpoints
    console.log(`Sending webhook to ${target}:`, webhook);
    
    // Simulate webhook delivery
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      console.log(`✅ Webhook delivered to ${target}`);
      return true;
    } else {
      console.log(`❌ Webhook failed to ${target}`);
      return false;
    }
  } catch (error) {
    console.error(`Error sending webhook to ${target}:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  
  let webhooks = Array.from(webhookQueue.values());
  
  if (status) {
    webhooks = webhooks.filter(w => w.status === status);
  }
  
  if (type) {
    webhooks = webhooks.filter(w => w.type === type);
  }
  
  return NextResponse.json({
    success: true,
    webhooks: webhooks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    totalCount: webhooks.length,
    queueStats: {
      pending: webhooks.filter(w => w.status === 'pending').length,
      sent: webhooks.filter(w => w.status === 'sent').length,
      failed: webhooks.filter(w => w.status === 'failed').length,
      retrying: webhooks.filter(w => w.status === 'retrying').length,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, data, targets } = body;
    
    switch (action) {
      case 'create':
        if (!type || !data || !targets) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: type, data, targets' },
            { status: 400 }
          );
        }
        
        const eventKey = `${type}_${data.seedId || data.entityId || 'unknown'}`;
        
        // Check debounce
        if (shouldDebounce(eventKey)) {
          return NextResponse.json({
            success: true,
            message: 'Event debounced - duplicate event ignored',
            debounced: true,
          });
        }
        
        const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const webhook: WebhookEvent = {
          id: webhookId,
          type,
          timestamp: new Date().toISOString(),
          data,
          targets: Array.isArray(targets) ? targets : [targets],
          status: 'pending',
          attempts: 0,
        };
        
        webhookQueue.set(webhookId, webhook);
        
        // Process webhook delivery asynchronously
        setTimeout(() => processWebhook(webhookId), 100);
        
        return NextResponse.json({
          success: true,
          webhookId,
          message: 'Webhook queued for delivery',
          webhook,
        });
        
      case 'retry':
        const { webhookId: retryWebhookId } = body;
        if (!retryWebhookId) {
          return NextResponse.json(
            { success: false, error: 'Missing webhookId' },
            { status: 400 }
          );
        }
        
        const retryWebhook = webhookQueue.get(retryWebhookId);
        if (!retryWebhook) {
          return NextResponse.json(
            { success: false, error: 'Webhook not found' },
            { status: 404 }
          );
        }
        
        retryWebhook.status = 'retrying';
        retryWebhook.nextRetry = undefined;
        
        setTimeout(() => processWebhook(retryWebhookId), 100);
        
        return NextResponse.json({
          success: true,
          message: 'Webhook retry initiated',
          webhook: retryWebhook,
        });
        
      case 'clear_failed':
        const failedWebhooks = Array.from(webhookQueue.entries())
          .filter(([_, webhook]) => webhook.status === 'failed');
        
        failedWebhooks.forEach(([id]) => webhookQueue.delete(id));
        
        return NextResponse.json({
          success: true,
          message: `Cleared ${failedWebhooks.length} failed webhooks`,
          clearedCount: failedWebhooks.length,
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processWebhook(webhookId: string): Promise<void> {
  const webhook = webhookQueue.get(webhookId);
  if (!webhook) return;
  
  webhook.attempts++;
  webhook.lastAttempt = new Date().toISOString();
  
  const failedTargets: string[] = [];
  const succeededTargets: string[] = [];
  
  for (const target of webhook.targets) {
    // Check rate limiting
    if (isRateLimited(target)) {
      console.log(`Rate limited for target: ${target}`);
      failedTargets.push(target);
      continue;
    }
    
    const success = await sendWebhook(webhook, target);
    if (success) {
      succeededTargets.push(target);
    } else {
      failedTargets.push(target);
    }
  }
  
  if (failedTargets.length === 0) {
    webhook.status = 'sent';
  } else if (webhook.attempts >= 3) {
    webhook.status = 'failed';
  } else {
    webhook.status = 'retrying';
    // Schedule retry with exponential backoff
    const retryDelay = Math.pow(2, webhook.attempts) * 1000;
    webhook.nextRetry = new Date(Date.now() + retryDelay).toISOString();
    
    setTimeout(() => processWebhook(webhookId), retryDelay);
  }
}