import { NextRequest, NextResponse } from 'next/server';

// Mock data for mutation seeds and their evolution states
const mockSeeds = new Map();
const mockEvolutionHistory = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seedId = searchParams.get('seedId');

  if (seedId) {
    // Get specific seed
    const seed = mockSeeds.get(seedId);
    if (!seed) {
      return NextResponse.json(
        { success: false, error: 'Seed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      seed,
      evolutionHistory: mockEvolutionHistory.get(seedId) || [],
    });
  }

  // Get all pending seeds
  const pendingSeeds = Array.from(mockSeeds.values()).filter(
    seed => seed.status === 'pending'
  );

  return NextResponse.json({
    success: true,
    seeds: pendingSeeds,
    totalCount: pendingSeeds.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, seedId, approvalData, signedApproval } = body;

    switch (action) {
      case 'approve':
        if (!seedId) {
          return NextResponse.json(
            { success: false, error: 'Missing seedId' },
            { status: 400 }
          );
        }

        if (process.env.OMNI_REQUIRE_SIGNED_APPROVAL === 'true' && !signedApproval) {
          return NextResponse.json(
            { success: false, error: 'Signed approval required' },
            { status: 400 }
          );
        }

        const seed = mockSeeds.get(seedId);
        if (!seed) {
          return NextResponse.json(
            { success: false, error: 'Seed not found' },
            { status: 404 }
          );
        }

        // Update seed status
        seed.status = 'approved';
        seed.approvedAt = new Date().toISOString();
        seed.approvalData = approvalData;
        seed.signedApproval = signedApproval;

        // Add to evolution history
        const historyEntry = {
          timestamp: new Date().toISOString(),
          action: 'approved',
          details: approvalData,
          signature: signedApproval,
        };

        const history = mockEvolutionHistory.get(seedId) || [];
        history.push(historyEntry);
        mockEvolutionHistory.set(seedId, history);

        // Send webhook notification
        await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            type: 'relic_evolution',
            data: {
              seedId,
              action: 'approved',
              approver: approvalData?.approver || 'admin',
              timestamp: new Date().toISOString(),
            },
            targets: ['terminal', 'hud', 'vault'],
          }),
        }).catch(console.error);

        // Mock evolution propagation
        setTimeout(() => {
          seed.status = 'evolving';
          const evolutionEntry = {
            timestamp: new Date().toISOString(),
            action: 'evolution_started',
            details: { phase: 'vault_update' },
          };
          history.push(evolutionEntry);
          
          // Send evolution started webhook
          fetch('/api/webhooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              type: 'vault_sync',
              data: {
                seedId,
                action: 'evolution_started',
                phase: 'vault_update',
              },
              targets: ['vault', 'nft_metadata'],
            }),
          }).catch(console.error);
          
          setTimeout(() => {
            seed.status = 'completed';
            const completionEntry = {
              timestamp: new Date().toISOString(),
              action: 'evolution_completed',
              details: {
                vaultUpdated: true,
                nftMetadataUpdated: true,
                publicLoopsUpdated: true,
              },
            };
            history.push(completionEntry);
            
            // Send completion webhook
            fetch('/api/webhooks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create',
                type: 'nft_update',
                data: {
                  seedId,
                  action: 'evolution_completed',
                  updates: {
                    vaultUpdated: true,
                    nftMetadataUpdated: true,
                    publicLoopsUpdated: true,
                  },
                },
                targets: ['public_loops', 'nft_metadata', 'terminal'],
              }),
            }).catch(console.error);
          }, 2000);
        }, 1000);

        return NextResponse.json({
          success: true,
          message: 'Seed approved and evolution initiated',
          seed,
        });

      case 'reject':
        if (!seedId) {
          return NextResponse.json(
            { success: false, error: 'Missing seedId' },
            { status: 400 }
          );
        }

        const rejectedSeed = mockSeeds.get(seedId);
        if (!rejectedSeed) {
          return NextResponse.json(
            { success: false, error: 'Seed not found' },
            { status: 404 }
          );
        }

        rejectedSeed.status = 'rejected';
        rejectedSeed.rejectedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          message: 'Seed rejected',
          seed: rejectedSeed,
        });

      case 'rollback':
        if (!seedId) {
          return NextResponse.json(
            { success: false, error: 'Missing seedId' },
            { status: 400 }
          );
        }

        // Mock rollback functionality
        const rollbackSeed = mockSeeds.get(seedId);
        if (!rollbackSeed) {
          return NextResponse.json(
            { success: false, error: 'Seed not found' },
            { status: 404 }
          );
        }

        rollbackSeed.status = 'rolled_back';
        rollbackSeed.rolledBackAt = new Date().toISOString();

        const rollbackHistory = mockEvolutionHistory.get(seedId) || [];
        rollbackHistory.push({
          timestamp: new Date().toISOString(),
          action: 'rolled_back',
          details: { reason: 'Manual rollback requested' },
        });
        mockEvolutionHistory.set(seedId, rollbackHistory);

        return NextResponse.json({
          success: true,
          message: 'Evolution rolled back successfully',
          seed: rollbackSeed,
        });

      case 'create':
        // Create a new seed for testing
        const newSeedId = `seed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSeed = {
          id: newSeedId,
          eventId: body.eventId || 'evt_test',
          audio: {
            frequency: Math.random() * 1000 + 200,
            harmonics: [Math.random() * 0.5, Math.random() * 0.3, Math.random() * 0.2],
            duration: Math.random() * 5 + 2,
          },
          visual: {
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            pattern: ['spiral', 'fractal', 'wave', 'crystalline'][Math.floor(Math.random() * 4)],
            intensity: Math.random() * 0.8 + 0.2,
          },
          glyph: {
            symbols: ['⚡', '🔮', '⭐', '🌙', '🔥', '💎'][Math.floor(Math.random() * 6)] +
                     ['☯', '⚛', '🌀', '✨', '⚗', '🧿'][Math.floor(Math.random() * 6)],
            complexity: Math.floor(Math.random() * 5) + 1,
            resonance: Math.random(),
          },
          timestamp: new Date().toISOString(),
          confidenceScore: Math.random() * 0.4 + 0.6,
          status: 'pending',
        };

        mockSeeds.set(newSeedId, newSeed);
        mockEvolutionHistory.set(newSeedId, [{
          timestamp: new Date().toISOString(),
          action: 'seed_created',
          details: { source: 'cosmic_replay_terminal' },
        }]);

        return NextResponse.json({
          success: true,
          seed: newSeed,
          message: 'Seed created successfully',
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