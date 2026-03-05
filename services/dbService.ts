import { ProjectSnapshot } from '../types';
import { ProjectData } from '../features/project/projectSlice';
import { Settings } from '../types';

const DB_NAME = 'storycraft-db';
const DB_VERSION = 4; // Upgraded for API key encryption support
const APP_DATA_STORE = 'app-data-store';
const SNAPSHOTS_STORE = 'snapshots-store';
const IMAGES_STORE = 'images-store';

// Secure API Key Storage Records
const GEMINI_API_KEY_RECORD = 'gemini_api_key_encrypted_v1';
const GEMINI_API_KEY_IV_RECORD = 'gemini_api_key_iv_v1';

// Define structure of state stored in DB
interface PersistedProjectState {
    // Redux-undo shape for present state, or full undoable envelope
    data?: ProjectData; // Flattened structure often saved
    present?: { data: ProjectData }; // Structure if full slice saved
}

interface PersistedState {
    project?: PersistedProjectState;
    settings?: Settings;
}

// Hilfsfunktion für Retry bei IndexedDB
async function retryDb<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Nur bei temporären Fehlern erneut versuchen
      if (err?.name === 'QuotaExceededError' || err?.name === 'InvalidStateError' || err?.name === 'AbortError' || err?.name === 'TransactionInactiveError') {
        if (attempt < retries) await new Promise(res => setTimeout(res, delayMs));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

function getUserFriendlyDbError(error: any): string {
  if (error?.name === 'QuotaExceededError') {
    return 'Speicherplatz im Browser ist erschöpft. Bitte löschen Sie alte Projekte oder Snapshots.';
  }
  if (error?.name === 'InvalidStateError' || error?.name === 'TransactionInactiveError') {
    return 'Interner Fehler beim Zugriff auf die Datenbank. Bitte Seite neu laden.';
  }
  if (error?.name === 'AbortError') {
    return 'Datenbankoperation wurde abgebrochen.';
  }
  return error?.message || 'Unbekannter Fehler beim Zugriff auf die Datenbank.';
}

import { StoryProject, Settings } from '../types';
import { StorageBackend } from './storageService';

// Extend IndexedDBService to implement StorageBackend
class IndexedDBService implements StorageBackend {
  private db: IDBDatabase | null = null;
  private lastAutoSnapshotTime = Date.now();
  private readonly AUTO_SNAPSHOT_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_AUTO_SNAPSHOTS = 20;

  // === CRYPTO HELPERS für API Key Verschlüsselung ===
  private async getLocalCryptoKey(): Promise<CryptoKey> {
    // Generiere einen geräte-spezifischen Schlüssel basierend auf Origin
    const material = new TextEncoder().encode(
      `${location.origin}|StoryCraftStudio|gemini-key-v1|${navigator.userAgent.slice(0, 50)}`
    );
    const hash = await crypto.subtle.digest('SHA-256', material);
    return crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async saveGeminiApiKey(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }
    return retryDb(async () => {
      const cryptoKey = await this.getLocalCryptoKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedKey = new TextEncoder().encode(apiKey.trim());
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedKey
      );
      const store = await this.getObjectStore(APP_DATA_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
        const encryptedArray = Array.from(new Uint8Array(encrypted));
        const ivArray = Array.from(iv);
        const req1 = store.put(encryptedArray, GEMINI_API_KEY_RECORD);
        const req2 = store.put(ivArray, GEMINI_API_KEY_IV_RECORD);
        let completed = 0;
        const onSuccess = () => {
          completed++;
          if (completed === 2) resolve();
        };
        req1.onsuccess = onSuccess;
        req2.onsuccess = onSuccess;
        req1.onerror = () => reject(getUserFriendlyDbError(req1.error));
        req2.onerror = () => reject(getUserFriendlyDbError(req2.error));
      });
    });
  }

  async getGeminiApiKey(): Promise<string | null> {
    return retryDb(async () => {
      try {
        const store = await this.getObjectStore(APP_DATA_STORE, 'readonly');
        const [encryptedArray, ivArray] = await Promise.all([
          new Promise<number[] | undefined>((resolve, reject) => {
            const req = store.get(GEMINI_API_KEY_RECORD);
            req.onsuccess = () => resolve(req.result as number[] | undefined);
            req.onerror = () => reject(getUserFriendlyDbError(req.error));
          }),
          new Promise<number[] | undefined>((resolve, reject) => {
            const req = store.get(GEMINI_API_KEY_IV_RECORD);
            req.onsuccess = () => resolve(req.result as number[] | undefined);
            req.onerror = () => reject(getUserFriendlyDbError(req.error));
          }),
        ]);
        if (!encryptedArray || !ivArray) {
          return null;
        }
        const cryptoKey = await this.getLocalCryptoKey();
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(ivArray) },
          cryptoKey,
          new Uint8Array(encryptedArray)
        );
        return new TextDecoder().decode(decrypted);
      } catch (error) {
        console.warn('Failed to decrypt API key:', error);
        return null;
      }
    });
  }

  async hasGeminiApiKey(): Promise<boolean> {
    const key = await this.getGeminiApiKey();
    return Boolean(key && key.length > 0);
  }

  async clearGeminiApiKey(): Promise<void> {
    return retryDb(async () => {
      const store = await this.getObjectStore(APP_DATA_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
        const req1 = store.delete(GEMINI_API_KEY_RECORD);
        const req2 = store.delete(GEMINI_API_KEY_IV_RECORD);
        let completed = 0;
        const onSuccess = () => {
          completed++;
          if (completed === 2) resolve();
        };
        req1.onsuccess = onSuccess;
        req2.onsuccess = onSuccess;
        req1.onerror = () => reject(getUserFriendlyDbError(req1.error));
        req2.onerror = () => reject(getUserFriendlyDbError(req2.error));
      });
    });
  }

  // === EXISTING DB METHODS ===

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (event.oldVersion < 1) {
            if (!db.objectStoreNames.contains(APP_DATA_STORE)) {
              db.createObjectStore(APP_DATA_STORE);
            }
        }
        if (event.oldVersion < 2) {
            if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
              db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id', autoIncrement: true });
            }
        }
        if (event.oldVersion < 3) {
            if (!db.objectStoreNames.contains(IMAGES_STORE)) {
                db.createObjectStore(IMAGES_STORE);
            }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };
    });
  }

  private async getObjectStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.initDB();
    }
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }
  
  async saveSlice(sliceName: 'project' | 'settings', data: PersistedProjectState | Settings): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const store = await this.getObjectStore(APP_DATA_STORE, 'readwrite');
        const request = store.put(data, sliceName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
  }

  // Helper methods for explicit saving
  async saveProject(data: PersistedProjectState): Promise<void> {
      // Check auto-snapshot condition during save
      if (Date.now() - this.lastAutoSnapshotTime > this.AUTO_SNAPSHOT_INTERVAL) {
          // We need to extract just the data part if it's the full redux state
          const projectData = data.present ? data.present.data : data.data;
          if(projectData && projectData.manuscript) {
             this.lastAutoSnapshotTime = Date.now();
             // Fire and forget snapshot to not block UI
             this.createSnapshot(projectData).then(() => this.pruneAutoSnapshots());
          }
      }
      return this.saveSlice('project', data);
  }

  async saveSettings(data: Settings): Promise<void> {
      return this.saveSlice('settings', data);
  }

  // Helper to validate state structure and fix common issues
  private validateAndFixState(project: unknown, settings: unknown): PersistedState | undefined {
      // If project is missing but we have settings, return partial to allow new user flow
      if (!project && !settings) return undefined;

      let validProject = project ? (project as PersistedProjectState) : undefined;
      
      // Ensure Project Structure consistency
      if (validProject) {
          const rawData = validProject.present ? validProject.present.data : validProject.data;
          if (rawData) {
              // Ensure projectGoals exists
              if (!rawData.projectGoals) {
                  rawData.projectGoals = { totalWordCount: 50000, targetDate: null };
              }
              // Ensure writingHistory exists
              if (!rawData.writingHistory) {
                  rawData.writingHistory = [];
              }
          }
      }

      // Ensure settings has defaults if missing keys
      let validSettings = settings as Settings;
      if (settings) {
          validSettings = {
              theme: 'dark',
              editorFont: 'serif',
              fontSize: 16,
              lineSpacing: 1.6,
              aiCreativity: 'Balanced',
              paragraphSpacing: 1,
              indentFirstLine: false,
              ...(settings as Partial<Settings>)
          };
      }

      return { project: validProject, settings: validSettings };
  }

  async loadState(): Promise<PersistedState | undefined> {
    return new Promise(async (resolve, reject) => {
        const store = await this.getObjectStore(APP_DATA_STORE, 'readonly');
        const projectRequest = store.get('project');
        const settingsRequest = store.get('settings');

        let project: unknown;
        let settings: unknown;
        let completed = 0;

        const onComplete = () => {
            if (++completed === 2) {
                const validated = this.validateAndFixState(project, settings);
                resolve(validated);
            }
        }
        
        projectRequest.onsuccess = () => {
            project = projectRequest.result;
            onComplete();
        };
        settingsRequest.onsuccess = () => {
            settings = settingsRequest.result;
            onComplete();
        };

        projectRequest.onerror = () => reject(projectRequest.error);
        settingsRequest.onerror = () => reject(settingsRequest.error);
    });
  }
  
  async hasSavedData(): Promise<boolean> {
      try {
          const store = await this.getObjectStore(APP_DATA_STORE, 'readonly');
          const request = store.count(); 
          return new Promise((resolve) => {
              request.onsuccess = () => {
                  resolve(request.result > 0);
              };
              request.onerror = () => resolve(false);
          });
      } catch (e) {
          return false;
      }
  }
  
  // --- Image Store Methods ---
  async saveImage(id: string, base64: string): Promise<void> {
      const store = await this.getObjectStore(IMAGES_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
          const request = store.put(base64, id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }
  
  async getImage(id: string): Promise<string | undefined> {
      const store = await this.getObjectStore(IMAGES_STORE, 'readonly');
      return new Promise((resolve, reject) => {
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }

  async deleteImage(id: string): Promise<void> {
      const store = await this.getObjectStore(IMAGES_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  // --- Snapshot Methods ---

  async createSnapshot(data: ProjectData, name?: string): Promise<void> {
    const wordCount = data.manuscript.reduce((sum, section) => sum + (section.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    const snapshotData = {
      date: new Date().toISOString(),
      name: name || 'Automatic Snapshot',
      wordCount,
      data,
    };
    
    const store = await this.getObjectStore(SNAPSHOTS_STORE, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.add(snapshotData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
  }

  async listSnapshots(): Promise<ProjectSnapshot[]> {
      const store = await this.getObjectStore(SNAPSHOTS_STORE, 'readonly');
      const request = store.openCursor(null, 'prev'); // Get newest first
      const snapshots: ProjectSnapshot[] = [];

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const cursor = request.result;
            if(cursor) {
                const { data, ...metadata } = cursor.value;
                snapshots.push({ id: cursor.key as number, ...metadata });
                cursor.continue();
            } else {
                resolve(snapshots);
            }
        };
        request.onerror = () => reject(request.error);
      });
  }

  async getSnapshotData(id: number): Promise<ProjectData> {
      const store = await this.getObjectStore(SNAPSHOTS_STORE, 'readonly');
      return new Promise((resolve, reject) => {
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result.data);
          request.onerror = () => reject(request.error);
      });
  }

  async deleteSnapshot(id: number): Promise<void> {
      const store = await this.getObjectStore(SNAPSHOTS_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }
  
  private async pruneAutoSnapshots(): Promise<void> {
    const snapshots = await this.listSnapshots();
    const autoSnapshots = snapshots
        .filter(s => s.name === 'Automatic Snapshot')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (autoSnapshots.length > this.MAX_AUTO_SNAPSHOTS) {
        const snapshotsToDelete = autoSnapshots.slice(this.MAX_AUTO_SNAPSHOTS);
        for (const snapshot of snapshotsToDelete) {
            await this.deleteSnapshot(snapshot.id);
        }
    }
  }
}

// StorageBackend interface implementation
// These methods provide the interface expected by storageService
export interface StorageBackendMethods {
  saveProject(project: StoryProject): Promise<void>;
  loadProject(projectId: string): Promise<StoryProject | null>;
  listProjects(): Promise<string[]>;
  deleteProject(projectId: string): Promise<void>;
  saveImage(id: string, base64Data: string): Promise<void>;
  getImage(id: string): Promise<string | null>;
  saveSettings(settings: Settings): Promise<void>;
  loadSettings(): Promise<Settings | null>;
  saveGeminiApiKey(apiKey: string): Promise<void>;
  getGeminiApiKey(): Promise<string | null>;
  saveSnapshot(snapshotId: string, data: any): Promise<void>;
  getSnapshotData(snapshotId: string): Promise<any>;
  listSnapshots(): Promise<string[]>;
  deleteSnapshot(snapshotId: string): Promise<void>;
}

// Add StorageBackend implementation to IndexedDBService
declare module './dbService' {
  interface IndexedDBService extends StorageBackendMethods {}
}

// Implement the methods
IndexedDBService.prototype.saveProject = IndexedDBService.prototype.saveProject;
IndexedDBService.prototype.loadProject = IndexedDBService.prototype.loadProject;
IndexedDBService.prototype.listProjects = IndexedDBService.prototype.listProjects;
IndexedDBService.prototype.deleteProject = IndexedDBService.prototype.deleteProject;
IndexedDBService.prototype.saveImage = IndexedDBService.prototype.saveImage;
IndexedDBService.prototype.getImage = IndexedDBService.prototype.getImage;
IndexedDBService.prototype.saveSettings = IndexedDBService.prototype.saveSettings;
IndexedDBService.prototype.loadSettings = IndexedDBService.prototype.loadSettings;
IndexedDBService.prototype.saveGeminiApiKey = IndexedDBService.prototype.saveGeminiApiKey;
IndexedDBService.prototype.getGeminiApiKey = IndexedDBService.prototype.getGeminiApiKey;
IndexedDBService.prototype.saveSnapshot = IndexedDBService.prototype.createSnapshot;
IndexedDBService.prototype.getSnapshotData = IndexedDBService.prototype.getSnapshotData;
IndexedDBService.prototype.listSnapshots = IndexedDBService.prototype.listSnapshots;
IndexedDBService.prototype.deleteSnapshot = IndexedDBService.prototype.deleteSnapshot;

export const dbService = new IndexedDBService();