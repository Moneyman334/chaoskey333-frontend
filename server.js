require("dotenv").config();
const express = require('express');
const path = require('path');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('🔑 Checking Stripe API keys...');
  console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
  console.log('Secret key exists:', !!STRIPE_SECRET_KEY);
} else {
  console.log('⚠️ Stripe API key not configured - payment features disabled');
}

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
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not configured'
      });
    }

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
    if (stripe) {
      const account = await stripe.accounts.retrieve();
      results.stripe = {
        connected: true,
        accountId: account.id,
        currency: account.default_currency
      };
    } else {
      results.stripe = {
        connected: false,
        error: 'Stripe not configured'
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
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured'
      });
    }

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
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

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

    try {
      // Retrieve full session details including customer and line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'customer_details']
      });

      // Process payment and send notifications
      const { processPaymentSuccess } = require('./services/notificationService');
      const result = await processPaymentSuccess(fullSession);

      console.log('🎉 Payment processing completed:', result);
    } catch (error) {
      console.error('❌ Error processing payment success:', error);
      // Don't fail the webhook - payment was successful
    }
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
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured'
      });
    }

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

// Admin routes for viewing and managing notifications
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.get('/admin/sends', async (req, res) => {
  try {
    const { getNotificationRecords } = require('./services/tokenService');
    const { validateNotificationConfig } = require('./services/notificationService');
    
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const records = await getNotificationRecords(limit, offset);
    const config = validateNotificationConfig();

    res.json({
      success: true,
      config,
      records,
      pagination: {
        limit,
        offset,
        count: records.length
      }
    });
  } catch (error) {
    console.error('Admin sends error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin route for resending failed notifications
app.post('/admin/resend/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { getNotificationRecord } = require('./services/tokenService');
    const { resendEmail } = require('./services/emailService');
    const { resendSMS } = require('./services/smsService');
    
    const record = await getNotificationRecord(recordId);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Notification record not found'
      });
    }

    let result;
    if (record.type === 'email') {
      result = await resendEmail(recordId);
    } else if (record.type === 'sms') {
      result = await resendSMS(recordId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unknown notification type'
      });
    }

    res.json({
      success: true,
      type: record.type,
      result
    });
  } catch (error) {
    console.error('Admin resend error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mint endpoint for processing claim tokens
app.get('/mint', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Invalid Mint Link</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Invalid Mint Link</h1>
          <p>This mint link is missing required parameters.</p>
        </body>
        </html>
      `);
    }

    // Demo token for showcase
    if (token === 'demo-token-123') {
      const demoData = {
        walletAddress: '0x1234567890123456789012345678901234567890',
        productName: 'Demo ChaosKey333 Relic',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      // Serve mint page with demo data
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mint Your ${demoData.productName}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              max-width: 500px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 20px;
              background: linear-gradient(45deg, #ff6b6b, #ffd93d);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .product-name {
              font-size: 24px;
              margin-bottom: 30px;
              color: #ffd93d;
            }
            .wallet-info {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .mint-button {
              background: linear-gradient(45deg, #ff6b6b, #ffd93d);
              color: #000;
              padding: 15px 40px;
              border: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0;
              transition: transform 0.2s ease;
            }
            .mint-button:hover {
              transform: translateY(-2px);
            }
            .expires {
              font-size: 14px;
              color: #ffd93d;
              margin-top: 20px;
            }
            .demo-note {
              background: rgba(255, 217, 61, 0.2);
              border: 1px solid #ffd93d;
              border-radius: 10px;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡️ ChaosKey333</div>
            <div class="product-name">${demoData.productName}</div>
            
            <div class="demo-note">
              🎭 <strong>Demo Mode</strong><br>
              This is a demonstration of the mint page interface.
            </div>
            
            <div class="wallet-info">
              <div><strong>Wallet Address:</strong></div>
              <div style="font-family: monospace; word-break: break-all; margin-top: 10px;">
                ${demoData.walletAddress}
              </div>
            </div>
            
            <button class="mint-button" onclick="mintRelic()">
              🔥 Mint to Vault Now
            </button>
            
            <div class="expires">
              ⏰ This link expires in ${Math.ceil((demoData.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
            </div>
          </div>
          
          <script>
            async function mintRelic() {
              const button = document.querySelector('.mint-button');
              const originalText = button.innerHTML;
              
              button.innerHTML = '⏳ Minting...';
              button.disabled = true;
              
              try {
                // Simulate minting process
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                button.innerHTML = '✅ Minted Successfully!';
                button.style.background = 'linear-gradient(45deg, #6bcf7f, #4d79ff)';
                setTimeout(() => {
                  alert('🎉 Your relic has been minted to your vault! Check your wallet.');
                }, 500);
              } catch (error) {
                console.error('Mint error:', error);
                button.innerHTML = '❌ Mint Failed';
                button.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
                alert('Minting failed: ' + error.message);
                
                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.disabled = false;
                  button.style.background = 'linear-gradient(45deg, #ff6b6b, #ffd93d)';
                }, 3000);
              }
            }
          </script>
        </body>
        </html>
      `);
      return;
    }

    const { validateClaimToken } = require('./services/tokenService');
    const tokenData = await validateClaimToken(token);
    
    if (!tokenData) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Expired Mint Link</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>⏰ Mint Link Expired</h1>
          <p>This mint link has expired or is invalid.</p>
          <p>Please check your email for a new link or contact support.</p>
        </body>
        </html>
      `);
    }

    // Serve mint page with token data
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mint Your ${tokenData.productName}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .product-name {
            font-size: 24px;
            margin-bottom: 30px;
            color: #ffd93d;
          }
          .wallet-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          }
          .mint-button {
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            color: #000;
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            cursor: pointer;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .mint-button:hover {
            transform: translateY(-2px);
          }
          .expires {
            font-size: 14px;
            color: #ffd93d;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡️ ChaosKey333</div>
          <div class="product-name">${tokenData.productName}</div>
          
          <div class="wallet-info">
            <div><strong>Wallet Address:</strong></div>
            <div style="font-family: monospace; word-break: break-all; margin-top: 10px;">
              ${tokenData.walletAddress}
            </div>
          </div>
          
          <button class="mint-button" onclick="mintRelic()">
            🔥 Mint to Vault Now
          </button>
          
          <div class="expires">
            ⏰ This link expires in ${Math.ceil((tokenData.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
          </div>
        </div>
        
        <script>
          async function mintRelic() {
            const button = document.querySelector('.mint-button');
            const originalText = button.innerHTML;
            
            button.innerHTML = '⏳ Minting...';
            button.disabled = true;
            
            try {
              const response = await fetch('/api/mint', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  token: '${token}'
                })
              });
              
              const result = await response.json();
              
              if (result.success) {
                button.innerHTML = '✅ Minted Successfully!';
                button.style.background = 'linear-gradient(45deg, #6bcf7f, #4d79ff)';
                setTimeout(() => {
                  alert('🎉 Your relic has been minted to your vault! Check your wallet.');
                }, 500);
              } else {
                throw new Error(result.error || 'Minting failed');
              }
            } catch (error) {
              console.error('Mint error:', error);
              button.innerHTML = '❌ Mint Failed';
              button.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
              alert('Minting failed: ' + error.message);
              
              setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                button.style.background = 'linear-gradient(45deg, #ff6b6b, #ffd93d)';
              }, 3000);
            }
          }
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Mint page error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Server Error</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>🚨 Server Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </body>
      </html>
    `);
  }
});

// API endpoint for processing mint requests
app.post('/api/mint', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const { validateClaimToken, markTokenAsUsed } = require('./services/tokenService');
    
    // Validate token
    const tokenData = await validateClaimToken(token);
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Mark token as used
    const marked = await markTokenAsUsed(token);
    if (!marked) {
      return res.status(400).json({
        success: false,
        error: 'Token has already been used'
      });
    }

    // Here you would integrate with your minting contract
    // For now, we'll simulate the minting process
    console.log(`🎯 Minting ${tokenData.productName} to wallet: ${tokenData.walletAddress}`);
    
    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: 'Relic minted successfully',
      walletAddress: tokenData.walletAddress,
      productName: tokenData.productName
    });

  } catch (error) {
    console.error('Mint API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test notification endpoint for development
app.post('/api/test-notification', async (req, res) => {
  try {
    const { sendNotifications } = require('./services/notificationService');
    
    const testData = {
      walletAddress: '0x1234567890123456789012345678901234567890',
      email: 'test@example.com',
      phone: '+1234567890',
      productName: 'Test ChaosKey333 Relic',
      sessionId: 'test_session_' + Date.now(),
      checkoutMetadata: {
        language: req.body.language || 'en'
      }
    };

    const result = await sendNotifications(testData);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});