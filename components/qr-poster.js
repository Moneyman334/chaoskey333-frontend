// QR Poster Generator
class QRPosterGenerator {
  constructor() {
    this.currentUrl = 'https://chaoskey333-vault.eth/';
    this.currentQRStyle = 'standard';
    this.currentTheme = 'cyberpunk';
    this.relicImprint = this.generateRelicImprint();
    
    this.initializeElements();
    this.bindEvents();
    this.generateQRCode();
    this.startAnimations();
    this.updateMetrics();
  }

  initializeElements() {
    this.posterCanvas = document.getElementById('posterCanvas');
    this.qrCanvas = document.getElementById('qrCanvas');
    this.urlInput = document.getElementById('urlInput');
    this.qrStyleSelect = document.getElementById('qrStyle');
    this.themeSelect = document.getElementById('posterTheme');
    this.generateBtn = document.getElementById('generateQR');
    this.downloadBtn = document.getElementById('downloadPoster');
    this.shareBtn = document.getElementById('sharePoster');
    this.printBtn = document.getElementById('printPoster');
    
    // Info elements
    this.relicImprintElement = document.getElementById('relicImprint');
    this.vaultUrlElement = document.getElementById('vaultUrl');
    this.evolutionTimerElement = document.getElementById('evolutionTimer');
    this.qrDataInfoElement = document.getElementById('qrDataInfo');
    this.activeRelicsElement = document.getElementById('activeRelics');
    this.totalEvolvedElement = document.getElementById('totalEvolved');
    
    // Set initial values
    this.relicImprintElement.textContent = this.relicImprint;
    this.updateEvolutionTimer();
  }

  bindEvents() {
    this.generateBtn.addEventListener('click', () => this.generateQRCode());
    this.downloadBtn.addEventListener('click', () => this.downloadPoster());
    this.shareBtn.addEventListener('click', () => this.sharePoster());
    this.printBtn.addEventListener('click', () => this.printPoster());
    
    this.urlInput.addEventListener('input', (e) => {
      this.currentUrl = e.target.value;
      this.updateUrlDisplay();
      this.debounceQRGeneration();
    });
    
    this.qrStyleSelect.addEventListener('change', (e) => {
      this.currentQRStyle = e.target.value;
      this.generateQRCode();
    });
    
    this.themeSelect.addEventListener('change', (e) => {
      this.currentTheme = e.target.value;
      this.applyTheme();
    });
  }

  generateRelicImprint() {
    const chars = 'ABCDEF0123456789';
    let result = 'CK333-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  updateUrlDisplay() {
    try {
      const url = new URL(this.currentUrl);
      this.vaultUrlElement.textContent = url.hostname || this.currentUrl;
      this.qrDataInfoElement.textContent = this.currentUrl.length > 50 ? 
        this.currentUrl.substring(0, 47) + '...' : this.currentUrl;
    } catch {
      this.vaultUrlElement.textContent = this.currentUrl;
      this.qrDataInfoElement.textContent = 'Invalid URL';
    }
  }

  debounceQRGeneration() {
    clearTimeout(this.qrGenerationTimeout);
    this.qrGenerationTimeout = setTimeout(() => {
      this.generateQRCode();
    }, 500);
  }

  async generateQRCode() {
    if (!this.currentUrl) return;
    
    try {
      // Check if QRCode library is available
      if (typeof QRCode !== 'undefined') {
        const options = this.getQROptions();
        await QRCode.toCanvas(this.qrCanvas, this.currentUrl, options);
        this.applyQRStyle();
      } else {
        // Fallback: Create a simple placeholder
        this.generateQRPlaceholder();
      }
    } catch (error) {
      console.error('QR Code generation failed:', error);
      this.generateQRPlaceholder();
    }
  }

