type TauriHttpFetch = typeof globalThis.fetch;
type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let cachedTauriFetch: TauriHttpFetch | null | undefined;

async function resolveTauriFetch(): Promise<TauriHttpFetch | undefined> {
  if (cachedTauriFetch !== undefined) return cachedTauriFetch ?? undefined;
  if (typeof window === 'undefined' || !window.__TAURI__) {
    cachedTauriFetch = null;
    return undefined;
  }
  try {
    const mod = await import('@tauri-apps/plugin-http');
    cachedTauriFetch = mod.fetch;
    return mod.fetch;
  } catch {
    cachedTauriFetch = null;
    return undefined;
  }
}

export interface StoryCraftFetchOptions {
  /**
   * QNBS-v3: P1-F6 — opt-in request timeout (ms). DEFAULT OFF: streaming AI calls must not be
   * aborted mid-stream, so the timeout is only applied when a caller explicitly sets it (use for
   * short, non-streaming requests like `/api/tags` health probes). Composed with any caller signal.
   */
  timeoutMs?: number;
}

/**
 * Fetch für AI-Provider: im **Tauri-Desktop** Rust-HTTP-Client (CORS-Umgehung für lokale LLMs),
 * sonst Browser-`fetch`. Schlägt das Plugin fehl → Fallback auf `globalThis.fetch`.
 *
 * QNBS-v3: `options.timeoutMs` is opt-in (see {@link StoryCraftFetchOptions}); without it the
 * returned fetch is behaviourally identical to a bare `fetch`, so existing streaming callers are
 * unaffected.
 */
export function createStoryCraftFetch(options?: StoryCraftFetchOptions): FetchLike {
  const timeoutMs = options?.timeoutMs;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const tauriFetch = await resolveTauriFetch();
    const impl = tauriFetch ?? globalThis.fetch;

    if (
      typeof timeoutMs === 'number' &&
      timeoutMs > 0 &&
      typeof AbortSignal !== 'undefined' &&
      typeof AbortSignal.timeout === 'function'
    ) {
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const callerSignal = init?.signal ?? undefined;
      const signal =
        callerSignal && typeof AbortSignal.any === 'function'
          ? AbortSignal.any([callerSignal, timeoutSignal])
          : (callerSignal ?? timeoutSignal);
      return impl(input, { ...init, signal });
    }

    return impl(input, init);
  };
}
