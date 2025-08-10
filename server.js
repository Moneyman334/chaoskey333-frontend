require("dotenv").config();
const express = require('express');
const path = require('path');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

// Initialize Stripe only if keys are provided
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ Stripe keys not provided - Stripe functionality disabled');
}

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
  if (!stripe) {
    return res.status(400).json({
      success: false,
      error: 'Stripe not configured',
      message: 'Stripe API keys not provided'
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
    environment: {
      publicKey: !!process.env.STRIPE_PUBLIC_KEY,
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      port: PORT
    }
  };

  // Test Stripe
  if (stripe) {
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
  } else {
    results.stripe = {
      connected: false,
      error: 'Stripe not configured'
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

// ⚡ NEW API ENDPOINTS FOR RELIC EVOLUTION & DECODE FEATURES ⚡

// Middleware to check admin token
const checkAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const adminToken = process.env.TEMP_ADMIN_TOKEN || 'temp-admin-token';
  
  if (!token || token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }
  
  next();
};

// 🧬 Relic Evolution Hook - Triggers evolution pipeline
app.post('/api/evolution/trigger', checkAdminToken, async (req, res) => {
  try {
    const { walletAddress, decodeData } = req.body;
    
    console.log('🧬 Evolution triggered for wallet:', walletAddress);
    console.log('📊 Decode data:', decodeData);
    
    // In a real implementation, this would:
    // 1. Validate decode completion
    // 2. Trigger evolution pipeline (PR #24 integration)
    // 3. Queue render jobs
    // 4. Update relic metadata
    
    // For now, simulate evolution process
    const evolutionId = `evo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate async evolution process
    setTimeout(async () => {
      console.log(`🎯 Evolution ${evolutionId} completed for ${walletAddress}`);
      
      // Trigger render queue
      try {
        await fetch(`http://localhost:${PORT}/api/render/queue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEMP_ADMIN_TOKEN || 'temp-admin-token'}`
          },
          body: JSON.stringify({
            evolutionId,
            walletAddress,
            formats: ['mp4', 'webm', 'gif'],
            includeOgImage: true
          })
        });
      } catch (error) {
        console.error('❌ Error queuing render jobs:', error);
      }
    }, 3000);
    
    res.json({
      success: true,
      evolutionId,
      message: 'Evolution pipeline initiated',
      estimatedCompletion: new Date(Date.now() + 30000).toISOString()
    });
    
  } catch (error) {
    console.error('❌ Evolution trigger error:', error);
    res.status(500).json({ error: 'Evolution trigger failed' });
  }
});

// 🎬 Render Queue API - Queues render jobs for evolved relic assets
app.post('/api/render/queue', checkAdminToken, async (req, res) => {
  try {
    const { evolutionId, walletAddress, formats = ['mp4'], includeOgImage = false } = req.body;
    
    console.log('🎬 Render job queued:', { evolutionId, walletAddress, formats, includeOgImage });
    
    // Generate job IDs for each format
    const jobs = formats.map(format => ({
      jobId: `render_${format}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      format,
      status: 'queued',
      evolutionId,
      walletAddress,
      queuedAt: new Date().toISOString()
    }));
    
    // Add OG image job if requested
    if (includeOgImage) {
      jobs.push({
        jobId: `render_og_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        format: 'og-image',
        status: 'queued',
        evolutionId,
        walletAddress,
        queuedAt: new Date().toISOString()
      });
    }
    
    // In a real implementation, this would:
    // 1. Add jobs to a proper queue (Redis, Bull, etc.)
    // 2. Start background processing
    // 3. Store job metadata in database
    
    // Simulate job processing
    jobs.forEach((job, index) => {
      setTimeout(() => {
        console.log(`✅ Render job ${job.jobId} completed`);
        
        // Trigger NFT refresh after render completion
        if (index === jobs.length - 1) { // Last job
          setTimeout(async () => {
            try {
              await fetch(`http://localhost:${PORT}/api/nft/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.TEMP_ADMIN_TOKEN || 'temp-admin-token'}`
                },
                body: JSON.stringify({
                  walletAddress,
                  evolutionId
                })
              });
            } catch (error) {
              console.error('❌ Error triggering NFT refresh:', error);
            }
          }, 2000);
        }
      }, (index + 1) * 5000); // Stagger job completion
    });
    
    res.json({
      success: true,
      message: 'Render jobs queued successfully',
      jobs: jobs.map(job => ({
        jobId: job.jobId,
        format: job.format,
        status: job.status,
        estimatedCompletion: new Date(Date.now() + ((jobs.indexOf(job) + 1) * 5000)).toISOString()
      }))
    });
    
  } catch (error) {
    console.error('❌ Render queue error:', error);
    res.status(500).json({ error: 'Render queue failed' });
  }
});

