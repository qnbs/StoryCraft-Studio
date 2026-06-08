/*
 * WebLLM Dedicated Worker for GPU-isolated inference (P1-1)
 * 
 * All heavy lifting (CreateMLCEngine + WebGPU) happens here.
 * Main thread stays responsive.
 */

/// <reference lib="webworker" />

import type { MLCEngine } from '@mlc-ai/web-llm';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

interface WebLlmProgressReport {
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
  type: 'progress' | 'ready' | 'result' | 'stream-chunk' | 'error';
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
            payload: { progress: report?.progress ?? 0, text: report?.text ?? 'Loading...' } as WebLlmProgressReport },
          });
        },
        ...options,
      });

      currentModelId = modelId;
      postResponse({ id, type: 'ready', payload: { modelId } });
    } else if (type === 'generate') {
      if (!engine) {
        postResponse({ id, type: 'error', payload: { message: 'Engine not ready' } });
        return;
      }
      const { prompt, options = {} } = payload || {};
      const { maxTokens = 512, temperature = 0.7, stream = false } = options;

      const ac = new AbortController();
      abortControllers.set(id, ac);

      try {
        if (stream) {
          const streamRes = await engine.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature,
            stream: true,
          });

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
          const res = await engine.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature,
          });
          const text = res.choices?.[0]?.message?.content ?? '';
          postResponse({ id, type: 'result', payload: { text, usage: res.usage } });
        }
      } finally {
        abortControllers.delete(id);
      }
    } else if (type === 'abort') {
      const { requestId } = payload || {};
      abortControllers.get(requestId)?.abort();
      abortControllers.delete(requestId);
    } else if (type === 'dispose') {
      if (engine) {
        try { await engine.dispose?.(); } catch {}
        engine = null;
        currentModelId = null;
      }
      abortControllers.clear();
      postResponse({ id, type: 'result', payload: { disposed: true } });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    postResponse({ id, type: 'error', payload: { message } });
  }
};

self.onclose = () => {
  try { engine?.dispose?.(); } catch {}
};
