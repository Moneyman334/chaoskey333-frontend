import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { PremiereEvent, PremiereStatus, PremiereResponse, CinematicEffect } from '@/types/premiere';
import crypto from 'crypto';

// Validate GitHub webhook signature
function validateSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  const providedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
}

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

// Generate cinematic effects based on phase
function generateCinematicEffects(phase: string): CinematicEffect[] {
  const effects: CinematicEffect[] = [];
  
  switch (phase) {
    case 'ignition':
      effects.push({
        type: 'glyph_expansion',
        intensity: 0.3,
        duration: 5000,
        parameters: { initialRadius: 10, finalRadius: 50, glowColor: '#FFD700' }
      });
      break;
    case 'expansion':
      effects.push({
        type: 'glyph_expansion',
        intensity: 0.7,
        duration: 8000,
        parameters: { initialRadius: 50, finalRadius: 150, glowColor: '#FF6B35' }
      });
      break;
    case 'resonance':
      effects.push({
        type: 'soundscape_resonance',
        intensity: 0.9,
        duration: 10000,
        parameters: { frequency: 432, harmonics: 7, amplitude: 0.8 }
      });
      break;
    case 'evolution':
      effects.push({
        type: 'blueprint_ripple',
        intensity: 1.0,
        duration: 12000,
        parameters: { 
          rippleCount: 3, 
          waveSpeed: 2.5, 
          centerPoint: { x: 0.5, y: 0.5 },
          color: '#9D4EDD'
        }
      });
      break;
  }
  
  return effects;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    let event: PremiereEvent;
    
    try {
      event = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate vault key
    const vaultKey = request.headers.get('x-vault-key');
    if (!vaultKey || !validateVaultKey(vaultKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vault key' },
        { status: 401 }
      );
    }

    // Validate GitHub signature for merged events
    if (event.action === 'merged') {
      const signature = request.headers.get('x-hub-signature-256');
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      
      if (!webhookSecret || !signature || !validateSignature(body, signature, webhookSecret)) {
        return NextResponse.json(
          { success: false, error: 'Invalid GitHub signature' },
          { status: 401 }
        );
      }

      // Validate it's PR #24 merged into main
      if (event.number !== 24 || !event.pull_request?.merged || event.pull_request.base.ref !== 'main') {
        return NextResponse.json(
          { success: false, error: 'Event does not match PR #24 merge criteria' },
          { status: 400 }
        );
      }
    }

    // Check current premiere status
    const currentStatus = await kv.get('premiere:status') as PremiereStatus | null;
    
    // Handle different event types
    switch (event.action) {
      case 'merged':
      case 'manual_trigger':
        // Check if premiere is already active
        if (currentStatus?.active) {
          return NextResponse.json({
            success: false,
            error: 'Premiere is already active',
            status: currentStatus
          } as PremiereResponse, { status: 409 });
        }

        // Check if manual override is disabled for auto triggers
        if (event.action === 'merged') {
          const config = await kv.get('premiere:config');
          if (config && !config.autoTrigger) {
            return NextResponse.json({
              success: false,
              error: 'Auto-trigger is disabled',
              status: currentStatus || { active: false, message: 'Premiere disabled', phase: 'inactive', timestamp: Date.now() }
            } as PremiereResponse, { status: 403 });
          }
        }

        // Start the premiere
        const newStatus: PremiereStatus = {
          active: true,
          message: 'Vault Cinematic Premiere initiated - Relic Evolution in progress',
          phase: 'ignition',
          timestamp: Date.now(),
          countdown: 60000 // 60 seconds countdown
        };

        await kv.set('premiere:status', newStatus);
        
        // Log the event
        await kv.set(`premiere:event:${Date.now()}`, {
          ...event,
          triggeredAt: Date.now(),
          triggeredBy: event.action === 'manual_trigger' ? event.adminUserId : 'github_workflow'
        });

        // Generate effects for ignition phase
        const effects = generateCinematicEffects('ignition');

        // Schedule phase transitions
        setTimeout(async () => {
          const phases = ['expansion', 'resonance', 'evolution', 'complete'];
          const phaseDurations = [10000, 8000, 12000, 5000]; // milliseconds
          
          for (let i = 0; i < phases.length; i++) {
            setTimeout(async () => {
              const phaseStatus: PremiereStatus = {
                active: phases[i] !== 'complete',
                message: phases[i] === 'complete' 
                  ? 'Vault Cinematic Premiere complete - All relics evolved' 
                  : `Phase ${phases[i]} in progress`,
                phase: phases[i] as any,
                timestamp: Date.now()
              };
              
              await kv.set('premiere:status', phaseStatus);
              
              if (phases[i] === 'evolution') {
                // Trigger NFT metadata updates
                await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nft-update`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Vault-Key': process.env.VAULT_SECRET_KEY || ''
                  },
                  body: JSON.stringify({ phase: 'evolution' })
                });
              }
            }, phaseDurations.slice(0, i).reduce((a, b) => a + b, 0));
          }
        }, 5000);

        return NextResponse.json({
          success: true,
          message: 'Vault Cinematic Premiere successfully triggered',
          status: newStatus,
          effects
        } as PremiereResponse);

      case 'rollback':
      case 'manual_disable':
        // Stop the premiere
        const disabledStatus: PremiereStatus = {
          active: false,
          message: event.reason ? `Premiere disabled: ${event.reason}` : 'Premiere manually disabled',
          phase: 'inactive',
          timestamp: Date.now()
        };

        await kv.set('premiere:status', disabledStatus);
        
        // Log the disable event
        await kv.set(`premiere:disable:${Date.now()}`, {
          ...event,
          disabledAt: Date.now(),
          previousStatus: currentStatus
        });

        return NextResponse.json({
          success: true,
          message: 'Premiere successfully disabled',
          status: disabledStatus
        } as PremiereResponse);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Premiere trigger error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}