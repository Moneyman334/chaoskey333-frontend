// Eternal Fusion Core Multilingual Cinematic JavaScript

// Global state
let currentLanguage = 'en';
let cinematicRunning = false;
let cinematicPaused = false;
let globalSyncMode = false;
let walletConnected = false;
let currentWhisperIndex = 0;
let cinematicStartTime = null;

// Multilingual Glyph Whispers
const glyphWhispers = {
  en: [
    { text: "The Eternal Fusion Core awakens...", glyph: "◇◆◇", time: 2000 },
    { text: "Ancient protocols emerge from the void", glyph: "⬢⬡⬢", time: 4000 },
    { text: "Chaos and Order unite in perfect harmony", glyph: "◊◈◊", time: 6000 },
    { text: "The Key unlocks infinite possibilities", glyph: "⟐⟡⟐", time: 8000 },
    { text: "Transcendence through digital alchemy", glyph: "◇⬢◇", time: 10000 },
    { text: "Your vault holds the power of creation", glyph: "⬡◈⬡", time: 12000 }
  ],
  es: [
    { text: "El Núcleo de Fusión Eterna despierta...", glyph: "◇◆◇", time: 2000 },
    { text: "Protocolos antiguos emergen del vacío", glyph: "⬢⬡⬢", time: 4000 },
    { text: "Caos y Orden se unen en perfecta armonía", glyph: "◊◈◊", time: 6000 },
    { text: "La Llave desbloquea posibilidades infinitas", glyph: "⟐⟡⟐", time: 8000 },
    { text: "Trascendencia a través de la alquimia digital", glyph: "◇⬢◇", time: 10000 },
    { text: "Tu bóveda posee el poder de la creación", glyph: "⬡◈⬡", time: 12000 }
  ],
  jp: [
    { text: "永遠の融合コアが目覚める...", glyph: "◇◆◇", time: 2000 },
    { text: "古代のプロトコルが虚無から現れる", glyph: "⬢⬡⬢", time: 4000 },
    { text: "混沌と秩序が完璧な調和で結ばれる", glyph: "◊◈◊", time: 6000 },
    { text: "鍵が無限の可能性を解き放つ", glyph: "⟐⟡⟐", time: 8000 },
    { text: "デジタル錬金術による超越", glyph: "◇⬢◇", time: 10000 },
    { text: "あなたの金庫は創造の力を秘めている", glyph: "⬡◈⬡", time: 12000 }
  ],
  ar: [
    { text: "نواة الاندماج الأبدي تستيقظ...", glyph: "◇◆◇", time: 2000 },
    { text: "البروتوكولات القديمة تظهر من الفراغ", glyph: "⬢⬡⬢", time: 4000 },
    { text: "الفوضى والنظام يتحدان في انسجام مثالي", glyph: "◊◈◊", time: 6000 },
    { text: "المفتاح يفتح إمكانيات لا نهائية", glyph: "⟐⟡⟐", time: 8000 },
    { text: "التسامي من خلال الكيمياء الرقمية", glyph: "◇⬢◇", time: 10000 },
    { text: "خزنتك تحمل قوة الخلق", glyph: "⬡◈⬡", time: 12000 }
  ],
  ru: [
    { text: "Вечное Ядро Слияния пробуждается...", glyph: "◇◆◇", time: 2000 },
    { text: "Древние протоколы возникают из пустоты", glyph: "⬢⬡⬢", time: 4000 },
    { text: "Хаос и Порядок объединяются в совершенной гармонии", glyph: "◊◈◊", time: 6000 },
    { text: "Ключ открывает бесконечные возможности", glyph: "⟐⟡⟐", time: 8000 },
    { text: "Трансценденция через цифровую алхимию", glyph: "◇⬢◇", time: 10000 },
    { text: "Ваше хранилище держит силу творения", glyph: "⬡◈⬡", time: 12000 }
  ]
};

// Language color mappings
const languageColors = {
  en: "#00ffcc",
  es: "#ff6600", 
  jp: "#ff00ff",
  ar: "#ffaa00",
  ru: "#0099ff"
};

// Initialize cinematic
function initializeCinematic() {
  console.log("🎬 Initializing Eternal Fusion Core Cinematic...");
  
  setupEventListeners();
  updateLanguageDisplay();
  checkWalletConnection();
  updateGlobalTime();
  
  // Start background effects immediately
  startBackgroundEffects();
}

// Setup event listeners
function setupEventListeners() {
  // Language selector buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });

  // Control buttons
  document.getElementById('startCinematic').addEventListener('click', startCinematic);
  document.getElementById('pauseCinematic').addEventListener('click', pauseCinematic);
  document.getElementById('syncGlobal').addEventListener('click', toggleGlobalSync);
  document.getElementById('joinPremiere').addEventListener('click', joinGlobalPremiere);
}

