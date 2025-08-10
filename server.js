require("dotenv").config();
const express = require('express');
const path = require('path');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // sandbox or live

// Initialize Stripe only if credentials are available
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ Stripe credentials not found. Stripe functionality disabled.');
}

// Initialize PayPal only if credentials are available
let paypalClient = null;
if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  try {
    const { Client } = require('@paypal/paypal-server-sdk');
    paypalClient = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      environment: PAYPAL_ENVIRONMENT === 'live' ? 'production' : 'sandbox',
    });
  } catch (error) {
    console.warn('⚠️ PayPal SDK initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ PayPal credentials not found. PayPal functionality disabled.');
}

console.log('🔑 Checking API keys...');
console.log('Stripe Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Stripe Secret key exists:', !!STRIPE_SECRET_KEY);
console.log('PayPal Client ID exists:', !!PAYPAL_CLIENT_ID);
console.log('PayPal Client Secret exists:', !!PAYPAL_CLIENT_SECRET);
console.log('PayPal Environment:', PAYPAL_ENVIRONMENT);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: 'Stripe not configured',
      message: 'Stripe service not available'
    });
  }
  
  try {
    console.log('🧪 Testing Stripe connection...');

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
    paypal: { connected: false, error: null },
    environment: {
      stripePublicKey: !!process.env.STRIPE_PUBLIC_KEY,
      stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      paypalClientId: !!process.env.PAYPAL_CLIENT_ID,
      paypalClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      paypalEnvironment: PAYPAL_ENVIRONMENT,
      port: PORT
    }
  };

  // Test Stripe
  try {
    const account = await stripe.accounts.retrieve();
    results.stripe = {
      connected: true,
      accountId: account.id,
      currency: account.default_currency
    };
  } catch (error) {
    results.stripe = {
      connected: false,
      error: error.message
    };
  }

  // Test PayPal
  try {
    if (paypalClient) {
      // Test PayPal connection by creating a minimal request
      const testRequest = {
        body: {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: '1.00'
            }
          }]
        }
      };
      
      await paypalClient.orders.create(testRequest);
      results.paypal = {
        connected: true,
        environment: PAYPAL_ENVIRONMENT,
        clientId: PAYPAL_CLIENT_ID?.substring(0, 10) + '...' // Partial ID for security
      };
    } else {
      results.paypal = {
        connected: false,
        error: 'PayPal client not initialized'
      };
    }
  } catch (error) {
    results.paypal = {
      connected: false,
      error: error.message
    };
  }

  console.log('🔄 Full system test results:', results);
  res.json(results);
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe service not available. Please check configuration.' });
  }
  
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 3333; // Default to $33.33 for ChaosKey333 Relic  
    const currency = req.body.currency || 'usd'; // Default currency
    const productName = req.body.productName || 'ChaosKey333 Relic'; // Default product name

    console.log('🔄 Creating Stripe checkout session for wallet:', walletAddress);

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
      success_url: `${req.headers.origin}/?payment=success&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled&gateway=stripe`,
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
        gateway: 'stripe'
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);
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
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Stripe payment successful for wallet:', session.metadata.walletAddress);
    console.log('🧿 Ready to mint relic to vault...');

    // Log to Revenue Pulse Tracker
    logToPulseTracker({
      gateway: 'stripe',
      sessionId: session.id,
      walletAddress: session.metadata.walletAddress,
      connectedWalletType: session.metadata.connectedWalletType,
      amount: (session.amount_total / 100).toString(), // Convert from cents
      currency: session.currency.toUpperCase(),
      timestamp: new Date().toISOString(),
      primeKey: false // Stripe users don't get Prime Vault Key
    });

    // Here you would typically:
    // 1. Mint the NFT to the user's wallet
    // 2. Store the transaction in your database
    // 3. Send confirmation email

    // For now, we'll just log it
    console.log('🎉 Relic minting process initiated for:', session.metadata.walletAddress);
  }

  res.json({ received: true });
});

// Revenue Pulse Tracker for logging transactions
const pulseBroadcastLog = [];

