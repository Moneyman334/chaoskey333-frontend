export interface TelemetryEvent {
  type: 'page_view' | 'mint_success' | 'checkout_start' | 'wallet_connect' | 'custom';
  timestamp: number;
  metadata?: Record<string, string | number>;
  userAgent?: string;
  ip?: string;
}

export interface TelemetryRollup {
  date: string; // YYYY-MM-DD format
  events: Record<string, number>; // event type -> count
  totalEvents: number;
  lastUpdated: number;
}

export interface TelemetryIngestRequest {
  events: Omit<TelemetryEvent, 'timestamp' | 'ip'>[];
}

export interface TelemetryRollupResponse {
  date: string;
  rollup: TelemetryRollup | null;
}

export interface TelemetryManualRollupRequest {
  startDate?: string;
  endDate?: string;
  saveSnapshot?: boolean;
}

export interface TelemetryManualRollupResponse {
  success: boolean;
  rollups: TelemetryRollup[];
  snapshotSaved?: boolean;
  message: string;
}