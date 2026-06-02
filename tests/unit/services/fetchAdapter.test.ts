/**
 * Tests for services/ai/fetchAdapter.ts
 * QNBS-v3: createStoryCraftFetch — uses browser globalThis.fetch when not in Tauri.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('createStoryCraftFetch', () => {
  beforeEach(() => {
    // Ensure no __TAURI__ context
    delete (window as unknown as Record<string, unknown>)['__TAURI__'];
    vi.resetModules();
  });

  it('uses globalThis.fetch when not in Tauri environment', async () => {
    const mockResponse = new Response('{"ok":true}', { status: 200 });
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', mockFetch);

    const { createStoryCraftFetch } = await import('../../../services/ai/fetchAdapter');
    const fetchFn = createStoryCraftFetch();
    const result = await fetchFn('https://api.example.com/test');

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', undefined);
    expect(result).toBe(mockResponse);
    vi.unstubAllGlobals();
  });

  it('passes init options to the underlying fetch', async () => {
    const mockResponse = new Response('{}', { status: 200 });
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', mockFetch);

    const { createStoryCraftFetch } = await import('../../../services/ai/fetchAdapter');
    const fetchFn = createStoryCraftFetch();
    const init = { method: 'POST', body: JSON.stringify({ test: true }) };
    await fetchFn('https://api.example.com/test', init);

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', init);
    vi.unstubAllGlobals();
  });

  it('returns a callable function', async () => {
    const { createStoryCraftFetch } = await import('../../../services/ai/fetchAdapter');
    const fetchFn = createStoryCraftFetch();
    expect(typeof fetchFn).toBe('function');
  });

  it('does not attach a signal when no timeout is configured (streaming-safe default)', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const { createStoryCraftFetch } = await import('../../../services/ai/fetchAdapter');
    await createStoryCraftFetch()('https://api.example.com/stream', { method: 'POST' });

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/stream', { method: 'POST' });
    vi.unstubAllGlobals();
  });

  it('attaches an AbortSignal when an opt-in timeout is set', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const { createStoryCraftFetch } = await import('../../../services/ai/fetchAdapter');
    await createStoryCraftFetch({ timeoutMs: 5000 })('https://api.example.com/tags');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    vi.unstubAllGlobals();
  });
});
