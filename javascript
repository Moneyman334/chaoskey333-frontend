// Confirm environment variable retrieval
async function fetchConfig() {
  try {
    const response = await fetch('/config');
    const config = await response.json();
    STRIPE_PUBLISHABLE_KEY = config.publicKey;
  } catch (error) {
    console.error("Error fetching Stripe config:", error);
  }
}

// Ensure this is called early in your code
fetchConfig();