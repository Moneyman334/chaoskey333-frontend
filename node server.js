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
run = "node server.js"
