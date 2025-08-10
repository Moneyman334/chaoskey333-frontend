require("dotenv").config();
const express = require('express');
const path = require('path');
const PaymentFactory = require('./lib/payments/PaymentFactory');

// Load environment variables
const PAYMENTS_PROVIDER = process.env.PAYMENTS_PROVIDER || 'coinbase';
const PRODUCT_NAME = process.env.PRODUCT_NAME || 'Superman Unstoppable Relic';
const PRODUCT_DESCRIPTION = process.env.PRODUCT_DESCRIPTION || 'Exclusive digital collectible relic';
const PRODUCT_PRICE = parseInt(process.env.PRODUCT_PRICE) || 3333;

// Initialize payment provider
let paymentProvider;
try {
  paymentProvider = PaymentFactory.createProvider(PAYMENTS_PROVIDER, process.env);
  console.log(`🔑 Payment provider initialized: ${PAYMENTS_PROVIDER.toUpperCase()}`);
} catch (error) {
  console.error(`❌ Failed to initialize payment provider: ${error.message}`);
  process.exit(1);
}

// Legacy Stripe setup for backward compatibility
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve store pages
app.get('/store', (req, res) => {
  res.sendFile(path.join(__dirname, 'store', 'index.html'));
});

app.get('/store/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'store', 'success.html'));
});

app.get('/store/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'store', 'cancel.html'));
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
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
    environment: {
      publicKey: !!process.env.STRIPE_PUBLIC_KEY,
      secretKey: !!process.env.STRIPE_SECRET_KEY,
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

  console.log('🔄 Full system test results:', results);
  res.json(results);
});

// Unified checkout API - supports all payment providers
app.post('/api/checkout/start', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || PRODUCT_PRICE;
    const currency = req.body.currency || 'usd';
    const productName = req.body.productName || PRODUCT_NAME;

    console.log(`🔄 Creating ${PAYMENTS_PROVIDER} checkout session for wallet:`, walletAddress);

    const baseUrl = req.headers.origin || `http://localhost:${PORT}`;
    const orderData = {
      amount,
      currency,
      productName,
      productDescription: PRODUCT_DESCRIPTION,
      walletAddress,
      connectedWalletType,
      successUrl: `${baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}&provider=${PAYMENTS_PROVIDER}`,
      cancelUrl: `${baseUrl}/store/cancel?provider=${PAYMENTS_PROVIDER}`
    };

    const result = await paymentProvider.createCheckoutSession(orderData);

    console.log(`✅ ${PAYMENTS_PROVIDER} checkout session created:`, result.sessionId);
    res.json({
      success: true,
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
      provider: result.provider
    });

  } catch (error) {
    console.error(`❌ Error creating ${PAYMENTS_PROVIDER} checkout session:`, error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      provider: PAYMENTS_PROVIDER
    });
  }
});

// Legacy Stripe checkout endpoint for backward compatibility
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 1000;
    const currency = req.body.currency || 'usd';
    const productName = req.body.productName || 'ChaosKey333 Relic';

    console.log('🔄 Creating legacy Stripe checkout session for wallet:', walletAddress);

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

    console.log('✅ Legacy Stripe checkout session created:', session.id);
    res.json({ sessionId: session.id });

  } catch (error) {
    console.error('❌ Error creating legacy Stripe checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unified webhook handler for all payment providers
app.post('/api/webhook/:provider', express.raw({ type: 'application/json' }), async (req, res) => {
  const providerType = req.params.provider;
  const payload = req.body;
  
  try {
    // Get the appropriate signature header based on provider
    let signature;
    switch (providerType) {
      case 'stripe':
        signature = req.headers['stripe-signature'];
        break;
      case 'coinbase':
        signature = req.headers['x-cc-webhook-signature'];
        break;
      case 'paypal':
        signature = req.headers['paypal-transmission-sig'];
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    // Initialize the specific provider for webhook verification
    const webhookProvider = PaymentFactory.createProvider(providerType, process.env);
    
    // Verify webhook signature
    const event = await webhookProvider.verifyWebhook(payload, signature);
    
    // Handle payment success
    const paymentResult = await webhookProvider.handlePaymentSuccess({ event });
    
    if (paymentResult) {
      console.log(`💰 Payment successful via ${providerType}:`, paymentResult.walletAddress);
      console.log('🧿 Ready to mint relic to vault...');
      
      // Here you would typically:
      // 1. Generate a signed claim token for the user
      // 2. Store the payment record in database
      // 3. Trigger the minting process
      
      // For now, we'll create a simple claim token
      const claimToken = generateClaimToken(paymentResult);
      console.log('🎟️ Claim token generated:', claimToken);
      
      // You could store this claim token in a database or send it via webhook to your minting service
      console.log(`🎉 Relic minting process initiated for: ${paymentResult.walletAddress}`);
    }

    res.json({ received: true, provider: providerType });

  } catch (error) {
    console.error(`❌ ${providerType} webhook error:`, error.message);
    res.status(400).json({ error: error.message });
  }
});

// Stripe webhook for backward compatibility 
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Legacy webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Legacy payment successful for wallet:', session.metadata.walletAddress);
    console.log('🧿 Ready to mint relic to vault...');

    console.log('🎉 Legacy relic minting process initiated for:', session.metadata.walletAddress);
  }

  res.json({ received: true });
});

// Helper function to generate claim tokens
function generateClaimToken(paymentResult) {
  const crypto = require('crypto');
  const tokenData = {
    walletAddress: paymentResult.walletAddress,
    paymentId: paymentResult.paymentId,
    provider: paymentResult.provider,
    amount: paymentResult.amount,
    timestamp: Date.now(),
    productName: PRODUCT_NAME
  };
  
  // In production, you should sign this with a private key
  const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
  return token;
}

// Get current payment provider configuration
app.get('/api/payment-config', (req, res) => {
  const providerConfig = PaymentFactory.getProviderConfig(PAYMENTS_PROVIDER);
  
  res.json({
    currentProvider: PAYMENTS_PROVIDER,
    providerConfig: providerConfig,
    product: {
      name: PRODUCT_NAME,
      description: PRODUCT_DESCRIPTION,
      price: PRODUCT_PRICE,
      currency: 'usd'
    },
    publicKeys: {
      stripe: process.env.STRIPE_PUBLIC_KEY || null,
      // Add other provider public keys as needed
    }
  });
});

// Config endpoint to provide Stripe public key (legacy)
app.get('/config', (req, res) => {
  console.log('🔑 Legacy config endpoint called...');

  if (!process.env.STRIPE_PUBLIC_KEY) {
    console.error('❌ STRIPE_PUBLIC_KEY not found in environment variables');
    return res.status(500).json({ error: 'Stripe public key not configured' });
  }

  res.json({
    publicKey: process.env.STRIPE_PUBLIC_KEY
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