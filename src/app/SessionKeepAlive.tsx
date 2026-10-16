"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";

// Membuat singleton Supabase browser client di setiap halaman sehingga timer
// auto-refresh token aktif. Tanpa ini, sesi hanya diperbarui di halaman yang
// kebetulan memakai klien tersebut, dan pengguna bisa diminta login ulang.
export default function SessionKeepAlive() {
  useEffect(() => {
    try {
      void getSupabaseBrowserClient().auth.getSession();
    } catch {
      // Supabase belum dikonfigurasi; tidak ada sesi untuk dijaga.
    }
  }, []);

  return null;
}