// Switch language
function switchLanguage(lang) {
  currentLanguage = lang;
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
  
  // Update background aura color
  const aura = document.getElementById('backgroundAura');
  aura.className = `background-aura ${lang}`;
  
  // Update subtitle styling
  const subtitleText = document.getElementById('subtitleText');
  subtitleText.style.color = languageColors[lang];
  subtitleText.style.borderColor = languageColors[lang] + '50';
  subtitleText.style.textShadow = `0 0 10px ${languageColors[lang]}, 0 0 20px ${languageColors[lang]}`;
  
  updateLanguageDisplay();
  
  console.log(`🌍 Language switched to: ${lang}`);
}

// Update language display in metadata
function updateLanguageDisplay() {
  const languageNames = {
    en: "English",
    es: "Español", 
    jp: "日本語",
    ar: "العربية",
    ru: "Русский"
  };
  
  document.getElementById('selectedLanguage').textContent = languageNames[currentLanguage];
}

// Start cinematic sequence
function startCinematic() {
  if (cinematicRunning && !cinematicPaused) return;
  
  console.log("🚀 Starting Eternal Fusion Cinematic...");
  
  cinematicRunning = true;
  cinematicPaused = false;
  cinematicStartTime = Date.now();
  currentWhisperIndex = 0;
  
  // Update controls
  document.getElementById('startCinematic').disabled = true;
  document.getElementById('pauseCinematic').disabled = false;
  
  // Update metadata
  document.getElementById('fusionSequence').textContent = "Active";
  
  // Start audio
  const audio = document.getElementById('fusionAudio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio autoplay blocked:", e));
  }
  
  // Start whisper sequence
  startWhisperSequence();
  
  // Update progress
  updateProgress();
}

