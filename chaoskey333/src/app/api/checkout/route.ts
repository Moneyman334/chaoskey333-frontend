import { NextRequest, NextResponse } from "next/server";
import { handleStripeCheckout } from "./stripe";
import { handleCoinbaseCheckout } from "./coinbase";
import { handlePayPalCheckout } from "./paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, priceId, description } = body;

    // Get the payment provider from environment variables
    const provider = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER || "stripe";

    let checkoutData;

    switch (provider.toLowerCase()) {
      case "stripe":
        checkoutData = await handleStripeCheckout({ amount, priceId, description });
        break;
      case "coinbase":
        checkoutData = await handleCoinbaseCheckout({ amount, priceId, description });
        break;
      case "paypal":
        checkoutData = await handlePayPalCheckout({ amount, priceId, description });
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported payment provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json(checkoutData);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "Checkout API is running",
      provider: process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER || "stripe"
    },
    { status: 200 }
  );
}