"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { marketingApi } from "@/services/api/index";
import ProdukFormModal from "../ProdukFormModal/ProdukFormModal";
import type { MarketingProduct, ProductFormData } from "../types/types";
import { formatPrice } from "../types/types";
import * as s from "../../style/style";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

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

function ProdukActions({
  product,
  full = false,
  onEdit,
  onDelete,
}: {
  product: MarketingProduct;
  full?: boolean;
  onEdit: (product: MarketingProduct) => void;
  onDelete: (product: MarketingProduct) => void;
}) {
  const extra = full ? " w-full" : "";
  return (
    <>
      <button onClick={() => onEdit(product)} title="Edit harga / produk" className={`${s.actionButton}${extra}`}>
        <span className={s.iconSm}>edit</span>
        {full && <span className="text-xs font-bold uppercase tracking-wide">Edit</span>}
      </button>
      <button onClick={() => onDelete(product)} title="Hapus produk" className={`${s.actionDelete}${extra}`}>
        <span className={s.iconSm}>delete</span>
        {full && <span className="text-xs font-bold uppercase tracking-wide">Hapus</span>}
      </button>
    </>
  );
}

export default function ProdukSection() {
  const loadProducts = useCallback(() => marketingApi.getProducts(), []);
  const { data: products, loading: isLoading, error: loadError, refresh } = usePollingResource<MarketingProduct[]>(loadProducts, []);
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<MarketingProduct | null>(null);

  function handleTambah() {
    setEditProduct(null);
    setShowForm(true);
  }

  function handleEdit(product: MarketingProduct) {
    setEditProduct(product);
    setShowForm(true);
  }

  async function handleSave(form: ProductFormData, id?: number) {
    setActionError("");
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
        await marketingApi.updateProduct(id, input);
      } else {
        await marketingApi.createProduct(input);
      }
      refresh();
      setShowForm(false);
      setEditProduct(null);
    } catch (reason) { setActionError(reason instanceof Error ? reason.message : "Produk gagal disimpan."); }
  }

  async function handleDelete(product: MarketingProduct) {
    if (!confirm(`Hapus produk "${product.title}"?`)) return;
    setActionError("");
    try {
      await marketingApi.deleteProduct(product.id);
      refresh();
    } catch (reason) { setActionError(reason instanceof Error ? reason.message : "Produk gagal dihapus."); }
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

        {(actionError || loadError) && <p className="mb-4 text-sm text-red-400">{actionError || loadError}</p>}

        <div className={s.mobileList}>
          {products.length === 0 ? (
            <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
              Belum ada produk. Klik &quot;Upload Produk&quot; untuk menambahkan.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className={s.card}>
                <div className={s.cardTop}>
                  <div className={s.productInfo}>
                    <Image src={product.img} alt={product.title} width={64} height={64} unoptimized className={s.productImg} />
                    <div className="min-w-0">
                      <p className={s.productTitle}>{product.title}</p>
                      <p className={s.productCategory}>{product.category}</p>
                    </div>
                  </div>
                  <span className={s.skuText}>SKU: {product.sku}</span>
                </div>
                <div className={s.cardInfo}>
                  <div className="truncate">Kategori: {product.category}</div>
                </div>
                <div className={s.cardMeta}>
                  <span className={s.priceText}>{formatPrice(product.price)}</span>
                  <span className={product.stock === 0 ? s.stockLow : s.stockText}>
                    Stok: {product.stock}
                  </span>
                </div>
                <div className={`${s.cardActions} gap-2`}>
                  <ProdukActions product={product} full onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`${s.tableCard} ${s.desktopOnly}`}>
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
                          <Image src={product.img} alt={product.title} width={64} height={64} unoptimized className={s.productImg} />
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
                          <ProdukActions product={product} onEdit={handleEdit} onDelete={handleDelete} />
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