// Pause cinematic
function pauseCinematic() {
  if (!cinematicRunning) return;
  
  cinematicPaused = !cinematicPaused;
  
  const btn = document.getElementById('pauseCinematic');
  btn.textContent = cinematicPaused ? "▶ Resume" : "⏸ Pause";
  
  const audio = document.getElementById('fusionAudio');
  if (audio) {
    if (cinematicPaused) {
      audio.pause();
    } else {
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  }
  
  console.log(`⏸ Cinematic ${cinematicPaused ? 'paused' : 'resumed'}`);
}

// Start whisper sequence
function startWhisperSequence() {
  if (!cinematicRunning || cinematicPaused) return;
  
  const whispers = glyphWhispers[currentLanguage];
  if (currentWhisperIndex >= whispers.length) {
    // Sequence complete
    completeCinematic();
    return;
  }
  
  const whisper = whispers[currentWhisperIndex];
  displayWhisper(whisper);
  
  // Schedule next whisper
  setTimeout(() => {
    currentWhisperIndex++;
    startWhisperSequence();
  }, whisper.time);
}

// Display whisper with glyph
function displayWhisper(whisper) {
  const subtitleText = document.getElementById('subtitleText');
  const subtitleGlyph = document.getElementById('subtitleGlyph');
  
  // Fade out current text
  subtitleText.style.opacity = '0';
  subtitleGlyph.style.opacity = '0';
  
  setTimeout(() => {
    // Update text and fade in
    subtitleText.textContent = whisper.text;
    subtitleGlyph.textContent = whisper.glyph;
    
    subtitleText.style.opacity = '1';
    subtitleGlyph.style.opacity = '1';
    
    // Trigger core bloom pulse
    triggerCorePulse();
    
    console.log(`💬 Whisper: ${whisper.text}`);
  }, 300);
}

// Trigger core pulse synchronized with whispers
function triggerCorePulse() {
  const coreBloom = document.querySelector('.core-bloom');
  const plasmaArcs = document.querySelectorAll('.plasma-arc');
  
  // Add pulse effect
  coreBloom.style.animation = 'none';
  plasmaArcs.forEach(arc => arc.style.animation = 'none');
  
  setTimeout(() => {
    coreBloom.style.animation = 'coreBloom 1s ease-in-out, coreBloom 4s ease-in-out infinite 1s';
    plasmaArcs.forEach((arc, index) => {
      arc.style.animation = `plasmaRotation 1.5s linear infinite ${index * -0.5}s`;
    });
  }, 50);
}

// Update progress indicator
function updateProgress() {
  if (!cinematicRunning) return;
  
  const totalDuration = 12000; // Total cinematic duration
  const elapsed = Date.now() - cinematicStartTime;
  const progress = Math.min((elapsed / totalDuration) * 100, 100);
  
  document.getElementById('progressFill').style.width = `${progress}%`;
  
  if (progress < 100) {
    document.getElementById('progressText').textContent = `Fusion Progress: ${Math.round(progress)}%`;
    setTimeout(updateProgress, 100);
  } else {
    document.getElementById('progressText').textContent = "Fusion Complete";
  }
}

// Complete cinematic sequence
function completeCinematic() {
  console.log("✨ Cinematic sequence completed!");
  
  cinematicRunning = false;
  cinematicPaused = false;
  
  // Update controls
  document.getElementById('startCinematic').disabled = false;
  document.getElementById('startCinematic').textContent = "▶ Replay Fusion";
  document.getElementById('pauseCinematic').disabled = true;
  
  // Update metadata
  document.getElementById('fusionSequence').textContent = "Complete";
  
  // Final whisper
  setTimeout(() => {
    displayFinalMessage();
  }, 1000);
}

// Display final completion message
function displayFinalMessage() {
  const finalMessages = {
    en: "The Eternal Fusion is complete. Your vault transcends reality.",
    es: "La Fusión Eterna está completa. Tu bóveda trasciende la realidad.",
    jp: "永遠の融合が完了しました。あなたの金庫は現実を超越します。",
    ar: "الاندماج الأبدي مكتمل. خزنتك تتجاوز الواقع.",
    ru: "Вечное Слияние завершено. Ваше хранилище превосходит реальность."
  };
  
  const subtitleText = document.getElementById('subtitleText');
  const subtitleGlyph = document.getElementById('subtitleGlyph');
  
  subtitleText.textContent = finalMessages[currentLanguage];
  subtitleGlyph.textContent = "⟐◇⬢◇⟐";
  
  // Add special completion styling
  subtitleText.style.fontSize = '1.8rem';
  subtitleText.style.animation = 'primaryGlow 2s ease-in-out infinite';
}

// Start background effects
function startBackgroundEffects() {
  // Core rotation and plasma effects are handled by CSS
  // This function can be extended for additional dynamic effects
  console.log("🌌 Background fusion effects active");
}

// Toggle global sync mode
function toggleGlobalSync() {
  globalSyncMode = !globalSyncMode;
  const panel = document.getElementById('globalSyncPanel');
  
  if (globalSyncMode) {
    panel.classList.remove('hidden');
    updateGlobalTime();
  } else {
    panel.classList.add('hidden');
  }
  
  console.log(`🌍 Global sync mode: ${globalSyncMode ? 'ON' : 'OFF'}`);
}

// Update global time zones
function updateGlobalTime() {
  const now = new Date();
  
  // Calculate next premiere time (every hour on the hour)
  const nextPremiere = new Date(now);
  nextPremiere.setHours(nextPremiere.getHours() + 1, 0, 0, 0);
  
  document.getElementById('syncTime').textContent = `Next Premiere: ${nextPremiere.toLocaleTimeString()}`;
  
  // Update time zones
  const timeZones = {
    EST: 'America/New_York',
    GMT: 'Europe/London', 
    JST: 'Asia/Tokyo'
  };
  
  Object.entries(timeZones).forEach(([zone, timezone]) => {
    const time = new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById(`tz${zone}`).textContent = time;
  });
  
  // Update every minute
  setTimeout(updateGlobalTime, 60000);
}

// Join global premiere
function joinGlobalPremiere() {
  console.log("🌍 Joining global premiere...");
  
  // Close sync panel
  globalSyncMode = false;
  document.getElementById('globalSyncPanel').classList.add('hidden');
  
  // Start cinematic with global sync
  startCinematic();
  
  // Show premiere message
  const subtitleText = document.getElementById('subtitleText');
  subtitleText.textContent = "🌍 Connected to Global Premiere";
  subtitleText.style.color = "#ffaa00";
  subtitleText.style.opacity = "1";
  
  setTimeout(() => {
    subtitleText.style.color = languageColors[currentLanguage];
  }, 2000);
}

// Check wallet connection
function checkWalletConnection() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          walletConnected = true;
          const address = accounts[0];
          document.getElementById('connectedWallet').textContent = 
            `${address.slice(0, 6)}...${address.slice(-4)}`;
          console.log("🔌 Wallet connected:", address);
        }
      })
      .catch(console.error);
  }
}

// NFT Metadata integration
function updateNFTMetadata() {
  if (!walletConnected) return;
  
  // Simulate NFT metadata with language pack
  const metadata = {
    name: "Eternal Fusion Core NFT",
    description: "A transcendent cinematic experience",
    attributes: [
      {
        trait_type: "Language Pack",
        value: currentLanguage.toUpperCase()
      },
      {
        trait_type: "Fusion Status", 
        value: cinematicRunning ? "Active" : "Dormant"
      },
      {
        trait_type: "Rarity",
        value: "Mythic"
      }
    ]
  };
  
  console.log("🔮 NFT Metadata updated:", metadata);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeCinematic);

// Handle window events
window.addEventListener('beforeunload', () => {
  const audio = document.getElementById('fusionAudio');
  if (audio) {
    audio.pause();
  }
});

// Expose functions for debugging
window.cinematicDebug = {
  startCinematic,
  switchLanguage,
  toggleGlobalSync,
  updateNFTMetadata
};