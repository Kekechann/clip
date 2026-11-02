import { MediaItem, Folder, AppSettings } from '../types';

const DB_NAME = 'ClipVaultDB';
const DB_VERSION = 1;

const STORES = {
  MEDIA: 'media',
  BLOBS: 'blobs',
  FOLDERS: 'folders',
  SETTINGS: 'settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  autoClipboardDetection: true,
  autoDownloadOnCopy: true,
  defaultFolderId: 'social',
  defaultVideoQuality: '1080p',
  darkMode: true,
  saveToDeviceDirectly: false,
  notifyOnComplete: true,
};

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'all',
    name: 'All Media',
    iconName: 'Folder',
    color: '#6366f1',
    description: 'Complete offline library collection',
    createdAt: Date.now(),
    isSystem: true,
  },
  {
    id: 'social',
    name: 'Social Media',
    iconName: 'Share2',
    color: '#ec4899',
    description: 'Instagram reels, TikToks & viral clips',
    createdAt: Date.now(),
    isSystem: true,
  },
  {
    id: 'favorites',
    name: 'Favorites',
    iconName: 'Heart',
    color: '#f59e0b',
    description: 'Starred and bookmarked media',
    createdAt: Date.now(),
    isSystem: true,
  },
  {
    id: 'work',
    name: 'Research & Work',
    iconName: 'Briefcase',
    color: '#3b82f6',
    description: 'Tutorials, references & project assets',
    createdAt: Date.now(),
  },
];

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  public ready(): Promise<void> {
    if (this.db) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.MEDIA)) {
          const mediaStore = db.createObjectStore(STORES.MEDIA, { keyPath: 'id' });
          mediaStore.createIndex('folderId', 'folderId', { unique: false });
          mediaStore.createIndex('platform', 'platform', { unique: false });
          mediaStore.createIndex('dateKey', 'dateKey', { unique: false });
          mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.BLOBS)) {
          db.createObjectStore(STORES.BLOBS);
        }

        if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
          db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => {
        resolve(); // Fallback gracefully if IDB restricted
      };
    });

    return this.initPromise;
  }

  // --- MEDIA ---
  public async getAllMedia(): Promise<MediaItem[]> {
    await this.ready();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.MEDIA, 'readonly');
        const store = tx.objectStore(STORES.MEDIA);
        const req = store.getAll();

        req.onsuccess = () => {
          const items: MediaItem[] = req.result || [];
          items.sort((a, b) => b.createdAt - a.createdAt);
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async saveMedia(item: MediaItem, blob?: Blob): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(
          blob ? [STORES.MEDIA, STORES.BLOBS] : [STORES.MEDIA],
          'readwrite'
        );
        const mediaStore = tx.objectStore(STORES.MEDIA);
        mediaStore.put(item);

        if (blob) {
          const blobStore = tx.objectStore(STORES.BLOBS);
          blobStore.put(blob, item.id);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async updateMedia(id: string, updates: Partial<MediaItem>): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.MEDIA, 'readwrite');
        const store = tx.objectStore(STORES.MEDIA);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          if (getReq.result) {
            const updated = { ...getReq.result, ...updates };
            store.put(updated);
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async deleteMedia(id: string): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction([STORES.MEDIA, STORES.BLOBS], 'readwrite');
        tx.objectStore(STORES.MEDIA).delete(id);
        tx.objectStore(STORES.BLOBS).delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getMediaBlob(id: string): Promise<Blob | null> {
    await this.ready();
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.BLOBS, 'readonly');
        const req = tx.objectStore(STORES.BLOBS).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // --- FOLDERS ---
  public async getAllFolders(): Promise<Folder[]> {
    await this.ready();
    if (!this.db) return DEFAULT_FOLDERS;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.FOLDERS, 'readonly');
        const req = tx.objectStore(STORES.FOLDERS).getAll();

        req.onsuccess = () => {
          const list: Folder[] = req.result || [];
          if (list.length === 0) {
            // Seed defaults
            this.seedDefaultFolders().then(() => resolve(DEFAULT_FOLDERS));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => resolve(DEFAULT_FOLDERS);
      } catch {
        resolve(DEFAULT_FOLDERS);
      }
    });
  }

  private async seedDefaultFolders(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.FOLDERS, 'readwrite');
        const store = tx.objectStore(STORES.FOLDERS);
        DEFAULT_FOLDERS.forEach((f) => store.put(f));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async saveFolder(folder: Folder): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.FOLDERS, 'readwrite');
        tx.objectStore(STORES.FOLDERS).put(folder);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async deleteFolder(id: string): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.FOLDERS, 'readwrite');
        tx.objectStore(STORES.FOLDERS).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<AppSettings> {
    await this.ready();
    if (!this.db) return DEFAULT_SETTINGS;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.SETTINGS, 'readonly');
        const req = tx.objectStore(STORES.SETTINGS).get('user_settings');
        req.onsuccess = () => resolve(req.result ? { ...DEFAULT_SETTINGS, ...req.result } : DEFAULT_SETTINGS);
        req.onerror = () => resolve(DEFAULT_SETTINGS);
      } catch {
        resolve(DEFAULT_SETTINGS);
      }
    });
  }

  public async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    await this.ready();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORES.SETTINGS, 'readwrite');
        const store = tx.objectStore(STORES.SETTINGS);
        const getReq = store.get('user_settings');
        getReq.onsuccess = () => {
          const current = getReq.result || DEFAULT_SETTINGS;
          store.put({ ...current, ...settings }, 'user_settings');
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const dbService = new IndexedDBService();
