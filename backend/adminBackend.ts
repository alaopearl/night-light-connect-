import type { Property } from "../src/types";
import { supabase } from "../src/lib/supabase";
import * as localBackend from "./localBackend";

const backendMode = import.meta.env.VITE_BACKEND_MODE || "supabase";
export const isLocalBackend = backendMode === "local";

const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "night-light-img";
const allowedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const maxPhotoSize = 10 * 1024 * 1024;

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

async function requireAdmin() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;

  const role = data.session?.user.app_metadata?.role;
  if (!data.session || (role !== "admin" && role !== "super_admin")) {
    throw new Error("Admin sign-in required.");
  }

  return client;
}

export async function getBackendStatus() {
  if (isLocalBackend) {
    return {
      configured: true,
      signedIn: true,
      isAdmin: true,
      bucketExists: true,
      bucketName: "local-indexeddb",
    };
  }

  const client = requireSupabase();
  const [{ data: sessionData }, { data: bucketData, error: bucketError }] = await Promise.all([
    client.auth.getSession(),
    client.storage.getBucket(bucketName),
  ]);

  const role = sessionData.session?.user.app_metadata?.role;
  return {
    configured: true,
    signedIn: Boolean(sessionData.session),
    isAdmin: role === "admin" || role === "super_admin",
    bucketExists: Boolean(bucketData) && !bucketError,
    bucketName,
  };
}

export async function uploadPropertyPhotos(files: File[]): Promise<{ urls: string[]; error?: string }> {
  if (isLocalBackend) return localBackend.uploadPropertyPhotos(files);
  const client = await requireAdmin();
  const urls: string[] = [];

  for (const file of files) {
    if (!allowedPhotoTypes.has(file.type)) {
      return { urls, error: `Unsupported image type: ${file.type || "unknown"}` };
    }
    if (file.size > maxPhotoSize) {
      return { urls, error: `${file.name} exceeds the 10 MB upload limit.` };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `properties/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await client.storage.from(bucketName).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      if (error.message.toLowerCase().includes("bucket not found")) {
        return { urls, error: `Storage bucket "${bucketName}" was not found. Create the public bucket and run supabase/storage-policy.sql.` };
      }
      return { urls, error: error.message };
    }
    urls.push(client.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl);
  }

  return { urls };
}

export async function deletePropertyPhotoUrls(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  if (isLocalBackend) return localBackend.deletePropertyPhotoUrls(urls);
  const client = await requireAdmin();

  const marker = `/object/public/${bucketName}/`;
  const paths = urls.flatMap((url) => {
    try {
      const markerIndex = new URL(url).pathname.indexOf(marker);
      return markerIndex >= 0
        ? [decodeURIComponent(new URL(url).pathname.slice(markerIndex + marker.length))]
        : [];
    } catch {
      return [];
    }
  });

  if (paths.length) {
    const { error } = await client.storage.from(bucketName).remove(paths);
    if (error) throw error;
  }
}

export async function saveProperty(property: Property): Promise<void> {
  if (isLocalBackend) return localBackend.saveProperty(property);
  const client = await requireAdmin();
  const now = new Date().toISOString();

  const { error } = await client.from("properties").upsert(
    {
      id: property.id,
      value: property,
      created_at: property.createdAt ?? now,
      updated_at: now,
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export async function deleteProperty(id: string, imageUrls: string[] = []): Promise<void> {
  if (isLocalBackend) return localBackend.deleteProperty(id, imageUrls);
  const client = await requireAdmin();
  const { error } = await client.from("properties").delete().eq("id", id);
  if (error) throw error;
  await deletePropertyPhotoUrls(imageUrls);
}

export async function readProperties(): Promise<Property[]> {
  if (isLocalBackend) return localBackend.readProperties();
  const client = requireSupabase();
  const { data, error } = await client
    .from("properties")
    .select("value")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const property = row.value as Property | null;
    return property?.id ? [property] : [];
  });
}

export function subscribeToProperties(onChange: (properties: Property[]) => void) {
  if (isLocalBackend) return localBackend.subscribeToProperties(onChange);
  const client = requireSupabase();

  const refresh = () => {
    void readProperties().then(onChange).catch((error) => {
      console.warn("Realtime property refresh failed:", error);
    });
  };

  void refresh();
  const pollingTimer = window.setInterval(refresh, 3000);
  const refreshOnVisible = () => {
    if (document.visibilityState === "visible") refresh();
  };
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refreshOnVisible);

  const channel = client
    .channel("admin-properties-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, refresh)
    .subscribe((status, error) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("Supabase Realtime subscription failed; polling remains active:", error);
      }
    });

  return () => {
    window.clearInterval(pollingTimer);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refreshOnVisible);
    void client.removeChannel(channel);
  };
}
