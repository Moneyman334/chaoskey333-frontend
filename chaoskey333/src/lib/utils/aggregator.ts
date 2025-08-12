// Cosmic Replay Terminal v2.0 - Data Aggregation and Rollup Logic
import { ReplayManifest } from '@/lib/types/replay';
import { ReplayVaultStorage } from './storage';

export class ReplayAggregator {
  
  // Mock data collection - in real implementation, this would connect to your contract/blockchain
  static async collectTelemetryData(startTime: Date, endTime: Date): Promise<any> {
    // This is a mock implementation - replace with actual blockchain/contract data collection
    const mockEvents = [
      {
        type: 'mint' as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        transactionHash: '0x1234567890abcdef',
        blockNumber: 18500000,
        from: '0x0000000000000000000000000000000000000000',
        to: '0x742d35Cc6634C0532925a3b8D2a3c465c0C0b7f9',
        tokenId: '1',
        price: '0.01',
        gasUsed: '21000'
      },
      {
        type: 'mint' as const,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        transactionHash: '0xabcdef1234567890',
        blockNumber: 18500100,
        from: '0x0000000000000000000000000000000000000000',
        to: '0x8ba1f109551bD432803012645Hac136c84928b8E',
        tokenId: '2',
        price: '0.015',
        gasUsed: '21000'
      }
    ];

    const mockHolders = [
      {
        address: '0x742d35Cc6634C0532925a3b8D2a3c465c0C0b7f9',
        mintCount: 3,
        totalSpent: '0.045',
        firstMint: new Date(Date.now() - 7200000).toISOString(),
        lastMint: new Date(Date.now() - 3600000).toISOString()
      },
      {
        address: '0x8ba1f109551bD432803012645Hac136c84928b8E',
        mintCount: 2,
        totalSpent: '0.025',
        firstMint: new Date(Date.now() - 5400000).toISOString(),
        lastMint: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    return {
      events: mockEvents,
      holders: mockHolders,
      totalMints: mockEvents.length,
      totalVolume: '0.070',
      uniqueHolders: mockHolders.length
    };
  }

  // Calculate metrics from collected data
  static calculateMetrics(data: any): ReplayManifest['metrics'] {
    const { events, totalMints, totalVolume, uniqueHolders } = data;
    
    // Calculate average price
    const totalPriceSum = events.reduce((sum: number, event: any) => {
      return sum + (event.price ? parseFloat(event.price) : 0);
    }, 0);
    const averagePrice = totalMints > 0 ? (totalPriceSum / totalMints).toFixed(6) : '0';

    // Find peak activity hour
    const hourlyActivity: Record<string, number> = {};
    events.forEach((event: any) => {
      const hour = new Date(event.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    let peakHour = '';
    let peakCount = 0;
    Object.entries(hourlyActivity).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    return {
      totalMints,
      totalVolume,
      uniqueHolders,
      averagePrice,
      peakActivity: {
        timestamp: peakHour + ':00:00.000Z',
        mintsPerHour: peakCount
      }
    };
  }

  // Generate leaderboard from holder data
  static generateLeaderboard(data: any): ReplayManifest['leaderboard'] {
    const { holders } = data;

    // Sort by mint count for top minters
    const topMinters = [...holders]
      .sort((a, b) => b.mintCount - a.mintCount)
      .slice(0, 10);

    // Sort by total spent for top spenders
    const topSpenders = [...holders]
      .sort((a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent))
      .slice(0, 10);

    return {
      topMinters,
      topSpenders
    };
  }

  // Calculate pricing information
  static calculatePricing(data: any): ReplayManifest['pricing'] {
    const { events } = data;
    
    const prices = events
      .filter((event: any) => event.price)
      .map((event: any) => parseFloat(event.price));

    const currentFloor = prices.length > 0 ? Math.min(...prices).toFixed(6) : '0';
    const highestSale = prices.length > 0 ? Math.max(...prices).toFixed(6) : '0';
    
    // Mock royalties calculation (typically 2.5% of total volume)
    const totalRoyalties = (parseFloat(data.totalVolume) * 0.025).toFixed(6);

    // Generate price history (mock - 24 hour periods)
    const priceHistory = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 3600000).toISOString();
      const mockPrice = (Math.random() * 0.02 + 0.01).toFixed(6);
      const mockVolume = (Math.random() * 0.1).toFixed(6);
      priceHistory.push({ timestamp, price: mockPrice, volume: mockVolume });
    }

    return {
      currentFloor,
      highestSale,
      totalRoyalties,
      priceHistory
    };
  }

  // Generate asset references
  static generateAssetReferences(data: any): ReplayManifest['assets'] {
    // Mock asset generation - in real implementation, this would reference actual NFT assets
    const thumbnails = [
      '/api/assets/thumb/1.jpg',
      '/api/assets/thumb/2.jpg'
    ];
    
    const videos = [
      '/api/assets/video/highlight.mp4'
    ];
    
    const metadata = [
      '/api/assets/metadata/batch.json'
    ];

    return {
      thumbnails,
      videos,
      metadata,
      archived: false
    };
  }

  // Main rollup function to create a replay vault
  static async createReplayRollup(
    startTime?: Date,
    endTime?: Date,
    forced: boolean = false
  ): Promise<ReplayManifest> {
    
    // Default to last 3 hours if no time specified
    const now = new Date();
    const defaultStartTime = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    
    const rollupStartTime = startTime || defaultStartTime;
    const rollupEndTime = endTime || now;

    // Collect telemetry data
    const data = await this.collectTelemetryData(rollupStartTime, rollupEndTime);

    // Generate replay ID
    const timestamp = rollupEndTime.getTime();
    const replayId = ReplayVaultStorage.generateReplayId(timestamp);

    // Build manifest
    const manifest: Omit<ReplayManifest, 'signature'> = {
      id: replayId,
      version: '2.0',
      timestamp,
      createdAt: rollupEndTime.toISOString(),
      
      metadata: {
        title: `ChaosKey333 Replay - ${rollupEndTime.toISOString().slice(0, 10)}`,
        description: `Cosmic vault replay for period ${rollupStartTime.toISOString()} to ${rollupEndTime.toISOString()}`,
        period: {
          start: rollupStartTime.toISOString(),
          end: rollupEndTime.toISOString()
        },
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D2a3c465c0C0b7f9'
      },
      
      metrics: this.calculateMetrics(data),
      leaderboard: this.generateLeaderboard(data),
      events: data.events,
      pricing: this.calculatePricing(data),
      assets: this.generateAssetReferences(data)
    };

    // Generate signature
    const signature = ReplayVaultStorage.generateSignature(manifest);
    const finalManifest: ReplayManifest = { ...manifest, signature };

    // Store the manifest
    await ReplayVaultStorage.storeManifest(finalManifest);
    
    // Update index
    await ReplayVaultStorage.updateIndex(replayId, timestamp);

    return finalManifest;
  }

  // Check if activity burst threshold is met (25 mints in 10 minutes)
  static async shouldTriggerActivityRollup(): Promise<boolean> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const now = new Date();
    
    // Collect recent data
    const recentData = await this.collectTelemetryData(tenMinutesAgo, now);
    
    // Check if we have 25+ mints in the last 10 minutes
    return recentData.events.length >= 25;
  }
}