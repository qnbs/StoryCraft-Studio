/**
 * Tests for VoiceActivityCoordinator — VAD-gated Whisper WASM STT bridge.
 * QNBS-v3: B-2 completion — verifies coordinator start/stop/dispose + error-handling paths.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../services/logger', () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), withContext: vi.fn() }),
}));

import { VoiceActivityCoordinator } from '../../../../services/voice/voiceActivityCoordinator';
import type { SttEngine, VadEngine, VadSegment } from '../../../../services/voice/voiceTypes';

// ── Shared mock factories ─────────────────────────────────────────────────────

function makeVad(overrides: Partial<VadEngine> = {}): VadEngine {
  return {
    name: 'test-vad',
    isAvailable: vi.fn().mockResolvedValue(true),
    initialize: vi.fn().mockResolvedValue(undefined),
    processChunk: vi
      .fn()
      .mockResolvedValue({ startMs: 0, endMs: 20, isSpeech: false } as VadSegment),
    dispose: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeStt(overrides: Partial<SttEngine> = {}): SttEngine {
  return {
    id: 'whisper' as SttEngine['id'],
    name: 'test-stt',
    isLocal: true,
    supportsStreaming: false,
    isAvailable: vi.fn().mockResolvedValue(true),
    initialize: vi.fn().mockResolvedValue(undefined),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ── Browser API stubs ─────────────────────────────────────────────────────────

// Mutable state shared across tests — reset in beforeEach
let mockTrack: { stop: ReturnType<typeof vi.fn> };
let mockStream: { getTracks: ReturnType<typeof vi.fn> };
let mockScriptProcessor: {
  onaudioprocess: ((e: unknown) => void) | null;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};
let mockSource: { connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };
let mockAudioCtxInstance: {
  createMediaStreamSource: ReturnType<typeof vi.fn>;
  createScriptProcessor: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  destination: object;
};

function buildMocks() {
  mockTrack = { stop: vi.fn() };
  mockStream = { getTracks: vi.fn().mockReturnValue([mockTrack]) };
  mockScriptProcessor = {
    onaudioprocess: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  mockSource = { connect: vi.fn(), disconnect: vi.fn() };
  mockAudioCtxInstance = {
    createMediaStreamSource: vi.fn().mockReturnValue(mockSource),
    createScriptProcessor: vi.fn().mockReturnValue(mockScriptProcessor),
    close: vi.fn().mockResolvedValue(undefined),
    destination: {},
  };
}

beforeEach(() => {
  buildMocks();

  // Use a real class (not arrow fn) so `new AudioContext()` works in jsdom.
  // biome-ignore lint/suspicious/noExplicitAny: test shim assigns partial mock to this
  const instance = mockAudioCtxInstance as any;
  class FakeAudioContext {
    constructor() {
      // biome-ignore lint/correctness/noConstructorReturn: needed to return mock instance to caller
      return instance;
    }
  }
  Object.defineProperty(global, 'AudioContext', {
    value: FakeAudioContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global, 'navigator', {
    value: {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    },
    writable: true,
    configurable: true,
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VoiceActivityCoordinator', () => {
  describe('start()', () => {
    it('initializes VAD and STT engines', async () => {
      const vad = makeVad();
      const stt = makeStt();
      const coordinator = new VoiceActivityCoordinator(vad, stt);
      await coordinator.start(vi.fn(), vi.fn());
      expect(vad.initialize).toHaveBeenCalledOnce();
      expect(stt.initialize).toHaveBeenCalledOnce();
      await coordinator.dispose();
    });

    it('requests microphone access with audio constraints', async () => {
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({ audio: expect.any(Object) }),
      );
      await coordinator.dispose();
    });

    it('wires up script processor for audio capture', async () => {
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      expect(mockAudioCtxInstance.createScriptProcessor).toHaveBeenCalled();
      expect(mockSource.connect).toHaveBeenCalledWith(mockScriptProcessor);
      await coordinator.dispose();
    });

    it('calls onError and rethrows when VAD initialization fails', async () => {
      const initErr = new Error('vad init failed');
      const vad = makeVad({ initialize: vi.fn().mockRejectedValue(initErr) });
      const coordinator = new VoiceActivityCoordinator(vad, makeStt());
      const onError = vi.fn();
      await expect(coordinator.start(vi.fn(), onError)).rejects.toThrow('vad init failed');
      expect(onError).toHaveBeenCalledWith(initErr);
    });

    it('calls onError and rethrows when getUserMedia fails', async () => {
      const gumErr = new Error('permission denied');
      (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        gumErr,
      );
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      const onError = vi.fn();
      await expect(coordinator.start(vi.fn(), onError)).rejects.toThrow('permission denied');
      expect(onError).toHaveBeenCalledWith(gumErr);
    });

    it('wraps non-Error rejections in Error for onError callback', async () => {
      // Coordinator rethrows the original value but wraps it for onError
      const vad = makeVad({ initialize: vi.fn().mockRejectedValue('string rejection') });
      const coordinator = new VoiceActivityCoordinator(vad, makeStt());
      const onError = vi.fn();
      await expect(coordinator.start(vi.fn(), onError)).rejects.toBeDefined();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('stop()', () => {
    it('disconnects script processor on stop', async () => {
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      await coordinator.stop();
      expect(mockScriptProcessor.disconnect).toHaveBeenCalled();
    });

    it('stops media tracks on stop', async () => {
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      await coordinator.stop();
      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('is idempotent — safe to call twice without throwing', async () => {
      const coordinator = new VoiceActivityCoordinator(makeVad(), makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      await coordinator.stop();
      await expect(coordinator.stop()).resolves.not.toThrow();
    });
  });

  describe('dispose()', () => {
    it('disposes VAD and STT engines', async () => {
      const vad = makeVad();
      const stt = makeStt();
      const coordinator = new VoiceActivityCoordinator(vad, stt);
      await coordinator.start(vi.fn(), vi.fn());
      await coordinator.dispose();
      expect(vad.dispose).toHaveBeenCalledOnce();
      expect(stt.dispose).toHaveBeenCalledOnce();
    });

    it('swallows VAD dispose failure gracefully', async () => {
      const vad = makeVad({ dispose: vi.fn().mockRejectedValue(new Error('vad dispose fail')) });
      const coordinator = new VoiceActivityCoordinator(vad, makeStt());
      await coordinator.start(vi.fn(), vi.fn());
      await expect(coordinator.dispose()).resolves.not.toThrow();
    });

    it('swallows STT dispose failure gracefully', async () => {
      const stt = makeStt({ dispose: vi.fn().mockRejectedValue(new Error('stt dispose fail')) });
      const coordinator = new VoiceActivityCoordinator(makeVad(), stt);
      await coordinator.start(vi.fn(), vi.fn());
      await expect(coordinator.dispose()).resolves.not.toThrow();
    });
  });
});
