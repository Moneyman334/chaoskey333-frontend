interface CheckoutParams {
  amount?: number;
  priceId?: string;
  description?: string;
}

export async function handleCoinbaseCheckout({ amount, priceId, description }: CheckoutParams) {
  if (!process.env.COINBASE_COMMERCE_API_KEY) {
    throw new Error("Coinbase Commerce API key not configured");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // Use direct amount or fallback to fixed price
    const chargeAmount = amount || 10; // Default $10 if no amount specified

    const chargeData = {
      name: description || "Purchase",
      description: description || "Purchase from ChaosKey333",
      pricing_type: "fixed_price",
      local_price: {
        amount: chargeAmount.toString(),
        currency: "USD",
      },
      metadata: {
        priceId: priceId || "custom",
      },
      redirect_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
    };

    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY!,
        "X-CC-Version": "2018-03-22",
      },
      body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Coinbase API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      url: data.data.hosted_url,
      chargeId: data.data.id,
      provider: "coinbase",
    };
  } catch (error) {
    console.error("Coinbase checkout error:", error);
    throw new Error(`Coinbase checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}