# ChaosKey333 Cinematic Evolution Drop - Integration Guide

This document provides guidance on integrating the new cinematic evolution drop components into the ChaosKey333 frontend.

## Components Overview

### 1. Cinematic HUD (`components/cinematic-hud.html`)
A full-screen immersive evolution interface featuring:
- Interactive glyph animations
- Dynamic solver imprint generation
- 4-step evolution timeline
- Resonance frequency visualizer
- Real-time progress tracking

### 2. Meta-Update Logs (`components/meta-logs.html`)
Real-time logging system with:
- Live event stream with filtering
- Blockchain event monitoring
- Metadata mutation flow visualizer
- Statistical dashboard
- Export functionality

### 3. QR Poster Generator (`components/qr-poster.html`)
Professional poster creation tool with:
- Dynamic QR code generation
- Multiple visual themes
- Customizable branding
- Download/share/print options

## Integration Examples

### Embedding in Existing Pages

```html
<!-- Add to any existing page -->
<link rel="stylesheet" href="components/cinematic-hud.css">
<script src="components/cinematic-hud.js"></script>

<!-- Use global API -->
<script>
// Start cinematic experience
ChaosKey333.startCinematic();

// Log evolution events
ChaosKey333.logs.logEvolutionStep(2, 'CK333-RELIC-001');
</script>
```

### Vault Integration

```javascript
// In vault.html or main application
document.addEventListener('DOMContentLoaded', () => {
  // Check for completed evolution
  const evolutionData = localStorage.getItem('chaoskey333_evolution');
  if (evolutionData) {
    const data = JSON.parse(evolutionData);
    console.log('Evolution completed:', data);
    // Show special vault features for evolved relics
  }
});
```

### Minting Integration

```javascript
// Log minting events to meta-logs
async function mintRelic() {
  try {
    ChaosKey333.logs.logEvolutionStep(1, relicId);
    
    const tx = await contract.mintRelic();
    ChaosKey333.logs.logBlockchainEvent(tx.hash, 'MINT', { relicId });
    
    await tx.wait();
    ChaosKey333.logs.logEvolutionStep(4, relicId);
    
  } catch (error) {
    ChaosKey333.logs.logError('blockchain', 'Minting failed', error);
  }
}
```

## Customization

### Themes
All components support multiple themes via CSS custom properties:
- `--primary-color`: Main accent color
- `--secondary-color`: Secondary accent
- `--accent-color`: Highlight color

### Audio Integration
For production, add audio files to `assets/` directory:
- `resonance-333hz.mp3` - Main resonance tone
- `glyph-activation.mp3` - Glyph interaction sounds

### QR Code Customization
```javascript
// Update poster URL dynamically
ChaosKey333.poster.updateUrl('https://your-vault-url.com');

// Change visual style
ChaosKey333.poster.setStyle('neon');

// Apply theme
ChaosKey333.poster.setTheme('matrix');
```

## Production Considerations

1. **Audio Files**: Replace placeholder audio elements with actual sound files
2. **QR Library**: The CDN fallback should work, but consider hosting locally
3. **Performance**: Components are optimized but consider lazy loading for large pages
4. **Mobile**: All components are responsive but test on target devices

## API Reference

### Global ChaosKey333 Object

```javascript
ChaosKey333.startCinematic()      // Show cinematic HUD
ChaosKey333.hideCinematic()       // Hide cinematic HUD
ChaosKey333.resetCinematic()      // Reset to initial state

// Logging API
ChaosKey333.logs.logMetadataMutation(data)
ChaosKey333.logs.logBlockchainEvent(txHash, eventType, data)
ChaosKey333.logs.logSolverImprint(solverId, imprint)
ChaosKey333.logs.logEvolutionStep(step, relicId)
ChaosKey333.logs.logError(source, message, error)

// Poster API
ChaosKey333.poster.updateUrl(url)
ChaosKey333.poster.setStyle(style)  // 'standard', 'neon', 'matrix', 'chaos'
ChaosKey333.poster.setTheme(theme)  // 'cyberpunk', 'neon', 'dark', 'matrix'
ChaosKey333.poster.download()
ChaosKey333.poster.share()
ChaosKey333.poster.print()
```

## Browser Compatibility

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Web Audio API for sound effects (optional)
- Canvas API for QR code generation

## File Structure

```
components/
├── cinematic-hud.html
├── cinematic-hud.css
├── cinematic-hud.js
├── meta-logs.html
├── meta-logs.css
├── meta-logs.js
├── qr-poster.html
├── qr-poster.css
└── qr-poster.js

assets/
└── README.md           # Placeholder for audio files

cosmic_drop_page.html   # Enhanced main entry point
style.css              # Updated with cosmic drop styles
```