// Shared state for recursion monitoring system
export interface PulseEvent {
  id: string;
  timestamp: number;
  depth: number;
  source: string;
  broadcastOn: boolean;
  recursionDepth: number;
  pulseCount: number;
  pps: number;
  topic: string;
}

// Global state
class RecursionState {
  public broadcastOn: boolean;
  public recursionDepth: number;
  public pulseCount: number;
  public lastPulseTime: number;
  public pulseHistory: number[];
  public sseConnections: Set<WritableStreamDefaultWriter>;

  constructor() {
    this.broadcastOn = process.env.BROADCAST_ON === 'true' || false;
    this.recursionDepth = 0;
    this.pulseCount = 0;
    this.lastPulseTime = Date.now();
    this.pulseHistory = [];
    this.sseConnections = new Set();
  }

  toggleBroadcast(): boolean {
    this.broadcastOn = !this.broadcastOn;
    console.log(`🔄 Broadcast toggled: ${this.broadcastOn ? 'ON' : 'OFF'}`);
    return this.broadcastOn;
  }

  addPulse(): void {
    const now = Date.now();
    this.pulseHistory = this.pulseHistory.filter(time => now - time < 1000);
    this.pulseHistory.push(now);
    this.pulseCount++;
    this.lastPulseTime = now;
  }

  getCurrentPPS(): number {
    const now = Date.now();
    this.pulseHistory = this.pulseHistory.filter(time => now - time < 1000);
    return this.pulseHistory.length;
  }

  canPulse(): boolean {
    const qpsLimit = parseInt(process.env.PULSE_QPS_LIMIT || '12');
    return this.getCurrentPPS() < qpsLimit;
  }

  broadcastToSSE(event: PulseEvent): void {
    const eventData = `data: ${JSON.stringify(event)}\n\n`;
    
    this.sseConnections.forEach(async (writer) => {
      try {
        await writer.write(new TextEncoder().encode(eventData));
      } catch (error) {
        // Remove dead connections
        this.sseConnections.delete(writer);
      }
    });
  }

  addSSEConnection(writer: WritableStreamDefaultWriter): void {
    this.sseConnections.add(writer);
  }

  removeSSEConnection(writer: WritableStreamDefaultWriter): void {
    this.sseConnections.delete(writer);
  }

  getStatus() {
    return {
      broadcastOn: this.broadcastOn,
      recursionDepth: this.recursionDepth,
      pulseCount: this.pulseCount,
      lastPulseTime: this.lastPulseTime,
      pps: this.getCurrentPPS(),
      connections: this.sseConnections.size,
      limits: {
        maxDepth: parseInt(process.env.MAX_RECURSION_DEPTH || '4'),
        qpsLimit: parseInt(process.env.PULSE_QPS_LIMIT || '12')
      },
      topic: process.env.NEXT_PUBLIC_REPLAY_TOPIC || 'vault-broadcast'
    };
  }
}

// Singleton instance
export const recursionState = new RecursionState();