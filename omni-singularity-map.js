// Omni-Singularity Map Component
// Features glowing relay nodes and circuit connections

import { OMNI_SINGULARITY_CONFIG, omniLog } from './omni-singularity-config.js';

export class OmniSingularityMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.relayNodes = [];
    this.circuits = [];
    this.isInitialized = false;
    this.animationFrame = null;
    
    omniLog('Initializing Omni-Singularity Map', 'info');
  }
  
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      omniLog(`Container ${this.containerId} not found`, 'error');
      return false;
    }
    
    this.createMapStructure();
    this.generateRelayNodes();
    this.createCircuitLinks();
    this.startUpdateCycle();
    
    this.isInitialized = true;
    omniLog('Omni-Singularity Map initialized successfully', 'success');
    
    return true;
  }
  
  createMapStructure() {
    // Create the main map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'omni-singularity-map';
    mapContainer.innerHTML = `
      <div class="map-header">
        <h3 class="map-title">🌀 Omni-Singularity Network</h3>
        <div class="map-status">
          <span class="status-indicator active"></span>
          <span class="status-text">RELAY NODES ACTIVE</span>
        </div>
      </div>
      <div class="map-grid" id="mapGrid">
        <!-- Relay nodes will be generated here -->
      </div>
      <div class="map-footer">
        <div class="circuit-info">
          <span class="circuit-count">0</span> Active Circuits
        </div>
      </div>
    `;
    
    this.container.appendChild(mapContainer);
    this.mapGrid = document.getElementById('mapGrid');
  }
  
  generateRelayNodes() {
    const nodeCount = OMNI_SINGULARITY_CONFIG.RELAY_NODE_COUNT;
    
    for (let i = 0; i < nodeCount; i++) {
      const node = this.createRelayNode(i);
      this.relayNodes.push(node);
      this.mapGrid.appendChild(node.element);
    }
    
    omniLog(`Generated ${nodeCount} relay nodes`, 'success');
  }
  
  createRelayNode(index) {
    const node = {
      id: `relay_node_${index}`,
      index: index,
      active: Math.random() > 0.3, // 70% chance of being active
      energy: Math.random() * 100,
      connections: [],
      lastPulse: 0,
      element: null
    };
    
    // Create the visual element
    const element = document.createElement('div');
    element.className = `relay-node ${node.active ? 'active' : 'dormant'}`;
    element.id = node.id;
    element.style.cssText = `
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #00ffcc;
      background: radial-gradient(circle, rgba(0,255,204,0.3) 0%, rgba(0,255,204,0.1) 70%, transparent 100%);
      box-shadow: 
        0 0 20px #00ffcc,
        inset 0 0 20px rgba(0,255,204,0.2);
      margin: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    // Add node info
    element.innerHTML = `
      <div class="node-core"></div>
      <div class="node-pulse"></div>
      <div class="node-label">R${index + 1}</div>
      <div class="node-energy">${Math.floor(node.energy)}%</div>
    `;
    
    // Add click handler for manual activation
    element.addEventListener('click', () => this.activateRelayNode(node));
    
    node.element = element;
    return node;
  }
  
  createCircuitLinks() {
    // Create visual connections between active relay nodes
    const activeNodes = this.relayNodes.filter(node => node.active);
    
    for (let i = 0; i < activeNodes.length - 1; i++) {
      const circuit = this.createCircuit(activeNodes[i], activeNodes[i + 1]);
      this.circuits.push(circuit);
    }
    
    // Create a circuit back to the first node for a complete loop
    if (activeNodes.length > 2) {
      const loopCircuit = this.createCircuit(activeNodes[activeNodes.length - 1], activeNodes[0]);
      this.circuits.push(loopCircuit);
    }
    
    this.updateCircuitCount();
  }
  
  createCircuit(nodeA, nodeB) {
    const circuit = {
      id: `circuit_${nodeA.index}_${nodeB.index}`,
      nodeA: nodeA,
      nodeB: nodeB,
      active: true,
      dataFlow: Math.random() * 100,
      element: null
    };
    
    // Visual circuit connection would require SVG or canvas
    // For now, we'll just track the logical connection
    nodeA.connections.push(nodeB);
    nodeB.connections.push(nodeA);
    
    return circuit;
  }
  
  activateRelayNode(node) {
    if (!node.active) {
      node.active = true;
      node.energy = Math.min(100, node.energy + 25);
      node.element.classList.remove('dormant');
      node.element.classList.add('active');
      
      this.triggerNodePulse(node);
      this.createCircuitLinks(); // Rebuild circuits with new active node
      
      omniLog(`Relay node ${node.id} activated`, 'success');
      
      // Trigger event for other systems
      this.broadcastNodeActivation(node);
    }
  }
  
  triggerNodePulse(node) {
    node.lastPulse = Date.now();
    const pulseElement = node.element.querySelector('.node-pulse');
    
    if (pulseElement) {
      pulseElement.style.animation = 'none';
      pulseElement.offsetHeight; // Trigger reflow
      pulseElement.style.animation = 'relayPulse 1s ease-out';
    }
    
    // Animate energy spread to connected nodes
    node.connections.forEach(connectedNode => {
      setTimeout(() => this.spreadEnergyPulse(connectedNode), 200);
    });
  }
  
  spreadEnergyPulse(targetNode) {
    if (targetNode.active && targetNode.energy < 90) {
      targetNode.energy = Math.min(100, targetNode.energy + 5);
      this.updateNodeDisplay(targetNode);
      
      // Create visual energy flow effect
      this.createEnergyFlowEffect(targetNode);
    }
  }
  
  createEnergyFlowEffect(node) {
    const flowElement = document.createElement('div');
    flowElement.className = 'energy-flow';
    flowElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      background: #00ffcc;
      border-radius: 50%;
      box-shadow: 0 0 10px #00ffcc;
      animation: energyFlow 0.5s ease-out forwards;
      pointer-events: none;
    `;
    
    node.element.appendChild(flowElement);
    
    setTimeout(() => {
      if (flowElement.parentNode) {
        flowElement.parentNode.removeChild(flowElement);
      }
    }, 500);
  }
  
  updateNodeDisplay(node) {
    const energyElement = node.element.querySelector('.node-energy');
    if (energyElement) {
      energyElement.textContent = `${Math.floor(node.energy)}%`;
    }
    
    // Update glow intensity based on energy
    const glowIntensity = node.energy / 100;
    node.element.style.boxShadow = `
      0 0 ${20 * glowIntensity}px #00ffcc,
      inset 0 0 ${20 * glowIntensity}px rgba(0,255,204,${0.2 * glowIntensity})
    `;
  }
  
  broadcastNodeActivation(node) {
    // Dispatch custom event for integration with other systems
    const event = new CustomEvent('omniNodeActivation', {
      detail: {
        nodeId: node.id,
        nodeIndex: node.index,
        energy: node.energy,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
  }
  
  updateCircuitCount() {
    const circuitCountElement = this.container.querySelector('.circuit-count');
    if (circuitCountElement) {
      circuitCountElement.textContent = this.circuits.filter(c => c.active).length;
    }
  }
  
  startUpdateCycle() {
    const updateMap = () => {
      this.updateRelayNodes();
      this.updateCircuits();
      
      if (this.isInitialized) {
        setTimeout(updateMap, OMNI_SINGULARITY_CONFIG.MAP_UPDATE_FREQUENCY);
      }
    };
    
    updateMap();
  }
  
  updateRelayNodes() {
    this.relayNodes.forEach(node => {
      if (node.active) {
        // Slowly drain energy over time
        node.energy = Math.max(10, node.energy - 0.5);
        this.updateNodeDisplay(node);
        
        // Random chance of spontaneous pulse
        if (Math.random() < 0.1) {
          this.triggerNodePulse(node);
        }
      }
    });
  }
  
  updateCircuits() {
    this.circuits.forEach(circuit => {
      if (circuit.active && circuit.nodeA.active && circuit.nodeB.active) {
        // Update data flow
        circuit.dataFlow = Math.min(100, circuit.dataFlow + Math.random() * 5);
      }
    });
  }
  
  destroy() {
    this.isInitialized = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    omniLog('Omni-Singularity Map destroyed', 'info');
  }
}

// CSS Styles for the map (to be added to the main stylesheet)
export const OMNI_MAP_STYLES = `
  .omni-singularity-map {
    background: linear-gradient(135deg, #000 0%, #111 50%, #000 100%);
    border: 2px solid #00ffcc;
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    position: relative;
    overflow: hidden;
  }
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #00ffcc;
    padding-bottom: 10px;
  }
  
  .map-title {
    color: #00ffcc;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.2rem;
    margin: 0;
    text-shadow: 0 0 10px #00ffcc;
  }
  
  .map-status {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00ff00;
    box-shadow: 0 0 10px #00ff00;
    animation: pulse 2s infinite;
  }
  
  .status-text {
    color: #00ff00;
    font-size: 0.8rem;
    font-family: 'Courier New', monospace;
  }
  
  .map-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 15px;
    min-height: 200px;
    align-items: center;
    justify-items: center;
  }
  
  .relay-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', monospace;
  }
  
  .relay-node.active {
    animation: nodeGlow 3s ease-in-out infinite alternate;
  }
  
  .relay-node.dormant {
    opacity: 0.5;
    border-color: #666;
    box-shadow: 0 0 5px #666;
  }
  
  .node-core {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #00ffcc;
    box-shadow: 0 0 15px #00ffcc;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .node-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #00ffcc;
    top: 0;
    left: 0;
    opacity: 0;
  }
  
  .node-label {
    position: absolute;
    bottom: -25px;
    color: #00ffcc;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  .node-energy {
    position: absolute;
    top: -25px;
    color: #ffcc00;
    font-size: 0.6rem;
  }
  
  .map-footer {
    margin-top: 20px;
    text-align: center;
    border-top: 1px solid #00ffcc;
    padding-top: 10px;
  }
  
  .circuit-info {
    color: #00ffcc;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
  }
  
  .circuit-count {
    color: #ffcc00;
    font-weight: bold;
  }
  
  @keyframes relayPulse {
    0% { opacity: 0; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
    100% { opacity: 0; transform: scale(2); }
  }
  
  @keyframes nodeGlow {
    0% { box-shadow: 0 0 20px #00ffcc, inset 0 0 20px rgba(0,255,204,0.2); }
    100% { box-shadow: 0 0 40px #00ffcc, inset 0 0 30px rgba(0,255,204,0.4); }
  }
  
  @keyframes energyFlow {
    0% { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1); 
    }
    100% { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(3); 
    }
  }
`;