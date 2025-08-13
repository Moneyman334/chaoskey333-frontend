import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { VaultRelic } from '@/types/premiere';
import crypto from 'crypto';

// Validate vault key
function validateVaultKey(providedKey: string): boolean {
  const expectedKey = process.env.VAULT_SECRET_KEY;
  if (!expectedKey || !providedKey) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expectedKey),
    Buffer.from(providedKey)
  );
}

// Generate evolved metadata for a relic
function evolveRelicMetadata(relic: VaultRelic): VaultRelic {
  const evolvedRelic = { ...relic };
  
  // Update evolution state
  if (relic.evolutionState === 'dormant') {
    evolvedRelic.evolutionState = 'awakening';
  } else if (relic.evolutionState === 'awakening') {
    evolvedRelic.evolutionState = 'evolved';
  }

  // Update metadata for evolved state
  if (evolvedRelic.evolutionState === 'evolved') {
    evolvedRelic.metadata = {
      ...relic.metadata,
      name: relic.metadata.name.replace('Dormant', 'Evolved').replace('Awakening', 'Evolved'),
      description: relic.metadata.description + ' - Enhanced through the Vault Cinematic Premiere, this relic now pulses with cosmic energy and evolved consciousness.',
      attributes: [
        ...relic.metadata.attributes.filter(attr => attr.trait_type !== 'Evolution State'),
        { trait_type: 'Evolution State', value: 'Evolved' },
        { trait_type: 'Premiere Phase', value: 'Vault Cinematic Premiere 2024' },
        { trait_type: 'Power Level', value: (Math.random() * 50 + 50).toFixed(1) },
        { trait_type: 'Cosmic Resonance', value: Math.floor(Math.random() * 100) + 1 }
      ]
    };

    // Add glyph halo effect
    evolvedRelic.glyphHalo = {
      intensity: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      pattern: ['spiral', 'radial', 'matrix', 'waves'][Math.floor(Math.random() * 4)],
      color: ['#FFD700', '#FF6B35', '#9D4EDD', '#06FFA5'][Math.floor(Math.random() * 4)]
    };
  }

  return evolvedRelic;
}

