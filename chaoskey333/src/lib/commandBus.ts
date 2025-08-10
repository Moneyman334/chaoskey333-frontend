import { kv } from '@vercel/kv';
import { createHmac } from 'crypto';
import { validateCommand, validateSignature } from './policy';
import { updateState } from './state';
import { logEvent } from './events';

export interface Command {
  type: string;
  payload?: any;
  idempotencyKey: string;
  timestamp: number;
  actor: string;
  signature?: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  eventId?: string;
}

// Validated command types
const VALID_COMMANDS = [
  'REPLAY.START',
  'REPLAY.STOP', 
  'HUD.DECODE.ENABLE',
  'HUD.DECODE.DISABLE',
  'RELIC.EVOLVE.TRIGGER',
  'BROADCAST.PULSE',
  'MINT.GATE.OPEN',
  'MINT.GATE.CLOSE'
] as const;

export type ValidCommandType = typeof VALID_COMMANDS[number];

export class CommandBus {
  private isDryRun: boolean;
  private isPaused: boolean;

  constructor() {
    this.isDryRun = process.env.ASCENSION_DRY_RUN === 'true';
    this.isPaused = process.env.ASCENSION_PAUSED === 'true';
  }

  async executeCommand(command: Command): Promise<CommandResult> {
    try {
      // Validate command structure
      if (!this.isValidCommand(command)) {
        return {
          success: false,
          message: 'Invalid command type or structure'
        };
      }

      // Check signature
      if (!validateSignature(command)) {
        return {
          success: false,
          message: 'Invalid signature'
        };
      }

      // Validate user permission for command
      if (!validateCommand(command.actor, command.type)) {
        return {
          success: false,
          message: 'Insufficient permissions'
        };
      }

      // Check idempotency
      const idempotencyResult = await this.checkIdempotency(command.idempotencyKey);
      if (idempotencyResult.exists) {
        return {
          success: false,
          message: 'Command already processed',
          data: idempotencyResult.result
        };
      }

      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(command.actor, command.type);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          message: `Rate limit exceeded. Try again in ${rateLimitResult.resetTime}s`
        };
      }

      // Circuit breaker check
      if (this.isPaused) {
        await this.logCommandOnly(command);
        return {
          success: true,
          message: 'Command logged (system paused)',
          data: { paused: true }
        };
      }

      // Dry run mode
      if (this.isDryRun) {
        await this.logCommandOnly(command);
        return {
          success: true,
          message: 'Command executed (dry run)',
          data: { dryRun: true }
        };
      }

      // Execute the actual command
      const result = await this.processCommand(command);
      
      // Store idempotency result
      await this.storeIdempotencyResult(command.idempotencyKey, result);

      return result;

    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  private isValidCommand(command: Command): boolean {
    return (
      typeof command.type === 'string' &&
      VALID_COMMANDS.includes(command.type as ValidCommandType) &&
      typeof command.idempotencyKey === 'string' &&
      command.idempotencyKey.length > 0 &&
      typeof command.timestamp === 'number' &&
      typeof command.actor === 'string' &&
      command.actor.length > 0
    );
  }

  private async checkIdempotency(idempotencyKey: string): Promise<{ exists: boolean; result?: any }> {
    try {
      const existingResult = await kv.get(`idempotency:${idempotencyKey}`);
      return {
        exists: !!existingResult,
        result: existingResult
      };
    } catch (error) {
      console.error('Idempotency check error:', error);
      return { exists: false };
    }
  }

  private async storeIdempotencyResult(idempotencyKey: string, result: CommandResult): Promise<void> {
    try {
      // Store for 24 hours
      await kv.setex(`idempotency:${idempotencyKey}`, 86400, result);
    } catch (error) {
      console.error('Failed to store idempotency result:', error);
    }
  }

