import "./globals.css";
import Providers from "./Providers";
import { InlineScript } from "./InlineScript";
import { themeInitScript } from "./theme-script";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";

export const metadata = {
  title: "ALUPBESK | Solusi Produk Aluminium & Komponen Industrial Terpercaya",
  description:
    "Solusi Produk Aluminium & Komponen Industrial Terpercaya - Katalog, Pemesanan, dan Manajemen",
  manifest: "/manifest.json",
  themeColor: "#e94560",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALUPBESK",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: script inline mengubah class="dark" pada <html>
    // sebelum React hydrate, jadi React harus menerima nilai yang sudah ada di DOM
    // alih-alih menandai perbedaan atribut sebagai error.
    <html lang="id" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/*
         * Script anti-flicker tema: jalan sebelum CSS pertama dirender sehingga
         * class="dark" pada <html> sudah sesuai localStorage sejak frame pertama,
         * tanpa perlukilau saat React hydrate.
         */}
        <InlineScript html={themeInitScript} />

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
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}