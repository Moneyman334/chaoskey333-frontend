"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import useInputControls from '../hooks/useInputControls';

interface FocusableItem {
  id: string;
  type: 'button' | 'card' | 'panel';
  label: string;
  description?: string;
  x: number;
  y: number;
  action?: () => void;
}

// Sample grid of focusable items for the Omni-Singularity Map
const createMapItems = (): FocusableItem[] => {
  const items: FocusableItem[] = [];
  
  // Create a 4x3 grid of items
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 4; x++) {
      const id = `tile-${x}-${y}`;
      const types: Array<'button' | 'card' | 'panel'> = ['button', 'card', 'panel'];
      const type = types[(x + y) % 3];
      
      items.push({
        id,
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${x + 1}-${y + 1}`,
        description: `Interactive ${type} at position (${x + 1}, ${y + 1})`,
        x,
        y,
        action: () => console.log(`Activated ${id}`)
      });
    }
  }
  
  return items;
};

const CosmicReplayTerminal: React.FC = () => {
  const [items] = useState<FocusableItem[]>(createMapItems());
  const [currentFocus, setCurrentFocus] = useState<string>('tile-0-0');
  const [announcements, setAnnouncements] = useState<string>('');
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();

  // Helper to find item by coordinates
  const findItemAt = useCallback((x: number, y: number) => {
    return items.find(item => item.x === x && item.y === y);
  }, [items]);

  // Helper to get current focused item
  const getCurrentItem = useCallback(() => {
    return items.find(item => item.id === currentFocus);
  }, [items, currentFocus]);

  // Announce changes for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncements(message);
    
    // Clear previous timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    // Clear announcement after a delay
    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncements('');
    }, 1000);
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right', source: 'keyboard' | 'gamepad') => {
    const currentItem = getCurrentItem();
    if (!currentItem) return;

    let newX = currentItem.x;
    let newY = currentItem.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, newY - 1);
        break;
      case 'down':
        newY = Math.min(2, newY + 1); // Max Y is 2 (3 rows)
        break;
      case 'left':
        newX = Math.max(0, newX - 1);
        break;
      case 'right':
        newX = Math.min(3, newX + 1); // Max X is 3 (4 columns)
        break;
    }

    const targetItem = findItemAt(newX, newY);
    if (targetItem && targetItem.id !== currentFocus) {
      setCurrentFocus(targetItem.id);
      announce(`Moved to ${targetItem.label}. ${targetItem.description || ''}`);
      
      // Scroll into view if needed
      const element = document.querySelector(`[data-focusable="${targetItem.id}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [getCurrentItem, findItemAt, currentFocus, announce]);

  // Select handler
  const handleSelect = useCallback((source: 'keyboard' | 'gamepad') => {
    const currentItem = getCurrentItem();
    if (currentItem?.action) {
      currentItem.action();
      announce(`Activated ${currentItem.label}`);
    }
  }, [getCurrentItem, announce]);

  // Back handler
  const handleBack = useCallback((source: 'keyboard' | 'gamepad') => {
    announce('Back pressed');
    // Could implement back navigation logic here
    console.log('Back navigation triggered from', source);
  }, [announce]);

  // Initialize input controls
  const { isArrowsEnabled, isGamepadEnabled, triggerHaptic } = useInputControls({
    onNavigate: handleNavigate,
    onSelect: handleSelect,
    onBack: handleBack,
    enableHaptics: true
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  // Get style for focus ring
  const getFocusStyle = (itemId: string) => {
    const isFocused = currentFocus === itemId;
    return {
      outline: isFocused ? '3px solid #3b82f6' : 'none',
      outlineOffset: '2px',
      transform: isFocused ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease-in-out',
      boxShadow: isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
    };
  };

  // Get item type styles
  const getItemTypeStyle = (type: FocusableItem['type']) => {
    const baseStyle = {
      padding: '1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      minHeight: '100px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      border: '2px solid',
      background: 'white'
    };

    switch (type) {
      case 'button':
        return {
          ...baseStyle,
          borderColor: '#10b981',
          backgroundColor: '#ecfdf5',
          color: '#065f46'
        };
      case 'card':
        return {
          ...baseStyle,
          borderColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          color: '#92400e'
        };
      case 'panel':
        return {
          ...baseStyle,
          borderColor: '#8b5cf6',
          backgroundColor: '#f5f3ff',
          color: '#5b21b6'
        };
    }
  };

  return (
    <div className="cosmic-replay-terminal p-6 max-w-4xl mx-auto">
      {/* Status indicator */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🎮 Omni-Singularity Map</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Arrow Keys/WASD: {isArrowsEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
          <div>Gamepad: {isGamepadEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
          <div className="mt-2 font-medium">
            Controls: {isArrowsEnabled && 'Arrow Keys/WASD to navigate, Enter/Space to select, Esc to go back'}
            {isArrowsEnabled && isGamepadEnabled && ' | '}
            {isGamepadEnabled && 'D-pad/Left Stick to navigate, A/Cross to select, B/Circle to go back'}
          </div>
        </div>
      </div>

      {/* Accessibility announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcements}
      </div>

      {/* Interactive grid */}
      <div 
        className="grid grid-cols-4 gap-4 mb-6"
        role="grid"
        aria-label="Navigable map items"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-focusable={item.id}
            role="gridcell"
            tabIndex={currentFocus === item.id ? 0 : -1}
            aria-label={`${item.label}. ${item.description || ''}`}
            style={{
              ...getItemTypeStyle(item.type),
              ...getFocusStyle(item.id)
            }}
            onClick={() => {
              setCurrentFocus(item.id);
              item.action?.();
            }}
            onFocus={() => {
              setCurrentFocus(item.id);
            }}
          >
            <div className="font-semibold text-sm">{item.label}</div>
            <div className="text-xs mt-1 opacity-75">
              Position: ({item.x + 1}, {item.y + 1})
            </div>
            <div className="text-xs mt-1 capitalize">
              {item.type}
            </div>
          </div>
        ))}
      </div>

      {/* Current focus info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Current Focus</h3>
        {(() => {
          const current = getCurrentItem();
          return current ? (
            <div className="text-blue-800">
              <div><strong>Item:</strong> {current.label}</div>
              <div><strong>Type:</strong> {current.type}</div>
              <div><strong>Position:</strong> ({current.x + 1}, {current.y + 1})</div>
              {current.description && (
                <div><strong>Description:</strong> {current.description}</div>
              )}
            </div>
          ) : (
            <div className="text-blue-600">No item focused</div>
          );
        })()}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Navigation Instructions:</h4>
        <ul className="space-y-1">
          {isArrowsEnabled && (
            <>
              <li>• Use Arrow Keys or WASD to move focus between tiles</li>
              <li>• Press Enter or Space to activate the focused tile</li>
              <li>• Press Escape to trigger back action</li>
            </>
          )}
          {isGamepadEnabled && (
            <>
              <li>• Use D-pad or Left Stick to move focus between tiles</li>
              <li>• Press A/Cross button to activate the focused tile</li>
              <li>• Press B/Circle button to trigger back action</li>
            </>
          )}
          {!isArrowsEnabled && !isGamepadEnabled && (
            <li>• Navigation is disabled. Enable via environment variables NEXT_PUBLIC_ENABLE_ARROWS or NEXT_PUBLIC_ENABLE_GAMEPAD</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CosmicReplayTerminal;