
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Your Stripe secret key from environment
const path = require('path');

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

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType, amount, currency, productName } = req.body;

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
  const endpointSecret = 'whsec_your_webhook_secret_here'; // Replace with your webhook secret

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
});
const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://chaoskey333.web.app/vault?payment=success",
      cancel_url: "https://chaoskey333.web.app/vault?payment=cancel",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ChaosKey333 Vault Relic Drop",
              description: "Includes poster + NFT relic card",
            },
            unit_amount: 3300, // $33.00
          },
          quantity: 1,
        },
      ],
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe session error:", err.message);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

app.listen(4242, () => console.log("🔥 Stripe server running on port 4242"));
fetch("/create-checkout-session")
