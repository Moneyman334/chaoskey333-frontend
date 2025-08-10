import { createHmac } from 'crypto';
import type { Command } from './commandBus';

export interface Role {
  name: string;
  permissions: string[];
}

export interface OperatorKey {
  key: string;
  role: string;
}

// Role definitions
export const ROLES: Record<string, Role> = {
  owner: {
    name: 'owner',
    permissions: ['*'] // Full access
  },
  operator: {
    name: 'operator', 
    permissions: [
      'REPLAY.*',
      'HUD.DECODE.*',
      'BROADCAST.PULSE',
      'MINT.GATE.*'
    ]
  },
  bot: {
    name: 'bot',
    permissions: [
      'BROADCAST.PULSE',
      'HUD.DECODE.ENABLE'
    ]
  }
};

// Command permissions mapping
const COMMAND_PERMISSIONS: Record<string, string[]> = {
  'REPLAY.START': ['owner', 'operator'],
  'REPLAY.STOP': ['owner', 'operator'],
  'HUD.DECODE.ENABLE': ['owner', 'operator', 'bot'],
  'HUD.DECODE.DISABLE': ['owner', 'operator'],
  'RELIC.EVOLVE.TRIGGER': ['owner'], // Most restricted
  'BROADCAST.PULSE': ['owner', 'operator', 'bot'],
  'MINT.GATE.OPEN': ['owner', 'operator'],
  'MINT.GATE.CLOSE': ['owner', 'operator']
};

export function parseOperatorKeys(): OperatorKey[] {
  const operatorKeysEnv = process.env.OPERATOR_KEYS || '';
  if (!operatorKeysEnv) {
    return [];
  }

  try {
    return operatorKeysEnv.split(',').map(pair => {
      const [key, role] = pair.split(':');
      if (!key || !role) {
        throw new Error(`Invalid operator key format: ${pair}`);
      }
      return { key: key.trim(), role: role.trim() };
    });
  } catch (error) {
    console.error('Failed to parse operator keys:', error);
    return [];
  }
}

export function getActorRole(actor: string): string | null {
  const operatorKeys = parseOperatorKeys();
  
  // Check if actor matches any operator key
  const operatorKey = operatorKeys.find(op => op.key === actor);
  if (operatorKey) {
    return operatorKey.role;
  }

  // Default role based on actor pattern
  if (actor.startsWith('owner:')) {
    return 'owner';
  } else if (actor.startsWith('bot:')) {
    return 'bot';
  }

  return null;
}

export function validateCommand(actor: string, commandType: string): boolean {
  const role = getActorRole(actor);
  if (!role) {
    console.log(`No role found for actor: ${actor}`);
    return false;
  }

  const allowedRoles = COMMAND_PERMISSIONS[commandType];
  if (!allowedRoles) {
    console.log(`No permissions defined for command: ${commandType}`);
    return false;
  }

  const hasPermission = allowedRoles.includes(role);
  console.log(`Permission check - Actor: ${actor}, Role: ${role}, Command: ${commandType}, Allowed: ${hasPermission}`);
  
  return hasPermission;
}

export function validateSignature(command: Command): boolean {
  const secret = process.env.MASTER_HMAC_SECRET;
  if (!secret) {
    console.error('MASTER_HMAC_SECRET not configured');
    return false;
  }

  if (!command.signature) {
    console.log('No signature provided');
    return false;
  }

  try {
    // Create payload for signing (exclude signature field)
    const { signature, ...payloadForSigning } = command;
    const payload = JSON.stringify(payloadForSigning);
    
    // Compute expected signature
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    const providedSignature = command.signature;
    
    if (expectedSignature.length !== providedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      result |= expectedSignature.charCodeAt(i) ^ providedSignature.charCodeAt(i);
    }
    
    const isValid = result === 0;
    console.log(`Signature validation - Valid: ${isValid}`);
    
    return isValid;
    
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

export function signCommand(command: Omit<Command, 'signature'>): string {
  const secret = process.env.MASTER_HMAC_SECRET;
  if (!secret) {
    throw new Error('MASTER_HMAC_SECRET not configured');
  }

  const payload = JSON.stringify(command);
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

export function hasRole(actor: string, requiredRole: string): boolean {
  const userRole = getActorRole(actor);
  if (!userRole) {
    return false;
  }

  // Owner has all permissions
  if (userRole === 'owner') {
    return true;
  }

  return userRole === requiredRole;
}

export function hasPermission(actor: string, permission: string): boolean {
  const role = getActorRole(actor);
  if (!role || !ROLES[role]) {
    return false;
  }

  const rolePermissions = ROLES[role].permissions;
  
  // Check for wildcard permission
  if (rolePermissions.includes('*')) {
    return true;
  }

  // Check exact permission
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check wildcard patterns (e.g., "REPLAY.*" matches "REPLAY.START")
  return rolePermissions.some(p => {
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix + '.');
    }
    return false;
  });
}