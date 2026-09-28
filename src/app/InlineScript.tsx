/**
 * InlineScript — server component, tanpa directive "use client".
 *
 * Script anti-flicker harus jalan sinkron saat browser parse HTML, sebelum paint
 * pertama dan sebelum React hydrate. React 19 membiarkan ini terjadi lewat
 * dangerouslySetInnerHTML, tapi saat elemen yang sama dibuat ulang di sisi client
 * React ikut merender tag <script> dan memunculkan warning "scripts inside React
 * components are never executed when rendering on the client".
 *
 * Solusinya: beri type yang berbeda per environment. Di server type-nya
 * "text/javascript" sehingga browser menjalankannya. Di client type-nya
 * "text/plain" sehingga React memperlakukannya sebagai data block (tidak pernah
 * dieksekusi) dan warning-nya hilang. suppressHydrationWarning menutup selisih
 * atribut type antara SSR dan client.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
