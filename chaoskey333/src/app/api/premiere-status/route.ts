import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { PremiereStatus } from '@/types/premiere';

export async function GET(request: NextRequest) {
  try {
    // Get current premiere status
    const status = await kv.get('premiere:status') as PremiereStatus | null;
    
    // Default status if none exists
    const defaultStatus: PremiereStatus = {
      active: false,
      message: 'No active premiere',
      phase: 'inactive',
      timestamp: Date.now()
    };

    const currentStatus = status || defaultStatus;

    // Calculate remaining countdown time if applicable
    if (currentStatus.active && currentStatus.countdown && currentStatus.timestamp) {
      const elapsed = Date.now() - currentStatus.timestamp;
      const remaining = Math.max(0, currentStatus.countdown - elapsed);
      
      if (remaining > 0) {
        currentStatus.countdown = remaining;
      } else {
        // Countdown expired, remove it
        delete currentStatus.countdown;
      }
    }

    return NextResponse.json({
      success: true,
      status: currentStatus
    });

  } catch (error) {
    console.error('Premiere status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve premiere status',
        status: {
          active: false,
          message: 'Error retrieving status',
          phase: 'inactive',
          timestamp: Date.now()
        }
      },
      { status: 500 }
    );
  }
}

// POST endpoint for admin controls
export async function POST(request: NextRequest) {
  try {
    const { action, adminUserId } = await request.json();

    // Validate admin access (in a real app, you'd check authentication)
    const vaultKey = request.headers.get('x-vault-key');
    if (!vaultKey || vaultKey !== process.env.VAULT_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentStatus = await kv.get('premiere:status') as PremiereStatus | null;

    switch (action) {
      case 'manual_countdown':
        // Start a manual countdown for admin control
        const countdownStatus: PremiereStatus = {
          active: false,
          message: 'Manual countdown initiated - Awaiting ignition',
          phase: 'inactive',
          timestamp: Date.now(),
          countdown: 30000 // 30 second countdown
        };

        await kv.set('premiere:status', countdownStatus);
        
        return NextResponse.json({
          success: true,
          message: 'Manual countdown started',
          status: countdownStatus
        });

      case 'manual_ignition':
        // Trigger immediate ignition (bypass countdown)
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/premiere-trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Vault-Key': process.env.VAULT_SECRET_KEY || ''
          },
          body: JSON.stringify({ 
            action: 'manual_trigger',
            adminUserId 
          })
        });

        const result = await response.json();
        return NextResponse.json(result, { status: response.status });

      case 'emergency_stop':
        // Emergency stop the premiere
        const stoppedStatus: PremiereStatus = {
          active: false,
          message: 'Emergency stop activated by admin',
          phase: 'inactive',
          timestamp: Date.now()
        };

        await kv.set('premiere:status', stoppedStatus);
        
        // Log emergency stop
        await kv.set(`premiere:emergency_stop:${Date.now()}`, {
          action: 'emergency_stop',
          adminUserId,
          timestamp: Date.now(),
          previousStatus: currentStatus
        });

        return NextResponse.json({
          success: true,
          message: 'Emergency stop executed',
          status: stoppedStatus
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Premiere status control error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}