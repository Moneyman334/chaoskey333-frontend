/**
 * SSE Connection Manager
 * Handles broadcast functionality separate from route handlers
 */

import { WatchtowerConfig, EventBuilders } from './watchtower';

// Active connections store
const activeConnections = new Set<WritableStreamDefaultWriter>();

// Heartbeat interval for keeping connections alive
let heartbeatInterval: NodeJS.Timeout | null = null;

// Function to broadcast events to all connected clients
export async function broadcastEvent(eventData: any) {
  const message = `data: ${JSON.stringify(eventData)}\n\n`;
  
  // Send to all active connections
  const deadConnections: WritableStreamDefaultWriter[] = [];
  
  for (const writer of activeConnections) {
    try {
      await writer.write(new TextEncoder().encode(message));
    } catch (error) {
      console.log('Dead connection detected, removing...');
      deadConnections.push(writer);
    }
  }
  
  // Clean up dead connections
  deadConnections.forEach(writer => activeConnections.delete(writer));
}

// Add a connection to the active pool
export function addConnection(writer: WritableStreamDefaultWriter) {
  activeConnections.add(writer);
  startHeartbeat();
}

// Remove a connection from the active pool
export function removeConnection(writer: WritableStreamDefaultWriter) {
  activeConnections.delete(writer);
  
  // Stop heartbeat if no connections
  if (activeConnections.size === 0 && heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Get active connection count
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

// Start heartbeat if not already started
function startHeartbeat() {
  if (heartbeatInterval) return;
  
  heartbeatInterval = setInterval(async () => {
    const heartbeat = EventBuilders.systemHeartbeat();
    await broadcastEvent({
      ...heartbeat,
      isHeartbeat: true,
    });
  }, WatchtowerConfig.heartbeatInterval);
}