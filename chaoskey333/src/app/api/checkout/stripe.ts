import Stripe from "stripe";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripe;
}

interface CheckoutParams {
  amount?: number;
  priceId?: string;
  description?: string;
}

export async function handleStripeCheckout({ amount, priceId, description }: CheckoutParams) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not configured");
  }

  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Failed to initialize Stripe");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (priceId) {
      // Use existing Stripe Price ID
      sessionParams = {
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      };
    } else if (amount) {
      // Create checkout session with direct amount
      sessionParams = {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: description || "Purchase",
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      };
    } else {
      throw new Error("Either amount or priceId must be provided for Stripe checkout");
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      url: session.url,
      sessionId: session.id,
      provider: "stripe",
    };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw new Error(`Stripe checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}