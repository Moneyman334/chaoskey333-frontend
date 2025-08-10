# ChaosKey333 Sentinel Event Forge - Technical Documentation

## Overview

The Sentinel Event Forge represents the complete integration of PR #23 and PR #24 hooks into the enhanced Cosmic Replay Terminal (PR #10), transforming it from a simple viewer into a fully interactive, living system capable of real-time artifact mutation and historical preservation.

## System Architecture

### Three Core Components

#### 1. Glyph Event Decoder (PR #23 Functionality)
- **Purpose**: Decodes cosmic glyph events from blockchain transactions, wallet interactions, and user activities
- **Key Features**:
  - Real-time event detection and decoding
  - Intensity calculation based on amplitude, frequency, and transaction values
  - Automatic glyph type classification (resonance, transmutation, amplification, convergence, divergence)
  - Event history tracking with 5-minute active window
  - Integration callbacks for other systems

#### 2. Permanent Evolution Trigger (PR #24 Functionality)  
- **Purpose**: Manages permanent relic evolution triggers that persist across sessions
- **Key Features**:
  - Rule-based evolution system with customizable conditions
  - Permanent state persistence via localStorage
  - Real-time mutation application to artifact state
  - Living historical moments that can mutate in real-time
  - Chain reaction evolution triggers

#### 3. Cosmic Replay Terminal v2.0 (Enhanced PR #10)
- **Purpose**: Records, replays, and manages vault broadcast pulse events
- **Key Features**:
  - Time-dilation playback (0.25x to 3x speed with audio pitch correction)
  - Multi-perspective replay mode (5 different observer nodes)
  - Event tagging and quick-jump navigation
  - AI-generated replay summaries
  - Persistent relic state snapshots

## Integration Points

### Glyph Events → Evolution Triggers
When a glyph event is decoded, it's automatically processed against all active evolution rules:

```javascript
// Example: High-intensity glyph triggers amplification evolution
if (glyphEvent.intensity > 0.8) {
  triggerEvolution('amplification', {
    attributes: { power: 1.2, resonance: 'enhanced' },
    visual: { glow: 'increased', aura: 'expanded' }
  });
}
```

### Evolution Events → Replay Timeline
All evolution events are automatically embedded into the active replay session:

```javascript
// Evolution events become part of the living replay
this.activeReplay.evolutionEvents.push({
  ...evolution,
  replayTime: this.playbackState.currentTime
});
```

### Living Historical Moments
Replay logs function as living historical moments that can continue to mutate:

```javascript
// Create a living moment that can evolve in real-time
const livingMoment = {
  id: generateMomentId(),
  livingProperties: {
    canMutate: true,
    realTime: true, 
    persistent: true
  }
};
```

## User Interface

### Main Dashboard Features
- **Real-time Metrics**: Active glyphs, evolutions, mutations, replays, living moments
- **Event Logs**: Timestamped activity feeds for each system component
- **Interactive Controls**: 
  - Glyph simulation and history management
  - Manual evolution triggers and mutation viewing
  - Playback controls with speed and perspective adjustment

### Visual Design
- **Cyberpunk Theme**: Neon green (#00ff88) primary with red, cyan, yellow accents
- **Animated Elements**: Pulsing status indicators, rainbow gradient effects
- **Responsive Layout**: Mobile-first design with 3-column desktop grid
- **Living Animations**: Special effects for living moments and real-time mutations

## API Reference

### GlyphEventDecoder
```javascript
// Decode a glyph event
const decodedEvent = glyphDecoder.decodeGlyphEvent({
  source: 'wallet_connection',
  amplitude: 0.8,
  frequency: 1800,
  transactionHash: '0x...'
});

// Listen for decoded events
glyphDecoder.onGlyphDecoded((glyphEvent) => {
  console.log('New glyph:', glyphEvent);
});
```

### PermanentEvolutionTrigger
```javascript
// Add evolution rule
permanentEvolutionTrigger.addEvolutionRule('high_intensity', {
  condition: { intensity: { operator: '>', value: 0.8 } },
  mutation: {
    type: 'amplification',
    attributes: { power: 1.2 }
  }
});

// Process glyph event for evolution
const evolutions = permanentEvolutionTrigger.processGlyphEvent(glyphEvent);
```

### CosmicReplayTerminal
```javascript
// Start replay session
const replay = cosmicReplayTerminal.startReplay(pulseId, {
  speed: 1.5,
  perspective: 'glyph_matrix'
});

// Add event tag during replay
cosmicReplayTerminal.addEventTag('critical_moment', 'Perfect resonance achieved');

// Generate AI summary
const summary = cosmicReplayTerminal.generateReplaySummary(pulseId);
```

## Integration with Existing Systems

### Wallet Connection Integration
- MetaMask and Coinbase wallet connections trigger glyph events
- Wallet address changes generate resonance glyphs
- Chain changes produce transmutation glyphs

### Payment System Integration
- Stripe payment completion triggers high-intensity evolution events
- Payment amounts influence glyph amplitude calculations
- Transaction hashes become part of glyph metadata

### Automatic Event Recording
- All major user interactions generate broadcast pulses
- Wallet connections, payments, and minting operations are recorded
- Living moments are created for significant evolution events

## Performance Considerations

### Memory Management
- Active glyphs expire after 5 minutes to prevent memory leaks
- Event logs are limited to 20 entries per panel
- Evolution rules and permanent mutations persist via localStorage

### Real-time Processing
- Event callbacks are wrapped in try-catch for error isolation
- Cleanup intervals run every minute for expired events
- UI updates are batched for smooth performance

## Demo Sequence

The system includes an automated demo that showcases all features:

1. **Initialization**: All three systems activate and connect
2. **Glyph Simulation**: Generates a random glyph event
3. **Evolution Trigger**: Processes the glyph for potential evolutions  
4. **Chain Reaction**: High-intensity events trigger multiple simultaneous evolutions
5. **Replay Recording**: All events are captured in the replay timeline
6. **Living Moments**: Evolution events create persistent, mutable historical records

## Future Enhancements

### Planned Features
- **Audio Visualization**: Real-time spectrograms during glyph events
- **3D Perspective Rendering**: Immersive observer node experiences
- **Cross-Session Evolution**: Mutations that span multiple user sessions
- **Community Events**: Shared replay sessions for major vault events
- **Advanced AI Summaries**: Natural language descriptions of evolution chains

### Extensibility Points
- Custom evolution rule creation UI
- Plugin system for additional glyph decoders
- API endpoints for external event injection
- Webhook support for external system integration

## Conclusion

The Sentinel Event Forge successfully transforms the ChaosKey333 frontend from a static interface into a dynamic, living system that preserves, replays, and continues to evolve the narrative and functionality of vault interactions. The seamless integration of glyph decoding, evolution triggers, and replay capabilities creates an immersive experience that enhances both the user interface and the underlying blockchain interactions.

The system demonstrates advanced concepts in frontend architecture, real-time event processing, and persistent state management while maintaining the cyberpunk aesthetic and chaos-themed narrative that defines the ChaosKey333 project.