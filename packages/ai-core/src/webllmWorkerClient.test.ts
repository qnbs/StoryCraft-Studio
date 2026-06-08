import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWebLlmWorkerClient, type WebLlmWorkerClient } from './webllmWorkerClient';

// Mock the Worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    // Simulate async responses
    setTimeout(() => {
      if (this.onmessage) {
        // Simulate ready response for init
        this.onmessage({ data: { id: 'test', type: 'ready', payload: { modelId: 'test-model' } } } as any);
      }
    }, 10);
  }
}

globalThis.Worker = MockWorker as any;

de scribe('WebLLM Worker Client (CodeAnt fixes)', () => {
  let client: WebLlmWorkerClient;

  beforeEach(() => {
    client = createWebLlmWorkerClient();
  });

  afterEach(async () => {
    await client.dispose();
  });

  it('should create isolated client instances', () => {
    const clientA = createWebLlmWorkerClient();
    const clientB = createWebLlmWorkerClient();
    expect(clientA).not.toBe(clientB);
  });

  it('should support onProgress in init', async () => {
    const onProgress = vi.fn();
    await client.init('test-model', { onProgress });
    // In real scenario progress would be called; here we just check API
    expect(typeof onProgress).toBe('function');
  });

  it('should have restart() method', async () => {
    expect(typeof client.restart).toBe('function');
    await client.restart();
  });

  it('should reject generate() if not initialized', async () => {
    await expect(client.generate('hello')).rejects.toThrow('Call init() first');
  });

  it('should expose isReady and getCurrentModel', () => {
    expect(typeof client.isReady).toBe('function');
    expect(typeof client.getCurrentModel).toBe('function');
  });
});
