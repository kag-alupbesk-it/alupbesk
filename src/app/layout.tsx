import "./globals.css";
import Providers from "./Providers";
import { themeInitScript } from "./theme-script";

export const metadata = {
  title: "ALUPBESK | Solusi Produk Aluminium & Komponen Industrial Terpercaya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the inline script may change class="dark"
    // before React hydrates, causing a class mismatch warning. This attr
    // tells React to ignore attribute differences on <html> only.
    <html lang="id" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/*
         * Anti-flicker inline script.
         * Runs synchronously before any CSS or React renders,
         * reads localStorage and sets/removes class="dark" on <html>.
         * Imported from theme-script.ts (NOT a "use client" module)
         * so Next.js treats this layout as a Server Component.
         */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}