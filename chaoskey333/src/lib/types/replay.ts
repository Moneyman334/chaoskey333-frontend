// Cosmic Replay Terminal v2.0 - Vault Manifest Types

export interface ReplayManifest {
  id: string;
  version: string;
  timestamp: number;
  createdAt: string; // ISO string
  
  metadata: {
    title: string;
    description: string;
    period: {
      start: string;
      end: string;
    };
    appVersion: string;
    chainId: number;
    contractAddress: string;
  };
  
  metrics: {
    totalMints: number;
    totalVolume: string; // in ETH
    uniqueHolders: number;
    averagePrice: string;
    peakActivity: {
      timestamp: string;
      mintsPerHour: number;
    };
  };
  
  leaderboard: {
    topMinters: Array<{
      address: string;
      mintCount: number;
      totalSpent: string;
      firstMint: string;
      lastMint: string;
    }>;
    topSpenders: Array<{
      address: string;
      totalSpent: string;
      mintCount: number;
    }>;
  };
  
  events: Array<{
    type: 'mint' | 'transfer' | 'burn' | 'market_sale';
    timestamp: string;
    transactionHash: string;
    blockNumber: number;
    from?: string;
    to?: string;
    tokenId?: string;
    price?: string;
    gasUsed?: string;
  }>;
  
  pricing: {
    currentFloor: string;
    highestSale: string;
    totalRoyalties: string;
    priceHistory: Array<{
      timestamp: string;
      price: string;
      volume: string;
    }>;
  };
  
  assets: {
    thumbnails: string[];
    videos: string[];
    metadata: string[];
    archived: boolean;
    archiveUrl?: string; // S3/Backblaze URL if archived
  };
  
  signature: string; // Hash of the manifest for integrity
}

export interface ReplayIndex {
  latest: string; // Latest replay ID
  daily: Record<string, string[]>; // YYYYMMDD -> replay IDs
  featured: string[]; // Pinned/featured replay IDs
  count: number;
}

export interface ReplayRollupRequest {
  adminToken: string;
  forced?: boolean; // Manual rollup override
  startTime?: string; // Custom start time for rollup
  endTime?: string; // Custom end time for rollup
}

export interface ReplayPinRequest {
  adminToken: string;
  replayId: string;
  archiveAssets: boolean;
}