function logToPulseTracker(transactionData) {
  const pulseEntry = {
    id: `pulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...transactionData,
    pulseIntensity: transactionData.gateway === 'paypal_prime' ? 'PRIME_SURGE' : 'STANDARD_PULSE'
  };
  
  pulseBroadcastLog.push(pulseEntry);
  
  console.log('📊 Revenue Pulse Logged:', pulseEntry);
  
  // In a real implementation, this would also broadcast to a dashboard
  // or save to a database for real-time analytics
}

// Get Revenue Pulse Tracker data
app.get('/api/pulse-tracker', (req, res) => {
  const { gateway, limit } = req.query;
  
  let filteredLog = pulseBroadcastLog;
  
  if (gateway) {
    filteredLog = pulseBroadcastLog.filter(entry => entry.gateway === gateway);
  }
  
  if (limit) {
    filteredLog = filteredLog.slice(-parseInt(limit));
  }
  
  const stats = {
    totalTransactions: filteredLog.length,
    primeTransactions: filteredLog.filter(entry => entry.primeKey).length,
    totalRevenue: filteredLog.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
    lastPulse: filteredLog.length > 0 ? filteredLog[filteredLog.length - 1].timestamp : null
  };
  
  res.json({
    stats,
    transactions: filteredLog.reverse() // Most recent first
  });
});

// Config endpoint to provide both Stripe and PayPal public keys
app.get('/config', (req, res) => {
  console.log('🔑 Providing payment gateway configuration...');
  
  if (!STRIPE_PUBLIC_KEY) {
    console.error('❌ STRIPE_PUBLIC_KEY not found in environment variables');
  }
  
  if (!PAYPAL_CLIENT_ID) {
    console.error('❌ PAYPAL_CLIENT_ID not found in environment variables');
  }

  res.json({
    stripe: {
      publicKey: STRIPE_PUBLIC_KEY,
      available: !!STRIPE_PUBLIC_KEY
    },
    paypal: {
      clientId: PAYPAL_CLIENT_ID,
      environment: PAYPAL_ENVIRONMENT,
      available: !!PAYPAL_CLIENT_ID
    }
  });
});

// Create PayPal order endpoint
app.post('/api/paypal/create-order', async (req, res) => {
  if (!paypalClient) {
    return res.status(503).json({ error: 'PayPal service not available. Please check configuration.' });
  }
  
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 33.33; // Default to $33.33 for ChaosKey333 Relic
    const currency = req.body.currency || 'USD';
    const productName = req.body.productName || 'ChaosKey333 Prime Relic';

    console.log('🟡 Creating PayPal order for wallet:', walletAddress);

    const request = {
      body: {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: `${productName} for ${connectedWalletType} wallet: ${walletAddress}`,
          custom_id: `vault_${walletAddress}_${Date.now()}`
        }],
        application_context: {
          return_url: `${req.headers.origin}/?payment=success&gateway=paypal`,
          cancel_url: `${req.headers.origin}/?payment=cancelled&gateway=paypal`,
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW'
        }
      }
    };

    const response = await paypalClient.orders.create(request);
    
    console.log('✅ PayPal order created:', response.result.id);
    
    res.json({
      orderID: response.result.id,
      links: response.result.links
    });

  } catch (error) {
    console.error('❌ Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Capture PayPal order endpoint
app.post('/api/paypal/capture-order', async (req, res) => {
  if (!paypalClient) {
    return res.status(503).json({ error: 'PayPal service not available. Please check configuration.' });
  }
  
  try {
    const { orderID, walletAddress, connectedWalletType } = req.body;

    console.log('🟡 Capturing PayPal order:', orderID);

    const request = {
      id: orderID,
      body: {}
    };

    const response = await paypalClient.orders.capture(request);
    
    if (response.result.status === 'COMPLETED') {
      console.log('💰 PayPal payment successful for wallet:', walletAddress);
      console.log('🎯 Prime Vault Key earned! Ready to mint relic...');

      // Log to Revenue Pulse Tracker
      logToPulseTracker({
        gateway: 'paypal_prime',
        orderID: orderID,
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
        amount: response.result.purchase_units[0].amount.value,
        currency: response.result.purchase_units[0].amount.currency_code,
        timestamp: new Date().toISOString(),
        primeKey: true // Flag for Prime Buyer Badge
      });

      res.json({
        success: true,
        orderID: orderID,
        paymentID: response.result.id,
        primeKey: true, // Indicates user earned Prime Vault Key badge
        autoMint: true // Trigger auto-mint flow
      });
    } else {
      throw new Error('Payment not completed');
    }

  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
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