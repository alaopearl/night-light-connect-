import { supabase } from "./supabase";

const DB_NAME = "night-light-connect";
const STORE_NAME = "site-data";

export const STORAGE_KEYS = {
  leads: "nlc_leads",
  inspections: "nlc_inspections",
  customProperties: "nlc_custom_properties",
  deletedProperties: "nlc_deleted_properties",
  adminSession: "nlc_admin_unlocked",
} as const;

const REQUEST_TABLES = {
  [STORAGE_KEYS.leads]: "site_leads",
  [STORAGE_KEYS.inspections]: "site_inspections",
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
  if (!(key in REQUEST_TABLES)) void saveToSupabase(key, value);
}

export function appendStoredRecord<T extends { id: string; createdAt?: string }>(key: string, record: T) {
  const records = readStored<T[]>(key, []);
  if (!records.some((item) => item.id === record.id)) writeStored(key, [...records, record]);

  const table = REQUEST_TABLES[key as keyof typeof REQUEST_TABLES];
  if (supabase && table) {
    void supabase.from(table).insert({
      id: record.id,
      value: record,
      created_at: record.createdAt ?? new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.warn(`Supabase ${table} insert failed:`, error.message);
    });
  }
}

export async function readStoredRecords<T>(key: string, fallback: T[] = []): Promise<T[]> {
  const table = REQUEST_TABLES[key as keyof typeof REQUEST_TABLES];
  if (supabase && table) {
    try {
      const { data, error } = await supabase.from(table).select("value").order("created_at", { ascending: false });
      if (!error && data?.length) return data.map((row) => row.value as T);
      if (!error && data) return readStored<T[]>(key, fallback);
      if (error) console.warn(`Supabase ${table} read failed:`, error.message);
    } catch (error) {
      console.warn(`Supabase ${table} read failed:`, error);
    }
  }
  return readStored<T[]>(key, fallback);
}

export function deleteStoredRecord(key: string, id: string) {
  const table = REQUEST_TABLES[key as keyof typeof REQUEST_TABLES];
  const records = readStored<{ id: string }[]>(key, []).filter((record) => record.id !== id);
  writeStored(key, records);

  if (supabase && table) {
    void supabase.from(table).delete().eq("id", id).then(({ error }) => {
      if (error) console.warn(`Supabase ${table} delete failed:`, error.message);
    });
  }
}

export function subscribeToStoredRecords(
  keys: string[],
  onChange: (key: string, value: unknown[]) => void
) {
  if (!supabase) return () => undefined;

  const channels = keys.flatMap((key) => {
    const table = REQUEST_TABLES[key as keyof typeof REQUEST_TABLES];
    if (!table) return [];
    const channel = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void readStoredRecords<unknown>(key).then((records) => onChange(key, records));
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`Supabase ${table} Realtime subscription failed:`, error);
        }
      });
    return [channel];
  });

  return () => {
    channels.forEach((channel) => void supabase?.removeChannel(channel));
  };
}

export function clearStored(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }

  void (async () => {
    if (!supabase) return;
    const { error } = await supabase.from("site_data").delete().eq("key", key);
    if (error) console.warn("Supabase delete failed:", error.message);
  })();

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

export function subscribeToStoredKeys(
  keys: string[],
  onChange: (key: string, value: unknown) => void
) {
  if (!supabase) return () => undefined;

  const keySet = new Set(keys);
  const channel = supabase
    .channel(`site-data-${keys.join("-")}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_data" },
      (payload) => {
        const record = payload.new as { key?: string; value?: unknown };
        if (record.key && keySet.has(record.key)) {
          onChange(record.key, record.value);
          return;
        }

        const oldRecord = payload.old as { key?: string };
        if (payload.eventType === "DELETE" && oldRecord.key && keySet.has(oldRecord.key)) {
          onChange(oldRecord.key, undefined);
        }
      }
    )
    .subscribe((status, error) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("Supabase Realtime subscription failed:", error);
      }
    });

  return () => {
    void supabase?.removeChannel(channel);
  };
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
