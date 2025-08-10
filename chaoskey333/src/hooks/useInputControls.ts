"use client";

import { useEffect, useRef, useCallback, useState } from 'react';

// Environment variables for feature flags
const ENABLE_ARROWS = process.env.NEXT_PUBLIC_ENABLE_ARROWS === 'true';
const ENABLE_GAMEPAD = process.env.NEXT_PUBLIC_ENABLE_GAMEPAD === 'true';

// Gamepad constants
const DEADZONE = 0.2;
const REPEAT_DELAY = 250; // ms
const POLL_INTERVAL = 16; // ~60fps

type Direction = 'up' | 'down' | 'left' | 'right';
type InputAction = 'select' | 'back' | 'navigate';

interface InputEvent {
  type: InputAction;
  direction?: Direction;
  source: 'keyboard' | 'gamepad';
}

interface UseInputControlsOptions {
  onNavigate?: (direction: Direction, source: 'keyboard' | 'gamepad') => void;
  onSelect?: (source: 'keyboard' | 'gamepad') => void;
  onBack?: (source: 'keyboard' | 'gamepad') => void;
  enableHaptics?: boolean;
}

interface GamepadState {
  lastAction: number;
  repeatTimeout: number | null;
  pressedButtons: Set<number>;
}

export const useInputControls = (options: UseInputControlsOptions = {}) => {
  const {
    onNavigate,
    onSelect,
    onBack,
    enableHaptics = false
  } = options;

  const gamepadStateRef = useRef<GamepadState>({
    lastAction: 0,
    repeatTimeout: null,
    pressedButtons: new Set()
  });

  const animationFrameRef = useRef<number>();
  const [isListening, setIsListening] = useState(false);

  // Haptic feedback helper
  const triggerHaptic = useCallback((intensity: number = 0.5, duration: number = 100) => {
    if (!enableHaptics || !ENABLE_GAMEPAD) return;
    
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad && gamepad.vibrationActuator) {
        gamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude: intensity * 0.5,
          strongMagnitude: intensity
        }).catch(() => {
          // Ignore errors - haptics may not be supported
        });
      }
    }
  }, [enableHaptics]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!ENABLE_ARROWS) return;

    let direction: Direction | null = null;
    let action: InputAction | null = null;

    // Arrow keys and WASD
    switch (event.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        direction = 'up';
        action = 'navigate';
        break;
      case 'arrowdown':
      case 's':
        direction = 'down';
        action = 'navigate';
        break;
      case 'arrowleft':
      case 'a':
        direction = 'left';
        action = 'navigate';
        break;
      case 'arrowright':
      case 'd':
        direction = 'right';
        action = 'navigate';
        break;
      case 'enter':
      case ' ':
        action = 'select';
        break;
      case 'escape':
      case 'backspace':
        action = 'back';
        break;
    }

    if (action) {
      event.preventDefault();
      
      if (action === 'navigate' && direction && onNavigate) {
        onNavigate(direction, 'keyboard');
      } else if (action === 'select' && onSelect) {
        onSelect('keyboard');
      } else if (action === 'back' && onBack) {
        onBack('keyboard');
      }
    }
  }, [onNavigate, onSelect, onBack]);

  // Handle gamepad input
  const pollGamepad = useCallback(() => {
    if (!ENABLE_GAMEPAD) return;

    const gamepads = navigator.getGamepads();
    let anyGamepadConnected = false;

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      anyGamepadConnected = true;
      const now = Date.now();
      const state = gamepadStateRef.current;

      // Check D-pad (buttons 12-15) and face buttons
      const buttons = {
        up: gamepad.buttons[12]?.pressed || false,
        down: gamepad.buttons[13]?.pressed || false,
        left: gamepad.buttons[14]?.pressed || false,
        right: gamepad.buttons[15]?.pressed || false,
        select: gamepad.buttons[0]?.pressed || false, // A/Cross
        back: gamepad.buttons[1]?.pressed || false,   // B/Circle
      };

      // Check left stick
      const leftStickX = gamepad.axes[0] || 0;
      const leftStickY = gamepad.axes[1] || 0;

      // Determine stick direction (prioritize dominant axis)
      let stickDirection: Direction | null = null;
      if (Math.abs(leftStickX) > DEADZONE || Math.abs(leftStickY) > DEADZONE) {
        if (Math.abs(leftStickX) > Math.abs(leftStickY)) {
          stickDirection = leftStickX > 0 ? 'right' : 'left';
        } else {
          stickDirection = leftStickY > 0 ? 'down' : 'up';
        }
      }

      // Handle navigation (D-pad or stick)
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      for (const direction of directions) {
        const dpadPressed = buttons[direction];
        const stickPressed = stickDirection === direction;
        const isPressed = dpadPressed || stickPressed;

        if (isPressed && (!state.lastAction || now - state.lastAction > REPEAT_DELAY)) {
          onNavigate?.(direction, 'gamepad');
          state.lastAction = now;
          triggerHaptic(0.3, 50);
        }
      }

      // Handle face buttons
      if (buttons.select && !state.pressedButtons.has(0)) {
        state.pressedButtons.add(0);
        onSelect?.('gamepad');
        triggerHaptic(0.6, 100);
      } else if (!buttons.select && state.pressedButtons.has(0)) {
        state.pressedButtons.delete(0);
      }

      if (buttons.back && !state.pressedButtons.has(1)) {
        state.pressedButtons.add(1);
        onBack?.('gamepad');
        triggerHaptic(0.4, 80);
      } else if (!buttons.back && state.pressedButtons.has(1)) {
        state.pressedButtons.delete(1);
      }
    }

    if (anyGamepadConnected) {
      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    }
  }, [onNavigate, onSelect, onBack, triggerHaptic]);

  // Start/stop listening
  const startListening = useCallback(() => {
    if (isListening) return;

    setIsListening(true);

    // Keyboard events
    if (ENABLE_ARROWS) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Gamepad polling
    if (ENABLE_GAMEPAD) {
      const startPolling = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        pollGamepad();
      };

      // Start polling immediately if gamepad is connected
      const gamepads = navigator.getGamepads();
      const hasGamepad = Array.from(gamepads).some(gamepad => gamepad !== null);
      if (hasGamepad) {
        startPolling();
      }

      // Listen for gamepad connect/disconnect
      window.addEventListener('gamepadconnected', startPolling);
      window.addEventListener('gamepaddisconnected', () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      });
    }
  }, [isListening, handleKeyDown, pollGamepad]);

  const stopListening = useCallback(() => {
    if (!isListening) return;

    setIsListening(false);

    // Clean up keyboard events
    document.removeEventListener('keydown', handleKeyDown);

    // Clean up gamepad polling
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Clean up gamepad events
    window.removeEventListener('gamepadconnected', pollGamepad);
    window.removeEventListener('gamepaddisconnected', pollGamepad);

    // Clear gamepad state
    gamepadStateRef.current = {
      lastAction: 0,
      repeatTimeout: null,
      pressedButtons: new Set()
    };
  }, [isListening, handleKeyDown, pollGamepad]);

  // Auto start/stop on mount/unmount
  useEffect(() => {
    startListening();
    return stopListening;
  }, [startListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    isArrowsEnabled: ENABLE_ARROWS,
    isGamepadEnabled: ENABLE_GAMEPAD,
    triggerHaptic
  };
};

export default useInputControls;