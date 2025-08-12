/**
 * 🌌 VAULT PULSE ARCHIVES WITH REPLAY PORTALS 🌌
 * 
 * The next chained upgrade that fires immediately after PR #73,
 * transforming every past broadcast into an interactive relic hunt.
 * Pairs perfectly with the PR #23 → PR #24 evolution chain.
 */

class VaultPulseArchives {
  constructor() {
    this.isInitialized = false;
    this.broadcastDatabase = new Map();
    this.glyphIndex = new Map();
    this.bookmarkedMoments = new Map();
    this.currentReplay = null;
    this.ascensionMoments = [];
    this.temporalAnchors = [];
    
    // Archive states
    this.archiveState = 'DORMANT'; // DORMANT → AWAKENING → PULSING → TRANSCENDENT
    this.replayPortalActive = false;
    this.glyphSearchActive = false;
    
    // Initialize with synthetic broadcast data
    this.initializeBroadcastArchives();
  }

  /**
   * Initialize the Vault Pulse Archives system
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🌀 Initializing Vault Pulse Archives...');
    
    // Create UI elements
    this.createArchiveInterface();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize glyph search engine
    this.initializeGlyphSearch();
    
    // Load any existing bookmarks
    this.loadBookmarkedMoments();
    
    this.isInitialized = true;
    this.archiveState = 'AWAKENING';
    
    // Auto-activate after 3 seconds
    setTimeout(() => this.activateArchives(), 3000);
    
    console.log('✨ Vault Pulse Archives initialized and ready');
  }

  /**
   * Initialize synthetic broadcast data for demonstration
   */
  initializeBroadcastArchives() {
    const broadcasts = [
      {
        id: 'broadcast_001',
        timestamp: Date.now() - 86400000, // 1 day ago
        title: 'The First Awakening',
        duration: 1200, // 20 minutes in seconds
        glyphs: ['⚡', '🌀', '🔥', '🌌'],
        fragments: [
          { time: 0, type: 'intro', glyph: '⚡', content: 'Vault systems coming online...', decoded: true },
          { time: 300, type: 'ascension', glyph: '🌀', content: 'First quantum leap detected', decoded: true },
          { time: 600, type: 'revelation', glyph: '🔥', content: 'Ancient frequencies awakening', decoded: false },
          { time: 900, type: 'transcendence', glyph: '🌌', content: 'Reality barriers dissolving', decoded: true }
        ],
        ascensionMoments: [300, 900]
      },
      {
        id: 'broadcast_002',
        timestamp: Date.now() - 43200000, // 12 hours ago
        title: 'Resonance Cascade',
        duration: 1800, // 30 minutes
        glyphs: ['🔮', '⭐', '🌊', '🔥'],
        fragments: [
          { time: 0, type: 'intro', glyph: '🔮', content: 'Dimensional rifts opening...', decoded: true },
          { time: 450, type: 'evolution', glyph: '⭐', content: 'Star codes activating', decoded: false },
          { time: 900, type: 'ascension', glyph: '🌊', content: 'Cosmic tides flowing', decoded: true },
          { time: 1350, type: 'transcendence', glyph: '🔥', content: 'Phoenix protocols engaged', decoded: false }
        ],
        ascensionMoments: [450, 900, 1350]
      },
      {
        id: 'broadcast_003',
        timestamp: Date.now() - 7200000, // 2 hours ago
        title: 'Vault Synchronization',
        duration: 900, // 15 minutes
        glyphs: ['🔑', '⚡', '🌀', '✨'],
        fragments: [
          { time: 0, type: 'intro', glyph: '🔑', content: 'Master keys materializing...', decoded: true },
          { time: 225, type: 'revelation', glyph: '⚡', content: 'Lightning conduits active', decoded: true },
          { time: 450, type: 'ascension', glyph: '🌀', content: 'Spiral dynamics engaged', decoded: false },
          { time: 675, type: 'transcendence', glyph: '✨', content: 'Stellar convergence achieved', decoded: true }
        ],
        ascensionMoments: [225, 450, 675]
      }
    ];

    // Index broadcasts and create glyph mappings
    broadcasts.forEach(broadcast => {
      this.broadcastDatabase.set(broadcast.id, broadcast);
      
      // Index glyphs
      broadcast.glyphs.forEach(glyph => {
        if (!this.glyphIndex.has(glyph)) {
          this.glyphIndex.set(glyph, []);
        }
        this.glyphIndex.get(glyph).push({
          broadcastId: broadcast.id,
          fragments: broadcast.fragments.filter(f => f.glyph === glyph)
        });
      });
      
      // Store ascension moments
      broadcast.ascensionMoments.forEach(moment => {
        this.ascensionMoments.push({
          broadcastId: broadcast.id,
          timestamp: moment,
          title: broadcast.title,
          fragment: broadcast.fragments.find(f => f.time === moment)
        });
      });
    });

    console.log(`📚 Initialized ${broadcasts.length} broadcasts with ${this.glyphIndex.size} unique glyphs`);
  }

