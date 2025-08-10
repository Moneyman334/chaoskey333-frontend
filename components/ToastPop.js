// Cinematic Toast Overlay Component
class ToastPop {
  constructor() {
    this.toastContainer = null;
    this.activeToasts = [];
    this.init();
  }

  init() {
    this.createToastContainer();
  }

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-pop-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 15000;
      pointer-events: none;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(this.toastContainer);
  }

  show(message, type = 'INFO', duration = 4000) {
    const toast = document.createElement('div');
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = toastId;
    
    // Determine styling based on type
    let bgColor, textColor, borderColor, icon;
    switch (type.toUpperCase()) {
      case 'EVOLUTION':
        bgColor = 'rgba(0, 255, 136, 0.95)';
        textColor = '#000000';
        borderColor = '#00ff88';
        icon = '🧬';
        break;
      case 'SUCCESS':
        bgColor = 'rgba(0, 255, 136, 0.9)';
        textColor = '#000000';
        borderColor = '#00ff88';
        icon = '✅';
        break;
      case 'WARNING':
        bgColor = 'rgba(255, 170, 0, 0.9)';
        textColor = '#000000';
        borderColor = '#ffaa00';
        icon = '⚠️';
        break;
      case 'ERROR':
        bgColor = 'rgba(255, 0, 0, 0.9)';
        textColor = '#ffffff';
        borderColor = '#ff0000';
        icon = '❌';
        break;
      default:
        bgColor = 'rgba(0, 255, 255, 0.9)';
        textColor = '#000000';
        borderColor = '#00ffff';
        icon = 'ℹ️';
    }

    toast.style.cssText = `
      background: ${bgColor};
      color: ${textColor};
      border: 3px solid ${borderColor};
      border-radius: 15px;
      padding: 25px 40px;
      font-family: 'Orbitron', 'Courier New', monospace;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 0 30px ${borderColor}, inset 0 0 20px rgba(255,255,255,0.2);
      text-shadow: 0 0 10px rgba(0,0,0,0.5);
      max-width: 600px;
      min-width: 300px;
      transform: scale(0.1) rotate(180deg);
      opacity: 0;
      transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      backdrop-filter: blur(5px);
      pointer-events: auto;
      cursor: pointer;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
        <span style="font-size: 32px; filter: drop-shadow(0 0 5px ${borderColor});">${icon}</span>
        <span style="flex: 1;">${message}</span>
        <span style="font-size: 32px; filter: drop-shadow(0 0 5px ${borderColor});">${icon}</span>
      </div>
    `;

    // Add click handler to dismiss early
    toast.addEventListener('click', () => {
      this.dismiss(toastId);
    });

    this.toastContainer.appendChild(toast);
    this.activeToasts.push({ id: toastId, element: toast });

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.style.transform = 'scale(1) rotate(0deg)';
      toast.style.opacity = '1';
    });

    // Add pulsing glow effect
    this.addGlowEffect(toast, borderColor);

    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismiss(toastId);
    }, duration);

    // Add screen shake effect for EVOLUTION type
    if (type.toUpperCase() === 'EVOLUTION') {
      this.addScreenShake();
    }

    return toastId;
  }

  addGlowEffect(element, color) {
    let glowIntensity = 0;
    let increasing = true;
    
    const glowInterval = setInterval(() => {
      if (increasing) {
        glowIntensity += 2;
        if (glowIntensity >= 30) increasing = false;
      } else {
        glowIntensity -= 2;
        if (glowIntensity <= 10) increasing = true;
      }
      
      element.style.boxShadow = `
        0 0 ${glowIntensity}px ${color}, 
        inset 0 0 20px rgba(255,255,255,0.2),
        0 0 ${glowIntensity * 2}px ${color}
      `;
      
      // Stop if element is removed
      if (!element.parentNode) {
        clearInterval(glowInterval);
      }
    }, 100);
  }

  addScreenShake() {
    const body = document.body;
    body.style.animation = 'screen-shake 0.6s ease-in-out';
    
    // Remove animation after completion
    setTimeout(() => {
      body.style.animation = '';
    }, 600);

    // Add screen shake keyframes if not already present
    if (!document.getElementById('screen-shake-style')) {
      const style = document.createElement('style');
      style.id = 'screen-shake-style';
      style.textContent = `
        @keyframes screen-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px) translateY(1px); }
          20% { transform: translateX(2px) translateY(-1px); }
          30% { transform: translateX(-1px) translateY(2px); }
          40% { transform: translateX(1px) translateY(-2px); }
          50% { transform: translateX(-2px) translateY(1px); }
          60% { transform: translateX(2px) translateY(-1px); }
          70% { transform: translateX(-1px) translateY(2px); }
          80% { transform: translateX(1px) translateY(-2px); }
          90% { transform: translateX(-1px) translateY(1px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  dismiss(toastId) {
    const toastIndex = this.activeToasts.findIndex(toast => toast.id === toastId);
    if (toastIndex === -1) return;

    const toast = this.activeToasts[toastIndex];
    
    // Exit animation
    toast.element.style.transform = 'scale(0.1) rotate(-180deg)';
    toast.element.style.opacity = '0';
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      this.activeToasts.splice(toastIndex, 1);
    }, 800);
  }

  dismissAll() {
    this.activeToasts.forEach(toast => {
      this.dismiss(toast.id);
    });
  }

  // Convenience methods for specific toast types
  showSuccess(message, duration = 3000) {
    return this.show(message, 'SUCCESS', duration);
  }

  showWarning(message, duration = 4000) {
    return this.show(message, 'WARNING', duration);
  }

  showError(message, duration = 5000) {
    return this.show(message, 'ERROR', duration);
  }

  showEvolution(message = 'Decode Complete → Evolution Live', duration = 5000) {
    return this.show(message, 'EVOLUTION', duration);
  }

  showInfo(message, duration = 3000) {
    return this.show(message, 'INFO', duration);
  }

  // Demo method to show various toast types
  demo() {
    setTimeout(() => this.showInfo('System Initializing...'), 500);
    setTimeout(() => this.showSuccess('Connection Established'), 2000);
    setTimeout(() => this.showWarning('Decode Patterns Detected'), 4000);
    setTimeout(() => this.showEvolution('Evolution Sequence Active'), 6000);
  }
}

// Initialize ToastPop globally
window.ToastPop = new ToastPop();

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.ToastPop) {
      window.ToastPop = new ToastPop();
    }
  });
} else {
  if (!window.ToastPop) {
    window.ToastPop = new ToastPop();
  }
}