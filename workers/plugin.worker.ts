/// <reference lib="webworker" />
/**
 * Plugin Worker — Isolated execution context for StoryCraft plugins.
 * QNBS-v3: P0-1 — Plugins run inside a Function-scope sandbox with shadowed globals.
 *          P0-2 — Execution respects the AbortSignal supplied by WorkerBus v2.
 *          P0-3 — Read-only API snapshots are passed in the task payload; side effects
 *          (appendToCurrentScene, log) are collected and returned to the main thread for
 *          application. Async APIs that require main-thread state (generateText, storage)
 *          are explicitly unsupported inside the worker sandbox.
 */

import { registerTaskHandler, type WorkerHandlerContext } from '@domain/worker-bus';
import type { PluginPermission } from '../services/pluginRegistry';

// ---------------------------------------------------------------------------
// Task payload types
// ---------------------------------------------------------------------------

interface PluginExecutePayload {
  readonly pluginId: string;
  readonly code: string;
  readonly timeoutMs?: number;
  readonly grantedPermissions: readonly PluginPermission[];
  readonly readApiSnapshot: {
    readonly projectTitle: string;
    readonly sceneTitles: readonly string[];
  };
}

interface PluginSideEffect {
  readonly kind: 'append' | 'log';
  readonly payload: unknown;
}

interface PluginExecuteResult {
  readonly pluginId: string;
  readonly sideEffects: readonly PluginSideEffect[];
  readonly logs: readonly string[];
}

// ---------------------------------------------------------------------------
// Sandbox implementation
// ---------------------------------------------------------------------------

const DENIED_GLOBALS = new Set<string>([
  'self',
  'globalThis',
  'window',
  'top',
  'parent',
  'opener',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'indexedDB',
  'caches',
  'navigator',
  'location',
  'document',
  'localStorage',
  'sessionStorage',
  'importScripts',
  'Worker',
  'SharedArrayBuffer',
  'Atomics',
]);

/**
 * Build a sandboxed runner for plugin code.
 * QNBS-v3: Uses `new Function` with explicit parameter names so every identifier the
 * plugin references must be resolved from the supplied sandbox object. Dangerous globals
 * are intentionally absent. The plugin must export a `run(api)` function.
 */
