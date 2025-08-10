'use client';

import { useState, useEffect } from 'react';

interface PaymentConfig {
  currentProvider: string;
  providerConfig: {
    name: string;
    description: string;
    supportedCurrencies: string[];
    requiresRedirect: boolean;
  };
  product: {
    name: string;
    description: string;
    price: number;
    currency: string;
  };
}

interface BuyButtonProps {
  walletAddress?: string;
  connectedWalletType?: string;
  onSuccess?: (sessionId: string, provider: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function BuyButton({
  walletAddress,
  connectedWalletType,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}: BuyButtonProps) {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  // Load payment configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/payment-config');
        const config = await response.json();
        setPaymentConfig(config);
      } catch (error) {
        console.error('Failed to load payment config:', error);
        onError?.('Failed to load payment configuration');
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, [onError]);

  const handleBuyClick = async () => {
    if (!walletAddress) {
      onError?.('Please connect your wallet first');
      return;
    }

    if (!paymentConfig) {
      onError?.(configLoading ? 'Payment configuration loading...' : 'Payment configuration not available');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          connectedWalletType,
          amount: paymentConfig.product.price,
          currency: paymentConfig.product.currency,
          productName: paymentConfig.product.name
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.sessionId, result.provider);
        
        // Redirect to payment provider
        if (result.sessionUrl) {
          window.location.href = result.sessionUrl;
        }
      } else {
        throw new Error(result.error || 'Checkout failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (configLoading) return 'Loading...';
    if (loading) return 'Processing...';
    if (!walletAddress) return 'Connect Wallet First';
    if (!paymentConfig) return 'Config Error';
    
    const price = (paymentConfig.product.price / 100).toFixed(2);
    const provider = paymentConfig.providerConfig.name;
    return `Buy with ${provider} - $${price}`;
  };

  const isDisabled = disabled || loading || configLoading || !walletAddress || !paymentConfig;

  return (
    <div className={`buy-button-container ${className}`}>
      <button
        onClick={handleBuyClick}
        disabled={isDisabled}
        className={`
          buy-button
          ${isDisabled ? 'disabled' : 'enabled'}
          ${loading ? 'loading' : ''}
        `}
      >
        {getButtonText()}
      </button>
      
      {paymentConfig && (
        <div className="payment-info">
          <small>
            Payment via {paymentConfig.providerConfig.name} • 
            {paymentConfig.product.name} • 
            ${(paymentConfig.product.price / 100).toFixed(2)}
          </small>
        </div>
      )}
      
      <style jsx>{`
        .buy-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .buy-button {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border: none;
          color: white;
          padding: 15px 40px;
          font-size: 1.3rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Orbitron', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 250px;
        }
        
        .buy-button.enabled:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
        }
        
        .buy-button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .buy-button.loading {
          opacity: 0.8;
          cursor: wait;
        }
        
        .payment-info {
          text-align: center;
          opacity: 0.8;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}