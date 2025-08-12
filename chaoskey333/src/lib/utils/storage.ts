// Cosmic Replay Terminal v2.0 - Storage Layer for Vercel KV
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { ReplayManifest, ReplayIndex } from '@/lib/types/replay';

export class ReplayVaultStorage {
  
  // Generate deterministic replay ID
  static generateReplayId(timestamp: number): string {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = date.toISOString().slice(11, 16).replace(':', ''); // HHmm
    const randomId = nanoid(8);
    return `${dateStr}-${timeStr}-${randomId}`;
  }

  // Generate KV storage key for manifest
  static getManifestKey(id: string): string {
    const [datePart, timePart] = id.split('-');
    return `replay:manifest:${datePart}:${timePart}:${id}`;
  }

  // Generate signature for manifest integrity
  static generateSignature(manifest: Omit<ReplayManifest, 'signature'>): string {
    const content = JSON.stringify(manifest, Object.keys(manifest).sort());
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Store replay manifest
  static async storeManifest(manifest: ReplayManifest): Promise<void> {
    const key = this.getManifestKey(manifest.id);
    await kv.set(key, manifest);
  }

  // Retrieve replay manifest by ID
  static async getManifest(id: string): Promise<ReplayManifest | null> {
    const key = this.getManifestKey(id);
    return await kv.get<ReplayManifest>(key);
  }

  // Update replay index
  static async updateIndex(replayId: string, timestamp: number): Promise<void> {
    const date = new Date(timestamp);
    const dateKey = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Get current index or create new one
    let index = await kv.get<ReplayIndex>('replay:index') || {
      latest: '',
      daily: {},
      featured: [],
      count: 0
    };

    // Update latest
    index.latest = replayId;
    
    // Update daily index
    if (!index.daily[dateKey]) {
      index.daily[dateKey] = [];
    }
    index.daily[dateKey].push(replayId);
    
    // Update count
    index.count++;

    // Store updated index
    await kv.set('replay:index', index);
  }

  // Get replay index
  static async getIndex(): Promise<ReplayIndex> {
    return await kv.get<ReplayIndex>('replay:index') || {
      latest: '',
      daily: {},
      featured: [],
      count: 0
    };
  }

  // Get latest replay
  static async getLatestReplay(): Promise<ReplayManifest | null> {
    const index = await this.getIndex();
    if (!index.latest) return null;
    return await this.getManifest(index.latest);
  }

  // Get replays for a specific date
  static async getReplaysForDate(date: string): Promise<ReplayManifest[]> {
    const index = await this.getIndex();
    const replayIds = index.daily[date] || [];
    
    const replays = await Promise.all(
      replayIds.map(id => this.getManifest(id))
    );
    
    return replays.filter(Boolean) as ReplayManifest[];
  }

  // Add replay to featured list
  static async addToFeatured(replayId: string): Promise<void> {
    const index = await this.getIndex();
    if (!index.featured.includes(replayId)) {
      index.featured.push(replayId);
      await kv.set('replay:index', index);
    }
  }

  // Remove replay from featured list
  static async removeFromFeatured(replayId: string): Promise<void> {
    const index = await this.getIndex();
    index.featured = index.featured.filter(id => id !== replayId);
    await kv.set('replay:index', index);
  }

  // Get featured replays
  static async getFeaturedReplays(): Promise<ReplayManifest[]> {
    const index = await this.getIndex();
    const replays = await Promise.all(
      index.featured.map(id => this.getManifest(id))
    );
    return replays.filter(Boolean) as ReplayManifest[];
  }

  // Archive replay assets (update manifest with archive URL)
  static async archiveReplay(replayId: string, archiveUrl: string): Promise<void> {
    const manifest = await this.getManifest(replayId);
    if (!manifest) throw new Error('Replay not found');

    // Update manifest with archive information
    manifest.assets.archived = true;
    manifest.assets.archiveUrl = archiveUrl;
    
    // Regenerate signature
    const { signature, ...manifestWithoutSignature } = manifest;
    manifest.signature = this.generateSignature(manifestWithoutSignature);

    // Store updated manifest
    await this.storeManifest(manifest);
  }

  // Clean up old replays (optional utility for maintenance)
  static async cleanupOldReplays(daysToKeep: number = 30): Promise<number> {
    const index = await this.getIndex();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateKey = cutoffDate.toISOString().slice(0, 10).replace(/-/g, '');
    
    let deletedCount = 0;
    const updatedDaily: Record<string, string[]> = {};

    for (const [dateKey, replayIds] of Object.entries(index.daily)) {
      if (dateKey >= cutoffDateKey) {
        updatedDaily[dateKey] = replayIds;
      } else {
        // Delete old replays
        for (const replayId of replayIds) {
          const key = this.getManifestKey(replayId);
          await kv.del(key);
          deletedCount++;
        }
      }
    }

    // Update index
    index.daily = updatedDaily;
    index.count -= deletedCount;
    await kv.set('replay:index', index);

    return deletedCount;
  }
}