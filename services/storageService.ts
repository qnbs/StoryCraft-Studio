import { StoryProject, Settings } from "../types";

// Storage interface for different backends
export interface StorageBackend {
  // Project operations
  saveProject(project: StoryProject): Promise<void>;
  loadProject(projectId: string): Promise<StoryProject | null>;
  listProjects(): Promise<string[]>;
  deleteProject(projectId: string): Promise<void>;

  // Image operations
  saveImage(id: string, base64Data: string): Promise<void>;
  getImage(id: string): Promise<string | null>;

  // Settings operations
  saveSettings(settings: Settings): Promise<void>;
  loadSettings(): Promise<Settings | null>;

  // Gemini API key
  saveGeminiApiKey(apiKey: string): Promise<void>;
  getGeminiApiKey(): Promise<string | null>;
  clearGeminiApiKey(): Promise<void>;

  // Generic provider API key (openai, anthropic, etc.)
  saveApiKey(provider: string, apiKey: string): Promise<void>;
  getApiKey(provider: string): Promise<string | null>;
  clearApiKey(provider: string): Promise<void>;

  // Snapshots
  saveSnapshot(snapshotId: string, data: any): Promise<void>;
  getSnapshotData(snapshotId: string): Promise<any>;
  listSnapshots(): Promise<string[]>;
  deleteSnapshot(snapshotId: string): Promise<void>;
}

// Import existing services
import { dbService } from "./dbService";
import { fileSystemService } from "./fileSystemService";

// Storage manager that chooses the appropriate backend
class StorageManager {
  private backend: StorageBackend;

  constructor() {
    // For now, default to IndexedDB, but we'll add detection for Tauri
    this.backend = dbService;
    this.initializeBackend();
  }

  private async initializeBackend() {
    // Check if we're running in Tauri
    if (typeof window !== "undefined" && window.__TAURI__) {
      try {
        await fileSystemService.initialize();
        this.backend = fileSystemService;
        console.log("Using file system storage backend");
      } catch (error) {
        console.warn(
          "Failed to initialize file system storage, falling back to IndexedDB:",
          error,
        );
        this.backend = dbService;
      }
    } else {
      console.log("Using IndexedDB storage backend");
      this.backend = dbService;
    }
  }

  // Delegate all methods to the current backend
  async saveProject(project: StoryProject): Promise<void> {
    return this.backend.saveProject(project);
  }

  async loadProject(projectId: string): Promise<StoryProject | null> {
    return this.backend.loadProject(projectId);
  }

  async listProjects(): Promise<string[]> {
    return this.backend.listProjects();
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.backend.deleteProject(projectId);
  }

  async saveImage(id: string, base64Data: string): Promise<void> {
    return this.backend.saveImage(id, base64Data);
  }

  async getImage(id: string): Promise<string | null> {
    return this.backend.getImage(id);
  }

  async saveSettings(settings: Settings): Promise<void> {
    return this.backend.saveSettings(settings);
  }

  async loadSettings(): Promise<Settings | null> {
    return this.backend.loadSettings();
  }

  async saveGeminiApiKey(apiKey: string): Promise<void> {
    return this.backend.saveGeminiApiKey(apiKey);
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.backend.getGeminiApiKey();
  }

  async clearGeminiApiKey(): Promise<void> {
    return (this.backend as any).clearGeminiApiKey?.();
  }

  async saveApiKey(provider: string, apiKey: string): Promise<void> {
    return this.backend.saveApiKey(provider, apiKey);
  }

  async getApiKey(provider: string): Promise<string | null> {
    return this.backend.getApiKey(provider);
  }

  async clearApiKey(provider: string): Promise<void> {
    return this.backend.clearApiKey(provider);
  }

  async saveSnapshot(snapshotId: string, data: any): Promise<void> {
    return this.backend.saveSnapshot(snapshotId, data);
  }

  async getSnapshotData(snapshotId: string): Promise<any> {
    return this.backend.getSnapshotData(snapshotId);
  }

  async listSnapshots(): Promise<string[]> {
    return this.backend.listSnapshots();
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    return this.backend.deleteSnapshot(snapshotId);
  }
}

export const storageService = new StorageManager();
