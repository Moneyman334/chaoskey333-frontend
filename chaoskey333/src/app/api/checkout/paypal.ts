interface CheckoutParams {
  amount?: number;
  priceId?: string;
  description?: string;
}

export async function handlePayPalCheckout({ amount, priceId, description }: CheckoutParams) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
    throw new Error("PayPal credentials not configured");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const paypalMode = process.env.PAYPAL_MODE || "sandbox";
  const paypalBaseUrl = paypalMode === "sandbox" 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com";

  try {
    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error(`PayPal auth failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Use direct amount or fallback to fixed price
    const orderAmount = amount || 10; // Default $10 if no amount specified

    // Create PayPal order
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: orderAmount.toFixed(2),
          },
          description: description || "Purchase from ChaosKey333",
        },
      ],
      application_context: {
        return_url: `${baseUrl}/success`,
        cancel_url: `${baseUrl}/cancel`,
        brand_name: "ChaosKey333",
        user_action: "PAY_NOW",
      },
    };

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`PayPal order creation failed: ${errorData.message || orderResponse.statusText}`);
    }

    const order = await orderResponse.json();
    const approvalUrl = order.links.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("PayPal approval URL not found");
    }

    return {
      url: approvalUrl,
      orderId: order.id,
      provider: "paypal",
    };
  } catch (error) {
    console.error("PayPal checkout error:", error);
    throw new Error(`PayPal checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}