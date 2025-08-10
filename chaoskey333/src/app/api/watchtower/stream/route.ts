/**
 * Watchtower SSE Stream Endpoint
 * Provides real-time Server-Sent Events for client subscriptions
 */

import { NextRequest } from 'next/server';
import { WatchtowerConfig } from '../../../../../lib/watchtower';
import { getRecentEvents, checkRateLimit } from '../../../../../lib/watchtower-store';
import { addConnection, removeConnection } from '../../../../../lib/sse-manager';

export async function GET(request: NextRequest) {
  // Check if Watchtower is enabled
  if (!WatchtowerConfig.enabled) {
    return new Response('Watchtower is disabled', { status: 503 });
  }

  // Get client IP for rate limiting
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  // Check rate limits
  const rateLimitResult = await checkRateLimit(clientIP, 'ip');
  if (!rateLimitResult.allowed) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Last-Event-ID',
  });

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const writer = controller;
      
      // Add to active connections
      const textWriter = {
        write: async (chunk: Uint8Array) => {
          try {
            controller.enqueue(chunk);
          } catch (error) {
            console.error('Error writing to stream:', error);
          }
        }
      } as WritableStreamDefaultWriter;
      
      addConnection(textWriter);
      
      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        type: 'connection.established',
        timestamp: Date.now(),
        message: '⚡ Watchtower Signal Amplifier connected',
        clientIP: clientIP.replace(/\./g, '*'), // Obfuscate IP for privacy
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
      
      // Send recent events if client requests them
      const lastEventId = request.headers.get('Last-Event-ID');
      if (!lastEventId) {
        // Send recent events for new connections
        getRecentEvents(10).then(recentEvents => {
          recentEvents.reverse().forEach(event => {
            const message = `id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`;
            try {
              controller.enqueue(new TextEncoder().encode(message));
            } catch (error) {
              console.error('Error sending recent event:', error);
            }
          });
        });
      }
      
      // Handle connection cleanup
      const cleanup = () => {
        removeConnection(textWriter);
        console.log(`SSE client disconnected.`);
      };
      
      // Clean up on close
      controller.close = () => {
        cleanup();
      };
      
      // Set up keep-alive ping
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
        } catch (error) {
          cleanup();
          clearInterval(keepAlive);
        }
      }, 15000); // Every 15 seconds
      
      return () => {
        cleanup();
        clearInterval(keepAlive);
      };
    },
    
    cancel() {
      // Connection cancelled by client
      console.log('SSE connection cancelled by client');
    }
  });

  return new Response(stream, { headers });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Last-Event-ID',
    },
  });
}