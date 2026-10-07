import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  experimental: {
    /**
     * Repository ini berada di mount FUSE/NTFS (fuseblk), bukan filesystem
     * native. Cache persisten Turbopack memakai RocksDB yang bergantung pada
     * mmap dan file locking — keduanya tidak andal di FUSE. Akibatnya database
     * cache rusak dan dev server gagal dengan:
     *
     *   TypeError: Cannot read properties of null (reading 'enqueueModel')
     *   TurbopackInternalError: Unable to open static sorted file *.sst
     *
     * Cache dibongkar total tiap restart, tapi compile ulang di dalam satu
     * sesi masih di-memory sehingga hot reload tetap cepat.
     *
     * Hapus opsi ini kalau project dipindah ke filesystem native (ext4/btrfs).
     */
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
