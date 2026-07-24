"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogApi } from "@/services/api";
import { products, type Product } from "@/services/catalog";
import { ProductCard } from "./ProductCard";
// Function untuk menampilkan katalog ringkas di beranda.
export function CatalogPreview() { const [catalogProducts, setCatalogProducts] = useState<Product[]>(products); useEffect(() => { catalogApi.getProducts().then(setCatalogProducts).catch(() => setCatalogProducts(products)); }, []); return <section className="py-section-gap-desktop bg-primary" id="katalog"><div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop"><span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span><div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4"><h2 className="text-headline-h1 font-headline-h1 text-white">Komponen Presisi untuk Konstruksi Unggul</h2><Link href="/katalog" className="rounded-full border border-secondary px-5 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-primary">Lihat selengkapnya</Link></div><div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">{catalogProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>; }
