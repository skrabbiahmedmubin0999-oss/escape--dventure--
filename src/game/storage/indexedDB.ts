/**
 * Escape Adventure 3D — Native IndexedDB Local Storage Engine
 *
 * Provides robust offline local storage for player profiles, game progress,
 * achievements, inventory, settings, and control configurations.
 * Features automatic localStorage data migration and graceful fallback.
 */

const DB_NAME = 'EscapeAdventureDB';
const DB_VERSION = 3;

export const STORES = {
  SETTINGS: 'settings',
  PROFILE: 'profile',
  STATS: 'stats',
  SAVED_GAME: 'savedGame',
  CONTROLS_LAYOUT: 'controlsLayout',
  KEY_BINDINGS: 'keyBindings',
  FEATURE_MANAGER: 'featureManager',
  HUD_PROFILES: 'hudProfiles',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all required Stores if they don't exist
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Schema Self-Healing: Verify all required object stores exist before proceeding
      const missingStores = Object.values(STORES).some((storeName) => !db.objectStoreNames.contains(storeName));
      if (missingStores) {
        db.close();
        dbPromise = null;
        const upgradeRequest = indexedDB.open(DB_NAME, db.version + 1);
        upgradeRequest.onupgradeneeded = (upgEvent) => {
          const upgradeDb = (upgEvent.target as IDBOpenDBRequest).result;
          Object.values(STORES).forEach((storeName) => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
              upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };
        upgradeRequest.onsuccess = (upgSuccessEvent) => {
          resolve((upgSuccessEvent.target as IDBOpenDBRequest).result);
        };
        upgradeRequest.onerror = (upgErrEvent) => {
          reject((upgErrEvent.target as IDBOpenDBRequest).error);
        };
        return;
      }

      // Handle DB connection loss gracefully
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = (event) => {
      console.warn('[IndexedDB] Failed to open database:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Generic Async Get Item from IndexedDB Store with localStorage fallback
 */
export async function idbGet<T>(storeName: StoreName, id: string = 'default'): Promise<T | null> {
  try {
    const db = await getDB();
    if (!db.objectStoreNames.contains(storeName)) {
      // Fallback to localStorage if store doesn't exist yet
      const fallbackKey = `escape_adventure_idb_${storeName}_${id}`;
      const legacyKey = storeName === STORES.SETTINGS ? 'escape_adventure_settings' :
                        storeName === STORES.PROFILE ? 'escape_adventure_profile' :
                        storeName === STORES.STATS ? 'escape_adventure_stats' :
                        storeName === STORES.SAVED_GAME ? 'escape_adventure_saved_game' :
                        storeName === STORES.CONTROLS_LAYOUT ? 'escape_adventure_controls_layout' : null;

      const saved = localStorage.getItem(fallbackKey) || (legacyKey ? localStorage.getItem(legacyKey) : null);
      return saved ? JSON.parse(saved) : null;
    }

    return new Promise<T | null>((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.data !== undefined) {
          resolve(req.result.data as T);
        } else {
          // Check localStorage fallback if not found in IndexedDB
          try {
            const fallbackKey = `escape_adventure_idb_${storeName}_${id}`;
            const legacyKey = storeName === STORES.SETTINGS ? 'escape_adventure_settings' :
                              storeName === STORES.PROFILE ? 'escape_adventure_profile' :
                              storeName === STORES.STATS ? 'escape_adventure_stats' :
                              storeName === STORES.SAVED_GAME ? 'escape_adventure_saved_game' :
                              storeName === STORES.CONTROLS_LAYOUT ? 'escape_adventure_controls_layout' : null;

            const saved = localStorage.getItem(fallbackKey) || (legacyKey ? localStorage.getItem(legacyKey) : null);
            resolve(saved ? JSON.parse(saved) : null);
          } catch {
            resolve(null);
          }
        }
      };

      req.onerror = () => {
        // Fallback to localStorage on request error
        try {
          const fallbackKey = `escape_adventure_idb_${storeName}_${id}`;
          const saved = localStorage.getItem(fallbackKey);
          resolve(saved ? JSON.parse(saved) : null);
        } catch {
          resolve(null);
        }
      };
    });
  } catch (err) {
    // Fallback to localStorage on connection error or unsupported environment
    try {
      const fallbackKey = `escape_adventure_idb_${storeName}_${id}`;
      const legacyKey = storeName === STORES.SETTINGS ? 'escape_adventure_settings' :
                        storeName === STORES.PROFILE ? 'escape_adventure_profile' :
                        storeName === STORES.STATS ? 'escape_adventure_stats' :
                        storeName === STORES.SAVED_GAME ? 'escape_adventure_saved_game' :
                        storeName === STORES.CONTROLS_LAYOUT ? 'escape_adventure_controls_layout' : null;

      const saved = localStorage.getItem(fallbackKey) || (legacyKey ? localStorage.getItem(legacyKey) : null);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Generic Async Put Item into IndexedDB Store with localStorage sync
 */
export async function idbSet<T>(storeName: StoreName, data: T, id: string = 'default'): Promise<void> {
  // Sync to localStorage as redundant safe fallback
  try {
    const fallbackKey = `escape_adventure_idb_${storeName}_${id}`;
    localStorage.setItem(fallbackKey, JSON.stringify(data));
  } catch {}

  try {
    const db = await getDB();
    if (!db.objectStoreNames.contains(storeName)) return;
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put({ id, data, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Falling back to localStorage for ${storeName}:`, err);
  }
}

/**
 * Automatically migrate legacy localStorage keys to IndexedDB on first launch
 */
export async function migrateLegacyLocalStorage(): Promise<void> {
  const migrations: Array<{ lsKey: string; store: StoreName; id: string }> = [
    { lsKey: 'escape_adventure_settings', store: STORES.SETTINGS, id: 'default' },
    { lsKey: 'escape_adventure_profile', store: STORES.PROFILE, id: 'default' },
    { lsKey: 'escape_adventure_stats', store: STORES.STATS, id: 'default' },
    { lsKey: 'escape_adventure_saved_game', store: STORES.SAVED_GAME, id: 'default' },
    { lsKey: 'escape_adventure_controls_layout', store: STORES.CONTROLS_LAYOUT, id: 'default' },
  ];

  for (const { lsKey, store, id } of migrations) {
    try {
      const rawLs = localStorage.getItem(lsKey);
      if (rawLs) {
        const parsed = JSON.parse(rawLs);
        await idbSet(store, parsed, id);
      }
    } catch (err) {
      console.warn(`[IndexedDB] Migration skipped for ${lsKey}:`, err);
    }
  }
}

/**
 * Diagnostic Verification Test for all 5 IndexedDB Object Stores
 */
export async function verifyIndexedDBStores(): Promise<{
  allPassed: boolean;
  stores: Record<StoreName, boolean>;
  details: string[];
}> {
  const results: Record<StoreName, boolean> = {
    settings: false,
    profile: false,
    stats: false,
    savedGame: false,
    controlsLayout: false,
    keyBindings: false,
    featureManager: false,
    hudProfiles: false,
  };
  const details: string[] = [];

  try {
    const db = await getDB();
    for (const storeName of Object.values(STORES)) {
      if (!db.objectStoreNames.contains(storeName)) {
        details.push(`Store ${storeName} missing from database.`);
        results[storeName] = false;
        continue;
      }

      // Write test canary
      const testCanary = { test: true, timestamp: Date.now() };
      await idbSet(storeName, testCanary, '__test_canary__');

      // Read back canary
      const readBack = await idbGet<typeof testCanary>(storeName, '__test_canary__');
      if (readBack && readBack.test === true) {
        results[storeName] = true;
        details.push(`Store ${storeName}: PASS (read/write verified)`);
      } else {
        results[storeName] = false;
        details.push(`Store ${storeName}: FAIL (canary mismatch)`);
      }
    }
  } catch (err: any) {
    details.push(`IndexedDB Engine error: ${err?.message || String(err)}`);
  }

  const allPassed = Object.values(results).every(Boolean);
  return { allPassed, stores: results, details };
}

// Register global diagnostic hook for automated/console verification
if (typeof window !== 'undefined') {
  (window as any).__verifyIndexedDB = verifyIndexedDBStores;
}
