# Feature Flags System

This project includes a feature flag system designed for Vercel Preview environments that allows toggling feature flags live without requiring redeployment.

## Quick Start

1. **Environment Setup**: Add to your `.env.preview` or `.env.local`:
   ```
   NEXT_PUBLIC_VERCEL_ENV=preview
   NEXT_PUBLIC_FEATURE_FLAGS='{"casinoV2":false,"mintGate":true,"replayTerminal":true}'
   ```

2. **Usage**: The feature flag pill appears in the bottom-right corner when in preview mode.

## Features

- **🎯 Preview-Only**: Only shows in `NEXT_PUBLIC_VERCEL_ENV=preview` or when `NEXT_PUBLIC_ENABLE_FLAG_BAR=true`
- **🎮 Interactive UI**: Collapsible pill with toggle switches
- **📌 Pinning**: Pin the panel to keep it open
- **⌨️ Keyboard Shortcut**: `Cmd/Ctrl + .` to toggle panel
- **🔗 URL Overrides**: Use `?flags=key1,key2=false` to override flags temporarily
- **💾 Persistence**: Changes saved to localStorage
- **🏆 Precedence**: URL > localStorage > environment variables

## Flag Resolution Order

1. **URL Parameters** (highest priority): `?flags=casinoV2=false,newFeature=true`
2. **localStorage**: Persisted across sessions
3. **Environment Variables** (lowest priority): `NEXT_PUBLIC_FEATURE_FLAGS`

## Configuration

### Environment Variables

- `NEXT_PUBLIC_VERCEL_ENV`: Set to `preview` to show the flag bar
- `NEXT_PUBLIC_ENABLE_FLAG_BAR`: Force enable (overrides environment check)
- `NEXT_PUBLIC_FEATURE_FLAGS`: JSON object with flag defaults

### Example URLs

- Toggle specific flags: `?flags=casinoV2=true,mintGate=false`
- Enable flags (defaults to true): `?flags=newFeature,anotherFlag`

## Implementation

The system consists of:

- **`lib/featureFlags.ts`**: Core flag management logic
- **`components/FeatureFlagBar.tsx`**: UI component
- **`src/app/layout.tsx`**: Integration point

## Production Safety

The feature flag bar is automatically hidden in production (`NEXT_PUBLIC_VERCEL_ENV=production`) to ensure it never appears in live environments.