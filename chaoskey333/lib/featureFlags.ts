/**
 * Feature Flag utility for managing flags from URL, localStorage, and environment variables
 */

export interface FeatureFlags {
  [key: string]: boolean;
}

const STORAGE_KEY = 'feature-flags';

/**
 * Parse flags from URL query parameters
 * Supports: ?flags=key1,key2=false,key3=true
 */
export function getFlagsFromURL(): FeatureFlags {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const flagsParam = urlParams.get('flags');
  
  if (!flagsParam) return {};
  
  const flags: FeatureFlags = {};
  const pairs = flagsParam.split(',');
  
  for (const pair of pairs) {
    if (pair.includes('=')) {
      const [key, value] = pair.split('=');
      flags[key.trim()] = value.trim() === 'true';
    } else {
      // If no value specified, default to true
      flags[pair.trim()] = true;
    }
  }
  
  return flags;
}

/**
 * Get flags from localStorage
 */
export function getFlagsFromStorage(): FeatureFlags {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save flags to localStorage
 */
export function saveFlagsToStorage(flags: FeatureFlags): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get flags from environment variables
 */
export function getFlagsFromEnv(): FeatureFlags {
  try {
    const envFlags = process.env.NEXT_PUBLIC_FEATURE_FLAGS;
    if (!envFlags) {
      return {};
    }
    return JSON.parse(envFlags);
  } catch (error) {
    console.error('Error parsing NEXT_PUBLIC_FEATURE_FLAGS:', error);
    return {};
  }
}

/**
 * Resolve flags from all sources with proper precedence:
 * 1. URL parameters (highest priority)
 * 2. localStorage
 * 3. Environment variables (lowest priority)
 */
export function resolveFeatureFlags(): FeatureFlags {
  const envFlags = getFlagsFromEnv();
  const storageFlags = getFlagsFromStorage();
  const urlFlags = getFlagsFromURL();
  
  return {
    ...envFlags,
    ...storageFlags,
    ...urlFlags,
  };
}

/**
 * Check if feature flag bar should be shown
 */
export function shouldShowFlagBar(): boolean {
  // Force enable for development/testing
  if (process.env.NEXT_PUBLIC_ENABLE_FLAG_BAR === 'true') {
    return true;
  }
  
  // Only show in preview environments
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
}

/**
 * Toggle a single feature flag and save to storage
 */
export function toggleFeatureFlag(key: string, currentFlags: FeatureFlags): FeatureFlags {
  const newFlags = {
    ...currentFlags,
    [key]: !currentFlags[key],
  };
  
  // Only save non-URL flags to storage
  const urlFlags = getFlagsFromURL();
  const flagsToSave = { ...newFlags };
  
  // Remove URL-overridden flags from storage
  Object.keys(urlFlags).forEach(urlKey => {
    delete flagsToSave[urlKey];
  });
  
  saveFlagsToStorage(flagsToSave);
  return newFlags;
}

/**
 * Get all available flag keys from all sources
 */
export function getAllFlagKeys(): string[] {
  const envFlags = getFlagsFromEnv();
  const storageFlags = getFlagsFromStorage();
  const urlFlags = getFlagsFromURL();
  
  const allKeys = new Set([
    ...Object.keys(envFlags),
    ...Object.keys(storageFlags),
    ...Object.keys(urlFlags),
  ]);
  
  return Array.from(allKeys).sort();
}