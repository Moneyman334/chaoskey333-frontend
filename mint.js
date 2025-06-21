

document.addEventListener("DOMContentLoaded", () => {
  const mintBtn = document.getElementById("mint-button");
  const statusEl = document.getElementById("mint-status");

  mintBtn.addEventListener("click", async () => {
    mintBtn.disabled = true;
    statusEl.innerText = "⏳ Minting relic to vault...";

    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: window.walletAddress || "vault_owner" // fallback if not passed
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(`🟢 Relic minted!\nTx: ${data.txHash}`);
        statusEl.innerText = `✅ Relic minted! Tx: ${data.txHash}`;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Mint Failed: ${err.message}`);
      statusEl.innerText = `❌ Error: ${err.message}`;
    } finally {
      mintBtn.disabled = false;
    }
  });
});
