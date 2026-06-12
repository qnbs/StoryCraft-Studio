/**
 * Tests for plugin.worker.ts — Worker isolation for plugin execution.
 * QNBS-v3: P0 — Verifies Function-scope sandbox: dangerous globals are shadowed,
 *          side effects are collected, and AbortSignal is respected.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture registered handlers so we can invoke them directly.
const registeredHandlers = new Map<string, (ctx: unknown) => Promise<unknown>>();
const mockRegisterTaskHandler = vi.fn(
  (taskType: string, handler: (ctx: unknown) => Promise<unknown>) => {
    registeredHandlers.set(taskType, handler);
  },
);

vi.mock('@domain/worker-bus', () => ({
  registerTaskHandler: mockRegisterTaskHandler,
}));

function makeContext(overrides: { payload?: unknown; signalAborted?: boolean } = {}): {
  taskId: string;
  taskType: string;
  payload: unknown;
  signal: AbortSignal;
  emitProgress: ReturnType<typeof vi.fn>;
} {
  const controller = new AbortController();
  if (overrides.signalAborted) controller.abort();
  return {
    taskId: 'task-1',
    taskType: 'plugin.execute',
    payload: overrides.payload,
    signal: controller.signal,
    emitProgress: vi.fn(),
  };
}

async function importWorker(): Promise<void> {
  registeredHandlers.clear();
  // QNBS-v3: Force re-evaluation of the worker module so registerTaskHandler runs again.
  vi.resetModules();
  await import('../../../workers/plugin.worker', { with: { type: 'script' } });
}

describe('plugin.worker', () => {
  beforeEach(async () => {
    mockRegisterTaskHandler.mockClear();
    await importWorker();
  });

  describe('task registration', () => {
    it('registers plugin.execute and plugin.ping task handlers on module load', () => {
      expect(mockRegisterTaskHandler).toHaveBeenCalledTimes(2);
      expect(mockRegisterTaskHandler).toHaveBeenCalledWith('plugin.execute', expect.any(Function));
      expect(mockRegisterTaskHandler).toHaveBeenCalledWith('plugin.ping', expect.any(Function));
    });
  });

  describe('sandbox security', () => {
    it('denies access to fetch inside plugin code', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'escape-test',
          code: 'run = async () => { await fetch("https://evil.test"); };',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });

      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(
        /fetch is not defined|undefined is not a function|is not a function/,
      );
    });

    it('denies access to indexedDB inside plugin code', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'escape-test',
          code: 'run = async () => { indexedDB.open("x"); };',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });

      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/indexedDB is not defined|Cannot read properties of undefined/);
    });

    it('denies access to self/globalThis inside plugin code', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'escape-test',
          code: 'run = () => { return typeof self !== "undefined" || typeof globalThis !== "undefined"; };',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });

      const result = (await handler(ctx)) as {
        success: boolean;
        payload: { sideEffects: unknown[] };
      };
      expect(result.success).toBe(true);
      expect(result.payload.sideEffects).toHaveLength(0);
    });
  });

  describe('plugin execution', () => {
    it('returns error when payload is invalid', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({ payload: { pluginId: 'x' } });
      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Invalid plugin.execute payload/);
    });

    it('returns error when plugin has no run export', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'no-run',
          code: 'const x = 1;',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });
      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/has no exported run\(\) function/);
    });

    it('collects appendToCurrentScene side effects when permission is granted', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'side-effect',
          code: 'run = (api) => { api.appendToCurrentScene("extra"); };',
          grantedPermissions: ['scene.write'],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });
      const result = (await handler(ctx)) as {
        success: boolean;
        payload: { sideEffects: Array<{ kind: string; payload: string }> };
      };
      expect(result.success).toBe(true);
      expect(result.payload.sideEffects).toEqual([{ kind: 'append', payload: 'extra' }]);
    });

    it('throws permission denied when appendToCurrentScene is called without scene.write', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'no-perm',
          code: 'run = (api) => { api.appendToCurrentScene("extra"); };',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });
      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Permission denied: scene.write/);
    });

    it('collects logs', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'logger',
          code: 'run = (api) => { api.log("hello"); api.log(123); };',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });
      const result = (await handler(ctx)) as {
        success: boolean;
        payload: { logs: string[] };
      };
      expect(result.success).toBe(true);
      expect(result.payload.logs).toEqual(['hello', '123']);
    });

    it('reads project title and scene titles from snapshot', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'reader',
          code: 'let captured; run = (api) => { captured = { title: api.getProjectTitle(), scenes: api.getSceneTitles() }; api.log(JSON.stringify(captured)); };',
          grantedPermissions: ['project.read', 'scene.read'],
          readApiSnapshot: { projectTitle: 'My Novel', sceneTitles: ['Opening', 'Twist'] },
        },
      });
      const result = (await handler(ctx)) as {
        success: boolean;
        payload: { logs: string[] };
      };
      expect(result.success).toBe(true);
      expect(result.payload.logs[0]).toBe('{"title":"My Novel","scenes":["Opening","Twist"]}');
    });

    it('async APIs are unavailable in worker sandbox', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'async-api',
          code: 'run = async (api) => { await api.generateText("x"); };',
          grantedPermissions: ['ai.invoke'],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
      });
      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/generateText\(\) is not available inside the worker sandbox/);
    });
  });

  describe('abort/timeout', () => {
    it('returns aborted error when signal is already aborted', async () => {
      const handler = registeredHandlers.get('plugin.execute');
      if (!handler) throw new Error('plugin.execute handler not registered');

      const ctx = makeContext({
        payload: {
          pluginId: 'aborted',
          code: 'run = () => {};',
          grantedPermissions: [],
          readApiSnapshot: { projectTitle: '', sceneTitles: [] },
        },
        signalAborted: true,
      });
      const result = (await handler(ctx)) as { success: boolean; error: string };
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/aborted before start/);
    });
  });

  describe('plugin.ping', () => {
    it('responds with ok status', async () => {
      const handler = registeredHandlers.get('plugin.ping');
      if (!handler) throw new Error('plugin.ping handler not registered');

      const result = (await handler(makeContext())) as {
        success: boolean;
        payload: { status: string };
      };
      expect(result.success).toBe(true);
      expect(result.payload.status).toBe('ok');
    });
  });
});
