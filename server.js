require("dotenv").config();
const express = require('express');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize JSON schema validator
const ajv = new Ajv();
addFormats(ajv); // Add date-time format support

// Health response JSON schema
const healthSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["healthy", "unhealthy"] },
    timestamp: { type: "string", format: "date-time" },
    uptime: {
      type: "object",
      properties: {
        seconds: { type: "number", minimum: 0 },
        human: { type: "string" }
      },
      required: ["seconds", "human"]
    },
    version: { type: "string" },
    service: { type: "string" },
    message: { type: "string" }
  },
  required: ["status", "timestamp", "uptime", "version", "service", "message"]
};

const validateHealthResponse = ajv.compile(healthSchema);

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

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

// 🧪 Enhanced health check endpoint with JSON schema, timestamp, and uptime
app.get("/health", (req, res) => {
  const startTime = process.hrtime.bigint();
  const uptimeSeconds = process.uptime();
  const currentTimestamp = new Date().toISOString();
  
  const healthResponse = {
    status: "healthy",
    timestamp: currentTimestamp,
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      human: formatUptime(uptimeSeconds)
    },
    version: "1.0.0",
    service: "chaoskey333-frontend",
    message: "✅ Server is alive and kickin'"
  };

  // Validate response against schema
  const isValid = validateHealthResponse(healthResponse);
  if (!isValid) {
    console.error('Health response validation failed:', validateHealthResponse.errors);
    return res.status(500).json({
      status: "unhealthy",
      error: "Response validation failed",
      timestamp: currentTimestamp
    });
  }

  res.json(healthResponse);
});

// Helper function to format uptime in human readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

// Helper function to mask sensitive environment variables
function maskSensitiveEnvVars(envVars) {
  const sensitiveKeywords = [
    'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'PASS', 'API', 'AUTH', 
    'PRIVATE', 'CREDENTIAL', 'CERT', 'WEBHOOK', 'ENDPOINT'
  ];
  
  const maskedEnv = {};
  
  for (const [key, value] of Object.entries(envVars)) {
    const upperKey = key.toUpperCase();
    const isSensitive = sensitiveKeywords.some(keyword => upperKey.includes(keyword));
    
    if (isSensitive && value) {
      // Mask sensitive values, showing only first 4 and last 4 characters
      if (value.length > 8) {
        maskedEnv[key] = `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
      } else {
        maskedEnv[key] = '****';
      }
    } else {
      maskedEnv[key] = value;
    }
  }
  
  return maskedEnv;
}

// 🔐 Debug endpoint for environment variables - REQUIRES AUTHENTICATION
app.get("/debug/env", (req, res) => {
  // Check for admin authentication
  const adminToken = process.env.VAULT_ADMIN_TOKEN || 'vault-admin-debug-token-2024';
  const providedToken = req.headers.authorization?.replace('Bearer ', '') || 
                       req.headers['x-admin-token'] || 
                       req.query.token;
  
  if (!providedToken || providedToken !== adminToken) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid admin token required for environment debug access",
      hint: "Provide token via Authorization header (Bearer <token>), X-Admin-Token header, or ?token=<token> query parameter"
    });
  }

  // Return masked environment variables
  const maskedEnv = maskSensitiveEnvVars(process.env);
  
  const debugResponse = {
    timestamp: new Date().toISOString(),
    service: "chaoskey333-frontend",
    environment: maskedEnv,
    note: "Sensitive values are masked for security",
    count: Object.keys(maskedEnv).length
  };

  res.json(debugResponse);
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