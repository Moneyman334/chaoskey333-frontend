"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { useState, useEffect } from "react";

export default function ReplayTerminal() {
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "🌌 Welcome to the Cosmic Replay Terminal",
    "⚡ Type 'help' for available commands",
    "🔮 Your blockchain adventure awaits..."
  ]);

  const handleCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    let response = "";

    switch (cmd) {
      case "help":
        response = "Available commands: help, status, vault, clear, version";
        break;
      case "status":
        response = "🟢 Terminal: ONLINE | Vault: SECURED | Chain: CONNECTED";
        break;
      case "vault":
        response = "🔐 ChaosKey333 Vault is secured and operational";
        break;
      case "clear":
        setTerminalHistory([]);
        return;
      case "version":
        response = "ChaosKey333 Cosmic Replay Terminal v2.0.0-replay";
        break;
      default:
        response = cmd ? `Unknown command: ${cmd}` : "";
    }

    if (response) {
      setTerminalHistory(prev => [...prev, `> ${command}`, response]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(terminalInput);
      setTerminalInput("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-400">
            🌌 Cosmic Replay Terminal
          </h1>
          <p className="text-xl text-gray-300">
            Advanced blockchain exploration and vault management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Terminal */}
          <div className="bg-gray-900 rounded-lg border border-green-500 shadow-lg">
            <div className="bg-green-500 text-black px-4 py-2 rounded-t-lg font-bold">
              Terminal Output
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              {terminalHistory.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))}
            </div>
            <div className="border-t border-green-500 p-4">
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">cosmic@replay:~$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-transparent outline-none flex-1 text-green-400"
                  placeholder="Enter command..."
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Wallet & Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg border border-blue-500 p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                Wallet Connection
              </h3>
              <div className="flex justify-center">
                <ConnectButton client={client} />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-purple-500 p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-4">
                Vault Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Vault Security:</span>
                  <span className="text-green-400">🔒 SECURED</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Status:</span>
                  <span className="text-green-400">🟢 ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="text-blue-400">v2.0.0-replay</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-yellow-500 p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCommand("status")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Status
                </button>
                <button
                  onClick={() => handleCommand("vault")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Vault
                </button>
                <button
                  onClick={() => handleCommand("version")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Version
                </button>
                <button
                  onClick={() => handleCommand("clear")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>🚀 Powered by ChaosKey333 | ⚡ Ops Hardening Pack Active</p>
        </div>
      </div>
    </div>
  );
}