'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (typeof (window as any).ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        setAddress(walletAddress);
        setIsConnected(true);
        onConnect?.(walletAddress);

        // Listen for account changes
        (window as any).ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            disconnectWallet();
          } else {
            setAddress(newAccounts[0]);
            onConnect?.(newAccounts[0]);
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
    onDisconnect?.();
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <motion.div
        className="chaos-card p-4 w-full max-w-sm mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600/20 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Connected</p>
              <p className="font-mono text-green-400 text-sm">{formatAddress(address)}</p>
            </div>
          </div>
          <motion.button
            onClick={disconnectWallet}
            className="text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded-lg hover:bg-red-600/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disconnect
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="chaos-card p-6 w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-purple-600/20 rounded-full mr-3">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-green-400 mr-1" />
            <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Connect your wallet to access the Chaos Vault and make secure purchases
        </p>

        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-900/30 border border-red-600/30 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={connectWallet}
          disabled={loading}
          className="chaos-button w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-3">
            {loading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
            <span className="font-bold">
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </span>
          </div>
        </motion.button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Don&apos;t have MetaMask?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Download here
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}