function createSandboxedRunner(
  code: string,
  sandbox: Record<string, unknown>,
): () => ((api: Record<string, unknown>) => Promise<void> | void) | undefined {
  const sandboxKeys = Object.keys(sandbox);
  const sandboxValues = Object.values(sandbox);

  // QNBS-v3: Prepend a shadow-declaration for every denied global so that even if the
  // plugin tries to access them they are undefined in this scope. Also shadow
  // `globalThis`/`self` with undefined to break escape paths.
  const shadowDeclarations = Array.from(DENIED_GLOBALS)
    .map((name) => `var ${name} = undefined;`)
    .join('\n');

  // QNBS-v3: Wrap the plugin code so it can declare `run` (or `export const run`) in a
  // way that survives the Function body. We collect the declared `run` binding and
  // return it. `const`/`let` declared inside the user code stay in the function scope.
  const wrapped = `
"use strict";
${shadowDeclarations}
var run = undefined;
${code}
return typeof run === 'function' ? run : undefined;
`;

  try {
    // QNBS-v3: `new Function` creates a function in the global scope but with the
    // parameter list controlling what identifiers are injectable. By not including any
    // dangerous globals in the parameter list and shadowing them with `var`, the plugin
    // cannot reach them.
    const fn = new Function(...sandboxKeys, wrapped);
    return () =>
      fn(...sandboxValues) as ((api: Record<string, unknown>) => Promise<void> | void) | undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Plugin code failed to compile: ${message}`);
  }
}

function assertPermission(granted: ReadonlySet<PluginPermission>, perm: PluginPermission): void {
  if (!granted.has(perm)) {
    throw new Error(`Permission denied: ${perm}`);
  }
}

function buildSandboxApi(
  payload: PluginExecutePayload,
  sideEffects: PluginSideEffect[],
  logs: string[],
) {
  const granted = new Set(payload.grantedPermissions);
  const denyAsync = (name: string): never => {
    throw new Error(
      `${name}() is not available inside the worker sandbox. Use pluginRegistry.executeAsync() for plugins that need ${name}.`,
    );
  };

  return {
    getProjectTitle: () => {
      assertPermission(granted, 'project.read');
      return payload.readApiSnapshot.projectTitle;
    },
    getSceneTitles: () => {
      assertPermission(granted, 'scene.read');
      return payload.readApiSnapshot.sceneTitles.slice();
    },
    appendToCurrentScene: (text: string) => {
      assertPermission(granted, 'scene.write');
      if (typeof text !== 'string') {
        throw new Error('appendToCurrentScene requires a string argument');
      }
      sideEffects.push({ kind: 'append', payload: text });
    },
    log: (message: string) => {
      const entry = typeof message === 'string' ? message : String(message);
      logs.push(entry);
    },
    generateText: async () => denyAsync('generateText'),
    storageRead: async () => denyAsync('storageRead'),
    storageWrite: async () => denyAsync('storageWrite'),
  };
}

function isPluginExecutePayload(value: unknown): value is PluginExecutePayload {
  const p = value as Record<string, unknown> | undefined;
  if (!p || typeof p !== 'object') return false;
  if (typeof p['pluginId'] !== 'string' || typeof p['code'] !== 'string') return false;
  if (!Array.isArray(p['grantedPermissions'])) return false;
  const snap = p['readApiSnapshot'] as Record<string, unknown> | undefined;
  if (!snap || typeof snap !== 'object') return false;
  if (typeof snap['projectTitle'] !== 'string' || !Array.isArray(snap['sceneTitles'])) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Task handler
// ---------------------------------------------------------------------------

registerTaskHandler('plugin.execute', async (ctx: WorkerHandlerContext) => {
  if (!isPluginExecutePayload(ctx.payload)) {
    return {
      success: false,
      payload: null,
      error: 'Invalid plugin.execute payload',
      latencyMs: 0,
    };
  }

  const payload = ctx.payload;
  const sideEffects: PluginSideEffect[] = [];
  const logs: string[] = [];
  const sandboxApi = buildSandboxApi(payload, sideEffects, logs);

  // QNBS-v3: The sandbox runner receives only the API object. We deliberately do NOT
  // pass any browser globals. The plugin's `run` function is extracted and invoked.
  const runner = createSandboxedRunner(payload.code, { api: sandboxApi });

  if (ctx.signal.aborted) {
    return {
      success: false,
      payload: null,
      error: 'Plugin execution aborted before start',
      latencyMs: 0,
    };
  }

  try {
    const runFn = runner();
    if (typeof runFn !== 'function') {
      return {
        success: false,
        payload: null,
        error: `Plugin '${payload.pluginId}' has no exported run() function`,
        latencyMs: 0,
      };
    }

    ctx.emitProgress('running', 0.5);

    // QNBS-v3: Poll the AbortSignal before and after the plugin run. Long-running
    // synchronous plugin code cannot be pre-empted, but the timeout gates subsequent
    // side-effect application and async plugins cooperate via the signal.
    if (ctx.signal.aborted) {
      throw new Error('Plugin execution aborted');
    }

    const result = runFn(sandboxApi);
    if (result && typeof (result as Promise<void>).then === 'function') {
      await result;
    }

    if (ctx.signal.aborted) {
      throw new Error('Plugin execution aborted');
    }

    ctx.emitProgress('completed', 1);

    const executeResult: PluginExecuteResult = {
      pluginId: payload.pluginId,
      sideEffects,
      logs,
    };

    return {
      success: true,
      payload: executeResult,
      error: null,
      latencyMs: 0,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      payload: null,
      error: message,
      latencyMs: 0,
    };
  }
});

// Handle unknown task types gracefully
registerTaskHandler('plugin.ping', async () => {
  return {
    success: true,
    payload: { status: 'ok', version: '1.0.0' },
    error: null,
    latencyMs: 0,
  };
});
