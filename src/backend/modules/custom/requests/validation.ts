// Ambang batas url gambar mentah: hanya tautan ke storage publik milik sendiri
// yang boleh disimpan (bucket images, path /storage/v1/object/public/images).
// Ini mencegah request custom diarahkan ke URL asing yang ikut dimuat browser
// admin (beacon/pelacak) saat detail dibuka.
export function isAllowedRawImage(value: string | undefined | null): boolean {
  if (!value) return true;
  const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storageOrigin) return true;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return (
    parsed.protocol === "https:" &&
    `${parsed.origin}${parsed.pathname}`.startsWith(
      `${storageOrigin.replace(/\/$/, "")}/storage/v1/object/public/images/`,
    )
  );
}