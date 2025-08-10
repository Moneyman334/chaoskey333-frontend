import { NextRequest } from 'next/server';
import { recursionState } from '@/lib/recursion-state';

// Dynamic runtime for SSE streams
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const writer = controller;
      
      // Add this connection to our set
      recursionState.addSSEConnection(writer as any);

      // Send initial connection event
      const initEvent = {
        type: 'connection',
        timestamp: Date.now(),
        message: 'Connected to recursion monitor stream',
        status: recursionState.getStatus()
      };
      
      try {
        writer.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initEvent)}\n\n`));
      } catch (error) {
        console.error('Failed to send init event:', error);
      }

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: Date.now(),
            status: recursionState.getStatus()
          };
          writer.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
        } catch (error) {
          // Connection closed, clean up
          clearInterval(heartbeatInterval);
          recursionState.removeSSEConnection(writer as any);
        }
      }, 30000); // Heartbeat every 30 seconds

      // Cleanup when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        recursionState.removeSSEConnection(writer as any);
        try {
          controller.close();
        } catch (error) {
          // Connection might already be closed
        }
      });
    },

    cancel() {
      // Stream is being cancelled - no specific cleanup needed here
      // Connections are cleaned up in the start method
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}