/**
 * aiModeService.ts
 * ----------------
 * Singleton routing service for the AI execution mode.
 *
 * Mirrors the CannaGuide-2025 localRoutingService pattern (ADR-0006).
 * Controls whether AI calls are routed to cloud providers, local on-device
 * models, or resolved automatically. Callers use shouldRouteLocally() to
 * decide the routing path without importing Redux.
 *
 * Sync'd from Redux via listenerMiddleware on every setAiMode / setSettings
 * dispatch — never import directly from featureFlags or Redux here.
 */
import type { AiMode } from '../../types';

const isOffline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine === false;

let _mode: AiMode = 'hybrid';
let _localModelsReady = false;

/** Called from listenerMiddleware on setAiMode / setSettings. */
export const setActiveAiMode = (mode: AiMode): void => {
  _mode = mode;
};

/** Returns the current active AI execution mode. */
export const getActiveAiMode = (): AiMode => _mode;

/** Notify the service that local models have finished loading. */
export const notifyLocalModelsReady = (ready: boolean): void => {
  _localModelsReady = ready;
};

/**
 * Whether the current mode mandates local-only inference.
 *
 * - local / eco: always true
 * - cloud:       true only when offline (force fallback, no network)
 * - hybrid:      true when offline OR local models are preloaded
 */
export const shouldRouteLocally = (): boolean => {
  if (_mode === 'local' || _mode === 'eco') return true;
  if (_mode === 'cloud') return isOffline();
  // hybrid — smart routing
  return isOffline() || _localModelsReady;
};

/** True when eco mode is active (smallest models, no cloud). */
export const isEcoMode = (): boolean => _mode === 'eco';

/** True when only cloud providers should be used. */
export const isCloudOnlyMode = (): boolean => _mode === 'cloud' && !isOffline();