  generateQRPlaceholder() {
    const ctx = this.qrCanvas.getContext('2d');
    const size = 200;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // Draw border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    
    // Draw pattern
    ctx.fillStyle = '#00ffff';
    for (let x = 20; x < size - 20; x += 20) {
      for (let y = 20; y < size - 20; y += 20) {
        if ((x + y) % 40 === 0) {
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', size / 2, size / 2 - 10);
    ctx.fillText('PLACEHOLDER', size / 2, size / 2 + 10);
    
    this.applyQRStyle();
  }

  getQROptions() {
    const baseOptions = {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    switch (this.currentQRStyle) {
      case 'neon':
        return {
          ...baseOptions,
          color: {
            dark: '#00FFFF',
            light: '#000000'
          }
        };
      case 'matrix':
        return {
          ...baseOptions,
          color: {
            dark: '#00FF00',
            light: '#000000'
          }
        };
      case 'chaos':
        return {
          ...baseOptions,
          color: {
            dark: '#FF00FF',
            light: '#000000'
          }
        };
      default:
        return baseOptions;
    }
  }

  applyQRStyle() {
    const qrFrame = this.qrCanvas.parentElement;
    
    // Reset classes
    qrFrame.className = 'qr-frame';
    
    switch (this.currentQRStyle) {
      case 'neon':
        qrFrame.style.borderColor = '#00ffff';
        qrFrame.style.boxShadow = `
          0 0 20px rgba(0, 255, 255, 0.8),
          inset 0 0 20px rgba(0, 255, 255, 0.2)
        `;
        break;
      case 'matrix':
        qrFrame.style.borderColor = '#00ff00';
        qrFrame.style.boxShadow = `
          0 0 20px rgba(0, 255, 0, 0.8),
          inset 0 0 20px rgba(0, 255, 0, 0.2)
        `;
        break;
      case 'chaos':
        qrFrame.style.borderColor = '#ff00ff';
        qrFrame.style.boxShadow = `
          0 0 20px rgba(255, 0, 255, 0.8),
          inset 0 0 20px rgba(255, 0, 255, 0.2)
        `;
        break;
      default:
        qrFrame.style.borderColor = '#00ffff';
        qrFrame.style.boxShadow = `
          0 0 20px rgba(0, 255, 255, 0.5),
          inset 0 0 20px rgba(0, 255, 255, 0.1)
        `;
    }
  }

  applyTheme() {
    const themes = {
      cyberpunk: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#ffaa00',
        background: 'linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)'
      },
      neon: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#00ff00',
        background: 'linear-gradient(135deg, #000011 0%, #110022 50%, #000011 100%)'
      },
      dark: {
        primary: '#666666',
        secondary: '#999999',
        accent: '#ffffff',
        background: 'linear-gradient(135deg, #000000 0%, #000000 50%, #000000 100%)'
      },
      matrix: {
        primary: '#00ff00',
        secondary: '#00aa00',
        accent: '#ffffff',
        background: 'linear-gradient(135deg, #000000 0%, #001100 50%, #000000 100%)'
      }
    };

    const theme = themes[this.currentTheme];
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--secondary-color', theme.secondary);
      document.documentElement.style.setProperty('--accent-color', theme.accent);
      this.posterCanvas.style.background = theme.background;
    }
  }

  startAnimations() {
    this.animateMetrics();
    this.updateEvolutionTimer();
    
    // Update timer every second
    setInterval(() => this.updateEvolutionTimer(), 1000);
    
    // Update metrics every 5 seconds
    setInterval(() => this.animateMetrics(), 5000);
  }

  animateMetrics() {
    // Simulate dynamic metrics
    const activeRelics = 333 + Math.floor(Math.random() * 50) - 25;
    const totalEvolved = 1337 + Math.floor(Math.random() * 100) - 50;
    
    this.animateNumberChange(this.activeRelicsElement, activeRelics);
    this.animateNumberChange(this.totalEvolvedElement, totalEvolved);
  }

  animateNumberChange(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const difference = newValue - currentValue;
    const steps = 20;
    const stepValue = difference / steps;
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const displayValue = Math.round(currentValue + (stepValue * currentStep));
      element.textContent = displayValue;
      
      if (currentStep < steps) {
        setTimeout(animate, 50);
      }
    };
    
    animate();
  }

