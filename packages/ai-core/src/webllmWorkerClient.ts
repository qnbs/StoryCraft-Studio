/*
 * WebLLM Worker Client - Main thread proxy for the dedicated worker (P1-1)
 * Fixed per CodeAnt review comments (client isolation, streaming contract, progress, abort handling)
 */

interface WebLlmProgressReport {
  progress: number;
  text: string;
}

interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  onStreamChunk?: (chunk: string, done: boolean) => void;
  onProgress?: (report: WebLlmProgressReport) => void;
  signal?: AbortSignal;
}

export interface WebLlmWorkerClient {
  init(modelId: string, options?: { onProgress?: (report: WebLlmProgressReport) => void }): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  prewarm(modelId: string): Promise<void>;
  dispose(): Promise<void>;
  isReady(): boolean;
  getCurrentModel(): string | null;
}

interface PendingRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  onStreamChunk?: (chunk: string, done: boolean) => void;
  onProgress?: (report: WebLlmProgressReport) => void;
  accumulatedText?: string; // for streaming contract fix
}

// Per-client state (moved inside factory for isolation - fixes race condition)
export function createWebLlmWorkerClient(): WebLlmWorkerClient {
  let workerInstance: Worker | null = null;
  const pending = new Map<string, PendingRequest>();
  let ready = false;
  let currentModel: string | null = null;

  function genId(): string {
    return `wllm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function getWorker(): Worker {
    if (workerInstance) return workerInstance;

    workerInstance = new Worker(new URL('./webllm.worker.ts', import.meta.url), { type: 'module' });

    workerInstance.onmessage = (e: MessageEvent) => {
      const { id, type, payload } = e.data as { id: string; type: string; payload?: any };
      const p = pending.get(id);
      if (!p) return;

      if (type === 'progress') {
        if (p.onProgress) p.onProgress(payload as WebLlmProgressReport);
        return;
      }

      if (type === 'ready') {
        ready = true;
        currentModel = payload?.modelId ?? null;
        p.resolve();
        pending.delete(id);
      } else if (type === 'result') {
        const finalText = p.accumulatedText ?? (payload?.text ?? '');
        p.resolve(finalText);
        pending.delete(id);
      } else if (type === 'stream-chunk') {
        if (p.onStreamChunk) p.onStreamChunk(payload?.text ?? '', !!payload?.done);
        if (payload?.done) {
          // Do NOT resolve here with empty string. Wait for final 'result' which carries accumulated text.
          // The 'result' handler above will resolve with accumulatedText.
        }
      } else if (type === 'error') {
        p.reject(new Error(payload?.message ?? 'Worker error'));
        pending.delete(id);
      }
    };

    workerInstance.onerror = () => {
      pending.forEach((pr) => pr.reject(new Error('Worker crashed')));
      pending.clear();
      workerInstance = null;
      ready = false;
      currentModel = null;
    };

    return workerInstance;
  }

  return {
    async init(modelId: string, options: { onProgress?: (report: WebLlmProgressReport) => void } = {}): Promise<void> {
      const w = getWorker();
      const rid = genId();
      return new Promise((res, rej) => {
        pending.set(rid, { resolve: res, reject: rej, onProgress: options.onProgress });
        w.postMessage({ id: rid, type: 'init', payload: { modelId } });
      });
    },

    async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
      if (!ready) throw new Error('Call init() first');
      const w = getWorker();
      const rid = genId();
      return new Promise((res, rej) => {
        const entry: PendingRequest = {
          resolve: res,
          reject: rej,
          onStreamChunk: options.onStreamChunk,
          accumulatedText: options.stream || options.onStreamChunk ? '' : undefined,
        };
        pending.set(rid, entry);

        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            w.postMessage({ id: genId(), type: 'abort', payload: { requestId: rid } });
          }, { once: true });
        }

        w.postMessage({
          id: rid,
          type: 'generate',
          payload: {
            prompt,
            options: {
              maxTokens: options.maxTokens,
              temperature: options.temperature,
              stream: options.stream || !!options.onStreamChunk,
            },
          },
        });
      });
    },

    async prewarm(modelId: string): Promise<void> {
      const w = getWorker();
      const rid = genId();
      return new Promise((res, rej) => {
        pending.set(rid, { resolve: res, reject: rej });
        w.postMessage({ id: rid, type: 'prewarm', payload: { modelId } });
      });
    },

    async dispose(): Promise<void> {
      if (!workerInstance) return;
      const w = workerInstance;
      const rid = genId();
      return new Promise((res) => {
        pending.set(rid, {
          resolve: () => {
            try { w.terminate(); } catch {}
            workerInstance = null;
            ready = false;
            currentModel = null;
            pending.clear();
            res();
          },
          reject: res,
        });
        w.postMessage({ id: rid, type: 'dispose' });
      });
    },

    isReady: () => ready,
    getCurrentModel: () => currentModel,
  };
}

let singleton: WebLlmWorkerClient | null = null;
export function getWebLlmWorkerClient(): WebLlmWorkerClient {
  if (!singleton) singleton = createWebLlmWorkerClient();
  return singleton;
}

export type { WebLlmProgressReport, WebLlmWorkerClient, GenerateOptions };
