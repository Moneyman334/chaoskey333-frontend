"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BuyButton } from '@/components/BuyButton';
import { WalletConnection } from '@/components/WalletConnection';
import { Zap, Shield, Star, Coins } from 'lucide-react';

const sampleProduct = {
  id: 'chaos-vault-access',
  name: 'ChaosKey333 Premium Vault',
  price: 99.99,
  description: 'Exclusive access to the ultimate chaos vault with premium features and unlimited downloads',
  image: '/vault-preview.jpg'
};

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setTransactionSuccess(true);
    console.log('Payment successful:', transactionId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen vip-grid">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-green-900/20" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <motion.div
            className="text-center mb-12"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 chaos-title">
              ⚡️ ChaosKey333
            </h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Ultimate Vault Experience
            </motion.p>
            <motion.p
              className="text-lg text-green-400 chaos-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Multi-Provider • Chaos-Themed • VIP Access
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="chaos-card p-6 text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Multi-Provider Security</h3>
              <p className="text-sm text-gray-400">Coinbase, PayPal, and Stripe with auto-fallback</p>
            </div>
            
            <div className="chaos-card p-6 text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Instant Access</h3>
              <p className="text-sm text-gray-400">Immediate vault unlock with QR codes</p>
            </div>
            
            <div className="chaos-card p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">VIP Experience</h3>
              <p className="text-sm text-gray-400">Neon graffiti chaos theme with animations</p>
            </div>
          </motion.div>

          {/* Wallet Connection */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <WalletConnection 
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
            />
          </motion.div>

          {/* Buy Button */}
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <BuyButton
              product={sampleProduct}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </motion.div>

          {/* Success Message */}
          {transactionSuccess && (
            <motion.div
              className="mt-8 chaos-card p-6 text-center max-w-md w-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center mb-4">
                <Coins className="w-8 h-8 text-yellow-400 mr-2" />
                <h3 className="text-xl font-bold text-green-400">Payment Successful!</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Your chaos vault access has been activated. Check your email for QR codes.
              </p>
              <div className="p-3 bg-green-900/30 border border-green-600/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  Wallet: {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Not connected'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold chaos-title mb-2">ChaosKey333</h3>
              <p className="text-sm text-gray-400">Ultimate chaos-powered checkout system</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-2">Need support?</p>
              <a
                href="mailto:kingszized@gmail.com"
                className="text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                kingszized@gmail.com
              </a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-gray-500">
              © 2024 ChaosKey333. Powered by multi-provider payment infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}