  updateEvolutionTimer() {
    const now = new Date();
    const nextEvolution = new Date();
    nextEvolution.setHours(nextEvolution.getHours() + 1);
    nextEvolution.setMinutes(0);
    nextEvolution.setSeconds(0);
    
    const timeDiff = nextEvolution - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    this.evolutionTimerElement.textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateMetrics() {
    // Initial metrics update
    this.animateMetrics();
  }

  async downloadPoster() {
    try {
      const canvas = await this.posterToCanvas();
      const link = document.createElement('a');
      link.download = `chaoskey333-evolution-poster-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      this.showError('Failed to download poster');
    }
  }

  async posterToCanvas() {
    // Create a high-resolution canvas for the poster
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set high resolution
    const scale = 2;
    canvas.width = 1920 * scale;
    canvas.height = 1080 * scale;
    
    ctx.scale(scale, scale);
    
    // Draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Draw grid pattern
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1920; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }
    
    // Draw title
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 48px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('CHAOSKEY333', 960, 100);
    
    // Draw tagline
    ctx.fillStyle = '#ffaa00';
    ctx.font = '24px Orbitron';
    ctx.fillText('PERMANENT RELIC EVOLUTION PROTOCOL', 960, 140);
    
    // Draw QR code
    const qrImageData = this.qrCanvas.toDataURL();
    const qrImage = new Image();
    
    return new Promise((resolve) => {
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 860, 400, 200, 200);
        
        // Draw additional elements
        ctx.fillStyle = '#00ffff';
        ctx.font = '32px Orbitron';
        ctx.textAlign = 'left';
        ctx.fillText('SCAN TO ACCESS VAULT', 100, 500);
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = '20px Orbitron';
        ctx.fillText(`RELIC ID: ${this.relicImprint}`, 100, 550);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText('NETWORK: ETHEREUM', 100, 580);
        
        // Draw warning
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ WARNING: EVOLUTION IS IRREVERSIBLE ⚠', 960, 950);
        
        resolve(canvas);
      };
      qrImage.src = qrImageData;
    });
  }

  async sharePoster() {
    if (navigator.share) {
      try {
        const canvas = await this.posterToCanvas();
        const blob = await new Promise(resolve => 
          canvas.toBlob(resolve, 'image/png')
        );
        
        const file = new File([blob], 'chaoskey333-poster.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'ChaosKey333 Evolution Poster',
          text: 'Check out this ChaosKey333 relic evolution poster!',
          files: [file]
        });
      } catch (error) {
        console.error('Sharing failed:', error);
        this.fallbackShare();
      }
    } else {
      this.fallbackShare();
    }
  }

  fallbackShare() {
    const shareData = {
      title: 'ChaosKey333 Evolution Poster',
      text: 'Check out this ChaosKey333 relic evolution poster!',
      url: this.currentUrl
    };
    
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(shareUrl, '_blank');
  }

  printPoster() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ChaosKey333 Evolution Poster</title>
        <style>
          body { margin: 0; padding: 20px; background: #000; }
          .poster { 
            background: #000; 
            color: #00ffff; 
            font-family: monospace; 
            text-align: center;
            padding: 40px;
          }
          .title { font-size: 48px; margin-bottom: 20px; }
          .tagline { font-size: 24px; margin-bottom: 40px; color: #ffaa00; }
          .qr-section { margin: 40px 0; }
          .info { font-size: 18px; margin: 10px 0; }
          .warning { color: #ff4444; font-weight: bold; margin-top: 40px; }
          @media print {
            body { background: white !important; }
            .poster { background: white !important; color: black !important; }
          }
        </style>
      </head>
      <body>
        <div class="poster">
          <div class="title">⬢ CHAOSKEY333 ⬢</div>
          <div class="tagline">PERMANENT RELIC EVOLUTION PROTOCOL</div>
          <div class="qr-section">
            <img src="${this.qrCanvas.toDataURL()}" alt="QR Code">
          </div>
          <div class="info">RELIC ID: ${this.relicImprint}</div>
          <div class="info">VAULT: ${this.vaultUrlElement.textContent}</div>
          <div class="info">NETWORK: ETHEREUM</div>
          <div class="warning">⚠ WARNING: EVOLUTION IS IRREVERSIBLE ⚠</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 68, 68, 0.9);
      color: white;
      padding: 1rem;
      border-radius: 5px;
      z-index: 10000;
      font-family: Orbitron, monospace;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 3000);
  }

  // Public API
  updateUrl(url) {
    this.currentUrl = url;
    this.urlInput.value = url;
    this.updateUrlDisplay();
    this.generateQRCode();
  }

  setStyle(style) {
    this.currentQRStyle = style;
    this.qrStyleSelect.value = style;
    this.generateQRCode();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.themeSelect.value = theme;
    this.applyTheme();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.qrPosterGenerator = new QRPosterGenerator();
});

// Expose global API
window.ChaosKey333 = window.ChaosKey333 || {};
window.ChaosKey333.poster = {
  updateUrl: (url) => window.qrPosterGenerator?.updateUrl(url),
  setStyle: (style) => window.qrPosterGenerator?.setStyle(style),
  setTheme: (theme) => window.qrPosterGenerator?.setTheme(theme),
  download: () => window.qrPosterGenerator?.downloadPoster(),
  share: () => window.qrPosterGenerator?.sharePoster(),
  print: () => window.qrPosterGenerator?.printPoster()
};