// Simulate broadcasting to connected vault instances
async function broadcastToVaultInstances(relics: VaultRelic[]) {
  const vaultInstances = [
    'vault-alpha.chaoskey333.com',
    'vault-beta.chaoskey333.com',
    'vault-gamma.chaoskey333.com'
  ];

  const broadcastPromises = vaultInstances.map(async (instance) => {
    try {
      // In a real implementation, this would make HTTP calls to other vault instances
      // For now, we'll simulate the broadcast
      console.log(`Broadcasting relic updates to ${instance}:`, relics.length, 'relics updated');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      return { instance, success: true, count: relics.length };
    } catch (error) {
      console.error(`Failed to broadcast to ${instance}:`, error);
      return { instance, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  return Promise.all(broadcastPromises);
}

export async function POST(request: NextRequest) {
  try {
    const { phase, relicIds } = await request.json();

    // Validate vault key
    const vaultKey = request.headers.get('x-vault-key');
    if (!vaultKey || !validateVaultKey(vaultKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vault key' },
        { status: 401 }
      );
    }

    // Get current relics from storage
    let allRelics = await kv.get('vault:relics') as VaultRelic[] | null;
    
    // Initialize with sample relics if none exist
    if (!allRelics) {
      allRelics = [
        {
          id: 'relic-001',
          tokenId: 1,
          metadata: {
            name: 'Dormant Chaos Key Alpha',
            description: 'A mysterious relic containing untapped cosmic energy.',
            image: 'https://vault.chaoskey333.com/images/relic-001.png',
            attributes: [
              { trait_type: 'Type', value: 'Chaos Key' },
              { trait_type: 'Rarity', value: 'Legendary' },
              { trait_type: 'Evolution State', value: 'Dormant' }
            ]
          },
          evolutionState: 'dormant'
        },
        {
          id: 'relic-002',
          tokenId: 2,
          metadata: {
            name: 'Awakening Void Crystal',
            description: 'A crystal that hums with interdimensional frequencies.',
            image: 'https://vault.chaoskey333.com/images/relic-002.png',
            attributes: [
              { trait_type: 'Type', value: 'Void Crystal' },
              { trait_type: 'Rarity', value: 'Epic' },
              { trait_type: 'Evolution State', value: 'Awakening' }
            ]
          },
          evolutionState: 'awakening'
        },
        {
          id: 'relic-003',
          tokenId: 3,
          metadata: {
            name: 'Dormant Singularity Beacon',
            description: 'A beacon that once guided cosmic travelers through the void.',
            image: 'https://vault.chaoskey333.com/images/relic-003.png',
            attributes: [
              { trait_type: 'Type', value: 'Singularity Beacon' },
              { trait_type: 'Rarity', value: 'Mythic' },
              { trait_type: 'Evolution State', value: 'Dormant' }
            ]
          },
          evolutionState: 'dormant'
        }
      ];
      
      await kv.set('vault:relics', allRelics);
    }

    // Determine which relics to update
    let relicsToUpdate: VaultRelic[];
    
    if (relicIds && Array.isArray(relicIds)) {
      // Update specific relics
      relicsToUpdate = allRelics.filter(relic => relicIds.includes(relic.id));
    } else {
      // Update all non-evolved relics during evolution phase
      relicsToUpdate = allRelics.filter(relic => relic.evolutionState !== 'evolved');
    }

    if (relicsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No relics available for evolution',
        updatedCount: 0,
        broadcastResults: []
      });
    }

    // Evolve the relics
    const evolvedRelics = relicsToUpdate.map(evolveRelicMetadata);
    
    // Update the relics in the main array
    evolvedRelics.forEach(evolvedRelic => {
      const index = allRelics!.findIndex(r => r.id === evolvedRelic.id);
      if (index !== -1) {
        allRelics![index] = evolvedRelic;
      }
    });

    // Save updated relics
    await kv.set('vault:relics', allRelics);
    
    // Store evolution history
    await kv.set(`evolution:batch:${Date.now()}`, {
      phase,
      timestamp: Date.now(),
      relicsUpdated: evolvedRelics.map(r => ({ id: r.id, tokenId: r.tokenId, newState: r.evolutionState })),
      totalUpdated: evolvedRelics.length
    });

    // Broadcast updates to connected vault instances
    const broadcastResults = await broadcastToVaultInstances(evolvedRelics);

    // Update global vault statistics
    const stats = await kv.get('vault:stats') || { totalEvolutions: 0, lastEvolutionEvent: null };
    stats.totalEvolutions += evolvedRelics.length;
    stats.lastEvolutionEvent = Date.now();
    await kv.set('vault:stats', stats);

    return NextResponse.json({
      success: true,
      message: `Successfully evolved ${evolvedRelics.length} relics`,
      updatedCount: evolvedRelics.length,
      relics: evolvedRelics,
      broadcastResults,
      phase
    });

  } catch (error) {
    console.error('NFT update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update NFT metadata' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current relic states
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relicId = searchParams.get('relicId');

    let allRelics = await kv.get('vault:relics') as VaultRelic[] | null;
    
    // Initialize with sample relics if none exist (for demo purposes)
    if (!allRelics) {
      allRelics = [
        {
          id: 'relic-001',
          tokenId: 1,
          metadata: {
            name: 'Dormant Chaos Key Alpha',
            description: 'A mysterious relic containing untapped cosmic energy.',
            image: 'https://vault.chaoskey333.com/images/relic-001.png',
            attributes: [
              { trait_type: 'Type', value: 'Chaos Key' },
              { trait_type: 'Rarity', value: 'Legendary' },
              { trait_type: 'Evolution State', value: 'Dormant' }
            ]
          },
          evolutionState: 'dormant'
        },
        {
          id: 'relic-002',
          tokenId: 2,
          metadata: {
            name: 'Awakening Void Crystal',
            description: 'A crystal that hums with interdimensional frequencies.',
            image: 'https://vault.chaoskey333.com/images/relic-002.png',
            attributes: [
              { trait_type: 'Type', value: 'Void Crystal' },
              { trait_type: 'Rarity', value: 'Epic' },
              { trait_type: 'Evolution State', value: 'Awakening' }
            ]
          },
          evolutionState: 'awakening'
        },
        {
          id: 'relic-003',
          tokenId: 3,
          metadata: {
            name: 'Dormant Singularity Beacon',
            description: 'A beacon that once guided cosmic travelers through the void.',
            image: 'https://vault.chaoskey333.com/images/relic-003.png',
            attributes: [
              { trait_type: 'Type', value: 'Singularity Beacon' },
              { trait_type: 'Rarity', value: 'Mythic' },
              { trait_type: 'Evolution State', value: 'Dormant' }
            ]
          },
          evolutionState: 'dormant'
        }
      ];
      
      // Save sample relics to storage
      await kv.set('vault:relics', allRelics);
      console.log('Created sample relics for demo');
    }

    if (relicId) {
      const relic = allRelics.find(r => r.id === relicId);
      return NextResponse.json({
        success: true,
        relic: relic || null,
        message: relic ? 'Relic found' : 'Relic not found'
      });
    }

    return NextResponse.json({
      success: true,
      relics: allRelics,
      stats: {
        total: allRelics.length,
        dormant: allRelics.filter(r => r.evolutionState === 'dormant').length,
        awakening: allRelics.filter(r => r.evolutionState === 'awakening').length,
        evolved: allRelics.filter(r => r.evolutionState === 'evolved').length
      }
    });

  } catch (error) {
    console.error('NFT retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve NFT data' },
      { status: 500 }
    );
  }
}