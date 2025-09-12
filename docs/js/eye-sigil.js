// CHAOS Token Balance & Sanial AI Integration
const CHAOS = "0x093050017e0374A5777476b3B9Da94244612F980"; // Base mainnet
const DECIMALS = 18;
const abi = [{ "constant": true, "inputs": [{ "name": "a", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }];

async function readChaosBalance() {
  try {
    const { ethereum } = window;
    const provider = ethereum
      ? new window.ethers.BrowserProvider(ethereum)
      : new window.ethers.JsonRpcProvider("https://mainnet.base.org");
    const signer = ethereum ? await provider.getSigner() : null;
    const user = signer ? await signer.getAddress() : null;
    if (!user) { return 0n; }
    const c = new window.ethers.Contract(CHAOS, abi, provider);
    return (await c.balanceOf(user));
  } catch (e) {
    console.warn("CHAOS read failed", e);
    return 0n;
  }
}

function levelFromBalance(raw) {
  const x = Number(raw) / 10**DECIMALS;
  if (x >= 100000) return 1.00;
  if (x >= 10000) return 0.85;
  if (x >= 1000) return 0.65;
  if (x >= 100) return 0.45;
  if (x > 0) return 0.25;
  return 0.10;
}

async function readSanial() {
  try {
    const r = await fetch("./docs/data/sanial-feed.json?ts=" + Date.now(), { cache: "no-store" });
    return await r.json();
  } catch {
    return null;
  }
}

async function tick() {
  const raw = await readChaosBalance();
  const intensity = levelFromBalance(raw);
  document.documentElement.style.setProperty("--eye-intensity", intensity.toFixed(2));
  console.log(`CHAOS Balance: ${Number(raw) / 10**DECIMALS} tokens, Intensity: ${intensity}`);
}

async function tickSanial() {
  const j = await readSanial();
  if (!j) return;
  
  const hue = (j.signal * 120); // -1 (red/bearish) to +1 (green/bullish) * 120 degrees
  const extra = (Math.max(0, Math.min(1, j.confidence))) * 0.25;
  const baseIntensity = parseFloat(document.documentElement.style.getPropertyValue("--eye-intensity")) || 0.15;
  
  document.documentElement.style.setProperty("--eye-intensity", Math.min(1, baseIntensity + extra).toFixed(2));
  
  const eyeRing = document.querySelector(".eye-ring");
  if (eyeRing) {
    eyeRing.style.filter = `hue-rotate(${hue}deg) saturate(1.4) blur(calc(var(--eye-intensity)*1.2px))`;
  }
  
  console.log(`Sanial Signal: ${j.signal}, Confidence: ${j.confidence}, Hue: ${hue}deg, Extra: ${extra}`);
}

// Initialize and set intervals
function initializeEyeSigil() {
  console.log("🔮 Initializing Infinity Eye Sigil...");
  
  // Initial calls
  tick();
  tickSanial();
  
  // Set intervals
  setInterval(tick, 60_000); // 60 seconds for CHAOS balance
  setInterval(tickSanial, 15_000); // 15 seconds for Sanial signals
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEyeSigil);
} else {
  initializeEyeSigil();
}