import { db } from "@/services/supabase";

interface StorageBucketConfig {
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

export async function ensureStorageBucket(
  name: string,
  config: StorageBucketConfig,
): Promise<boolean> {
  if (!db) return false;

  let result = await db.storage.getBucket(name);
  if (result.error) {
    const created = await db.storage.createBucket(name, config);
    if (!created.error) return true;

    // Another request may have created the bucket concurrently.
    result = await db.storage.getBucket(name);
    if (result.error) {
      console.error(`[storage] bucket ${name} tidak tersedia:`, result.error.message);
      return false;
    }
  }

  const bucket = result.data;
  const allowedTypes = [...(bucket.allowed_mime_types ?? [])].sort();
  const expectedTypes = [...config.allowedMimeTypes].sort();
  const configurationMatches =
    bucket.public === config.public &&
    Number(bucket.file_size_limit) === config.fileSizeLimit &&
    allowedTypes.length === expectedTypes.length &&
    allowedTypes.every((type, index) => type === expectedTypes[index]);

  if (configurationMatches) return true;

  const { error } = await db.storage.updateBucket(name, config);
  if (error) {
    console.error(`[storage] konfigurasi bucket ${name} gagal diperbarui:`, error.message);
    return false;
  }
  return true;
}
