import type { Property } from "../src/types";

const dbName = "night-light-connect-backend";
const photoStore = "photos";
const propertyStore = "properties";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(photoStore)) database.createObjectStore(photoStore, { keyPath: "id" });
      if (!database.objectStoreNames.contains(propertyStore)) database.createObjectStore(propertyStore, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local backend database."));
  });
}

async function runStore<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, mode);
  const request = action(transaction.objectStore(storeName));
  const result = await new Promise<T>((resolve, reject) => {
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error ?? new Error("Local backend transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Local backend transaction aborted."));
  });
  database.close();
  return result;
}

const photoUrls = new Map<string, string>();

export async function uploadPropertyPhotos(files: File[]) {
  const urls: string[] = [];
  const database = await openDatabase();

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const id = `local-photo-${crypto.randomUUID()}`;
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(photoStore, "readwrite");
      transaction.objectStore(photoStore).put({ id, name: file.name, type: file.type, blob: file, createdAt: Date.now() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Photo save failed."));
    });

    const url = URL.createObjectURL(file);
    photoUrls.set(id, url);
    urls.push(`local-photo://${id}`);
  }

  database.close();
  return { urls };
}

export async function deletePropertyPhotoUrls(urls: string[]) {
  const ids = urls.flatMap((url) => url.startsWith("local-photo://") ? [url.slice("local-photo://".length)] : []);
  if (!ids.length) return;

  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(photoStore, "readwrite");
    for (const id of ids) transaction.objectStore(photoStore).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Photo delete failed."));
  });
  database.close();

  for (const id of ids) {
    const url = photoUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    photoUrls.delete(id);
  }
}

export async function resolveLocalPhotoUrl(url: string): Promise<string> {
  if (!url.startsWith("local-photo://")) return url;
  const id = url.slice("local-photo://".length);

  const existing = photoUrls.get(id);
  if (existing) return existing;

  const record = await runStore<{ blob: Blob } | undefined>(photoStore, "readonly", (store) => store.get(id));
  if (!record?.blob) return url;
  const objectUrl = URL.createObjectURL(record.blob);
  photoUrls.set(id, objectUrl);
  return objectUrl;
}

export async function saveProperty(property: Property) {
  await runStore(propertyStore, "readwrite", (store) => store.put(property));
  broadcast("properties-changed");
}

export async function deleteProperty(id: string, imageUrls: string[] = []) {
  await runStore(propertyStore, "readwrite", (store) => store.delete(id));
  await deletePropertyPhotoUrls(imageUrls);
  broadcast("properties-changed");
}

export async function readProperties(): Promise<Property[]> {
  return runStore<Property[]>(propertyStore, "readonly", (store) => store.getAll());
}

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel() {
  if (!("BroadcastChannel" in globalThis)) return null;
  if (!broadcastChannel) broadcastChannel = new BroadcastChannel("night-light-connect-backend");
  return broadcastChannel;
}

function broadcast(message: string) {
  getBroadcastChannel()?.postMessage(message);
  window.dispatchEvent(new CustomEvent("nlc-local-backend-change", { detail: message }));
}

export function subscribeToProperties(onChange: (properties: Property[]) => void) {
  const channel = "BroadcastChannel" in globalThis
    ? new BroadcastChannel("night-light-connect-backend")
    : null;

  const refresh = () => void readProperties().then(onChange);
  const refreshOnVisible = () => {
    if (document.visibilityState === "visible") refresh();
  };
  if (channel) channel.onmessage = refresh;
  window.addEventListener("storage", refresh);
  window.addEventListener("nlc-local-backend-change", refresh);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refreshOnVisible);
  const pollingTimer = window.setInterval(refresh, 1000);
  void refresh();

  return () => {
    channel?.close();
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nlc-local-backend-change", refresh);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refreshOnVisible);
    window.clearInterval(pollingTimer);
  };
}
