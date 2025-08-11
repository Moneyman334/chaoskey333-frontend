// Multilingual Glyph Captions System
// ChaosKey333 Vault International Support

class MultilingualGlyphCaptions {
  constructor() {
    this.currentLanguage = 'en';
    this.availableLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'ru'];
    this.glyphTranslations = {};
    this.interfaceTranslations = {};
    this.isInitialized = false;
    
    this.initializeI18n();
  }
  
  initializeI18n() {
    console.log("🌍 Initializing Multilingual Glyph Captions...");
    this.loadTranslations();
    this.detectUserLanguage();
    this.createLanguageSelector();
    this.setupDynamicTranslation();
    this.isInitialized = true;
    console.log("✅ Multilingual system initialized with", this.availableLanguages.length, "languages");
  }
  
  loadTranslations() {
    // Glyph and symbol translations
    this.glyphTranslations = {
      en: {
        // Evolution States
        'origin_flare': 'Origin Flare',
        'chaos_spark': 'Chaos Spark',
        'solver_touched': 'Solver Touched',
        'lore_awakened': 'Lore Awakened',
        'vault_ascended': 'Vault Ascended',
        'cosmic_complete': 'Cosmic Complete',
        
        // Timeline Events
        'mutation_event': 'Mutation Event',
        'solver_imprint': 'Solver Imprint',
        'lore_fragment': 'Lore Fragment',
        'evolution_complete': 'Evolution Complete',
        'vault_transfer': 'Vault Transfer',
        'genesis_moment': 'Genesis Moment',
        
        // Spectral Analysis
        'frequency_analysis': 'Frequency Analysis',
        'evolution_intensity': 'Evolution Intensity',
        'resonance_pattern': 'Resonance Pattern',
        'mutation_rate': 'Mutation Rate',
        'spectral_signature': 'Spectral Signature',
        
        // Status Messages
        'syncing_hud': 'Syncing with Spectral HUD',
        'replay_ready': 'Ready to replay relic evolution',
        'analysis_complete': 'Spectral analysis complete',
        'timeline_updated': 'Timeline updated',
        'auto_save_triggered': 'Auto-save triggered'
      },
      
      es: {
        // Evolution States
        'origin_flare': 'Llamarada de Origen',
        'chaos_spark': 'Chispa del Caos',
        'solver_touched': 'Tocado por Solver',
        'lore_awakened': 'Saber Despertado',
        'vault_ascended': 'Bóveda Ascendida',
        'cosmic_complete': 'Cósmico Completo',
        
        // Timeline Events
        'mutation_event': 'Evento de Mutación',
        'solver_imprint': 'Huella de Solver',
        'lore_fragment': 'Fragmento de Saber',
        'evolution_complete': 'Evolución Completa',
        'vault_transfer': 'Transferencia de Bóveda',
        'genesis_moment': 'Momento Génesis',
        
        // Spectral Analysis
        'frequency_analysis': 'Análisis de Frecuencia',
        'evolution_intensity': 'Intensidad de Evolución',
        'resonance_pattern': 'Patrón de Resonancia',
        'mutation_rate': 'Tasa de Mutación',
        'spectral_signature': 'Firma Espectral',
        
        // Status Messages
        'syncing_hud': 'Sincronizando con HUD Espectral',
        'replay_ready': 'Listo para repetir evolución de reliquia',
        'analysis_complete': 'Análisis espectral completo',
        'timeline_updated': 'Línea de tiempo actualizada',
        'auto_save_triggered': 'Auto-guardado activado'
      },
      
      fr: {
        // Evolution States
        'origin_flare': 'Flamme d\'Origine',
        'chaos_spark': 'Étincelle du Chaos',
        'solver_touched': 'Touché par Solver',
        'lore_awakened': 'Savoir Éveillé',
        'vault_ascended': 'Coffre Ascensionné',
        'cosmic_complete': 'Cosmique Complet',
        
        // Timeline Events
        'mutation_event': 'Événement de Mutation',
        'solver_imprint': 'Empreinte de Solver',
        'lore_fragment': 'Fragment de Savoir',
        'evolution_complete': 'Évolution Complète',
        'vault_transfer': 'Transfert de Coffre',
        'genesis_moment': 'Moment Genèse',
        
        // Spectral Analysis
        'frequency_analysis': 'Analyse de Fréquence',
        'evolution_intensity': 'Intensité d\'Évolution',
        'resonance_pattern': 'Motif de Résonance',
        'mutation_rate': 'Taux de Mutation',
        'spectral_signature': 'Signature Spectrale',
        
        // Status Messages
        'syncing_hud': 'Synchronisation avec HUD Spectral',
        'replay_ready': 'Prêt à rejouer l\'évolution de relique',
        'analysis_complete': 'Analyse spectrale terminée',
        'timeline_updated': 'Chronologie mise à jour',
        'auto_save_triggered': 'Sauvegarde auto déclenchée'
      },
      
      de: {
        // Evolution States
        'origin_flare': 'Ursprungsflare',
        'chaos_spark': 'Chaosfunke',
        'solver_touched': 'Solver Berührt',
        'lore_awakened': 'Wissen Erwacht',
        'vault_ascended': 'Tresor Aufgestiegen',
        'cosmic_complete': 'Kosmisch Vollständig',
        
        // Timeline Events
        'mutation_event': 'Mutationsereignis',
        'solver_imprint': 'Solver-Abdruck',
        'lore_fragment': 'Wissens-Fragment',
        'evolution_complete': 'Evolution Vollständig',
        'vault_transfer': 'Tresor-Transfer',
        'genesis_moment': 'Genesis-Moment',
        
        // Spectral Analysis
        'frequency_analysis': 'Frequenzanalyse',
        'evolution_intensity': 'Evolutionsintensität',
        'resonance_pattern': 'Resonanzmuster',
        'mutation_rate': 'Mutationsrate',
        'spectral_signature': 'Spektralsignatur',
        
        // Status Messages
        'syncing_hud': 'Synchronisierung mit Spektral-HUD',
        'replay_ready': 'Bereit für Reliquien-Evolution Wiedergabe',
        'analysis_complete': 'Spektralanalyse abgeschlossen',
        'timeline_updated': 'Zeitlinie aktualisiert',
        'auto_save_triggered': 'Auto-Speicherung ausgelöst'
      },
      
      ja: {
        // Evolution States
        'origin_flare': 'オリジンフレア',
        'chaos_spark': 'カオススパーク',
        'solver_touched': 'ソルバータッチ',
        'lore_awakened': 'ロア覚醒',
        'vault_ascended': 'ヴォルト昇天',
        'cosmic_complete': 'コズミック完成',
        
        // Timeline Events
        'mutation_event': '変異イベント',
        'solver_imprint': 'ソルバー刻印',
        'lore_fragment': 'ロアフラグメント',
        'evolution_complete': '進化完了',
        'vault_transfer': 'ヴォルト転送',
        'genesis_moment': '創世の瞬間',
        
        // Spectral Analysis
        'frequency_analysis': '周波数解析',
        'evolution_intensity': '進化強度',
        'resonance_pattern': '共鳴パターン',
        'mutation_rate': '変異率',
        'spectral_signature': 'スペクトラル署名',
        
        // Status Messages
        'syncing_hud': 'スペクトラルHUDと同期中',
        'replay_ready': 'レリック進化リプレイ準備完了',
        'analysis_complete': 'スペクトラル解析完了',
        'timeline_updated': 'タイムライン更新',
        'auto_save_triggered': '自動保存実行'
      },
      
      zh: {
        // Evolution States
        'origin_flare': '起源耀斑',
        'chaos_spark': '混沌火花',
        'solver_touched': '求解者触碰',
        'lore_awakened': '传说觉醒',
        'vault_ascended': '宝库升华',
        'cosmic_complete': '宇宙完成',
        
        // Timeline Events
        'mutation_event': '变异事件',
        'solver_imprint': '求解者印记',
        'lore_fragment': '传说片段',
        'evolution_complete': '进化完成',
        'vault_transfer': '宝库转移',
        'genesis_moment': '创世时刻',
        
        // Spectral Analysis
        'frequency_analysis': '频率分析',
        'evolution_intensity': '进化强度',
        'resonance_pattern': '共振模式',
        'mutation_rate': '变异率',
        'spectral_signature': '光谱签名',
        
        // Status Messages
        'syncing_hud': '与光谱HUD同步',
        'replay_ready': '圣物进化回放就绪',
        'analysis_complete': '光谱分析完成',
        'timeline_updated': '时间线已更新',
        'auto_save_triggered': '自动保存触发'
      }
    };
    
    // Interface element translations
    this.interfaceTranslations = {
      en: {
        'cosmic_replay_terminal': 'Cosmic Replay Terminal',
        'spectral_decode_hud': 'Spectral Decode HUD',
        'vault_timeline_map': 'Vault Pulse Timeline Map',
        'play': 'PLAY',
        'pause': 'PAUSE',
        'stop': 'STOP',
        'speed': 'Speed',
        'spectrogram': 'SPECTROGRAM',
        'slow_motion': 'SLOW MOTION',
        'freeze_moment': 'FREEZE MOMENT',
        'deep_analyze': 'DEEP ANALYZE',
        'export_analysis': 'EXPORT',
        'language': 'Language'
      },
      
      es: {
        'cosmic_replay_terminal': 'Terminal de Repetición Cósmica',
        'spectral_decode_hud': 'HUD de Decodificación Espectral',
        'vault_timeline_map': 'Mapa de Línea de Tiempo de Bóveda',
        'play': 'REPRODUCIR',
        'pause': 'PAUSAR',
        'stop': 'DETENER',
        'speed': 'Velocidad',
        'spectrogram': 'ESPECTROGRAMA',
        'slow_motion': 'CÁMARA LENTA',
        'freeze_moment': 'CONGELAR MOMENTO',
        'deep_analyze': 'ANÁLISIS PROFUNDO',
        'export_analysis': 'EXPORTAR',
        'language': 'Idioma'
      },
      
      fr: {
        'cosmic_replay_terminal': 'Terminal de Lecture Cosmique',
        'spectral_decode_hud': 'HUD de Décodage Spectral',
        'vault_timeline_map': 'Carte de Chronologie de Coffre',
        'play': 'JOUER',
        'pause': 'PAUSE',
        'stop': 'ARRÊT',
        'speed': 'Vitesse',
        'spectrogram': 'SPECTROGRAMME',
        'slow_motion': 'RALENTI',
        'freeze_moment': 'GELER MOMENT',
        'deep_analyze': 'ANALYSER PROFOND',
        'export_analysis': 'EXPORTER',
        'language': 'Langue'
      },
      
      de: {
        'cosmic_replay_terminal': 'Kosmisches Wiedergabe-Terminal',
        'spectral_decode_hud': 'Spektral-Dekodierungs-HUD',
        'vault_timeline_map': 'Tresor-Zeitlinie-Karte',
        'play': 'SPIELEN',
        'pause': 'PAUSE',
        'stop': 'STOPP',
        'speed': 'Geschwindigkeit',
        'spectrogram': 'SPEKTROGRAMM',
        'slow_motion': 'ZEITLUPE',
        'freeze_moment': 'MOMENT EINFRIEREN',
        'deep_analyze': 'TIEFANALYSE',
        'export_analysis': 'EXPORTIEREN',
        'language': 'Sprache'
      },
      
      ja: {
        'cosmic_replay_terminal': 'コズミックリプレイターミナル',
        'spectral_decode_hud': 'スペクトラルデコードHUD',
        'vault_timeline_map': 'ヴォルトタイムラインマップ',
        'play': '再生',
        'pause': '一時停止',
        'stop': '停止',
        'speed': '速度',
        'spectrogram': 'スペクトログラム',
        'slow_motion': 'スローモーション',
        'freeze_moment': '瞬間凍結',
        'deep_analyze': '深層解析',
        'export_analysis': 'エクスポート',
        'language': '言語'
      },
      
      zh: {
        'cosmic_replay_terminal': '宇宙回放终端',
        'spectral_decode_hud': '光谱解码HUD',
        'vault_timeline_map': '宝库时间线地图',
        'play': '播放',
        'pause': '暂停',
        'stop': '停止',
        'speed': '速度',
        'spectrogram': '频谱图',
        'slow_motion': '慢动作',
        'freeze_moment': '冻结瞬间',
        'deep_analyze': '深度分析',
        'export_analysis': '导出',
        'language': '语言'
      }
    };
  }
  
  detectUserLanguage() {
    // Detect user's preferred language
    const savedLang = localStorage.getItem('chaoskey_language');
    if (savedLang && this.availableLanguages.includes(savedLang)) {
      this.currentLanguage = savedLang;
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (this.availableLanguages.includes(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }
    
    console.log("🌍 Detected language:", this.currentLanguage);
  }
  
  createLanguageSelector() {
    const languageNames = {
      en: '🇺🇸 English',
      es: '🇪🇸 Español',
      fr: '🇫🇷 Français',
      de: '🇩🇪 Deutsch',
      ja: '🇯🇵 日本語',
      zh: '🇨🇳 中文',
      ko: '🇰🇷 한국어',
      ru: '🇷🇺 Русский'
    };
    
    const selector = document.createElement('div');
    selector.id = 'languageSelector';
    selector.innerHTML = `
      <div class="language-selector">
        <label for="langSelect">🌍 ${this.t('language', 'interface')}:</label>
        <select id="langSelect" onchange="changeLanguage(this.value)">
          ${this.availableLanguages.map(lang => 
            `<option value="${lang}" ${lang === this.currentLanguage ? 'selected' : ''}>
              ${languageNames[lang] || lang.toUpperCase()}
            </option>`
          ).join('')}
        </select>
      </div>
    `;
    
    // Add selector styles
    const style = document.createElement('style');
    style.textContent = `
      .language-selector {
        position: fixed;
        top: 20px;
        right: 380px;
        background: rgba(16, 33, 62, 0.9);
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 8px 12px;
        font-family: 'Courier New', monospace;
        color: #00ffff;
        font-size: 12px;
        z-index: 1001;
        backdrop-filter: blur(5px);
      }
      
      .language-selector label {
        margin-right: 8px;
        color: #aaffff;
      }
      
      .language-selector select {
        background: #333;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 11px;
        font-family: inherit;
      }
      
      .language-selector select:focus {
        outline: none;
        box-shadow: 0 0 5px #00ffff;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(selector);
  }
  
  setupDynamicTranslation() {
    // Set up mutation observer to translate new elements
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.translateElement(node);
            }
          });
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial translation of existing elements
    this.translatePage();
  }
  
  translatePage() {
    // Translate all existing elements
    this.translateElement(document.body);
  }
  
  translateElement(element) {
    // Translate text content with data-i18n attributes
    const elementsToTranslate = element.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const namespace = el.getAttribute('data-i18n-ns') || 'glyph';
      el.textContent = this.t(key, namespace);
    });
    
    // Also check the element itself
    if (element.hasAttribute && element.hasAttribute('data-i18n')) {
      const key = element.getAttribute('data-i18n');
      const namespace = element.getAttribute('data-i18n-ns') || 'glyph';
      element.textContent = this.t(key, namespace);
    }
  }
  
  t(key, namespace = 'glyph') {
    // Get translation for a key
    const translations = namespace === 'interface' ? 
      this.interfaceTranslations : 
      this.glyphTranslations;
    
    if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
      return translations[this.currentLanguage][key];
    }
    
    // Fallback to English
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    
    // Fallback to key itself
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  changeLanguage(newLanguage) {
    if (!this.availableLanguages.includes(newLanguage)) return;
    
    console.log("🌍 Changing language from", this.currentLanguage, "to", newLanguage);
    
    this.currentLanguage = newLanguage;
    localStorage.setItem('chaoskey_language', newLanguage);
    
    // Re-translate the entire page
    this.translatePage();
    
    // Update any dynamic content
    this.updateDynamicContent();
    
    // Emit language change event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { 
        language: newLanguage,
        previousLanguage: this.currentLanguage 
      }
    }));
    
    console.log("✅ Language changed to", newLanguage);
  }
  
  updateDynamicContent() {
    // Update any elements that need special handling
    
    // Update Cosmic Replay Terminal
    if (window.cosmicTerminal) {
      this.updateCosmicTerminalLanguage();
    }
    
    // Update Spectral HUD
    if (window.spectralHUD) {
      this.updateSpectralHUDLanguage();
    }
    
    // Update Timeline
    if (window.vaultTimeline) {
      this.updateTimelineLanguage();
    }
  }
  
  updateCosmicTerminalLanguage() {
    // Update terminal display text
    const currentState = document.getElementById('currentState');
    if (currentState && window.cosmicTerminal) {
      const data = window.cosmicTerminal.getCurrentEvolutionData();
      if (data) {
        const stateKey = data.state.toLowerCase().replace(/\s+/g, '_');
        currentState.textContent = this.t(stateKey);
      }
    }
    
    // Update evolution display
    const evolutionDisplay = document.getElementById('evolutionDisplay');
    if (evolutionDisplay && window.cosmicTerminal) {
      const data = window.cosmicTerminal.getCurrentEvolutionData();
      if (data) {
        window.cosmicTerminal.updateEvolutionDisplay(data);
      }
    }
  }
  
  updateSpectralHUDLanguage() {
    // Update HUD moment history
    if (window.spectralHUD && window.spectralHUD.evolutionMoments.length > 0) {
      const momentList = document.getElementById('momentList');
      if (momentList) {
        momentList.innerHTML = '';
        window.spectralHUD.evolutionMoments.slice(-10).forEach(moment => {
          const momentElement = document.createElement('div');
          momentElement.className = 'moment-item';
          
          const timeStr = this.formatTime(moment.time);
          const typeStr = this.t(moment.type + '_event');
          const intensityStr = Math.round(moment.analysis.intensity) + '%';
          
          momentElement.innerHTML = `
            ${timeStr} - ${typeStr} (${intensityStr})
            <br>🎵 ${moment.analysis.frequency}Hz
          `;
          
          momentList.appendChild(momentElement);
        });
      }
    }
  }
  
  updateTimelineLanguage() {
    // Update timeline event descriptions
    if (window.vaultTimeline && window.vaultTimeline.timelineEvents) {
      window.vaultTimeline.timelineEvents.forEach(event => {
        // Translate event titles and descriptions if they use translation keys
        if (event.titleKey) {
          event.title = this.t(event.titleKey);
        }
        if (event.descriptionKey) {
          event.description = this.t(event.descriptionKey);
        }
      });
      
      // Refresh timeline display
      window.vaultTimeline.refreshTimeline();
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Public API methods
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  getAvailableLanguages() {
    return [...this.availableLanguages];
  }
  
  addTranslation(language, namespace, key, value) {
    const translations = namespace === 'interface' ? 
      this.interfaceTranslations : 
      this.glyphTranslations;
    
    if (!translations[language]) {
      translations[language] = {};
    }
    
    translations[language][key] = value;
    console.log(`🌍 Added translation: ${language}.${namespace}.${key} = ${value}`);
  }
  
  addLanguage(languageCode, languageName) {
    if (!this.availableLanguages.includes(languageCode)) {
      this.availableLanguages.push(languageCode);
      
      // Add empty translation objects
      this.glyphTranslations[languageCode] = {};
      this.interfaceTranslations[languageCode] = {};
      
      // Refresh language selector
      const selector = document.getElementById('langSelect');
      if (selector) {
        const option = document.createElement('option');
        option.value = languageCode;
        option.textContent = languageName;
        selector.appendChild(option);
      }
      
      console.log(`🌍 Added new language: ${languageCode} (${languageName})`);
    }
  }
}

// Global functions
function changeLanguage(language) {
  if (window.multilingualSystem) {
    window.multilingualSystem.changeLanguage(language);
  }
}

// Helper function to translate text
function t(key, namespace = 'glyph') {
  if (window.multilingualSystem) {
    return window.multilingualSystem.t(key, namespace);
  }
  return key;
}

// Initialize multilingual system when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.multilingualSystem = new MultilingualGlyphCaptions();
  console.log("🌍 Multilingual Glyph Captions system loaded and ready");
});