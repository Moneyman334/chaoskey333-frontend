'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CancelContent() {
  const searchParams = useSearchParams();
  const [pulseActive, setPulseActive] = useState(true);

  const provider = searchParams.get('provider') || 'unknown';
  const product = searchParams.get('product') || 'unknown';
  const error = searchParams.get('error');

  useEffect(() => {
    // Stop pulse animation after a few seconds
    setTimeout(() => setPulseActive(false), 3000);
  }, []);

  return (
    <div className="min-h-screen vip-grid flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Cancel Animation */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-red-600/20 rounded-full mb-6"
            animate={pulseActive ? { 
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 20px rgba(255, 59, 48, 0.3)',
                '0 0 40px rgba(255, 59, 48, 0.6)',
                '0 0 20px rgba(255, 59, 48, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: pulseActive ? Infinity : 0 }}
          >
            <XCircle className="w-12 h-12 text-red-400" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(45deg, #ff3b30, #ff9500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Payment Cancelled
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Your transaction was not completed
          </motion.p>

          <motion.div
            className="flex items-center justify-center space-x-2 text-orange-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Via {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
            <AlertTriangle className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Cancellation Details */}
        <motion.div
          className="chaos-card p-6 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <XCircle className="w-6 h-6 mr-2 text-red-400" />
            Transaction Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Product</p>
              <p className="text-white font-medium">{product}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Payment Method</p>
              <p className="text-white font-medium capitalize">{provider}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className="text-red-400 font-medium">Cancelled</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Timestamp</p>
              <p className="text-gray-300 font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-red-400 mb-2">Error Details</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-4">What happened?</h3>
            
            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  Your payment was cancelled before completion
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  No charges were made to your account
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  You can try again with the same or different payment method
                </p>
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                💡 <strong>Pro Tip:</strong> The Chaos Vault supports multiple payment providers. 
                If one fails, our system automatically tries backup options!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <Link href="/">
            <motion.button
              className="chaos-button px-8 py-3 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </motion.button>
          </Link>

          <Link href="/">
            <motion.button
              className="bg-zinc-700/50 border border-zinc-600/50 text-gray-300 px-8 py-3 rounded-lg hover:bg-zinc-700/70 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Vault
            </motion.button>
          </Link>
        </motion.div>

        {/* Alternative Payment Methods */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-gray-400 text-sm mb-4">
            Having trouble? We support multiple payment methods:
          </p>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <span className="text-2xl">₿</span>
              <p className="text-xs text-gray-500 mt-1">Coinbase</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">🅿️</span>
              <p className="text-xs text-gray-500 mt-1">PayPal</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">💳</span>
              <p className="text-xs text-gray-500 mt-1">Stripe</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-xs text-gray-500">
            Need help? Contact{' '}
            <a 
              href={`mailto:${process.env.SUPPORT_EMAIL || 'kingszized@gmail.com'}`}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              kingszized@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}