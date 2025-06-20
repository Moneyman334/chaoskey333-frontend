app.post("/api/webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const wallet = session.metadata.wallet;
    const tokenURI = session.metadata.tokenURI;

    await mintRelicToWallet(tokenURI, wallet);

    // Log relic to Firebase
    await logToVault(wallet, tokenURI);

    // Respond to Stripe
    res.status(200).send("Relic minted 🔥");
  } else {
    res.status(400).send("Unhandled event");
  }
});
