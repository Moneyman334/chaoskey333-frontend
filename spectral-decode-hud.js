/**
 * Spectral Decode HUD - Multilingual Glyph Overlay System
 * Integration for PR #23 and PR #25 - ChaosKey333 Frontend
 */

class SpectralDecodeHUD {
  constructor() {
    this.currentLanguage = this.detectVaultLanguage();
    this.glyphTranslations = this.initializeGlyphTranslations();
    this.hudElement = null;
    this.subtitleLayers = {
      translated: null,
      original: null
    };
    this.highlights = [];
    this.isActive = false;
    this.lastDecodeTime = 0;
    
    this.init();
  }

  /**
   * Auto-Detection of Viewer's Vault Language Preference
   */
  detectVaultLanguage() {
    // Check stored preference first
    const storedLang = localStorage.getItem('chaoskey333_vault_language');
    if (storedLang && this.getSupportedLanguages().includes(storedLang)) {
      return storedLang;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Map to supported languages
    const supportedLanguages = this.getSupportedLanguages();
    if (supportedLanguages.includes(langCode)) {
      this.saveLanguagePreference(langCode);
      return langCode;
    }

    // Default to English
    this.saveLanguagePreference('en');
    return 'en';
  }

  getSupportedLanguages() {
    return ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ru', 'pt', 'it', 'ko'];
  }

  saveLanguagePreference(langCode) {
    localStorage.setItem('chaoskey333_vault_language', langCode);
    console.log(`🌐 Vault language preference saved: ${langCode}`);
  }

  /**
   * Initialize Glyph Translation System
   */
  initializeGlyphTranslations() {
    return {
      // Chaos Glyphs - Core symbols
      'ᚨᚢᚱᚨ': {
        en: 'AURA',
        es: 'AURA',
        fr: 'AURA', 
        de: 'AURA',
        ja: 'オーラ',
        zh: '气场',
        ru: 'АУРА',
        pt: 'AURA',
        it: 'AURA',
        ko: '아우라'
      },
      'ᚲᚺᚨᛟᛊ': {
        en: 'CHAOS',
        es: 'CAOS',
        fr: 'CHAOS',
        de: 'CHAOS',
        ja: 'カオス',
        zh: '混沌',
        ru: 'ХАОС',
        pt: 'CAOS',
        it: 'CAOS',
        ko: '카오스'
      },
      'ᚱᛖᛚᛁᚲ': {
        en: 'RELIC',
        es: 'RELIQUIA',
        fr: 'RELIQUE',
        de: 'RELIKT',
        ja: '遺物',
        zh: '遗物',
        ru: 'РЕЛИКТ',
        pt: 'RELÍQUIA',
        it: 'RELIQUIA',
        ko: '유물'
      },
      'ᚢᚨᚢᛚᛏ': {
        en: 'VAULT',
        es: 'BÓVEDA',
        fr: 'CHAMBRE',
        de: 'TRESOR',
        ja: '金庫',
        zh: '保险库',
        ru: 'ХРАНИЛИЩЕ',
        pt: 'COFRE',
        it: 'VOLTA',
        ko: '금고'
      },
      'ᛞᛖᚲᛟᛞᛖ': {
        en: 'DECODE',
        es: 'DECODIFICAR',
        fr: 'DÉCODER',
        de: 'ENTSCHLÜSSELN',
        ja: 'デコード',
        zh: '解码',
        ru: 'ДЕКОДИРОВАТЬ',
        pt: 'DECODIFICAR',
        it: 'DECODIFICARE',
        ko: '디코드'
      },
      '⧨⧩⧪': {
        en: 'ENERGY FLOW',
        es: 'FLUJO DE ENERGÍA',
        fr: 'FLUX D\'ÉNERGIE',
        de: 'ENERGIEFLUSS',
        ja: 'エネルギーフロー',
        zh: '能量流',
        ru: 'ПОТОК ЭНЕРГИИ',
        pt: 'FLUXO DE ENERGIA',
        it: 'FLUSSO DI ENERGIA',
        ko: '에너지 흐름'
      },
      '◯◉◯': {
        en: 'AWAKENING',
        es: 'DESPERTAR',
        fr: 'ÉVEIL',
        de: 'ERWACHEN',
        ja: '覚醒',
        zh: '觉醒',
        ru: 'ПРОБУЖДЕНИЕ',
        pt: 'DESPERTAR',
        it: 'RISVEGLIO',
        ko: '각성'
      }
    };
  }

  /**
   * Initialize HUD Components
   */
  init() {
    this.createHUDStructure();
    this.attachEventListeners();
    this.startHUDScan();
    console.log(`🌊 Spectral Decode HUD initialized in ${this.currentLanguage.toUpperCase()} language`);
  }

  createHUDStructure() {
    // Create main HUD container
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'spectral-decode-hud';
    this.hudElement.className = 'spectral-hud hidden';
    this.hudElement.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">
          <span class="glyph-icon">⧨</span>
          <span class="title-text">${this.translateText('SPECTRAL DECODE')}</span>
          <span class="glyph-icon">⧨</span>
        </div>
        <div class="language-selector">
          <select id="vault-language-select">
            ${this.getSupportedLanguages().map(lang => 
              `<option value="${lang}" ${lang === this.currentLanguage ? 'selected' : ''}>${this.getLanguageName(lang)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="hud-content">
        <div class="decode-status">
          <div class="status-indicator"></div>
          <span class="status-text">${this.translateText('SCANNING FOR GLYPHS')}</span>
        </div>
        <div class="glyph-highlights-container"></div>
      </div>
    `;

    // Create subtitle layers
    this.createSubtitleLayers();

    // Insert into DOM
    document.body.appendChild(this.hudElement);
    
    // Add styles
    this.injectHUDStyles();
  }

  createSubtitleLayers() {
    // Top layer: Translated hints
    this.subtitleLayers.translated = document.createElement('div');
    this.subtitleLayers.translated.id = 'translated-subtitle-layer';
    this.subtitleLayers.translated.className = 'subtitle-layer translated-layer';

    // Bottom layer: Original glyphs
    this.subtitleLayers.original = document.createElement('div');
    this.subtitleLayers.original.id = 'original-subtitle-layer'; 
    this.subtitleLayers.original.className = 'subtitle-layer original-layer';

    document.body.appendChild(this.subtitleLayers.translated);
    document.body.appendChild(this.subtitleLayers.original);
  }

  translateText(text) {
    const translations = {
      'SPECTRAL DECODE': {
        en: 'SPECTRAL DECODE',
        es: 'DECODIFICACIÓN ESPECTRAL',
        fr: 'DÉCODAGE SPECTRAL',
        de: 'SPEKTRALE DEKODIERUNG',
        ja: 'スペクトル解読',
        zh: '光谱解码',
        ru: 'СПЕКТРАЛЬНОЕ ДЕКОДИРОВАНИЕ',
        pt: 'DECODIFICAÇÃO ESPECTRAL',
        it: 'DECODIFICA SPETTRALE',
        ko: '스펙트럼 디코드'
      },
      'SCANNING FOR GLYPHS': {
        en: 'SCANNING FOR GLYPHS',
        es: 'ESCANEANDO GLIFOS',
        fr: 'ANALYSE DES GLYPHES',
        de: 'GLYPHEN SCANNEN',
        ja: 'グリフをスキャン中',
        zh: '扫描符文',
        ru: 'СКАНИРОВАНИЕ ГЛИФОВ',
        pt: 'ESCANEANDO GLIFOS',
        it: 'SCANSIONE GLIFI',
        ko: '글리프 스캔 중'
      }
    };

    return translations[text]?.[this.currentLanguage] || text;
  }

  getLanguageName(langCode) {
    const names = {
      en: 'English',
      es: 'Español', 
      fr: 'Français',
      de: 'Deutsch',
      ja: '日本語',
      zh: '中文',
      ru: 'Русский',
      pt: 'Português',
      it: 'Italiano',
      ko: '한국어'
    };
    return names[langCode] || langCode.toUpperCase();
  }

  /**
   * Adaptive AI Translation System
   */
  adaptiveTranslate(glyphText, targetLang = null) {
    const lang = targetLang || this.currentLanguage;
    
    // Check direct translation first
    if (this.glyphTranslations[glyphText]?.[lang]) {
      return this.glyphTranslations[glyphText][lang];
    }

    // Fallback to pattern matching for partial glyphs
    for (const [glyph, translations] of Object.entries(this.glyphTranslations)) {
      if (glyphText.includes(glyph)) {
        return translations[lang] || translations.en;
      }
    }

    // Return original if no translation found
    return glyphText;
  }

  /**
   * HUD Scanning and Detection
   */
  startHUDScan() {
    this.isActive = true;
    this.scanForGlyphs();
    
    // Continuous scanning
    setInterval(() => {
      if (this.isActive) {
        this.scanForGlyphs();
      }
    }, 1000);
  }

  scanForGlyphs() {
    // Scan page content for glyph patterns
    const textElements = document.querySelectorAll('*:not(script):not(style)');
    const foundGlyphs = new Set();

    textElements.forEach(element => {
      const text = element.textContent || '';
      Object.keys(this.glyphTranslations).forEach(glyph => {
        if (text.includes(glyph)) {
          foundGlyphs.add(glyph);
          this.highlightGlyph(element, glyph);
        }
      });
    });

    if (foundGlyphs.size > 0) {
      this.showHUD();
      this.updateGlyphHighlights(Array.from(foundGlyphs));
    }
  }

  highlightGlyph(element, glyph) {
    if (element.classList.contains('glyph-highlighted')) return;
    
    element.classList.add('glyph-highlighted');
    
    // Create highlight effect
    const highlight = document.createElement('div');
    highlight.className = 'glyph-highlight-effect';
    highlight.style.position = 'absolute';
    highlight.style.pointerEvents = 'none';
    
    // Position highlight
    const rect = element.getBoundingClientRect();
    highlight.style.left = rect.left + 'px';
    highlight.style.top = rect.top + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';
    
    document.body.appendChild(highlight);
    
    // Add to tracking
    this.highlights.push({
      element: element,
      highlight: highlight,
      glyph: glyph,
      timestamp: Date.now()
    });

    // Show subtitle
    this.showDualLayerSubtitle(glyph);
  }

  showDualLayerSubtitle(glyph) {
    const translated = this.adaptiveTranslate(glyph);
    
    // Update translated layer (top)
    this.subtitleLayers.translated.innerHTML = `
      <div class="subtitle-content translated-content">
        <div class="subtitle-text">${translated}</div>
      </div>
    `;
    
    // Update original layer (bottom)  
    this.subtitleLayers.original.innerHTML = `
      <div class="subtitle-content original-content">
        <div class="subtitle-text">${glyph}</div>
      </div>
    `;
    
    // Show layers
    this.subtitleLayers.translated.classList.add('visible');
    this.subtitleLayers.original.classList.add('visible');
    
    // Auto-hide after delay
    setTimeout(() => {
      this.subtitleLayers.translated.classList.remove('visible');
      this.subtitleLayers.original.classList.remove('visible');
    }, 3000);
  }

  updateGlyphHighlights(glyphs) {
    const container = this.hudElement.querySelector('.glyph-highlights-container');
    const statusText = this.hudElement.querySelector('.status-text');
    
    statusText.textContent = `${glyphs.length} ${this.translateText('GLYPHS DETECTED')}`;
    
    container.innerHTML = glyphs.map(glyph => `
      <div class="glyph-highlight-item">
        <span class="glyph-original">${glyph}</span>
        <span class="glyph-translated">${this.adaptiveTranslate(glyph)}</span>
      </div>
    `).join('');
  }

  showHUD() {
    if (this.hudElement) {
      this.hudElement.classList.remove('hidden');
    }
  }

  hideHUD() {
    if (this.hudElement) {
      this.hudElement.classList.add('hidden');
    }
  }

  /**
   * Event Listeners
   */
  attachEventListeners() {
    // Language selector
    document.addEventListener('change', (e) => {
      if (e.target.id === 'vault-language-select') {
        this.changeLanguage(e.target.value);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        this.toggleHUD();
      }
    });
  }

  changeLanguage(newLang) {
    this.currentLanguage = newLang;
    this.saveLanguagePreference(newLang);
    
    // Update HUD text
    this.updateHUDLanguage();
    
    // Refresh glyph translations
    this.scanForGlyphs();
    
    console.log(`🌐 Vault language changed to: ${newLang.toUpperCase()}`);
  }

  updateHUDLanguage() {
    const titleText = this.hudElement.querySelector('.title-text');
    if (titleText) {
      titleText.textContent = this.translateText('SPECTRAL DECODE');
    }
  }

  toggleHUD() {
    if (this.hudElement.classList.contains('hidden')) {
      this.showHUD();
    } else {
      this.hideHUD();
    }
  }

  /**
   * Inject CSS Styles for Cosmic Aesthetic
   */
  injectHUDStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Spectral Decode HUD Styles */
      .spectral-hud {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(17,17,17,0.95));
        border: 2px solid #00ffcc;
        border-radius: 15px;
        color: #00ffcc;
        font-family: 'Orbitron', 'Courier New', monospace;
        z-index: 10000;
        box-shadow: 0 0 30px rgba(0,255,204,0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .spectral-hud.hidden {
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
      }

      .hud-header {
        padding: 15px;
        border-bottom: 1px solid #00ffcc;
        background: linear-gradient(90deg, rgba(0,255,204,0.1), rgba(0,255,204,0.05));
      }

      .hud-title {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      .glyph-icon {
        font-size: 1.2em;
        margin: 0 10px;
        animation: glyphPulse 2s infinite;
      }

      .title-text {
        font-size: 1.1em;
        font-weight: bold;
        text-shadow: 0 0 10px #00ffcc;
      }

      .language-selector select {
        background: rgba(0,0,0,0.7);
        border: 1px solid #00ffcc;
        color: #00ffcc;
        padding: 5px;
        border-radius: 5px;
        font-family: inherit;
        width: 100%;
      }

      .language-selector select:focus {
        outline: none;
        box-shadow: 0 0 10px rgba(0,255,204,0.5);
      }

      .hud-content {
        padding: 15px;
      }

      .decode-status {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #00ffcc;
        margin-right: 10px;
        animation: statusPulse 1.5s infinite;
      }

      .glyph-highlight-item {
        background: rgba(0,255,204,0.1);
        border: 1px solid rgba(0,255,204,0.3);
        border-radius: 8px;
        padding: 8px;
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
      }

      .glyph-original {
        font-family: 'Courier New', monospace;
        color: #ffaa00;
      }

      .glyph-translated {
        color: #00ffcc;
        font-size: 0.9em;
      }

      /* Subtitle Layers */
      .subtitle-layer {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: none;
      }

      .subtitle-layer.visible {
        opacity: 1;
      }

      .translated-layer {
        bottom: 120px;
      }

      .original-layer {
        bottom: 80px;
      }

      .subtitle-content {
        background: rgba(0,0,0,0.8);
        padding: 10px 20px;
        border-radius: 10px;
        border: 2px solid;
        backdrop-filter: blur(5px);
      }

      .translated-content {
        border-color: #00ffcc;
        color: #00ffcc;
        text-shadow: 0 0 10px #00ffcc;
      }

      .original-content {
        border-color: #ffaa00;
        color: #ffaa00;
        text-shadow: 0 0 10px #ffaa00;
      }

      .subtitle-text {
        font-family: 'Orbitron', 'Courier New', monospace;
        font-size: 1.2em;
        font-weight: bold;
        text-align: center;
      }

      /* Glyph Highlighting Effects */
      .glyph-highlighted {
        position: relative;
        animation: glyphDiscovered 0.5s ease-out;
      }

      .glyph-highlight-effect {
        border: 2px solid #00ffcc;
        border-radius: 5px;
        animation: highlightPulse 2s infinite;
        z-index: 9998;
      }

      /* Animations */
      @keyframes glyphPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      @keyframes statusPulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 5px #00ffcc; }
        50% { opacity: 0.5; box-shadow: 0 0 15px #00ffcc; }
      }

      @keyframes glyphDiscovered {
        0% { background: rgba(0,255,204,0); }
        50% { background: rgba(0,255,204,0.3); }
        100% { background: rgba(0,255,204,0); }
      }

      @keyframes highlightPulse {
        0%, 100% { border-color: #00ffcc; box-shadow: 0 0 5px #00ffcc; }
        50% { border-color: #ffaa00; box-shadow: 0 0 15px #ffaa00; }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Global instance
window.SpectralDecodeHUD = SpectralDecodeHUD;