/**
 * Data layer events for tracking user actions
 */

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

interface TrackingEvent {
  event: string;
  [key: string]: any;
}

/**
 * Push event to data layer
 */
function pushToDataLayer(event: TrackingEvent) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
    console.log('Analytics Event:', event);
  }
}

/**
 * Track payment completion
 */
export function trackPaymentCompleted(data: {
  orderId: string;
  amount: string;
  currency: string;
  provider: 'coinbase' | 'paypal';
  productId?: string;
}) {
  pushToDataLayer({
    event: 'payment_completed',
    order_id: data.orderId,
    amount: parseFloat(data.amount),
    currency: data.currency,
    payment_provider: data.provider,
    product_id: data.productId,
  });
}

/**
 * Track claim token consumption
 */
export function trackClaimConsumed(data: {
  orderId: string;
  amount: string;
  currency: string;
}) {
  pushToDataLayer({
    event: 'claim_consumed',
    order_id: data.orderId,
    amount: parseFloat(data.amount),
    currency: data.currency,
  });
}

/**
 * Track vault minting
 */
export function trackVaultMinted(data: {
  orderId: string;
  amount: string;
  currency: string;
  walletAddress?: string;
}) {
  pushToDataLayer({
    event: 'vault_minted',
    order_id: data.orderId,
    amount: parseFloat(data.amount),
    currency: data.currency,
    wallet_address: data.walletAddress,
  });
}

/**
 * Track purchase initiation
 */
export function trackPurchaseStarted(data: {
  productId: string;
  amount: string;
  currency: string;
  provider: 'coinbase' | 'paypal';
}) {
  pushToDataLayer({
    event: 'purchase_started',
    product_id: data.productId,
    amount: parseFloat(data.amount),
    currency: data.currency,
    payment_provider: data.provider,
  });
}

/**
 * Track "Mint Later" link generation
 */
export function trackMintLaterGenerated(data: {
  orderId: string;
  claimToken: string;
}) {
  pushToDataLayer({
    event: 'mint_later_generated',
    order_id: data.orderId,
    claim_token_prefix: data.claimToken.substring(0, 8) + '...',
  });
}

/**
 * Track page views
 */
export function trackPageView(pageName: string, additionalData?: Record<string, any>) {
  pushToDataLayer({
    event: 'page_view',
    page_name: pageName,
    ...additionalData,
  });
}

/**
 * Track errors
 */
export function trackError(error: string, context?: string) {
  pushToDataLayer({
    event: 'error_occurred',
    error_message: error,
    error_context: context,
  });
}