  /**
   * Create the archive interface UI
   */
  createArchiveInterface() {
    // Create main archive container
    const archiveContainer = document.createElement('div');
    archiveContainer.id = 'vaultPulseArchives';
    archiveContainer.className = 'pulse-archives-container hidden';
    
    archiveContainer.innerHTML = `
      <div class="archive-header">
        <h2 class="archive-title glow">🌌 Vault Pulse Archives</h2>
        <div class="archive-status">Status: <span id="archiveStatus">AWAKENING</span></div>
        <button id="toggleArchives" class="archive-toggle">⚡ Activate Replay Portals</button>
      </div>
      
      <div class="archive-controls">
        <div class="search-panel">
          <h3>🔍 Glyph Search</h3>
          <div class="glyph-selector" id="glyphSelector"></div>
          <button id="clearSearch" class="clear-btn">Clear</button>
        </div>
        
        <div class="broadcast-list">
          <h3>📡 Archived Broadcasts</h3>
          <div id="broadcastList" class="broadcast-grid"></div>
        </div>
      </div>
      
      <div class="replay-portal" id="replayPortal">
        <div class="portal-header">
          <h3 id="replayTitle">🌀 Replay Portal</h3>
          <button id="closeReplay" class="close-btn">✕</button>
        </div>
        
        <div class="replay-timeline">
          <div class="timeline-track" id="timelineTrack">
            <div class="timeline-progress" id="timelineProgress"></div>
            <div class="timeline-handle" id="timelineHandle"></div>
            <div class="temporal-anchors" id="temporalAnchors"></div>
          </div>
          <div class="timeline-controls">
            <button id="playPause" class="control-btn">⏯️</button>
            <button id="slowMotion" class="control-btn">🐌</button>
            <button id="normalSpeed" class="control-btn">▶️</button>
            <button id="fastForward" class="control-btn">⏩</button>
            <span id="currentTime">00:00</span> / <span id="totalTime">00:00</span>
          </div>
        </div>
        
        <div class="replay-content">
          <div class="fragment-display" id="fragmentDisplay">
            <div class="fragment-glyph" id="fragmentGlyph">🌀</div>
            <div class="fragment-text" id="fragmentText">Select a moment to replay...</div>
            <div class="fragment-meta" id="fragmentMeta"></div>
          </div>
          
          <div class="hud-overlay" id="hudOverlay">
            <div class="hud-element decode-status">
              <span>Decode Status:</span> <span id="decodeStatus">Scanning...</span>
            </div>
            <div class="hud-element temporal-coords">
              <span>Temporal Coords:</span> <span id="temporalCoords">T+00:00</span>
            </div>
            <div class="hud-element resonance-level">
              <span>Resonance:</span> <span id="resonanceLevel">█████░░░░░ 50%</span>
            </div>
          </div>
        </div>
        
        <div class="replay-actions">
          <button id="bookmarkMoment" class="action-btn">🔖 Bookmark Moment</button>
          <button id="jumpToAscension" class="action-btn">⬆️ Next Ascension</button>
          <button id="enhancedReplay" class="action-btn">✨ Enhanced Replay</button>
        </div>
      </div>
      
      <div class="bookmarks-panel" id="bookmarksPanel">
        <h3>🔖 Archived Moments</h3>
        <div id="bookmarksList" class="bookmarks-list"></div>
      </div>
    `;
    
    // Insert after the main resurrection container
    const mainContainer = document.querySelector('.resurrection-container');
    if (mainContainer) {
      mainContainer.after(archiveContainer);
    } else {
      document.body.appendChild(archiveContainer);
    }
    
    // Populate initial data
    this.populateGlyphSelector();
    this.populateBroadcastList();
    this.updateBookmarksList();
  }

