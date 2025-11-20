import { ProjectSnapshot } from '../types';
import { ProjectData } from '../features/project/projectSlice';
import { Settings } from '../types';

const DB_NAME = 'storycraft-db';
const DB_VERSION = 3; 
const APP_DATA_STORE = 'app-data-store';
const SNAPSHOTS_STORE = 'snapshots-store';
const IMAGES_STORE = 'images-store';

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

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private lastAutoSnapshotTime = Date.now();
  private readonly AUTO_SNAPSHOT_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_AUTO_SNAPSHOTS = 20;

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

      const validProject = project ? (project as PersistedProjectState) : undefined;
      
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

export const dbService = new IndexedDBService();