  private async checkRateLimit(actor: string, commandType: string): Promise<{ allowed: boolean; resetTime?: number }> {
    try {
      const key = `rate_limit:${actor}:${commandType}`;
      const current = await kv.get(key) as number || 0;
      
      // Different limits per command type
      const limits: Record<string, number> = {
        'REPLAY.START': 10, // 10 per hour
        'REPLAY.STOP': 10,
        'HUD.DECODE.ENABLE': 20,
        'HUD.DECODE.DISABLE': 20,
        'RELIC.EVOLVE.TRIGGER': 5, // More restrictive
        'BROADCAST.PULSE': 30,
        'MINT.GATE.OPEN': 5,
        'MINT.GATE.CLOSE': 5
      };

      const limit = limits[commandType] || 10;
      
      if (current >= limit) {
        const ttl = await kv.ttl(key);
        return { allowed: false, resetTime: ttl };
      }

      // Increment counter with 1 hour expiry
      await kv.setex(key, 3600, current + 1);
      return { allowed: true };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow on error to prevent blocking
      return { allowed: true };
    }
  }

  private async logCommandOnly(command: Command): Promise<void> {
    // Log command execution without mutations
    await logEvent({
      type: `COMMAND.${command.type}`,
      payload: {
        ...command.payload,
        dryRun: this.isDryRun,
        paused: this.isPaused
      },
      actor: command.actor,
      timestamp: Date.now()
    });
  }

  private async processCommand(command: Command): Promise<CommandResult> {
    // Log the event first
    const eventId = await logEvent({
      type: `COMMAND.${command.type}`,
      payload: command.payload,
      actor: command.actor,
      timestamp: command.timestamp
    });

    // Update state based on command type
    let stateUpdate: any = {};
    
    switch (command.type) {
      case 'REPLAY.START':
        stateUpdate = {
          replay: {
            active: true,
            startedAt: command.timestamp,
            startedBy: command.actor
          }
        };
        break;
        
      case 'REPLAY.STOP':
        stateUpdate = {
          replay: {
            active: false,
            stoppedAt: command.timestamp,
            stoppedBy: command.actor
          }
        };
        break;
        
      case 'HUD.DECODE.ENABLE':
        stateUpdate = {
          hud: {
            decodeEnabled: true,
            enabledAt: command.timestamp,
            enabledBy: command.actor
          }
        };
        break;
        
      case 'HUD.DECODE.DISABLE':
        stateUpdate = {
          hud: {
            decodeEnabled: false,
            disabledAt: command.timestamp,
            disabledBy: command.actor
          }
        };
        break;
        
      case 'RELIC.EVOLVE.TRIGGER':
        stateUpdate = {
          relic: {
            evolving: true,
            evolutionTriggeredAt: command.timestamp,
            evolutionTriggeredBy: command.actor,
            evolutionPayload: command.payload
          }
        };
        break;
        
      case 'BROADCAST.PULSE':
        stateUpdate = {
          broadcast: {
            lastPulse: command.timestamp,
            pulsedBy: command.actor,
            pulseCount: await this.incrementPulseCount()
          }
        };
        break;
        
      case 'MINT.GATE.OPEN':
        stateUpdate = {
          mint: {
            gateOpen: true,
            openedAt: command.timestamp,
            openedBy: command.actor
          }
        };
        break;
        
      case 'MINT.GATE.CLOSE':
        stateUpdate = {
          mint: {
            gateOpen: false,
            closedAt: command.timestamp,
            closedBy: command.actor
          }
        };
        break;
        
      default:
        return {
          success: false,
          message: 'Unknown command type'
        };
    }

    // Apply state update
    await updateState(stateUpdate);

    return {
      success: true,
      message: `Command ${command.type} executed successfully`,
      data: stateUpdate,
      eventId
    };
  }

  private async incrementPulseCount(): Promise<number> {
    try {
      const current = await kv.get('pulse_count') as number || 0;
      const newCount = current + 1;
      await kv.set('pulse_count', newCount);
      return newCount;
    } catch (error) {
      console.error('Failed to increment pulse count:', error);
      return 0;
    }
  }
}

export const commandBus = new CommandBus();