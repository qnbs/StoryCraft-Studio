import type { FeatureFlagsState } from './featureFlagsSlice';

const FEATURE_FLAGS_STORAGE_KEY = 'worldscript-feature-flags';
const LEGACY_FEATURE_FLAGS_STORAGE_KEY = 'storycraft-feature-flags';

function getItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage may be blocked or unavailable.
  }
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // localStorage may be blocked or unavailable.
  }
}

/** Load the persisted feature flags, migrating any legacy StoryCraft key once. */
export function loadFeatureFlags(): string | null {
  let stored = getItem(FEATURE_FLAGS_STORAGE_KEY);

  // QNBS-v3: Rebrand migration — migrate legacy StoryCraft feature flags once, then drop the old key.
  if (!stored) {
    const legacy = getItem(LEGACY_FEATURE_FLAGS_STORAGE_KEY);
    if (legacy) {
      setItem(FEATURE_FLAGS_STORAGE_KEY, legacy);
      removeItem(LEGACY_FEATURE_FLAGS_STORAGE_KEY);
      stored = legacy;
    }
  }

  return stored;
}

/** Persist the current feature flags state. */
export function saveFeatureFlags(state: FeatureFlagsState): void {
  setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(state));
}

/** TEST ONLY: reset the in-memory/storage state used by tests. */
export function _resetFeatureFlagsStorage(): void {
  removeItem(FEATURE_FLAGS_STORAGE_KEY);
  removeItem(LEGACY_FEATURE_FLAGS_STORAGE_KEY);
}
