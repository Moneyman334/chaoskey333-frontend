require("dotenv").config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_WEBHOOK_SHARED_SECRET = process.env.COINBASE_WEBHOOK_SHARED_SECRET;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

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

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 1000; // Default to $10.00 if amount is not provided
    const currency = req.body.currency || 'usd'; // Default currency
    const productName = req.body.productName || 'ChaosKey333 Relic'; // Default product name

    console.log('🔄 Creating checkout session for wallet:', walletAddress);

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

// Create Coinbase Commerce charge
app.post('/api/create-coinbase-charge', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || '33.33'; // Default amount
    const currency = req.body.currency || 'USD'; // Default currency
    const productName = req.body.productName || 'ChaosKey333 Relic'; // Default product name

    if (!COINBASE_API_KEY) {
      return res.status(500).json({ error: 'Coinbase API key not configured' });
    }

    console.log('🔄 Creating Coinbase Commerce charge for wallet:', walletAddress);

    // Create charge using Coinbase Commerce API
    const chargeData = {
      name: productName,
      description: `Frankenstein Vault Relic for ${connectedWalletType} wallet: ${walletAddress}`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount,
        currency: currency
      },
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType
      },
      redirect_url: `${req.headers.origin}/?payment=success`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`
    };

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(chargeData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Coinbase Commerce API error:', errorData);
      return res.status(response.status).json({ error: errorData.error || 'Failed to create charge' });
    }

    const charge = await response.json();
    console.log('✅ Coinbase Commerce charge created:', charge.data.code);
    
    res.json({ 
      chargeId: charge.data.id,
      chargeCode: charge.data.code,
      hostedUrl: charge.data.hosted_url,
      checkoutUrl: charge.data.hosted_url
    });

  } catch (error) {
    console.error('❌ Error creating Coinbase Commerce charge:', error);
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

// Coinbase Commerce webhook to handle successful payments
app.post('/api/webhooks/coinbase', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  
  if (!COINBASE_WEBHOOK_SHARED_SECRET) {
    console.error('❌ COINBASE_WEBHOOK_SHARED_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  try {
    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', COINBASE_WEBHOOK_SHARED_SECRET)
      .update(req.body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('❌ Coinbase webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    console.log('📨 Coinbase webhook received:', event.type);

    // Handle charge:confirmed events
    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      
      console.log('💰 Coinbase Commerce payment confirmed!');
      console.log('🆔 Charge Code:', charge.code);
      console.log('💰 Amount:', charge.pricing.local.amount, charge.pricing.local.currency);
      
      // Extract wallet address from metadata
      if (charge.metadata && charge.metadata.walletAddress) {
        console.log('👛 Wallet Address:', charge.metadata.walletAddress);
        console.log('🧿 Ready to mint relic to vault...');
        
        // TODO: Implement claim token creation or mint request enqueueing
        // This is where you would:
        // 1. Create a claim token for the confirmed charge
        // 2. Enqueue a mint request to mint NFT to the wallet
        // 3. Store the transaction in your database
        // 4. Send confirmation notification
        
        console.log('🎉 Relic minting process initiated for:', charge.metadata.walletAddress);
        console.log('💳 Charge confirmed, creating claim token...');
        
        // Stub implementation for claim token creation
        const claimToken = {
          chargeCode: charge.code,
          walletAddress: charge.metadata.walletAddress,
          amount: charge.pricing.local.amount,
          currency: charge.pricing.local.currency,
          timestamp: new Date().toISOString(),
          status: 'pending_mint'
        };
        
        console.log('🎫 Claim token created:', claimToken);
        
      } else {
        console.warn('⚠️ No wallet address found in charge metadata');
      }
    } else {
      console.log('ℹ️ Unhandled Coinbase webhook event type:', event.type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Error processing Coinbase webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Config endpoint to provide Stripe public key
app.get('/config', (req, res) => {
  console.log('🔑 Checking Stripe API keys...');
  console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
  console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

  if (!STRIPE_PUBLIC_KEY) {
    console.error('❌ STRIPE_PUBLIC_KEY not found in environment variables');
    return res.status(500).json({ error: 'Stripe public key not configured' });
  }

  res.json({
    publicKey: STRIPE_PUBLIC_KEY
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