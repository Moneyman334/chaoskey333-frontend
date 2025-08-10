import { NextRequest, NextResponse } from 'next/server';
import { watchtowerBus, WatchtowerEvent } from '@/lib/watchtower';
import { watchtowerStore } from '@/lib/watchtower-store';

// Server-Sent Events endpoint for real-time Watchtower subscriptions
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const subscriberId = url.searchParams.get('id') || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      console.log(`[Watchtower] New SSE subscriber: ${subscriberId}`);

      // Send initial connection event
      const connectEvent = {
        id: `connect_${Date.now()}`,
        type: 'connection',
        data: {
          subscriberId,
          timestamp: Date.now(),
          message: 'Watchtower stream connected'
        }
      };

      controller.enqueue(`data: ${JSON.stringify(connectEvent)}\n\n`);

      // Event listener for new events
      const eventListener = (event: WatchtowerEvent) => {
        try {
          // Verify event signature before sending
          if (watchtowerBus.verifyEvent(event)) {
            controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
          } else {
            console.warn('[Watchtower] Event failed signature verification');
          }
        } catch (error) {
          console.error('[Watchtower] Error sending event to stream:', error);
        }
      };

      // Subscribe to all events
      watchtowerBus.on('*', eventListener);

      // Send recent events to new subscriber
      watchtowerStore.getRecentEvents(5).then(recentEvents => {
        recentEvents.forEach(event => {
          if (watchtowerBus.verifyEvent(event)) {
            controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
          }
        });
      }).catch(error => {
        console.error('[Watchtower] Error loading recent events:', error);
      });

      // Add subscriber to store
      watchtowerStore.addSubscriber(subscriberId);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatEvent = {
            id: `heartbeat_${Date.now()}`,
            type: 'heartbeat',
            data: {
              timestamp: Date.now(),
              subscriberId
            }
          };
          controller.enqueue(`data: ${JSON.stringify(heartbeatEvent)}\n\n`);
        } catch (error) {
          console.error('[Watchtower] Heartbeat error:', error);
          clearInterval(heartbeat);
        }
      }, 30000); // 30 second heartbeat

      // Cleanup function
      const cleanup = () => {
        console.log(`[Watchtower] SSE subscriber disconnected: ${subscriberId}`);
        watchtowerBus.off('*', eventListener);
        watchtowerStore.removeSubscriber(subscriberId);
        clearInterval(heartbeat);
      };

      // Handle stream cancellation
      request.signal.addEventListener('abort', cleanup);

      // Store cleanup in stream for manual closure
      (controller as any).cleanup = cleanup;
    },

    cancel() {
      // Cleanup will be called by the abort signal handler
      console.log('[Watchtower] Stream cancelled');
    }
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}