'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Shield, CreditCard } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface BuyButtonProps {
  product: Product;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

type PaymentProvider = 'coinbase' | 'paypal' | 'stripe';

export function BuyButton({ product, onSuccess, onError }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<PaymentProvider>('coinbase');
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    // Get provider from environment variable with fallback
    const envProvider = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER as PaymentProvider;
    if (envProvider && ['coinbase', 'paypal', 'stripe'].includes(envProvider)) {
      setCurrentProvider(envProvider);
    }
  }, []);

  const logTransaction = async (transactionData: any) => {
    try {
      await fetch('/api/transactions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  };

  const handlePayment = async (provider: PaymentProvider) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/payments/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Log transaction attempt
      await logTransaction({
        productId: product.id,
        provider,
        amount: product.price,
        status: 'initiated',
        timestamp: new Date().toISOString(),
      });

      // Redirect to payment provider
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        onSuccess?.(data.transactionId);
      }
    } catch (error) {
      console.error(`${provider} payment failed:`, error);
      
      // Try fallback if primary provider fails
      if (provider === 'coinbase' && !fallbackAttempted) {
        setFallbackAttempted(true);
        setCurrentProvider('paypal');
        setTimeout(() => handlePayment('paypal'), 1000);
        return;
      }
      
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'coinbase':
        return '₿';
      case 'paypal':
        return '🅿️';
      case 'stripe':
        return '💳';
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getProviderName = (provider: PaymentProvider) => {
    switch (provider) {
      case 'coinbase':
        return 'Coinbase Commerce';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      default:
        return 'Payment';
    }
  };

  return (
    <motion.div
      className="chaos-card p-6 w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-green-400 mr-2" />
          <h2 className="text-2xl font-bold chaos-title">Chaos Vault Access</h2>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold neon-text">${product.price}</span>
            <div className="flex items-center text-green-400">
              <Shield className="w-4 h-4 mr-1" />
              <span className="text-xs">Secured</span>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={() => handlePayment(currentProvider)}
        disabled={loading}
        className="chaos-button w-full relative"
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
            <>
              <span className="text-xl">{getProviderIcon(currentProvider)}</span>
              <ShoppingCart className="w-5 h-5" />
            </>
          )}
          <span className="font-bold">
            {loading 
              ? `Processing ${getProviderName(currentProvider)}...` 
              : `Buy with ${getProviderName(currentProvider)}`
            }
          </span>
        </div>
      </motion.button>

      {fallbackAttempted && (
        <motion.div
          className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg text-center"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-yellow-400 text-sm">
            Coinbase failed, trying PayPal backup...
          </p>
        </motion.div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">Supported payment methods:</p>
        <div className="flex justify-center space-x-4">
          {(['coinbase', 'paypal', 'stripe'] as PaymentProvider[]).map((provider) => (
            <motion.button
              key={provider}
              onClick={() => setCurrentProvider(provider)}
              className={`p-2 rounded-lg text-sm transition-all ${
                currentProvider === provider
                  ? 'bg-green-600/30 border border-green-500/50 text-green-400'
                  : 'bg-zinc-800/30 border border-zinc-600/30 text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{getProviderIcon(provider)}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Need help? Contact{' '}
          <a 
            href={`mailto:${process.env.SUPPORT_EMAIL || 'kingszized@gmail.com'}`}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            {process.env.SUPPORT_EMAIL || 'kingszized@gmail.com'}
          </a>
        </p>
      </div>
    </motion.div>
  );
}