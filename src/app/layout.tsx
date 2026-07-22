import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "ALUPBESK | Solusi Produk Aluminium & Komponen Industrial Terpercaya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}