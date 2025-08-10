"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [state, setState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchState();
    fetchEvents();
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      setState(data.state);
    } catch (error) {
      console.error('Failed to fetch state:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=10');
      const data = await response.json();
      setEvents(data.events);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-4">⚡️</div>
          <div>Initializing Ascension Terminal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">⚡️ ChaosKey333 Ascension Terminal</h1>
          <p className="text-gray-400">Master Command Layer v1.0.0</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* State Panel */}
          <div className="border border-green-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-300">System State</h2>
            {state ? (
              <div className="space-y-4 text-sm">
                <div className="border-b border-gray-700 pb-2">
                  <div className="flex justify-between">
                    <span>Replay Active:</span>
                    <span className={state.replay.active ? "text-green-400" : "text-red-400"}>
                      {state.replay.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-2">
                  <div className="flex justify-between">
                    <span>HUD Decode:</span>
                    <span className={state.hud.decodeEnabled ? "text-green-400" : "text-red-400"}>
                      {state.hud.decodeEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-2">
                  <div className="flex justify-between">
                    <span>Relic Evolving:</span>
                    <span className={state.relic.evolving ? "text-yellow-400" : "text-gray-400"}>
                      {state.relic.evolving ? "EVOLVING" : "STABLE"}
                    </span>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-2">
                  <div className="flex justify-between">
                    <span>Mint Gate:</span>
                    <span className={state.mint.gateOpen ? "text-green-400" : "text-red-400"}>
                      {state.mint.gateOpen ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last Updated: {new Date(state.system.lastUpdated).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No state data available</div>
            )}
          </div>

          {/* Events Panel */}
          <div className="border border-green-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-300">Recent Events</h2>
            {events.length > 0 ? (
              <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
                {events.map((event, index) => (
                  <div key={event.id} className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="font-mono text-xs text-blue-400">{event.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">by {event.actor}</div>
                    {event.payload && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {JSON.stringify(event.payload)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No events logged</div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="text-sm text-gray-400">
            Master Command Layer Active • Use API endpoints to execute commands
          </div>
          <div className="text-xs text-gray-600 mt-2">
            POST /api/command • GET /api/state • GET /api/events
          </div>
        </div>
      </div>
    </div>
  );
}