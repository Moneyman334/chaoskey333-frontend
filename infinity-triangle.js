/**
 * Infinity Triangle ♾️🔺 with Eye of God 👁️ Component
 * Handles triangle structure with BTC, ETH, SOL, CHAOS pillars
 * Integrates CoinGecko API for live price feeds
 */

class InfinityTriangle {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.priceCache = {};
    this.balances = {
      btc: 0,
      eth: 0,
      sol: 0,
      chaos: 0
    };
    this.isInitialized = false;
    this.eyeAnimationId = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    this.createTriangleStructure();
    this.createEyeOfGod();
    this.setupEventListeners();
    await this.loadInitialPrices();
    this.startAnimations();
    
    this.isInitialized = true;
    console.log("♾️🔺 Infinity Triangle initialized");
  }

  createTriangleStructure() {
    const triangleHtml = `
      <div class="infinity-triangle" id="infinityTriangle">
        <!-- SVG Triangle Structure -->
        <svg width="400" height="400" viewBox="0 0 400 400" class="triangle-svg">
          <!-- Triangle Edges -->
          <polygon points="200,50 100,300 300,300" 
                   fill="none" 
                   stroke="#FFD700" 
                   stroke-width="4" 
                   class="triangle-side" />
          
          <!-- Glowing Background -->
          <polygon points="200,50 100,300 300,300" 
                   fill="rgba(255, 215, 0, 0.05)" 
                   class="triangle-glow" />
        </svg>

        <!-- Corner Pillars -->
        <div class="pillar pillar-chaos" data-crypto="chaos" style="top: 40px; left: 180px;">
          <div class="pillar-icon">👑🗝️</div>
          <div class="pillar-label">CHAOS</div>
          <div class="pillar-price" id="chaos-price">$0.00</div>
          <div class="pillar-change" id="chaos-change">0%</div>
        </div>

        <div class="pillar pillar-btc" data-crypto="bitcoin" style="bottom: 80px; left: 80px;">
          <div class="pillar-icon">🪙</div>
          <div class="pillar-label">BTC</div>
          <div class="pillar-price" id="btc-price">$0.00</div>
          <div class="pillar-change" id="btc-change">0%</div>
        </div>

        <div class="pillar pillar-eth" data-crypto="ethereum" style="bottom: 80px; right: 80px;">
          <div class="pillar-icon">🔥</div>
          <div class="pillar-label">ETH</div>
          <div class="pillar-price" id="eth-price">$0.00</div>
          <div class="pillar-change" id="eth-change">0%</div>
        </div>

        <div class="pillar pillar-sol" data-crypto="solana" style="bottom: 140px; left: 160px;">
          <div class="pillar-icon">🌊⚡</div>
          <div class="pillar-label">SOL</div>
          <div class="pillar-price" id="sol-price">$0.00</div>
          <div class="pillar-change" id="sol-change">0%</div>
        </div>

        <!-- Eye of God Centerpiece -->
        <div class="eye-of-god" id="eyeOfGod">
          <div class="eye-outer">
            <div class="eye-inner">
              <div class="eye-pupil"></div>
            </div>
          </div>
          <div class="cosmic-ripples"></div>
        </div>

        <!-- Infinity Dashboard (Hidden by default) -->
        <div class="infinity-dashboard" id="infinityDashboard" style="display: none;">
          <div class="dashboard-header">
            <h3>♾️ Infinity Dashboard</h3>
            <button class="close-btn" onclick="infinityTriangle.hideDashboard()">✕</button>
          </div>
          <div class="dashboard-content">
            <div class="balance-item">
              <span class="crypto-icon">🪙</span>
              <span class="crypto-name">Bitcoin</span>
              <span class="crypto-balance" id="btc-balance">0.00000000 BTC</span>
              <span class="crypto-value" id="btc-value">$0.00</span>
            </div>
            <div class="balance-item">
              <span class="crypto-icon">🔥</span>
              <span class="crypto-name">Ethereum</span>
              <span class="crypto-balance" id="eth-balance">0.00000000 ETH</span>
              <span class="crypto-value" id="eth-value">$0.00</span>
            </div>
            <div class="balance-item">
              <span class="crypto-icon">🌊⚡</span>
              <span class="crypto-name">Solana</span>
              <span class="crypto-balance" id="sol-balance">0.00000000 SOL</span>
              <span class="crypto-value" id="sol-value">$0.00</span>
            </div>
            <div class="balance-item">
              <span class="crypto-icon">👑🗝️</span>
              <span class="crypto-name">CHAOS</span>
              <span class="crypto-balance" id="chaos-balance">0.00000000 CHAOS</span>
              <span class="crypto-value" id="chaos-total-value">$0.00</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = triangleHtml;
  }

  createEyeOfGod() {
    // Enhanced eye animations will be handled by CSS
    // This sets up any additional dynamic effects
    const eye = document.getElementById('eyeOfGod');
    if (eye) {
      this.createCosmicRipples(eye);
    }
  }

  createCosmicRipples(eyeContainer) {
    const ripplesContainer = eyeContainer.querySelector('.cosmic-ripples');
    
    // Create multiple ripple layers
    for (let i = 0; i < 3; i++) {
      const ripple = document.createElement('div');
      ripple.className = `cosmic-ripple ripple-${i}`;
      ripple.style.animationDelay = `${i * 0.5}s`;
      ripplesContainer.appendChild(ripple);
    }
  }

  setupEventListeners() {
    const eye = document.getElementById('eyeOfGod');
    const dashboard = document.getElementById('infinityDashboard');
    
    if (eye) {
      eye.addEventListener('click', () => this.toggleDashboard());
      eye.addEventListener('mouseenter', () => this.enhanceEyeGlow());
      eye.addEventListener('mouseleave', () => this.normalizeEyeGlow());
    }

    // Add click handlers to pillars for additional info
    document.querySelectorAll('.pillar').forEach(pillar => {
      pillar.addEventListener('click', (e) => {
        const crypto = e.currentTarget.getAttribute('data-crypto');
        this.showCryptoDetails(crypto);
      });
    });
  }

  async loadInitialPrices() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      
      this.priceCache = data;
      this.updatePriceDisplays();
      
      console.log("💰 Price data loaded:", data);
    } catch (error) {
      console.warn("⚠️ Failed to load price data:", error);
      this.setFallbackPrices();
    }
  }

  updatePriceDisplays() {
    const cryptos = [
      { id: 'bitcoin', symbol: 'btc' },
      { id: 'ethereum', symbol: 'eth' },
      { id: 'solana', symbol: 'sol' }
    ];

    cryptos.forEach(crypto => {
      const priceData = this.priceCache[crypto.id];
      if (priceData) {
        const priceElement = document.getElementById(`${crypto.symbol}-price`);
        const changeElement = document.getElementById(`${crypto.symbol}-change`);
        
        if (priceElement) {
          priceElement.textContent = `$${priceData.usd.toLocaleString()}`;
        }
        
        if (changeElement && priceData.usd_24h_change !== undefined) {
          const change = priceData.usd_24h_change.toFixed(2);
          changeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
          changeElement.className = `pillar-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
      }
    });

    // CHAOS token (mock data for now)
    const chaosPrice = document.getElementById('chaos-price');
    const chaosChange = document.getElementById('chaos-change');
    if (chaosPrice) chaosPrice.textContent = '$0.333';
    if (chaosChange) {
      chaosChange.textContent = '+33.3%';
      chaosChange.className = 'pillar-change positive';
    }
  }

  setFallbackPrices() {
    const fallbackData = {
      'btc': { price: '$65000', change: '+2.5%' },
      'eth': { price: '$3500', change: '+1.8%' },
      'sol': { price: '$180', change: '+5.2%' },
      'chaos': { price: '$0.333', change: '+33.3%' }
    };

    Object.entries(fallbackData).forEach(([symbol, data]) => {
      const priceElement = document.getElementById(`${symbol}-price`);
      const changeElement = document.getElementById(`${symbol}-change`);
      
      if (priceElement) priceElement.textContent = data.price;
      if (changeElement) {
        changeElement.textContent = data.change;
        changeElement.className = 'pillar-change positive';
      }
    });
  }

  toggleDashboard() {
    const dashboard = document.getElementById('infinityDashboard');
    if (dashboard) {
      const isVisible = dashboard.style.display !== 'none';
      dashboard.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        this.updateBalanceDisplays();
        dashboard.classList.add('dashboard-appear');
      }
    }
  }

  hideDashboard() {
    const dashboard = document.getElementById('infinityDashboard');
    if (dashboard) {
      dashboard.style.display = 'none';
      dashboard.classList.remove('dashboard-appear');
    }
  }

  enhanceEyeGlow() {
    const eye = document.getElementById('eyeOfGod');
    if (eye) {
      eye.classList.add('enhanced-glow');
    }
  }

  normalizeEyeGlow() {
    const eye = document.getElementById('eyeOfGod');
    if (eye) {
      eye.classList.remove('enhanced-glow');
    }
  }

  updateBalanceDisplays() {
    // Mock balance data - in real implementation, this would fetch from wallet/contracts
    const mockBalances = {
      btc: { amount: '0.00125', value: '$81.25' },
      eth: { amount: '0.75', value: '$2625.00' },
      sol: { amount: '15.5', value: '$2790.00' },
      chaos: { amount: '1337.333', value: '$445.22' }
    };

    Object.entries(mockBalances).forEach(([crypto, data]) => {
      const balanceElement = document.getElementById(`${crypto}-balance`);
      const valueElement = document.getElementById(`${crypto === 'chaos' ? 'chaos-total-value' : crypto + '-value'}`);
      
      if (balanceElement) balanceElement.textContent = `${data.amount} ${crypto.toUpperCase()}`;
      if (valueElement) valueElement.textContent = data.value;
    });
  }

  showCryptoDetails(crypto) {
    // Future implementation: show detailed info, charts, explorer links
    console.log(`📊 Showing details for ${crypto}`);
    
    // For now, just toggle the dashboard
    this.toggleDashboard();
  }

  startAnimations() {
    // Start the cosmic eye animation
    this.animateEye();
    
    // Start price update interval (every 30 seconds)
    setInterval(() => {
      this.loadInitialPrices();
    }, 30000);
  }

  animateEye() {
    const eye = document.getElementById('eyeOfGod');
    if (!eye) return;

    const animate = () => {
      const time = Date.now() * 0.001;
      const pupil = eye.querySelector('.eye-pupil');
      
      if (pupil) {
        // Subtle breathing effect
        const breathe = Math.sin(time * 0.5) * 0.1 + 1;
        pupil.style.transform = `scale(${breathe})`;
      }

      this.eyeAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    if (this.eyeAnimationId) {
      cancelAnimationFrame(this.eyeAnimationId);
    }
    this.isInitialized = false;
  }
}

// Global instance for easy access
let infinityTriangle = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure other scripts have loaded
  setTimeout(() => {
    if (document.getElementById('infinityTriangleContainer')) {
      infinityTriangle = new InfinityTriangle('infinityTriangleContainer');
      infinityTriangle.initialize();
    }
  }, 1000);
});