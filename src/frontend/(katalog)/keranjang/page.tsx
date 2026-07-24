"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { itemKey, useCart } from "../checkout/CartContext";
import { cartStyles as styles } from "./style";

const formatPrice = (price: number): string => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
}).format(price);

export default function KeranjangPage() {
  const { items, removeFromCart, updateQuantity, updateNote, clearCart, totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [confirmClear, setConfirmClear] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  const getKey = (productId: number, variants?: Record<string, string>): string => itemKey(productId, variants);
  const updateQuantityInput = (key: string, value: string): void => {
    const rawValue = value.replace(/[^0-9]/g, "");
    setQtyInputs((previous) => ({ ...previous, [key]: rawValue }));
    const quantity = Number.parseInt(rawValue, 10);
    if (Number.isInteger(quantity) && quantity > 0) updateQuantity(key, quantity);
  };
  const commitQuantityInput = (key: string, value: string): void => {
    const quantity = Number.parseInt(value, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) updateQuantity(key, 1);
    setQtyInputs((previous) => { const next = { ...previous }; delete next[key]; return next; });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarContent}>
          <Link href="/" className={styles.backLink}><span className={styles.backIcon}>arrow_back</span></Link>
          <div className={styles.headingContainer}>
            <h1 className={styles.heading}>Keranjang Belanja</h1>
            {items.length > 0 && <p className={styles.itemCount}>{totalItems} item dipilih</p>}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>shopping_cart</span>
            <p className={styles.emptyTitle}>Keranjang kamu masih kosong</p>
            <p className={styles.emptyDescription}>Yuk, tambahkan produk dari katalog kami</p>
            <Link href="/#katalog" className={styles.catalogLink}>Lihat Katalog</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.itemList}>
              {items.map((item) => {
                const key = getKey(item.product.id, item.selectedVariants);
                return (
                  <div key={key} className={styles.itemCard}>
                    <div className={styles.itemRow}>
                      <div className={styles.productImage} style={{ backgroundImage: `url('${item.product.img}')` }} />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <div className={styles.productInfo}>
                            <span className={styles.stockBadge}><span className={styles.stockDot} />{item.product.stock > 50 ? "Ready Stock" : item.product.stock > 0 ? `Stok: ${item.product.stock}` : "Habis"}</span>
                            <h3 className={styles.productTitle}>{item.product.title}</h3>
                            <p className={styles.unitPrice}>@ {formatPrice(item.product.price)} / pcs</p>
                          </div>
                          <button onClick={() => removeFromCart(key)} className={styles.deleteButton} title="Hapus produk"><span className={styles.icon}>delete</span></button>
                        </div>
                        <div className={styles.quantityRow}>
                          <div className={styles.quantityControl}>
                            <button onClick={() => updateQuantity(key, item.quantity - 1)} className={styles.quantityButton}><span className={styles.icon}>remove</span></button>
                            <input type="text" inputMode="numeric" value={qtyInputs[key] ?? item.quantity} onChange={(event) => updateQuantityInput(key, event.target.value)} onBlur={(event) => commitQuantityInput(key, event.target.value)} className={styles.quantityInput} />
                            <button onClick={() => updateQuantity(key, item.quantity + 1)} className={styles.quantityButton}><span className={styles.icon}>add</span></button>
                          </div>
                          <div className={styles.subtotal}><p className={styles.subtotalLabel}>Subtotal</p><p className={styles.subtotalValue}>{formatPrice(item.product.price * item.quantity)}</p></div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.noteContainer}><input type="text" placeholder="Catatan / spesifikasi custom (misal: potong 500mm)..." value={item.note} onChange={(event) => updateNote(key, event.target.value)} className={styles.noteInput} /></div>
                  </div>
                );
              })}
              <div className={styles.clearContainer}>
                {!confirmClear ? <button onClick={() => setConfirmClear(true)} className={styles.clearButton}><span className={styles.smallIcon}>delete_sweep</span>Kosongkan semua keranjang</button> : (
                  <div className={styles.confirmClear}><p className={styles.confirmText}>Yakin ingin mengosongkan keranjang?</p><button onClick={() => { clearCart(); setConfirmClear(false); }} className={styles.confirmButton}>Ya, Kosongkan</button><button onClick={() => setConfirmClear(false)} className={styles.cancelButton}>Batal</button></div>
                )}
              </div>
            </div>

            <div className={styles.summaryColumn}>
              <div className={styles.summary}>
                <h2 className={styles.summaryTitle}>Ringkasan Belanja</h2>
                <div className={styles.summaryItems}>{items.map((item) => <div key={getKey(item.product.id, item.selectedVariants)} className={styles.summaryItem}><span className={styles.summaryItemName}>{item.product.title} <span className={styles.mutedQuantity}>×{item.quantity}</span></span><span className={styles.summaryItemPrice}>{formatPrice(item.product.price * item.quantity)}</span></div>)}</div>
                <div className={styles.dividerSection}><div className={styles.summaryRow}><span className={styles.label}>Subtotal</span><span className={styles.price}>{formatPrice(totalPrice)}</span></div><div className={styles.summaryRow}><span className={styles.label}>Estimasi Ongkir</span><span className={styles.shipping}>Dihitung saat checkout</span></div></div>
                <div className={styles.totalSection}><div className={styles.totalRow}><span className={styles.totalLabel}>Total</span><span className={styles.totalPrice}>{formatPrice(totalPrice)}</span></div><p className={styles.totalNotice}>*Belum termasuk ongkir</p></div>
                <button onClick={() => router.push("/checkout")} className={styles.checkoutButton}><span className={styles.checkoutIcon}>shopping_cart_checkout</span>Checkout Sekarang</button>
                <Link href="/#katalog" className={styles.continueLink}><span className={styles.icon}>arrow_back</span>Lanjut Belanja</Link>
                <div className={styles.trustSection}><div className={styles.trustGrid}>{[["verified_user", "Transaksi Aman"], ["local_shipping", "Pengiriman Ekspres"], ["support_agent", "Dukungan 24/7"]].map(([icon, text]) => <div key={icon} className={styles.trustItem}><span className={styles.trustIcon}>{icon}</span><span className={styles.trustText}>{text}</span></div>)}</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
