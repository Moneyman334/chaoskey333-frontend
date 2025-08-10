'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Download, QrCode, Sparkles, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [qrCode, setQrCode] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  const provider = searchParams.get('provider') || 'unknown';
  const product = searchParams.get('product') || 'unknown';
  const demo = searchParams.get('demo') === 'true';

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Generate mock QR code (in production, this would be a real QR code)
    const mockQrData = `https://vault.chaoskey333.com/access?product=${product}&timestamp=${Date.now()}`;
    setQrCode(mockQrData);

    // Auto-hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  }, [product]);

  const confettiVariants = {
    hidden: { opacity: 0, y: -100, rotate: 0 },
    visible: {
      opacity: [0, 1, 1, 0],
      y: [0, 100, 200, 300],
      rotate: [0, 180, 360, 540],
      transition: {
        duration: 3,
        ease: "easeOut" as const,
        times: [0, 0.1, 0.8, 1]
      }
    }
  };

  return (
    <div className="min-h-screen vip-grid flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 ${
                i % 4 === 0 ? 'bg-green-400' :
                i % 4 === 1 ? 'bg-purple-400' :
                i % 4 === 2 ? 'bg-yellow-400' :
                'bg-pink-400'
              }`}
              style={{
                left: `${10 + (i * 4)}%`,
                top: '0%',
              }}
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-2xl w-full">
        {/* Success Animation */}
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
            className="inline-flex items-center justify-center w-24 h-24 bg-green-600/20 rounded-full mb-6"
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 20px rgba(0, 255, 65, 0.3)',
                '0 0 40px rgba(0, 255, 65, 0.6)',
                '0 0 20px rgba(0, 255, 65, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold chaos-title mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Welcome to the Chaos Vault
          </motion.p>

          <motion.div
            className="flex items-center justify-center space-x-2 text-green-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Powered by {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          className="chaos-card p-6 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <QrCode className="w-6 h-6 mr-2 text-green-400" />
            Vault Access Details
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
              <p className="text-green-400 font-medium">Confirmed</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Access Level</p>
              <p className="text-purple-400 font-medium">VIP Premium</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-green-900/20 to-purple-900/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-4">Your Vault Access QR Code</h3>
            
            {/* Mock QR Code Display */}
            <motion.div
              className="bg-white p-4 rounded-lg inline-block mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-48 h-48 bg-black/10 rounded flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs text-gray-600">QR Code</p>
                </div>
              </div>
            </motion.div>

            <p className="text-sm text-gray-400 mb-4">
              Scan this QR code with your device to access the vault instantly
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                className="chaos-button px-6 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // In production, this would download the actual QR code
                  alert('QR Code download would start here');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </motion.button>

              <motion.button
                className="bg-purple-600/20 border border-purple-500/50 text-purple-400 px-6 py-2 rounded-lg hover:bg-purple-600/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(qrCode);
                  alert('Vault URL copied to clipboard!');
                }}
              >
                Copy Vault URL
              </motion.button>
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
              <Home className="w-5 h-5 mr-2" />
              Return to Vault
            </motion.button>
          </Link>

          <motion.button
            className="bg-zinc-700/50 border border-zinc-600/50 text-gray-300 px-8 py-3 rounded-lg hover:bg-zinc-700/70 transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.open(`mailto:${process.env.SUPPORT_EMAIL || 'kingszized@gmail.com'}?subject=Vault Access Support`, '_blank');
            }}
          >
            Get Support
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>

        {demo && (
          <motion.div
            className="mt-8 p-4 bg-yellow-900/30 border border-yellow-600/30 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-yellow-400 text-sm">
              🎭 This is a demo transaction. In production, you would receive real vault access.
            </p>
          </motion.div>
        )}

        {/* Contact Support */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-xs text-gray-500">
            Questions? Contact{' '}
            <a 
              href={`mailto:${process.env.SUPPORT_EMAIL || 'kingszized@gmail.com'}`}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              kingszized@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}