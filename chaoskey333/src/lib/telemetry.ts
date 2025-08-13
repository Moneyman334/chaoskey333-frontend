import { TelemetryEvent } from '@/types/telemetry';

export class TelemetryTracker {
  private static instance: TelemetryTracker;
  private queue: Omit<TelemetryEvent, 'timestamp' | 'ip'>[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): TelemetryTracker {
    if (!TelemetryTracker.instance) {
      TelemetryTracker.instance = new TelemetryTracker();
    }
    return TelemetryTracker.instance;
  }

  /**
   * Track a telemetry event
   */
  track(
    type: TelemetryEvent['type'],
    metadata?: Record<string, string | number>
  ): void {
    const event: Omit<TelemetryEvent, 'timestamp' | 'ip'> = {
      type,
      metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.queue.push(event);
    this.scheduleFlush();
  }

  /**
   * Track a page view
   */
  trackPageView(path?: string): void {
    this.track('page_view', {
      path: path || (typeof window !== 'undefined' ? window.location.pathname : ''),
    });
  }

  /**
   * Track a mint success event
   */
  trackMintSuccess(tokenId?: string, contractAddress?: string): void {
    this.track('mint_success', {
      tokenId: tokenId || '',
      contractAddress: contractAddress || '',
    });
  }

  /**
   * Track a checkout start event
   */
  trackCheckoutStart(amount?: number, currency?: string): void {
    this.track('checkout_start', {
      amount: amount || 0,
      currency: currency || 'usd',
    });
  }

  /**
   * Track a wallet connection event
   */
  trackWalletConnect(walletType?: string, address?: string): void {
    this.track('wallet_connect', {
      walletType: walletType || 'unknown',
      address: address || '',
    });
  }

  /**
   * Track a custom event
   */
  trackCustom(eventName: string, metadata?: Record<string, string | number>): void {
    this.track('custom', {
      eventName,
      ...metadata,
    });
  }

  /**
   * Flush events immediately
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    try {
      const response = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        console.warn('Failed to send telemetry events:', response.statusText);
        // Re-queue events on failure
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.warn('Failed to send telemetry events:', error);
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }

  /**
   * Schedule a flush operation
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) return;

    // Flush after 5 seconds or when 10 events are queued
    const shouldFlushImmediately = this.queue.length >= 10;
    const delay = shouldFlushImmediately ? 0 : 5000;

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, delay);
  }
}

// Convenience functions for global use
export const telemetry = TelemetryTracker.getInstance();

export function trackPageView(path?: string): void {
  telemetry.trackPageView(path);
}

export function trackMintSuccess(tokenId?: string, contractAddress?: string): void {
  telemetry.trackMintSuccess(tokenId, contractAddress);
}

export function trackCheckoutStart(amount?: number, currency?: string): void {
  telemetry.trackCheckoutStart(amount, currency);
}

export function trackWalletConnect(walletType?: string, address?: string): void {
  telemetry.trackWalletConnect(walletType, address);
}

export function trackCustom(eventName: string, metadata?: Record<string, string | number>): void {
  telemetry.trackCustom(eventName, metadata);
}