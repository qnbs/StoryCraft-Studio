/*
 * WebLLM Dedicated Worker for GPU-isolated inference (P1-1: WebLLM Worker Offload)
 *
 * This worker isolates all heavy WebLLM / WebGPU work from the main thread.
 * 
 * Message Protocol:
 *   Main → Worker:
 *     { id, type: 'init', payload: { modelId, options? } }
 *     { id, type: 'generate', payload: { prompt, options? } }
 *     { id, type: 'prewarm', payload: { modelId } }
 *     { id, type: 'abort', payload: { requestId } }
 *     { id, type: 'dispose' }
 *
 *   Worker → Main:
 *     { id, type: 'progress', payload: WebLlmProgressReport }
 *     { id, type: 'ready', payload: { modelId } }
 *     { id, type: 'prewarmed', payload: { modelId } }
 *     { id, type: 'result', payload: { text, usage? } }
 *     { id, type: 'stream-chunk', payload: { text, done } }
 *     { id, type: 'error', payload: { message } }
 *
 * Design goals (CodeAnt + project style):
 * - Clear readiness semantics (prewarm uses distinct 'prewarmed' type)
 * - Proper abort support for both streaming and non-streaming
 * - Minimal shared state with main thread
 * - Good error messages and resource cleanup
 */

/// <reference lib="webworker" />

import type { MLCEngine } from '@mlc-ai/web-llm';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

export interface WebLlmProgressReport {
  progress: number;
  text: string;
}

interface WorkerRequest {
  id: string;
  type: 'init' | 'generate' | 'dispose' | 'abort' | 'prewarm';
  payload?: any;
}

interface WorkerResponse {
  id: string;
  type: 'progress' | 'ready' | 'prewarmed' | 'result' | 'stream-chunk' | 'error';
  payload?: any;
}

let engine: MLCEngine | null = null;
let currentModelId: string | null = null;
const abortControllers = new Map<string, AbortController>();

function postResponse(res: WorkerResponse): void {
  self.postMessage(res);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    if (type === 'init') {
      const { modelId, options = {} } = payload || {};
      if (!modelId) {
        postResponse({ id, type: 'error', payload: { message: 'modelId required' } });
        return;
      }

      if (engine && currentModelId !== modelId) {
        try { await engine.dispose?.(); } catch {}
        engine = null;
      }

      if (engine && currentModelId === modelId) {
        postResponse({ id, type: 'ready', payload: { modelId } });
        return;
      }

      engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (report: any) => {
          postResponse({
            id,
            type: 'progress',
            payload: { progress: report?.progress ?? 0, text: report?.text ?? 'Loading model...' } as WebLlmProgressReport,
          });
        },
        ...options,
      });

      currentModelId = modelId;
      postResponse({ id, type: 'ready', payload: { modelId } });
    }

    else if (type === 'generate') {
      if (!engine) {
        postResponse({ id, type: 'error', payload: { message: 'Engine not initialized. Call init first.' } });
        return;
      }

      const { prompt, options = {} } = payload || {};
      const { maxTokens = 512, temperature = 0.7, stream = false } = options;

      const ac = new AbortController();
      abortControllers.set(id, ac);

      try {
        const createOptions: any = {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
        };

        if (ac.signal) createOptions.signal = ac.signal;

        if (stream) {
          const streamRes = await engine.chat.completions.create({ ...createOptions, stream: true });
          let full = '';
          for await (const chunk of streamRes) {
            if (ac.signal.aborted) break;
            const delta = chunk.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              full += delta;
              postResponse({ id, type: 'stream-chunk', payload: { text: delta, done: false } });
            }
          }
          postResponse({ id, type: 'stream-chunk', payload: { text: '', done: true } });
          postResponse({ id, type: 'result', payload: { text: full } });
        } else {
          if (ac.signal.aborted) {
            postResponse({ id, type: 'error', payload: { message: 'Generation aborted' } });
            return;
          }
          const res = await engine.chat.completions.create(createOptions);
          if (ac.signal.aborted) {
            postResponse({ id, type: 'error', payload: { message: 'Generation aborted' } });
            return;
          }
          const text = res.choices?.[0]?.message?.content ?? '';
          postResponse({ id, type: 'result', payload: { text, usage: res.usage } });
        }
      } finally {
        abortControllers.delete(id);
      }
    }

    else if (type === 'abort') {
      const { requestId } = payload || {};
      const controller = abortControllers.get(requestId);
      if (controller) {
        controller.abort();
        abortControllers.delete(requestId);
        postResponse({ id, type: 'result', payload: { aborted: true } });
      }
    }

    else if (type === 'dispose') {
      if (engine) {
        try { await engine.dispose?.(); } catch {}
        engine = null;
        currentModelId = null;
      }
      abortControllers.clear();
      postResponse({ id, type: 'result', payload: { disposed: true } });
    }

    else if (type === 'prewarm') {
      const { modelId } = payload || {};
      if (!modelId) {
        postResponse({ id, type: 'error', payload: { message: 'modelId required for prewarm' } });
        return;
      }

      if (engine && currentModelId === modelId) {
        postResponse({ id, type: 'prewarmed', payload: { modelId } });
        return;
      }

      if (engine && currentModelId !== modelId) {
        try { await engine.dispose?.(); } catch {}
        engine = null;
      }

      engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (report: any) => {
          postResponse({
            id,
            type: 'progress',
            payload: { progress: report?.progress ?? 0, text: report?.text ?? 'Prewarming model...' } as WebLlmProgressReport,
          });
        },
      });

      currentModelId = modelId;
      postResponse({ id, type: 'prewarmed', payload: { modelId } });
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    postResponse({ id, type: 'error', payload: { message } });
  }
};

self.onclose = () => {
  try { engine?.dispose?.(); } catch {}
};
