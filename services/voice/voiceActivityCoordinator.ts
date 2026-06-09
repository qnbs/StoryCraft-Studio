/**
 * VoiceActivityCoordinator — bridges WebRtcVadEngine PCM frames to WasmSttEngine.
 * QNBS-v3: B-2 completion — wires VAD-gated Whisper inference without touching the
 * Web Speech API path. Only activated when enableVoiceWasm + sttEngine.id === 'whisper'.
 */

import { createLogger } from '../logger';
import type { AudioChunk, SttEngine, SttResult, VadEngine } from './voiceTypes';
import { DEFAULT_AUDIO_CONFIG } from './voiceTypes';

const log = createLogger('VoiceActivityCoordinator');

/** Minimum consecutive speech chunks before firing STT. Avoids false-positive tiny bursts. */
const MIN_SPEECH_CHUNKS = 2;
/** Max buffered duration in ms before forcing an STT flush to avoid unbounded memory use. */
const MAX_BUFFER_MS = 15_000;

export class VoiceActivityCoordinator {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  private speechChunkCount = 0;
  private bufferedDurationMs = 0;
  private isSttActive = false;
  private running = false;

  constructor(
    private readonly vad: VadEngine,
    private readonly stt: SttEngine,
  ) {}

  async start(
    onResult: (result: SttResult) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    this.running = true;
    try {
      await this.vad.initialize();
      await this.stt.initialize();
      this.mediaStream = await this.setupAudioCapture();
      this.startFramePump(onResult, onError);
    } catch (err) {
      this.running = false;
      onError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    this.teardownAudioCapture();
    if (this.isSttActive) {
      try {
        await this.stt.stop();
      } catch (err) {
        log.warn('stt.stop() failed on coordinator stop', { err });
      }
      this.isSttActive = false;
    }
    this.resetBufferState();
  }

  async dispose(): Promise<void> {
    await this.stop();
    try {
      await this.vad.dispose();
    } catch (err) {
      log.warn('vad.dispose() failed', { err });
    }
    try {
      await this.stt.dispose();
    } catch (err) {
      log.warn('stt.dispose() failed', { err });
    }
  }

  private async setupAudioCapture(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate,
        channelCount: DEFAULT_AUDIO_CONFIG.channelCount,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return stream;
  }

  private startFramePump(
    onResult: (result: SttResult) => void,
    onError: (error: Error) => void,
  ): void {
    if (!this.mediaStream) return;

    this.audioContext = new AudioContext({ sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate });
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    // QNBS-v3: ScriptProcessorNode is deprecated but universally supported; AudioWorklet
    // requires a separate file registration step not yet available in this build.
    this.scriptProcessor = this.audioContext.createScriptProcessor(
      DEFAULT_AUDIO_CONFIG.bufferSize,
      1,
      1,
    );

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.running) return;
      const inputData = event.inputBuffer.getChannelData(0);
      // Convert Float32 → Int16 PCM for VAD
      const pcm = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm[i] = Math.max(-32768, Math.min(32767, inputData[i]! * 32768));
      }
      const durationMs = (inputData.length / DEFAULT_AUDIO_CONFIG.sampleRate) * 1000;
      const chunk: AudioChunk = {
        buffer: pcm,
        durationMs,
        hasSpeech: false,
        capturedAt: Date.now(),
      };
      this.processAudioFrame(chunk, onResult, onError);
    };

    this.source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  private processAudioFrame(
    chunk: AudioChunk,
    onResult: (result: SttResult) => void,
    onError: (error: Error) => void,
  ): void {
    this.vad
      .processChunk(chunk)
      .then((segment) => {
        if (!this.running) return;
        const hasSpeech = segment?.isSpeech ?? false;

        if (hasSpeech) {
          this.speechChunkCount++;
          this.bufferedDurationMs += chunk.durationMs;

          // Activate STT after MIN_SPEECH_CHUNKS of confirmed speech
          if (!this.isSttActive && this.speechChunkCount >= MIN_SPEECH_CHUNKS) {
            this.isSttActive = true;
            this.stt.start(onResult, onError).catch((err) => {
              log.error(
                'stt.start() failed in coordinator',
                err instanceof Error ? err : new Error(String(err)),
              );
              onError(err instanceof Error ? err : new Error(String(err)));
            });
          }

          // Flush if buffer exceeds max duration to prevent unbounded growth
          if (this.isSttActive && this.bufferedDurationMs >= MAX_BUFFER_MS) {
            this.flushStt(onResult, onError);
          }
        } else {
          // Silence detected — stop STT if active
          if (this.isSttActive) {
            this.flushStt(onResult, onError);
          }
          this.speechChunkCount = 0;
        }
      })
      .catch((err) => {
        log.warn('VAD processChunk error', { err });
      });
  }

  private flushStt(onResult: (result: SttResult) => void, onError: (error: Error) => void): void {
    this.isSttActive = false;
    this.resetBufferState();
    this.stt.stop().catch((err) => {
      log.warn('stt.stop() failed during flush', { err });
    });
    // Restart STT for next utterance
    this.stt
      .start(onResult, onError)
      .then(() => {
        this.isSttActive = true;
      })
      .catch((err) => {
        log.error(
          'stt.start() failed after flush',
          err instanceof Error ? err : new Error(String(err)),
        );
        onError(err instanceof Error ? err : new Error(String(err)));
      });
  }

  private resetBufferState(): void {
    this.speechChunkCount = 0;
    this.bufferedDurationMs = 0;
  }

  private teardownAudioCapture(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
  }
}
