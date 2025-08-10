# Navigation Controls Documentation

This document describes the gamepad and arrow-key navigation system for the Omni-Singularity Map.

## Features

### 1. Arrow-Key and WASD Navigation
- Navigate interactive panels, cards, and controls using arrow keys or WASD
- Focus ring and aria-live cues ensure accessibility compliance
- Smooth transitions between focusable elements

### 2. Gamepad Support  
- Xbox/PlayStation/Nintendo Switch controller support
- Dead-zone handling prevents input jitter
- Edge-hold repeat for smooth navigation
- Optional haptic feedback
- D-pad and left stick navigation
- A/Cross button for select actions
- B/Circle button for back actions

### 3. Feature Flags (Default: OFF)
Navigation features are controlled via environment variables and are **disabled by default** for production safety.

#### Environment Variables:
```bash
# Enable arrow key and WASD navigation
NEXT_PUBLIC_ENABLE_ARROWS=false

# Enable gamepad support  
NEXT_PUBLIC_ENABLE_GAMEPAD=false
```

## Usage

### Development/Testing
To enable features for local development, update your `.env.local` file:

```bash
NEXT_PUBLIC_ENABLE_ARROWS=true
NEXT_PUBLIC_ENABLE_GAMEPAD=true
```

### Preview Environment
For Vercel preview deployments, add these environment variables in:
`Project → Settings → Environment Variables → Scope: Preview`

```bash
NEXT_PUBLIC_ENABLE_ARROWS=true
NEXT_PUBLIC_ENABLE_GAMEPAD=true
```

### Production
Keep features disabled in production until fully validated:

```bash
NEXT_PUBLIC_ENABLE_ARROWS=false
NEXT_PUBLIC_ENABLE_GAMEPAD=false
```

## Controls

When enabled, the following controls are available:

### Keyboard Navigation
- **Arrow Keys** or **WASD**: Move focus between tiles
- **Enter** or **Space**: Activate the focused tile
- **Escape**: Trigger back action

### Gamepad Navigation
- **D-pad** or **Left Stick**: Move focus between tiles
- **A/Cross Button**: Activate the focused tile
- **B/Circle Button**: Trigger back action

## Implementation Details

### Core Components
- `hooks/useInputControls.ts`: Centralized input management hook
- `components/CosmicReplayTerminal.tsx`: Demo component with navigation
- Focus management with visual indicators and screen reader support

### Performance
- Gamepad polling at ~60fps with dead-zone handling
- Minimal performance impact when features are disabled
- Safe fallback to mouse/touch for all interactions

### Accessibility
- Focus ring with 3px blue outline and shadow
- Aria-live announcements for navigation changes
- Screen reader compatible with proper ARIA labels
- Grid navigation pattern following WCAG guidelines

## Testing Checklist

### Basic Navigation
- [ ] Arrow keys move focus across tiles
- [ ] WASD keys work as alternatives to arrow keys
- [ ] Focus wraps appropriately at grid boundaries
- [ ] Visual focus indicator is clearly visible

### Gamepad Support (if enabled)
- [ ] D-pad navigation works
- [ ] Left stick navigation works with dead-zone
- [ ] A/Cross button activates items
- [ ] B/Circle button triggers back action
- [ ] Haptic feedback works on supported controllers

### Accessibility
- [ ] Screen reader announces navigation changes
- [ ] Focus is trapped within the navigation area
- [ ] Tab order is logical and predictable
- [ ] High contrast mode maintains visibility

### Feature Flags
- [ ] Features are disabled when flags are false
- [ ] No console errors when features are disabled
- [ ] UI clearly indicates when navigation is disabled
- [ ] Fallback to mouse/touch works correctly