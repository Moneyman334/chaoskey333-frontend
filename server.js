require("dotenv").config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_CLIENT_SECRET';

// Initialize Stripe only if we have valid keys
let stripe = null;
if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
}

// Simple in-memory claim token storage (in production, use a database)
const claimTokens = new Map();

console.log('🔑 Checking API keys...');
console.log('Stripe Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Stripe Secret key exists:', !!STRIPE_SECRET_KEY);
console.log('PayPal Client ID exists:', !!PAYPAL_CLIENT_ID);
console.log('PayPal Client Secret exists:', !!PAYPAL_CLIENT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve store success page
app.get('/store/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'store', 'success.html'));
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    console.log('🧪 Testing Stripe connection...');

    if (!stripe) {
      throw new Error('Stripe not initialized - missing API keys');
    }

    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve();

    console.log('✅ Stripe connection successful');
    console.log('Account ID:', account.id);
    console.log('Default currency:', account.default_currency);

    res.json({
      success: true,
      accountId: account.id,
      currency: account.default_currency,
      message: 'Stripe connection successful'
    });

  } catch (error) {
    console.error('❌ Stripe connection test failed:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Stripe connection failed'
    });
  }
});

// Comprehensive test endpoint for all connections
app.get('/api/test-all', async (req, res) => {
  const results = {
    server: { status: 'running', timestamp: new Date().toISOString() },
    stripe: { connected: false, error: null },
    environment: {
      publicKey: !!process.env.STRIPE_PUBLIC_KEY,
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      port: PORT
    }
  };

  // Test Stripe
  try {
    if (!stripe) {
      results.stripe = {
        connected: false,
        error: 'Stripe not initialized - missing API keys'
      };
    } else {
      const account = await stripe.accounts.retrieve();
      results.stripe = {
        connected: true,
        accountId: account.id,
        currency: account.default_currency
      };
    }
  } catch (error) {
    results.stripe = {
      connected: false,
      error: error.message
    };
  }

  console.log('🔄 Full system test results:', results);
  res.json(results);
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 1000; // Default to $10.00 if amount is not provided
    const currency = req.body.currency || 'usd'; // Default currency
    const productName = req.body.productName || 'ChaosKey333 Relic'; // Default product name

    console.log('🔄 Creating checkout session for wallet:', walletAddress);

    if (!stripe) {
      throw new Error('Stripe not initialized - missing API keys');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: `Frankenstein Vault Relic for ${connectedWalletType} wallet: ${walletAddress}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    res.json({ sessionId: session.id });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook to handle successful payments
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Payment successful for wallet:', session.metadata.walletAddress);
    console.log('🧿 Ready to mint relic to vault...');

    // Here you would typically:
    // 1. Mint the NFT to the user's wallet
    // 2. Store the transaction in your database
    // 3. Send confirmation email

    // For now, we'll just log it
    console.log('🎉 Relic minting process initiated for:', session.metadata.walletAddress);
  }

  res.json({ received: true });
});

// PayPal capture endpoint
app.post('/api/paypal-capture', async (req, res) => {
  try {
    const { orderID, walletAddress, connectedWalletType, paymentDetails } = req.body;
    
    console.log('💰 PayPal capture received for wallet:', walletAddress);
    console.log('💳 Order ID:', orderID);
    
    // Generate secure claim token
    const claimToken = crypto.randomBytes(32).toString('hex');
    const timestamp = new Date().toISOString();
    
    // Store claim token with metadata
    claimTokens.set(claimToken, {
      walletAddress,
      connectedWalletType,
      orderID,
      paymentDetails,
      timestamp,
      used: false,
      paymentProvider: 'paypal'
    });
    
    console.log('✅ Claim token generated:', claimToken);
    console.log('🎯 Ready to mint relic to vault...');
    
    res.json({
      success: true,
      claimToken,
      message: 'PayPal payment captured successfully'
    });
    
  } catch (error) {
    console.error('❌ PayPal capture error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PayPal webhook endpoint (for PAYMENT.CAPTURE.COMPLETED events)
app.post('/api/paypal-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    
    console.log('🔔 PayPal webhook received:', event.event_type);
    
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const payerInfo = resource.payer || {};
      
      console.log('💰 Payment capture completed for payer:', payerInfo.payer_id);
      
      // Generate claim token for webhook-triggered payments
      const claimToken = crypto.randomBytes(32).toString('hex');
      const timestamp = new Date().toISOString();
      
      claimTokens.set(claimToken, {
        payerID: payerInfo.payer_id,
        transactionID: resource.id,
        amount: resource.amount,
        timestamp,
        used: false,
        paymentProvider: 'paypal',
        source: 'webhook'
      });
      
      console.log('🎫 Webhook claim token generated:', claimToken);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Validate claim token endpoint
app.post('/api/validate-claim-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('🔍 Validating claim token:', token ? token.slice(0, 8) + '...' : 'none');
    
    if (!token) {
      return res.json({ valid: false, error: 'No token provided' });
    }
    
    const tokenData = claimTokens.get(token);
    
    if (!tokenData) {
      return res.json({ valid: false, error: 'Token not found or expired' });
    }
    
    res.json({
      valid: true,
      used: tokenData.used,
      data: {
        paymentProvider: tokenData.paymentProvider,
        timestamp: tokenData.timestamp,
        walletAddress: tokenData.walletAddress
      }
    });
    
  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(500).json({ valid: false, error: error.message });
  }
});

// Mint with claim token endpoint
app.post('/api/mint-with-token', async (req, res) => {
  try {
    const { token, walletAddress } = req.body;
    
    console.log('⚙️ Processing mint with token for wallet:', walletAddress);
    
    if (!token || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and wallet address required' 
      });
    }
    
    const tokenData = claimTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    if (tokenData.used) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token has already been used' 
      });
    }
    
    // Mark token as used
    tokenData.used = true;
    tokenData.mintedTo = walletAddress;
    tokenData.mintTimestamp = new Date().toISOString();
    claimTokens.set(token, tokenData);
    
    console.log('✅ Claim token marked as used');
    console.log('🎉 Vault relic minting process completed for:', walletAddress);
    
    // Here you would typically:
    // 1. Call your smart contract to mint the NFT
    // 2. Store the transaction in your database
    // 3. Send confirmation notifications
    
    res.json({
      success: true,
      message: 'Relic minted successfully',
      walletAddress: walletAddress,
      mintTimestamp: tokenData.mintTimestamp
    });
    
  } catch (error) {
    console.error('❌ Mint processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Config endpoint to provide API keys
app.get('/config', (req, res) => {
  console.log('🔑 Checking API keys...');
  console.log('Stripe Public key exists:', !!STRIPE_PUBLIC_KEY);
  console.log('Stripe Secret key exists:', !!STRIPE_SECRET_KEY);
  console.log('PayPal Client ID exists:', !!PAYPAL_CLIENT_ID);

  if (!STRIPE_PUBLIC_KEY) {
    console.error('❌ STRIPE_PUBLIC_KEY not found in environment variables');
    return res.status(500).json({ error: 'Stripe public key not configured' });
  }

  res.json({
    publicKey: STRIPE_PUBLIC_KEY,
    paypalClientId: PAYPAL_CLIENT_ID
  });
});

const cors = require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// 🧪 Test route to check server
app.get("/health", (req, res) => {
  res.send("✅ Server is alive and kickin'");
});

// 🔐 Stripe checkout endpoint (test)
app.post("/create-checkout-session2", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ChaosKey333 Relic Mint",
              description: "Unlock your VIP relic drop 🔐",
            },
            unit_amount: 33300,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://chaoskey333.web.app/vault?success=true",
      cancel_url: "https://chaoskey333.web.app/vault?canceled=true",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).send("Something went wrong");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
});