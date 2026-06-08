/*
 * WebLLM Dedicated Worker for GPU-isolated inference (P1-1: WebLLM Worker Offload)
 *
 * Purpose:
 * - Move heavy WebLLM engine (model loading + WebGPU inference) off the main thread.
 * - Full GPU context isolation to reduce jank and improve memory management.
 * - Support progress reporting, streaming-capable generation, abort, and clean dispose.
 *
 * Communication Protocol (postMessage):
 *   Main → Worker:
 *     { id: string, type: 'init', payload: { modelId: string, options?: any } }
 *     { id: string, type: 'generate', payload: { prompt: string, options?: { maxTokens?, temperature?, stream? } } }
 *     { id: string, type: 'dispose' }
 *     { id: string, type: 'abort', payload: { requestId: string } }
 *
 *   Worker → Main:
 *     { id: string, type: 'progress', payload: WebLlmProgressReport }
 *     { id: string, type: 'ready', payload: { modelId: string } }
 *     { id: string, type: 'result', payload: { text: string, usage?: any } }
 *     { id: string, type: 'stream-chunk', payload: { text: string, done?: boolean } }
 *     { id: string, type: 'error', payload: { message: string, code?: string } }
 *
 * Notes:
 * - Uses @mlc-ai/web-llm CreateMLCEngine inside worker (WebGPU context lives here).
 * - Vite bundles this as a separate worker chunk (use new Worker(new URL('./webllm.worker.ts', import.meta.url), { type: 'module' }))
 * - Compatible with Tauri webview (WebGPU support depends on host).
 * - For multiple models: worker can be restarted or implement simple internal cache (current: single active engine).
 */

/// <reference lib="webworker" />

import type { MLCEngine } from '@mlc-ai/web-llm';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

// Types matching the package (re-declared for worker isolation)
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
let abortControllers = new Map<string, AbortController>(); // for generate requests

// Helper to post typed messages back to main thread
function postResponse(res: WorkerResponse) {
  self.postMessage(res);
}

// Handle incoming messages from main thread
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case 'init': {
        const { modelId, options = {} } = payload || {};
        if (!modelId) {
          postResponse({ id, type: 'error', payload: { message: 'modelId is required for init' } });
          return;
        }

        // Dispose previous engine if switching models
        if (engine && currentModelId !== modelId) {
          try {
            await engine.dispose?.();
          } catch (e) {
            console.warn('[webllm.worker] dispose error on model switch:', e);
          }
          engine = null;
        }

        if (engine && currentModelId === modelId) {
          // Already initialized
          postResponse({ id, type: 'ready', payload: { modelId } });
          return;
        }

        // Create engine with progress callback forwarded to main
        engine = await CreateMLCEngine(modelId, {
          initProgressCallback: (report: any) => {
            const progressReport: WebLlmProgressReport = {
              progress: report?.progress || 0,
              text: report?.text || 'Loading model...',
            };
            postResponse({ id, type: 'progress', payload: progressReport });
          },
          // Pass through other options (e.g. kvConfig, temperature defaults, etc.)
          ...options,
        });

        currentModelId = modelId;
        postResponse({ id, type: 'ready', payload: { modelId } });
        break;
      }

      case 'generate': {
        if (!engine) {
          postResponse({ id, type: 'error', payload: { message: 'Engine not initialized. Call init first.' } });
          return;
        }

        const { prompt, options = {} } = payload || {};
        const { maxTokens = 512, temperature = 0.7, stream = false, signal: _signalIgnored } = options; // signal handled via abort message

        const abortController = new AbortController();
        abortControllers.set(id, abortController);

        try {
          if (stream) {
            // Streaming path (recommended for long responses)
            const streamResponse = await engine.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              max_tokens: maxTokens,
              temperature,
              stream: true,
              // Note: AbortSignal support in web-llm may vary; we use manual abort
            });

            let fullText = '';
            for await (const chunk of streamResponse) {
              if (abortController.signal.aborted) {
                postResponse({ id, type: 'error', payload: { message: 'Generation aborted' } });
                break;
              }
              const delta = chunk.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                postResponse({ id, type: 'stream-chunk', payload: { text: delta, done: false } });
              }
            }
            postResponse({ id, type: 'stream-chunk', payload: { text: '', done: true } });
            // Optionally send final result
            postResponse({ id, type: 'result', payload: { text: fullText } });
          } else {
            // Non-streaming
            const response = await engine.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              max_tokens: maxTokens,
              temperature,
            });
            const text = response.choices?.[0]?.message?.content || '';
            postResponse({ id, type: 'result', payload: { text, usage: response.usage } });
          }
        } finally {
          abortControllers.delete(id);
        }
        break;
      }

      case 'abort': {
        const { requestId } = payload || {};
        const controller = abortControllers.get(requestId);
        if (controller) {
          controller.abort();
          abortControllers.delete(requestId);
          postResponse({ id, type: 'result', payload: { aborted: true } });
        }
        break;
      }

      case 'dispose': {
        if (engine) {
          try {
            await engine.dispose?.();
          } catch (e) {
            console.warn('[webllm.worker] dispose error:', e);
          }
          engine = null;
          currentModelId = null;
        }
        abortControllers.clear();
        postResponse({ id, type: 'result', payload: { disposed: true } });
        break;
      }

      case 'prewarm': {
        // Prewarm is essentially init + a dummy generate or just init
        // For simplicity, treat as init (real prewarm can be a lightweight generate in future)
        const { modelId } = payload || {};
        if (modelId) {
          // Re-use init logic by posting internal message or duplicate small logic
          // For now, just acknowledge; real prewarm happens on first init
          postResponse({ id, type: 'ready', payload: { modelId, prewarmed: true } });
        }
        break;
      }

      default:
        postResponse({ id, type: 'error', payload: { message: `Unknown message type: ${type}` } });
    }
  } catch (err: any) {
    console.error('[webllm.worker] Error handling message:', err);
    postResponse({
      id,
      type: 'error',
      payload: { message: err?.message || 'Unknown worker error', stack: err?.stack },
    });
  }
};

// Optional: Handle worker termination gracefully
self.onclose = () => {
  if (engine) {
    try { engine.dispose?.(); } catch {}
  }
};

console.log('[webllm.worker] WebLLM Worker initialized and ready for messages.');
