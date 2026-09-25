"use client";

import { useState, useEffect } from "react";
import { marketingApi } from "@/services/api";
import ProdukFormModal from "./ProdukFormModal";
import type { MarketingProduct, ProductFormData } from "./types";
import { formatPrice } from "./types";
import * as s from "../style";

function LoadingSkeleton() {
  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={`h-20 w-72 ${s.skeleton}`} />
        <div className={`h-96 ${s.skeleton}`} />
      </div>
    </div>
  );
}

export default function ProdukSection() {
  const [products, setProducts] = useState<MarketingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<MarketingProduct | null>(null);

  useEffect(() => {
    marketingApi.getProducts()
      .then(setProducts)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Data produk gagal dimuat."))
      .finally(() => setIsLoading(false));
  }, []);

  function handleTambah() {
    setEditProduct(null);
    setShowForm(true);
  }

  function handleEdit(product: MarketingProduct) {
    setEditProduct(product);
    setShowForm(true);
  }

  async function handleSave(form: ProductFormData, id?: number) {
    setError("");
    const input = {
      category: form.category.trim().toUpperCase(),
      title: form.title.trim(),
      desc: form.desc.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      img: form.img.trim(),
      sku: form.sku.trim().toUpperCase(),
    };
    try {
      if (id) {
        const updated = await marketingApi.updateProduct(id, input);
        setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
      } else {
        const created = await marketingApi.createProduct(input);
        setProducts((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditProduct(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Produk gagal disimpan."); }
  }

  async function handleDelete(product: MarketingProduct) {
    if (!confirm(`Hapus produk "${product.title}"?`)) return;
    setError("");
    try {
      await marketingApi.deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Produk gagal dihapus."); }
  }

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl">
        <div className={s.header}>
          <div>
            <h3 className={s.title}>Kelola Produk &amp; Harga</h3>
            <p className={s.subtitle}>
              Upload produk baru dan perbarui harga katalog yang tampil di website publik. Stok produk dikelola oleh divisi gudang.
            </p>
          </div>
          <button onClick={handleTambah} className={s.addButton}>
            <span className={s.icon}>add</span>
            <span>Upload Produk</span>
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <div className={s.tableCard}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th scope="col" className={s.th}>Produk</th>
                  <th scope="col" className={s.th}>SKU</th>
                  <th scope="col" className={s.thHiddenMd}>Kategori</th>
                  <th scope="col" className={s.thRight}>Harga</th>
                  <th scope="col" className={s.thRight}>Stok</th>
                  <th scope="col" className={s.thRight}>Aksi</th>
                </tr>
              </thead>
              <tbody className={s.tbody}>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={s.emptyCell}>
                      Belum ada produk. Klik &quot;Upload Produk&quot; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className={s.row}>
                      <td className={s.td}>
                        <div className={s.productInfo}>
                          <img src={product.img} alt={product.title} className={s.productImg} />
                          <div>
                            <p className={s.productTitle}>{product.title}</p>
                            <p className={s.productCategory}>{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className={s.td}>
                        <span className={s.skuText}>{product.sku}</span>
                      </td>
                      <td className={s.tdHiddenMd}>
                        <span className="text-xs text-on-surface-variant">{product.category}</span>
                      </td>
                      <td className={s.tdRight}>
                        <span className={s.priceText}>{formatPrice(product.price)}</span>
                      </td>
                      <td className={s.tdRight}>
                        <span className={product.stock === 0 ? s.stockLow : s.stockText}>
                          {product.stock}
                        </span>
                      </td>
                      <td className={s.tdRight}>
                        <div className={s.aksiWrapper}>
                          <button onClick={() => handleEdit(product)} title="Edit harga / produk" className={s.actionButton}>
                            <span className={s.iconSm}>edit</span>
                          </button>
                          <button onClick={() => handleDelete(product)} title="Hapus produk" className={s.actionDelete}>
                            <span className={s.iconSm}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={s.tableFooter}>
            <p className={s.footerText}>
              Menampilkan <span className={s.footerAccent}>{products.length}</span> produk
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <ProdukFormModal
          editProduct={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
