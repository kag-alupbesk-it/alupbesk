"use client";

/**
 * InlineScript — client component yang output SSR-nya tetap dipakai.
 *
 * Script anti-flicker harus jalan sinkron saat browser parse HTML, sebelum paint
 * pertama dan sebelum React hydrate. Karena itu di server type-nya
 * "text/javascript" sehingga browser menjalankannya. Di client type-nya
 * "text/plain" sehingga React menganggapnya data block dan tidak memunculkan
 * warning "scripts inside React components are never executed on the client".
 * suppressHydrationWarning menutup selisih atribut type antara SSR dan client.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      data-dynamic="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