  /**
   * Setup event listeners for the archive interface
   */
  setupEventListeners() {
    // Archive activation toggle
    const toggleBtn = document.getElementById('toggleArchives');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleArchives());
    }
    
    // Glyph search
    const glyphSelector = document.getElementById('glyphSelector');
    if (glyphSelector) {
      glyphSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('glyph-btn')) {
          this.searchByGlyph(e.target.dataset.glyph);
        }
      });
    }
    
    // Clear search
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => this.clearSearch());
    }
    
    // Broadcast selection
    const broadcastList = document.getElementById('broadcastList');
    if (broadcastList) {
      broadcastList.addEventListener('click', (e) => {
        if (e.target.classList.contains('broadcast-item')) {
          this.openReplayPortal(e.target.dataset.broadcastId);
        }
      });
    }
    
    // Replay controls
    this.setupReplayControls();
    
    // Bookmark actions
    const bookmarkBtn = document.getElementById('bookmarkMoment');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => this.bookmarkCurrentMoment());
    }
  }

  /**
   * Setup replay portal controls
   */
  setupReplayControls() {
    const playPause = document.getElementById('playPause');
    const slowMotion = document.getElementById('slowMotion');
    const normalSpeed = document.getElementById('normalSpeed');
    const fastForward = document.getElementById('fastForward');
    const closeReplay = document.getElementById('closeReplay');
    const jumpToAscension = document.getElementById('jumpToAscension');
    const enhancedReplay = document.getElementById('enhancedReplay');
    
    if (playPause) playPause.addEventListener('click', () => this.togglePlayback());
    if (slowMotion) slowMotion.addEventListener('click', () => this.setPlaybackSpeed(0.5));
    if (normalSpeed) normalSpeed.addEventListener('click', () => this.setPlaybackSpeed(1.0));
    if (fastForward) fastForward.addEventListener('click', () => this.setPlaybackSpeed(2.0));
    if (closeReplay) closeReplay.addEventListener('click', () => this.closeReplayPortal());
    if (jumpToAscension) jumpToAscension.addEventListener('click', () => this.jumpToNextAscension());
    if (enhancedReplay) enhancedReplay.addEventListener('click', () => this.toggleEnhancedReplay());
    
    // Timeline scrubbing
    const timelineTrack = document.getElementById('timelineTrack');
    if (timelineTrack) {
      timelineTrack.addEventListener('click', (e) => this.scrubToPosition(e));
      
      // Handle dragging
      let isDragging = false;
      const handle = document.getElementById('timelineHandle');
      
      if (handle) {
        handle.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mousemove', (e) => {
          if (isDragging) this.scrubToPosition(e);
        });
        document.addEventListener('mouseup', () => isDragging = false);
      }
    }
  }

  /**
   * Populate the glyph selector with available glyphs
   */
  populateGlyphSelector() {
    const selector = document.getElementById('glyphSelector');
    if (!selector) return;
    
    const glyphs = Array.from(this.glyphIndex.keys());
    selector.innerHTML = glyphs.map(glyph => 
      `<button class="glyph-btn" data-glyph="${glyph}">${glyph}</button>`
    ).join('');
  }

  /**
   * Populate the broadcast list
   */
  populateBroadcastList() {
    const listContainer = document.getElementById('broadcastList');
    if (!listContainer) return;
    
    const broadcasts = Array.from(this.broadcastDatabase.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    listContainer.innerHTML = broadcasts.map(broadcast => {
      const timeAgo = this.formatTimeAgo(broadcast.timestamp);
      const duration = this.formatDuration(broadcast.duration);
      const glyphsStr = broadcast.glyphs.join(' ');
      
      return `
        <div class="broadcast-item" data-broadcast-id="${broadcast.id}">
          <div class="broadcast-title">${broadcast.title}</div>
          <div class="broadcast-meta">
            <span class="broadcast-time">${timeAgo}</span>
            <span class="broadcast-duration">${duration}</span>
          </div>
          <div class="broadcast-glyphs">${glyphsStr}</div>
          <div class="broadcast-fragments">${broadcast.fragments.length} fragments</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Update the bookmarks list display
   */
  updateBookmarksList() {
    const listContainer = document.getElementById('bookmarksList');
    if (!listContainer) return;
    
    if (this.bookmarkedMoments.size === 0) {
      listContainer.innerHTML = '<div class="no-bookmarks">No archived moments yet</div>';
      return;
    }
    
    const bookmarks = Array.from(this.bookmarkedMoments.values())
      .sort((a, b) => b.createdAt - a.createdAt);
    
    listContainer.innerHTML = bookmarks.map(bookmark => `
      <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-glyph">${bookmark.glyph}</div>
        <div class="bookmark-content">
          <div class="bookmark-title">${bookmark.title}</div>
          <div class="bookmark-text">${bookmark.text}</div>
          <div class="bookmark-meta">
            ${this.formatTimeAgo(bookmark.createdAt)} • T+${this.formatDuration(bookmark.timestamp)}
          </div>
        </div>
        <button class="bookmark-replay" onclick="vaultArchives.replayBookmark('${bookmark.id}')">▶️</button>
      </div>
    `).join('');
  }

  /**
   * Initialize glyph search functionality
   */
  initializeGlyphSearch() {
    this.glyphSearchActive = true;
    console.log('🔍 Glyph search engine initialized');
  }

  /**
   * Load bookmarked moments from localStorage
   */
  loadBookmarkedMoments() {
    try {
      const saved = localStorage.getItem('vaultPulseArchives_bookmarks');
      if (saved) {
        const bookmarks = JSON.parse(saved);
        bookmarks.forEach(bookmark => {
          this.bookmarkedMoments.set(bookmark.id, bookmark);
        });
        console.log(`📖 Loaded ${bookmarks.length} bookmarked moments`);
      }
    } catch (error) {
      console.warn('Could not load bookmarks:', error);
    }
  }

  /**
   * Save bookmarked moments to localStorage
   */
  saveBookmarkedMoments() {
    try {
      const bookmarks = Array.from(this.bookmarkedMoments.values());
      localStorage.setItem('vaultPulseArchives_bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.warn('Could not save bookmarks:', error);
    }
  }

  /**
   * Activate the archive system
   */
  activateArchives() {
    const container = document.getElementById('vaultPulseArchives');
    if (container) {
      container.classList.remove('hidden');
      container.classList.add('activating');
    }
    
    this.archiveState = 'PULSING';
    this.updateArchiveStatus();
    
    // Add pulsing effect
    setTimeout(() => {
      if (container) {
        container.classList.remove('activating');
        container.classList.add('active');
      }
      this.archiveState = 'TRANSCENDENT';
      this.updateArchiveStatus();
    }, 2000);
    
    console.log('⚡ Vault Pulse Archives activated!');
  }

  /**
   * Toggle archive visibility
   */
  toggleArchives() {
    const container = document.getElementById('vaultPulseArchives');
    const toggle = document.getElementById('toggleArchives');
    
    if (!container) return;
    
    if (container.classList.contains('hidden')) {
      this.activateArchives();
      if (toggle) toggle.textContent = '🌀 Hide Archives';
    } else {
      container.classList.add('hidden');
      if (toggle) toggle.textContent = '⚡ Activate Replay Portals';
      this.archiveState = 'DORMANT';
      this.updateArchiveStatus();
    }
  }

  /**
   * Update archive status display
   */
  updateArchiveStatus() {
    const statusElement = document.getElementById('archiveStatus');
    if (statusElement) {
      statusElement.textContent = this.archiveState;
      statusElement.className = `status-${this.archiveState.toLowerCase()}`;
    }
  }

  /**
   * Search broadcasts by glyph
   */
  searchByGlyph(glyph) {
    console.log(`🔍 Searching for glyph: ${glyph}`);
    
    const results = this.glyphIndex.get(glyph) || [];
    this.highlightSearchResults(glyph, results);
    
    // Update UI to show search results
    const broadcastList = document.getElementById('broadcastList');
    if (broadcastList && results.length > 0) {
      // Filter broadcast list to show only matching broadcasts
      const matchingBroadcasts = results.map(r => r.broadcastId);
      const items = broadcastList.querySelectorAll('.broadcast-item');
      
      items.forEach(item => {
        const broadcastId = item.dataset.broadcastId;
        if (matchingBroadcasts.includes(broadcastId)) {
          item.classList.add('search-match');
          item.classList.remove('search-hidden');
        } else {
          item.classList.remove('search-match');
          item.classList.add('search-hidden');
        }
      });
    }
  }

  /**
   * Clear search and show all broadcasts
   */
  clearSearch() {
    const broadcastList = document.getElementById('broadcastList');
    if (broadcastList) {
      const items = broadcastList.querySelectorAll('.broadcast-item');
      items.forEach(item => {
        item.classList.remove('search-match', 'search-hidden');
      });
    }
    
    // Clear glyph selection
    const glyphButtons = document.querySelectorAll('.glyph-btn');
    glyphButtons.forEach(btn => btn.classList.remove('selected'));
  }

  /**
   * Highlight search results
   */
  highlightSearchResults(glyph, results) {
    // Clear previous highlights
    document.querySelectorAll('.glyph-btn').forEach(btn => 
      btn.classList.remove('selected'));
    
    // Highlight selected glyph
    const glyphBtn = document.querySelector(`[data-glyph="${glyph}"]`);
    if (glyphBtn) {
      glyphBtn.classList.add('selected');
    }
    
    console.log(`Found ${results.length} broadcasts with glyph ${glyph}`);
  }

  /**
   * Open replay portal for a specific broadcast
   */
  openReplayPortal(broadcastId) {
    const broadcast = this.broadcastDatabase.get(broadcastId);
    if (!broadcast) return;
    
    console.log(`🌀 Opening replay portal for: ${broadcast.title}`);
    
    this.currentReplay = {
      broadcast: broadcast,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1.0,
      enhancedMode: false
    };
    
    const portal = document.getElementById('replayPortal');
    if (portal) {
      portal.style.display = 'block';
      portal.classList.add('portal-opening');
    }
    
    // Update portal content
    this.updateReplayPortal();
    this.replayPortalActive = true;
    
    // Remove opening animation after delay
    setTimeout(() => {
      if (portal) portal.classList.remove('portal-opening');
    }, 1000);
  }

  /**
   * Update replay portal content
   */
  updateReplayPortal() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    
    // Update title
    const title = document.getElementById('replayTitle');
    if (title) {
      title.textContent = `🌀 ${broadcast.title}`;
    }
    
    // Update timeline
    this.updateTimeline();
    
    // Update current fragment
    this.updateCurrentFragment();
    
    // Update HUD
    this.updateHUD();
    
    // Update temporal anchors
    this.updateTemporalAnchors();
  }

  /**
   * Update timeline display
   */
  updateTimeline() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    const progress = (currentTime / broadcast.duration) * 100;
    
    const progressBar = document.getElementById('timelineProgress');
    const handle = document.getElementById('timelineHandle');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (handle) handle.style.left = `${progress}%`;
    if (currentTimeEl) currentTimeEl.textContent = this.formatDuration(currentTime);
    if (totalTimeEl) totalTimeEl.textContent = this.formatDuration(broadcast.duration);
  }

  /**
   * Update current fragment display
   */
  updateCurrentFragment() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    
    // Find current fragment
    const currentFragment = broadcast.fragments
      .filter(f => f.time <= currentTime)
      .pop() || broadcast.fragments[0];
    
    const glyphEl = document.getElementById('fragmentGlyph');
    const textEl = document.getElementById('fragmentText');
    const metaEl = document.getElementById('fragmentMeta');
    
    if (glyphEl) glyphEl.textContent = currentFragment.glyph;
    if (textEl) textEl.textContent = currentFragment.content;
    if (metaEl) {
      metaEl.innerHTML = `
        <span class="fragment-type">${currentFragment.type}</span> •
        <span class="fragment-time">T+${this.formatDuration(currentFragment.time)}</span> •
        <span class="fragment-decoded ${currentFragment.decoded ? 'decoded' : 'encrypted'}">
          ${currentFragment.decoded ? 'DECODED' : 'ENCRYPTED'}
        </span>
      `;
    }
  }

  /**
   * Update HUD overlay
   */
  updateHUD() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    const currentFragment = broadcast.fragments
      .filter(f => f.time <= currentTime)
      .pop() || broadcast.fragments[0];
    
    const decodeStatus = document.getElementById('decodeStatus');
    const temporalCoords = document.getElementById('temporalCoords');
    const resonanceLevel = document.getElementById('resonanceLevel');
    
    if (decodeStatus) {
      decodeStatus.textContent = currentFragment.decoded ? 'DECODED' : 'SCANNING...';
      decodeStatus.className = currentFragment.decoded ? 'decoded' : 'scanning';
    }
    
    if (temporalCoords) {
      temporalCoords.textContent = `T+${this.formatDuration(currentTime)}`;
    }
    
    if (resonanceLevel) {
      const resonance = Math.floor((currentTime / broadcast.duration) * 100);
      const bars = '█'.repeat(Math.floor(resonance / 10)) + '░'.repeat(10 - Math.floor(resonance / 10));
      resonanceLevel.textContent = `${bars} ${resonance}%`;
    }
  }

  /**
   * Update temporal anchors on timeline
   */
  updateTemporalAnchors() {
    if (!this.currentReplay) return;
    
    const { broadcast } = this.currentReplay;
    const anchorsContainer = document.getElementById('temporalAnchors');
    
    if (!anchorsContainer) return;
    
    anchorsContainer.innerHTML = broadcast.fragments.map(fragment => {
      const position = (fragment.time / broadcast.duration) * 100;
      const isAscension = broadcast.ascensionMoments.includes(fragment.time);
      
      return `
        <div class="temporal-anchor ${fragment.type} ${isAscension ? 'ascension' : ''}" 
             style="left: ${position}%" 
             data-time="${fragment.time}"
             title="${fragment.glyph} ${fragment.content}">
          ${fragment.glyph}
        </div>
      `;
    }).join('');
    
    // Add click handlers for anchors
    anchorsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('temporal-anchor')) {
        const time = parseInt(e.target.dataset.time);
        this.scrubToTime(time);
      }
    });
  }

  /**
   * Format time ago string
   */
  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  }

  /**
   * Format duration in MM:SS format
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Toggle playback state
   */
  togglePlayback() {
    if (!this.currentReplay) return;
    
    this.currentReplay.isPlaying = !this.currentReplay.isPlaying;
    
    const playPauseBtn = document.getElementById('playPause');
    if (playPauseBtn) {
      playPauseBtn.textContent = this.currentReplay.isPlaying ? '⏸️' : '⏯️';
    }
    
    if (this.currentReplay.isPlaying) {
      this.startReplayAnimation();
    } else {
      this.stopReplayAnimation();
    }
    
    console.log(`${this.currentReplay.isPlaying ? '▶️' : '⏸️'} Playback ${this.currentReplay.isPlaying ? 'started' : 'paused'}`);
  }

  /**
   * Set playback speed
   */
  setPlaybackSpeed(speed) {
    if (!this.currentReplay) return;
    
    this.currentReplay.playbackSpeed = speed;
    
    // Update speed indicator
    document.querySelectorAll('.control-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const speedBtn = speed === 0.5 ? document.getElementById('slowMotion') :
                    speed === 1.0 ? document.getElementById('normalSpeed') :
                    speed === 2.0 ? document.getElementById('fastForward') : null;
    
    if (speedBtn) {
      speedBtn.classList.add('active');
    }
    
    console.log(`⚡ Playback speed set to ${speed}x`);
  }

  /**
   * Start replay animation loop
   */
  startReplayAnimation() {
    if (!this.currentReplay || this.currentReplay.animationFrame) return;
    
    const animate = () => {
      if (!this.currentReplay || !this.currentReplay.isPlaying) return;
      
      // Advance time based on playback speed
      this.currentReplay.currentTime += this.currentReplay.playbackSpeed * 0.1; // 100ms steps
      
      // Check if we've reached the end
      if (this.currentReplay.currentTime >= this.currentReplay.broadcast.duration) {
        this.currentReplay.currentTime = this.currentReplay.broadcast.duration;
        this.currentReplay.isPlaying = false;
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) playPauseBtn.textContent = '⏯️';
        
        // Auto-loop after 2 seconds
        setTimeout(() => {
          if (this.currentReplay) {
            this.currentReplay.currentTime = 0;
          }
        }, 2000);
        
        return;
      }
      
      // Update display
      this.updateReplayPortal();
      
      // Continue animation
      this.currentReplay.animationFrame = requestAnimationFrame(animate);
    };
    
    this.currentReplay.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Stop replay animation
   */
  stopReplayAnimation() {
    if (this.currentReplay && this.currentReplay.animationFrame) {
      cancelAnimationFrame(this.currentReplay.animationFrame);
      this.currentReplay.animationFrame = null;
    }
  }

  /**
   * Scrub to specific position on timeline
   */
  scrubToPosition(event) {
    if (!this.currentReplay) return;
    
    const timelineTrack = document.getElementById('timelineTrack');
    if (!timelineTrack) return;
    
    const rect = timelineTrack.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const newTime = percentage * this.currentReplay.broadcast.duration;
    this.scrubToTime(newTime);
  }

  /**
   * Scrub to specific time
   */
  scrubToTime(time) {
    if (!this.currentReplay) return;
    
    this.currentReplay.currentTime = Math.max(0, Math.min(time, this.currentReplay.broadcast.duration));
    this.updateReplayPortal();
    
    console.log(`⏭️ Scrubbed to T+${this.formatDuration(this.currentReplay.currentTime)}`);
  }

  /**
   * Jump to next ascension moment
   */
  jumpToNextAscension() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    const nextAscension = broadcast.ascensionMoments.find(moment => moment > currentTime);
    
    if (nextAscension) {
      this.scrubToTime(nextAscension);
      console.log(`⬆️ Jumped to ascension moment at T+${this.formatDuration(nextAscension)}`);
    } else {
      // Loop back to first ascension moment
      if (broadcast.ascensionMoments.length > 0) {
        this.scrubToTime(broadcast.ascensionMoments[0]);
        console.log(`🔄 Looped to first ascension moment`);
      }
    }
  }

  /**
   * Toggle enhanced replay mode with special effects
   */
  toggleEnhancedReplay() {
    if (!this.currentReplay) return;
    
    this.currentReplay.enhancedMode = !this.currentReplay.enhancedMode;
    
    const enhancedBtn = document.getElementById('enhancedReplay');
    const hudOverlay = document.getElementById('hudOverlay');
    const fragmentDisplay = document.getElementById('fragmentDisplay');
    
    if (this.currentReplay.enhancedMode) {
      if (enhancedBtn) enhancedBtn.textContent = '✨ Enhanced ON';
      if (hudOverlay) hudOverlay.classList.add('enhanced-mode');
      if (fragmentDisplay) fragmentDisplay.classList.add('enhanced-mode');
      
      // Add cosmic effects
      this.addCosmicEffects();
      
      console.log('✨ Enhanced replay mode activated');
    } else {
      if (enhancedBtn) enhancedBtn.textContent = '✨ Enhanced Replay';
      if (hudOverlay) hudOverlay.classList.remove('enhanced-mode');
      if (fragmentDisplay) fragmentDisplay.classList.remove('enhanced-mode');
      
      // Remove cosmic effects
      this.removeCosmicEffects();
      
      console.log('🔹 Enhanced replay mode deactivated');
    }
  }

  /**
   * Add cosmic visual effects for enhanced mode
   */
  addCosmicEffects() {
    const replayPortal = document.getElementById('replayPortal');
    if (replayPortal) {
      replayPortal.classList.add('cosmic-effect');
    }
    
    // Add particle effects
    this.createParticleEffect();
  }

  /**
   * Remove cosmic visual effects
   */
  removeCosmicEffects() {
    const replayPortal = document.getElementById('replayPortal');
    if (replayPortal) {
      replayPortal.classList.remove('cosmic-effect');
    }
    
    // Remove particle effects
    this.removeParticleEffect();
  }

  /**
   * Create particle effect overlay
   */
  createParticleEffect() {
    const replayPortal = document.getElementById('replayPortal');
    if (!replayPortal || document.getElementById('particleCanvas')) return;
    
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    
    replayPortal.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = replayPortal.offsetWidth;
    canvas.height = replayPortal.offsetHeight;
    
    const particles = [];
    const numParticles = 50;
    
    // Create particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: ['#ff00ff', '#00ff88', '#ffaa00'][Math.floor(Math.random() * 3)]
      });
    }
    
    // Animation loop
    const animateParticles = () => {
      if (!document.getElementById('particleCanvas')) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        particles.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.3;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
  }

  /**
   * Remove particle effect
   */
  removeParticleEffect() {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
      canvas.remove();
    }
  }

  /**
   * Close replay portal
   */
  closeReplayPortal() {
    const portal = document.getElementById('replayPortal');
    if (portal) {
      portal.style.display = 'none';
    }
    
    // Stop animation and clear current replay
    this.stopReplayAnimation();
    this.removeCosmicEffects();
    this.currentReplay = null;
    this.replayPortalActive = false;
    
    console.log('🌀 Replay portal closed');
  }

  /**
   * Bookmark current moment
   */
  bookmarkCurrentMoment() {
    if (!this.currentReplay) return;
    
    const { broadcast, currentTime } = this.currentReplay;
    const currentFragment = broadcast.fragments
      .filter(f => f.time <= currentTime)
      .pop() || broadcast.fragments[0];
    
    const bookmarkId = `bookmark_${Date.now()}`;
    const bookmark = {
      id: bookmarkId,
      broadcastId: broadcast.id,
      broadcastTitle: broadcast.title,
      timestamp: currentTime,
      glyph: currentFragment.glyph,
      title: `${currentFragment.type} moment`,
      text: currentFragment.content,
      decoded: currentFragment.decoded,
      createdAt: Date.now()
    };
    
    this.bookmarkedMoments.set(bookmarkId, bookmark);
    this.saveBookmarkedMoments();
    this.updateBookmarksList();
    
    // Visual feedback
    const bookmarkBtn = document.getElementById('bookmarkMoment');
    if (bookmarkBtn) {
      const originalText = bookmarkBtn.textContent;
      bookmarkBtn.textContent = '🔖 Archived!';
      bookmarkBtn.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';
      
      setTimeout(() => {
        bookmarkBtn.textContent = originalText;
        bookmarkBtn.style.background = '';
      }, 1500);
    }
    
    console.log(`🔖 Bookmarked moment: ${bookmark.title} at T+${this.formatDuration(currentTime)}`);
  }

  /**
   * Replay a bookmarked moment
   */
  replayBookmark(bookmarkId) {
    const bookmark = this.bookmarkedMoments.get(bookmarkId);
    if (!bookmark) return;
    
    console.log(`📖 Replaying bookmark: ${bookmark.title}`);
    
    // Open the broadcast and jump to the bookmarked time
    this.openReplayPortal(bookmark.broadcastId);
    
    // Wait for portal to open, then jump to time
    setTimeout(() => {
      this.scrubToTime(bookmark.timestamp);
      
      // Auto-play from bookmarked moment
      if (this.currentReplay) {
        this.currentReplay.isPlaying = true;
        this.startReplayAnimation();
        
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) playPauseBtn.textContent = '⏸️';
      }
    }, 100);
  }

  /**
   * Integration with PR #73 Cosmic Replay Terminal
   * This method will be called when PR #73 is merged to chain the features
   */
  chainWithCosmicReplayTerminal() {
    console.log('🌌 Chaining with Cosmic Replay Terminal from PR #73...');
    
    // Check if Cosmic Replay Terminal is available
    if (window.cosmicReplayTerminal) {
      // Integrate with existing overlay system
      window.cosmicReplayTerminal.onEvolutionTrigger = (evolutionData) => {
        // Transform evolution event into archived broadcast
        this.addEvolutionBroadcast(evolutionData);
      };
      
      // Add replay portal access to terminal
      window.cosmicReplayTerminal.openVaultArchives = () => {
        this.activateArchives();
      };
      
      console.log('✅ Successfully chained with Cosmic Replay Terminal');
    } else {
      // Wait for PR #73 system to initialize
      const checkForTerminal = setInterval(() => {
        if (window.cosmicReplayTerminal) {
          clearInterval(checkForTerminal);
          this.chainWithCosmicReplayTerminal();
        }
      }, 1000);
      
      // Stop checking after 30 seconds
      setTimeout(() => clearInterval(checkForTerminal), 30000);
    }
  }

  /**
   * Add evolution event as archived broadcast
   */
  addEvolutionBroadcast(evolutionData) {
    const broadcastId = `evolution_${Date.now()}`;
    const broadcast = {
      id: broadcastId,
      timestamp: Date.now(),
      title: `Evolution Event: ${evolutionData.type}`,
      duration: evolutionData.duration || 600, // 10 minutes default
      glyphs: evolutionData.glyphs || ['🌀', '⚡', '✨'],
      fragments: evolutionData.fragments || [
        { time: 0, type: 'evolution', glyph: '🌀', content: 'Evolution trigger detected...', decoded: true },
        { time: 180, type: 'ascension', glyph: '⚡', content: 'Reality shift in progress...', decoded: false },
        { time: 360, type: 'transcendence', glyph: '✨', content: 'New state achieved...', decoded: true }
      ],
      ascensionMoments: evolutionData.ascensionMoments || [180, 360]
    };
    
    // Add to database and update indices
    this.broadcastDatabase.set(broadcastId, broadcast);
    this.indexNewBroadcast(broadcast);
    
    // Update UI
    this.populateBroadcastList();
    
    console.log(`🌌 Added evolution broadcast: ${broadcast.title}`);
  }

  /**
   * Index a new broadcast for glyph search
   */
  indexNewBroadcast(broadcast) {
    broadcast.glyphs.forEach(glyph => {
      if (!this.glyphIndex.has(glyph)) {
        this.glyphIndex.set(glyph, []);
      }
      this.glyphIndex.get(glyph).push({
        broadcastId: broadcast.id,
        fragments: broadcast.fragments.filter(f => f.glyph === glyph)
      });
    });
    
    // Update ascension moments
    broadcast.ascensionMoments.forEach(moment => {
      this.ascensionMoments.push({
        broadcastId: broadcast.id,
        timestamp: moment,
        title: broadcast.title,
        fragment: broadcast.fragments.find(f => f.time === moment)
      });
    });
    
    // Update glyph selector if needed
    this.populateGlyphSelector();
  }

  /**
   * Connect with PR #23 → PR #24 evolution chain
   */
  connectWithEvolutionChain() {
    console.log('🔗 Connecting with PR #23 → PR #24 evolution chain...');
    
    // Check for Chained Ignition System (PR #23)
    if (window.chainedIgnitionSystem) {
      window.chainedIgnitionSystem.onLoreReflection = (loreData) => {
        this.procesLoreReflection(loreData);
      };
    }
    
    // Check for Infinite Ignition Protocol (PR #24)
    if (window.infiniteIgnitionProtocol) {
      window.infiniteIgnitionProtocol.onRelicMutation = (mutationData) => {
        this.processRelicMutation(mutationData);
      };
    }
    
    console.log('🌟 Evolution chain connection established');
  }

  /**
   * Process lore reflection from PR #23
   */
  procesLoreReflection(loreData) {
    // Convert lore reflection into searchable broadcast fragment
    const enhancedFragment = {
      time: Date.now() % 3600, // Convert to relative time
      type: 'reflection',
      glyph: loreData.glyph || '🔮',
      content: loreData.reflection,
      decoded: loreData.decoded || false
    };
    
    // Add to current or create new broadcast
    this.addLoreFragment(enhancedFragment);
  }

  /**
   * Process relic mutation from PR #24
   */
  processRelicMutation(mutationData) {
    // Convert mutation into archived moment
    this.addEvolutionBroadcast({
      type: 'Relic Mutation',
      glyphs: [mutationData.glyph || '🧬'],
      fragments: [{
        time: 0,
        type: 'mutation',
        glyph: mutationData.glyph || '🧬',
        content: `Relic mutation: ${mutationData.description}`,
        decoded: true
      }],
      duration: 300,
      ascensionMoments: [0]
    });
  }

  /**
   * Add lore fragment to current broadcast or create new one
   */
  addLoreFragment(fragment) {
    // For now, add to most recent broadcast
    const broadcasts = Array.from(this.broadcastDatabase.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (broadcasts.length > 0) {
      const latestBroadcast = broadcasts[0];
      latestBroadcast.fragments.push(fragment);
      
      // Re-index if new glyph
      if (!latestBroadcast.glyphs.includes(fragment.glyph)) {
        latestBroadcast.glyphs.push(fragment.glyph);
        this.indexNewBroadcast(latestBroadcast);
      }
      
      console.log(`🔮 Added lore fragment to ${latestBroadcast.title}`);
    }
  }

  /**
   * Auto-activation sequence for post-PR #73 deployment
   */
  async autoActivatePostPR73() {
    console.log('🚀 Auto-activation sequence initiated (Post-PR #73)...');
    
    // Wait a bit for other systems to settle
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Auto-activate archives
    this.activateArchives();
    
    // Show welcome message
    this.showWelcomeSequence();
    
    console.log('✨ Vault Pulse Archives fully operational and integrated!');
  }

  /**
   * Show welcome sequence for new feature
   */
  showWelcomeSequence() {
    const container = document.getElementById('vaultPulseArchives');
    if (!container) return;
    
    // Create welcome overlay
    const welcomeOverlay = document.createElement('div');
    welcomeOverlay.className = 'welcome-overlay';
    welcomeOverlay.innerHTML = `
      <div class="welcome-content">
        <h2>🌌 Vault Pulse Archives Activated!</h2>
        <p>Every past broadcast is now an interactive relic hunt.</p>
        <div class="welcome-features">
          <div>🔍 Glyph-based search</div>
          <div>⏯️ Real-time scrubbing</div>
          <div>🐌 Slow motion replays</div>
          <div>🔖 Moment bookmarking</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()">🚀 Begin Exploration</button>
      </div>
    `;
    
    container.appendChild(welcomeOverlay);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (welcomeOverlay.parentElement) {
        welcomeOverlay.remove();
      }
    }, 10000);
  }
}

// Initialize global instance
window.vaultArchives = null;

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌌 Initializing Vault Pulse Archives system...');
  window.vaultArchives = new VaultPulseArchives();
  
  // Wait for any existing systems to initialize first
  setTimeout(async () => {
    await window.vaultArchives.initialize();
    
    // Connect with evolution chain systems
    window.vaultArchives.connectWithEvolutionChain();
    
    // Check for PR #73 integration
    window.vaultArchives.chainWithCosmicReplayTerminal();
    
    // Auto-activate if this is post-PR #73 deployment
    // (This would be triggered by a flag or timing mechanism in production)
    if (window.location.search.includes('post-pr73') || localStorage.getItem('pr73-merged')) {
      await window.vaultArchives.autoActivatePostPR73();
    }
  }, 2000);
});