import { supabase } from "./supabase";

const DB_NAME = "night-light-connect";
const STORE_NAME = "site-data";

export const STORAGE_KEYS = {
  leads: "nlc_leads",
  inspections: "nlc_inspections",
  customProperties: "nlc_custom_properties",
  adminSession: "nlc_admin_unlocked",
} as const;

function parseStored<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function saveToIndexedDb(key: string, value: unknown) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, value, updatedAt: new Date().toISOString() });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to save to IndexedDB."));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB write aborted."));
    });

    db.close();
  } catch {
    // Ignore IndexedDB errors and keep browser localStorage as the fallback source of truth.
  }
}

async function saveToSupabase(key: string, value: unknown) {
  if (!supabase) return;

  try {
    const { error } = await supabase.from("site_data").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("Supabase sync failed:", error.message);
    }
  } catch (error) {
    console.warn("Supabase sync failed:", error);
  }
}

export function readStored<T>(key: string, fallback: T): T {
  return parseStored(window.localStorage.getItem(key), fallback);
}

export function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors.
  }

  void saveToIndexedDb(key, value);
  void saveToSupabase(key, value);
}

export function clearStored(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }

  void saveToSupabase(key, null);

  void (async () => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      db.close();
    } catch {
      // Ignore cleanup errors.
    }
  })();
}

export async function readPersistedRecord<T>(key: string, fallback: T): Promise<T> {
  const localValue = readStored(key, fallback);

  if (supabase) {
    try {
      const { data, error } = await supabase.from("site_data").select("value").eq("key", key).maybeSingle();
      if (!error && data?.value !== undefined && data?.value !== null) {
        return data.value as T;
      }
    } catch {
      // Fall back to local browser storage.
    }
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const result = await new Promise<T>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const payload = request.result?.value as T | undefined;
        resolve(payload ?? localValue);
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to read IndexedDB record."));
    });

    db.close();
    return result;
  } catch {
    return localValue;
  }
}