// 🔄 NFT Refresh API - Triggers metadata refresh on marketplaces
app.post('/api/nft/refresh', checkAdminToken, async (req, res) => {
  try {
    const { walletAddress, evolutionId, tokenId } = req.body;
    
    console.log('🔄 NFT refresh triggered:', { walletAddress, evolutionId, tokenId });
    
    const refreshResults = [];
    
    // OpenSea refresh (if API key provided)
    if (process.env.OPENSEA_API_KEY) {
      try {
        console.log('🌊 Refreshing NFT metadata on OpenSea...');
        // In real implementation, make actual OpenSea API call
        // const openseaResponse = await fetch(`https://api.opensea.io/v1/asset/${contractAddress}/${tokenId}/?force_update=true`, {
        //   headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY }
        // });
        
        refreshResults.push({
          marketplace: 'OpenSea',
          status: 'success',
          message: 'Metadata refresh requested'
        });
      } catch (error) {
        console.error('❌ OpenSea refresh error:', error);
        refreshResults.push({
          marketplace: 'OpenSea',
          status: 'error',
          message: error.message
        });
      }
    } else {
      refreshResults.push({
        marketplace: 'OpenSea',
        status: 'skipped',
        message: 'No API key provided'
      });
    }
    
    // Reservoir refresh (if API key provided)
    if (process.env.RESERVOIR_API_KEY) {
      try {
        console.log('💧 Refreshing NFT metadata on Reservoir...');
        // In real implementation, make actual Reservoir API call
        // const reservoirResponse = await fetch('https://api.reservoir.tools/tokens/refresh/v1', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'x-api-key': process.env.RESERVOIR_API_KEY
        //   },
        //   body: JSON.stringify({ token: `${contractAddress}:${tokenId}` })
        // });
        
        refreshResults.push({
          marketplace: 'Reservoir',
          status: 'success',
          message: 'Metadata refresh requested'
        });
      } catch (error) {
        console.error('❌ Reservoir refresh error:', error);
        refreshResults.push({
          marketplace: 'Reservoir',
          status: 'error',
          message: error.message
        });
      }
    } else {
      refreshResults.push({
        marketplace: 'Reservoir',
        status: 'skipped',
        message: 'No API key provided'
      });
    }
    
    res.json({
      success: true,
      message: 'NFT metadata refresh initiated',
      walletAddress,
      evolutionId,
      refreshResults
    });
    
  } catch (error) {
    console.error('❌ NFT refresh error:', error);
    res.status(500).json({ error: 'NFT refresh failed' });
  }
});

// 📊 Status endpoint to check API health
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    apis: {
      evolution: 'ready',
      render: 'ready',
      nft_refresh: 'ready'
    },
    environment: {
      admin_token_configured: !!process.env.TEMP_ADMIN_TOKEN,
      opensea_api_configured: !!process.env.OPENSEA_API_KEY,
      reservoir_api_configured: !!process.env.RESERVOIR_API_KEY
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
  console.log(`🧬 Evolution API endpoints ready`);
  console.log(`🎬 Render queue API ready`);
  console.log(`🔄 NFT refresh API ready`);
});