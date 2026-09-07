"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogApi } from "@/services/api";
import type { Product } from "@/services/catalog";
import { ProductCard } from "../../product/ProductCard";

export function CatalogPreview() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  useEffect(() => {
    catalogApi.getProducts().then(setCatalogProducts).catch(() => setCatalogProducts([]));
  }, []);
  return (
    <section className="py-section-gap-desktop bg-primary-container" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span>
        <div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-headline-h1 font-headline-h1 text-on-surface">
            Komponen Presisi untuk Konstruksi Unggul
          </h2>
          <Link
            href="/katalog"
            className="rounded-full border border-secondary px-5 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-primary"
          >
            Lihat selengkapnya
          </Link>
        </div>
        {catalogProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface/20 mb-4">inventory_2</span>
            <p className="text-[16px] font-semibold text-on-surface/50 mb-2">Produk masih kosong</p>
            <p className="text-[13px] text-on-surface/30 mb-6">
              Belum ada produk yang ditambahkan. Katalog akan tampil setelah produk tersedia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {catalogProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
