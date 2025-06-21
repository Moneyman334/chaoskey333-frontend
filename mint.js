
document.addEventListener("DOMContentLoaded", () => {
  const mintBtn = document.getElementById("mint-button");

  mintBtn.addEventListener("click", async () => {
    mintBtn.disabled = true;
    mintBtn.innerText = "⏳ Minting...";

    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: window.walletAddress || "vault_default"
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Minted!\nTx: ${data.txHash}`);
        mintBtn.innerText = "✅ Minted!";
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert(`❌ Mint failed: ${err.message}`);
      mintBtn.innerText = "❌ Try Again";
    } finally {
      mintBtn.disabled = false;
    }
  });
});
