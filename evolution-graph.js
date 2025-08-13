// Sentinel Omniverse Evolution Graph - Genesis Build
// Core implementation with Three.js for 3D visualization

class EvolutionGraph {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.animationSpeed = 1;
    this.isPlaying = false;
    this.currentTime = 0;
    this.collectorMode = 'all';
    
    // Node type definitions
    this.nodeTypes = {
      RELIC: { color: 0xff6600, emissive: 0xff3300, scale: 1.2 },
      SYSTEM: { color: 0x00ffff, emissive: 0x0088ff, scale: 1.0 },
      LORE: { color: 0x9966ff, emissive: 0x6600ff, scale: 1.1 },
      APEX: { color: 0xffd700, emissive: 0xffaa00, scale: 1.5 }
    };
    
    this.init();
    this.setupEventListeners();
    this.createMockData();
    this.animate();
  }

  init() {
    const container = document.getElementById('graph-canvas-container');
    const canvas = document.getElementById('evolution-canvas');
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    this.setupLighting();
    
    // Controls setup
    this.setupControls();
    
    // Add cosmic background
    this.createCosmicBackground();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Point lights for atmosphere
    const goldLight = new THREE.PointLight(0xffd700, 0.5, 50);
    goldLight.position.set(0, 15, 0);
    this.scene.add(goldLight);
    
    const cyanLight = new THREE.PointLight(0x00ffff, 0.3, 30);
    cyanLight.position.set(-20, 5, 10);
    this.scene.add(cyanLight);
  }

  createCosmicBackground() {
    // Create starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
    
    // Create nebula effect
    const nebulaGeometry = new THREE.SphereGeometry(80, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x330066,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    this.scene.add(nebula);
  }

  setupControls() {
    // Mouse/touch controls for camera movement
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    canvas.addEventListener('mousemove', (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // Rotate camera around origin
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    canvas.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
    
    // Zoom controls
    canvas.addEventListener('wheel', (event) => {
      const zoom = event.deltaY * 0.01;
      this.camera.position.multiplyScalar(1 + zoom);
      
      // Limit zoom
      const distance = this.camera.position.length();
      if (distance < 5) this.camera.position.normalize().multiplyScalar(5);
      if (distance > 100) this.camera.position.normalize().multiplyScalar(100);
    });
    
    // Node selection
    canvas.addEventListener('click', (event) => this.onNodeClick(event));
  }

  createMockData() {
    // Create sample PR/evolution nodes with relationships
    const prNodes = [
      {
        id: 'pr-8',
        type: 'SYSTEM',
        title: 'PR #8 - Vault Core Genesis',
        description: 'Initial vault infrastructure with quantum encryption layers',
        position: { x: -15, y: 0, z: 0 },
        status: 'completed',
        timestamp: Date.now() - 86400000 * 10, // 10 days ago
        artifacts: ['Quantum Core', 'Encryption Matrix']
      },
      {
        id: 'pr-9',
        type: 'RELIC',
        title: 'PR #9 - Relic Manifestation System',
        description: 'Visual and audio events for artifact materialization',
        position: { x: -5, y: 5, z: -5 },
        status: 'completed',
        timestamp: Date.now() - 86400000 * 7, // 7 days ago
        artifacts: ['Bass Resonator', 'Visual Harmonics Engine']
      },
      {
        id: 'pr-10',
        type: 'LORE',
        title: 'PR #10 - Shadow Files Integration',
        description: 'Encoded glyphs and cosmic event tracking',
        position: { x: 5, y: -3, z: 8 },
        status: 'completed',
        timestamp: Date.now() - 86400000 * 5, // 5 days ago
        artifacts: ['Glyph Decoder', 'Cosmic Event Monitor']
      },
      {
        id: 'pr-23',
        type: 'SYSTEM',
        title: 'PR #23 - Active Decoding Protocol',
        description: 'Real-time mutation and evolution tracking',
        position: { x: 10, y: 8, z: -3 },
        status: 'active',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        artifacts: ['Evolution Scanner', 'Mutation Tracker']
      },
      {
        id: 'pr-24',
        type: 'RELIC',
        title: 'PR #24 - Evolved Relic Triggers',
        description: 'Advanced artifact evolution mechanics',
        position: { x: 0, y: 12, z: 5 },
        status: 'pending',
        timestamp: Date.now() + 86400000 * 3, // 3 days future
        artifacts: ['Evolution Catalyst', 'Relic Transformer']
      },
      {
        id: 'sentinel-apex',
        type: 'APEX',
        title: 'Sentinel\'s Apex Node',
        description: 'Final ascension event - locked until conditions met',
        position: { x: 0, y: 20, z: 0 },
        status: 'locked',
        timestamp: Date.now() + 86400000 * 30, // Far future
        artifacts: ['Omniversal Key', 'Ascension Matrix', 'Chaos Singularity']
      }
    ];
    
    // Define connections between nodes
    const connections = [
      { from: 'pr-8', to: 'pr-9', type: 'evolution' },
      { from: 'pr-8', to: 'pr-10', type: 'branch' },
      { from: 'pr-9', to: 'pr-23', type: 'evolution' },
      { from: 'pr-10', to: 'pr-23', type: 'merge' },
      { from: 'pr-23', to: 'pr-24', type: 'evolution' },
      { from: 'pr-24', to: 'sentinel-apex', type: 'ascension' },
      { from: 'pr-9', to: 'sentinel-apex', type: 'convergence' },
      { from: 'pr-10', to: 'sentinel-apex', type: 'convergence' }
    ];
    
    this.createNodes(prNodes);
    this.createConnections(connections);
  }

  createNodes(nodeData) {
    nodeData.forEach(data => {
      const nodeType = this.nodeTypes[data.type];
      
      // Create node geometry
      const geometry = new THREE.SphereGeometry(
        nodeType.scale * 0.8, 
        32, 
        32
      );
      
      // Create node material with glow effect
      const material = new THREE.MeshPhongMaterial({
        color: nodeType.color,
        emissive: nodeType.emissive,
        emissiveIntensity: data.status === 'active' ? 0.3 : 0.1,
        transparent: true,
        opacity: data.status === 'locked' ? 0.5 : 1.0
      });
      
      const nodeMesh = new THREE.Mesh(geometry, material);
      nodeMesh.position.set(data.position.x, data.position.y, data.position.z);
      nodeMesh.userData = data;
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(
        nodeType.scale * 1.2, 
        16, 
        16
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: nodeType.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(nodeMesh.position);
      
      // Add orbital rings for special nodes
      if (data.type === 'APEX' || data.status === 'active') {
        this.createOrbitalRings(nodeMesh, nodeType);
      }
      
      this.scene.add(nodeMesh);
      this.scene.add(glowMesh);
      
      this.nodes.push({
        mesh: nodeMesh,
        glow: glowMesh,
        data: data,
        originalEmissive: nodeType.emissive
      });
    });
  }

  createOrbitalRings(centerNode, nodeType) {
    const ringCount = 3;
    
    for (let i = 0; i < ringCount; i++) {
      const radius = nodeType.scale * (2 + i * 0.5);
      const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 32);
      const material = new THREE.MeshBasicMaterial({
        color: nodeType.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.position.copy(centerNode.position);
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotationSpeed = 0.01 * (i + 1);
      
      this.scene.add(ring);
      
      // Store reference for animation
      if (!centerNode.userData.orbitalRings) {
        centerNode.userData.orbitalRings = [];
      }
      centerNode.userData.orbitalRings.push(ring);
    }
  }

  createConnections(connectionData) {
    connectionData.forEach(conn => {
      const fromNode = this.nodes.find(n => n.data.id === conn.from);
      const toNode = this.nodes.find(n => n.data.id === conn.to);
      
      if (!fromNode || !toNode) return;
      
      // Create connection line
      const points = [
        fromNode.mesh.position.clone(),
        toNode.mesh.position.clone()
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      let color, opacity;
      switch (conn.type) {
        case 'evolution':
          color = 0x00ff00;
          opacity = 0.8;
          break;
        case 'branch':
          color = 0xff6600;
          opacity = 0.6;
          break;
        case 'merge':
          color = 0x00ffff;
          opacity = 0.7;
          break;
        case 'ascension':
          color = 0xffd700;
          opacity = 1.0;
          break;
        case 'convergence':
          color = 0xff00ff;
          opacity = 0.5;
          break;
        default:
          color = 0xffffff;
          opacity = 0.4;
      }
      
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        linewidth: 2
      });
      
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      
      this.connections.push({
        line: line,
        from: fromNode,
        to: toNode,
        type: conn.type,
        originalOpacity: opacity
      });
    });
  }

  onNodeClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    const nodeObjects = this.nodes.map(n => n.mesh);
    const intersects = raycaster.intersectObjects(nodeObjects);
    
    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object;
      const nodeData = selectedMesh.userData;
      
      this.selectNode(nodeData);
      this.displayNodeInfo(nodeData);
    } else {
      this.clearSelection();
    }
  }

  selectNode(nodeData) {
    // Clear previous selection
    this.clearSelection();
    
    this.selectedNode = nodeData;
    
    // Highlight selected node
    const node = this.nodes.find(n => n.data.id === nodeData.id);
    if (node) {
      node.mesh.material.emissiveIntensity = 0.8;
      node.glow.material.opacity = 0.5;
    }
    
    // Highlight connected paths
    this.connections.forEach(conn => {
      if (conn.from.data.id === nodeData.id || conn.to.data.id === nodeData.id) {
        conn.line.material.opacity = Math.min(1.0, conn.originalOpacity * 2);
      } else {
        conn.line.material.opacity = conn.originalOpacity * 0.3;
      }
    });
  }

  clearSelection() {
    if (this.selectedNode) {
      const node = this.nodes.find(n => n.data.id === this.selectedNode.id);
      if (node) {
        node.mesh.material.emissiveIntensity = node.data.status === 'active' ? 0.3 : 0.1;
        node.glow.material.opacity = 0.2;
      }
    }
    
    // Reset connection opacity
    this.connections.forEach(conn => {
      conn.line.material.opacity = conn.originalOpacity;
    });
    
    this.selectedNode = null;
  }

  displayNodeInfo(nodeData) {
    const panel = document.getElementById('nodeDetails');
    
    const statusIcon = {
      'completed': '✅',
      'active': '🔄',
      'pending': '⏳',
      'locked': '🔒'
    };
    
    panel.innerHTML = `
      <div class="node-title">${statusIcon[nodeData.status]} ${nodeData.title}</div>
      <div class="node-type">Type: ${nodeData.type} Node</div>
      <div class="node-status">Status: ${nodeData.status.toUpperCase()}</div>
      <div class="node-description">${nodeData.description}</div>
      <div class="node-artifacts">
        <strong>Artifacts:</strong><br>
        ${nodeData.artifacts.map(a => `• ${a}`).join('<br>')}
      </div>
      <div class="node-timestamp">
        ${nodeData.status === 'pending' ? 'Scheduled:' : 'Created:'} 
        ${new Date(nodeData.timestamp).toLocaleDateString()}
      </div>
    `;
  }

  setupEventListeners() {
    // Control buttons
    document.getElementById('resetView').addEventListener('click', () => {
      this.resetCameraView();
    });
    
    document.getElementById('playAnimation').addEventListener('click', () => {
      this.isPlaying = true;
    });
    
    document.getElementById('pauseAnimation').addEventListener('click', () => {
      this.isPlaying = false;
    });
    
    document.getElementById('replayMode').addEventListener('click', () => {
      this.startReplayMode();
    });
    
    document.getElementById('collectorSelect').addEventListener('change', (e) => {
      this.collectorMode = e.target.value;
      this.updateCollectorView();
    });
  }

  resetCameraView() {
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);
    this.clearSelection();
  }

  startReplayMode() {
    this.currentTime = 0;
    this.isPlaying = true;
    
    // Show evolution timeline replay
    this.nodes.forEach(node => {
      if (node.data.timestamp > Date.now()) {
        node.mesh.visible = false;
        node.glow.visible = false;
      }
    });
  }

  updateCollectorView() {
    // Filter nodes based on collector pathway
    const pathwayFilters = {
      'all': () => true,
      'genesis': (node) => ['pr-8', 'pr-9'].includes(node.data.id),
      'vault-master': (node) => node.data.type === 'SYSTEM',
      'relic-seeker': (node) => node.data.type === 'RELIC'
    };
    
    const filter = pathwayFilters[this.collectorMode] || pathwayFilters['all'];
    
    this.nodes.forEach(node => {
      const visible = filter(node);
      node.mesh.visible = visible;
      node.glow.visible = visible;
    });
    
    this.connections.forEach(conn => {
      const visible = filter(conn.from) && filter(conn.to);
      conn.line.visible = visible;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const time = Date.now() * 0.001;
    
    // Animate orbital rings
    this.nodes.forEach(node => {
      if (node.data.orbitalRings) {
        node.data.orbitalRings.forEach(ring => {
          ring.rotation.z += ring.userData.rotationSpeed;
        });
      }
      
      // Pulse active nodes
      if (node.data.status === 'active') {
        const pulseFactor = (Math.sin(time * 3) + 1) * 0.5;
        node.mesh.material.emissiveIntensity = 0.2 + pulseFactor * 0.4;
      }
      
      // Gentle floating animation
      const floatOffset = Math.sin(time + node.data.id.length) * 0.2;
      node.mesh.position.y = node.data.position.y + floatOffset;
      node.glow.position.copy(node.mesh.position);
    });
    
    // Animate connections with pulse waves
    if (this.isPlaying) {
      this.connections.forEach((conn, index) => {
        const wave = Math.sin(time * 2 + index * 0.5);
        const pulseIntensity = (wave + 1) * 0.5;
        conn.line.material.opacity = conn.originalOpacity * (0.5 + pulseIntensity * 0.5);
      });
    }
    
    // Update cosmic background rotation
    if (this.scene.children.find(c => c.type === 'Points')) {
      const stars = this.scene.children.find(c => c.type === 'Points');
      stars.rotation.y += 0.0002;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the Evolution Graph when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 Initializing Sentinel Omniverse Evolution Graph...');
  
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-indicator';
  loadingDiv.textContent = '⚡ Materializing Evolution Matrix...';
  document.body.appendChild(loadingDiv);
  
  // Initialize after a brief delay for dramatic effect
  setTimeout(() => {
    const graph = new EvolutionGraph();
    loadingDiv.remove();
    console.log('✅ Evolution Graph Genesis Build activated!');
  }, 1500);
});

// Export for potential external use
window.EvolutionGraph = EvolutionGraph;