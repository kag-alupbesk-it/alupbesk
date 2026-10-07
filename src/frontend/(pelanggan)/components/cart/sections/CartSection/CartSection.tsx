"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { useCart, itemKey } from "@/frontend/(pelanggan)/hooks/useCart/useCart";
import type { CartItem } from "@/frontend/(pelanggan)/types/types";
import Navbar from "../../../layout/Navbar/Navbar";
import { cartStyles as styles } from "../../style/style";

const formatPrice = (price: number): string => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
}).format(price);

interface DeleteTarget {
  key: string;
  item: CartItem;
}

interface PendingDelete {
  key: string;
  item: CartItem;
}

export default function CartSection() {
  const { items, removeFromCart, restoreItem, updateQuantity, updateNote, clearCart, totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [confirmClear, setConfirmClear] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [popupExiting, setPopupExiting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [undoExiting, setUndoExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingDelete | null>(null);

  const openDeletePopup = useCallback((key: string, item: CartItem) => {
    setPopupExiting(false);
    setDeleteTarget({ key, item });
  }, []);

  const closeDeletePopup = useCallback(() => {
    setPopupExiting(true);
    setTimeout(() => {
      setDeleteTarget(null);
      setPopupExiting(false);
    }, 250);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const { key, item } = deleteTarget;

    if (timerRef.current) clearTimeout(timerRef.current);
    setUndoExiting(false);

    const pending: PendingDelete = { key, item };
    pendingRef.current = pending;
    setPendingDelete(pending);

    setPopupExiting(true);
    setTimeout(() => {
      setDeleteTarget(null);
      setPopupExiting(false);
    }, 250);

    const timer = setTimeout(() => {
      removeFromCart(key);
      pendingRef.current = null;
      setUndoExiting(true);
      setTimeout(() => {
        setPendingDelete(null);
        setUndoExiting(false);
      }, 300);
    }, 5000);
    timerRef.current = timer;
  }, [deleteTarget, removeFromCart]);

  const handleUndo = useCallback(() => {
    if (!pendingRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    restoreItem(pendingRef.current.item);
    setUndoExiting(true);
    setTimeout(() => {
      pendingRef.current = null;
      setPendingDelete(null);
      setUndoExiting(false);
    }, 300);
  }, [restoreItem]);

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
    <>
      <Navbar />
      <div className={`${styles.page} pt-[72px]`}>
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
        {items.length === 0 && !pendingDelete ? (
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
                const isPending = pendingDelete?.key === key;
                return (
                  <div key={key} className={`${styles.itemCard} ${isPending ? styles.itemCardPending : ""}`}>
                    <div className={styles.itemRow}>
                      <div className={styles.productImage} style={{ backgroundImage: `url('${item.product.img}')` }} />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <div className={styles.productInfo}>
                            <span className={styles.stockBadge}><span className={styles.stockDot} />{item.product.stock > 50 ? "Ready Stock" : item.product.stock > 0 ? `Stok: ${item.product.stock}` : "Habis"}</span>
                            <h3 className={styles.productTitle}>{item.product.title}</h3>
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className={styles.variantBadges}>
                                {Object.entries(item.selectedVariants).map(([k, v]) => (
                                  <span key={k} className={styles.variantBadge}>
                                    <span className={styles.variantKey}>{k}:</span> {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className={styles.unitPrice}>@ {formatPrice(item.product.price)} / pcs</p>
                          </div>
                          {!isPending && <button onClick={() => openDeletePopup(key, item)} className={styles.deleteButton} title="Hapus produk"><span className={styles.icon}>delete</span></button>}
                          {isPending && <span className={`${styles.icon} text-red-400/60`}>hourglass_empty</span>}
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
                    {isPending && <div className={styles.pendingTimer}><div className={styles.pendingTimerBar} /></div>}
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
                <div className={styles.summaryItems}>{items.map((item) => <div key={getKey(item.product.id, item.selectedVariants)} className={styles.summaryItemBlock}><div className={styles.summaryItem}><span className={styles.summaryItemName}>{item.product.title} <span className={styles.mutedQuantity}>×{item.quantity}</span></span><span className={styles.summaryItemPrice}>{formatPrice(item.product.price * item.quantity)}</span></div>{item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && <div className={styles.summaryVariants}>{Object.entries(item.selectedVariants).map(([k, v]) => <span key={k} className={styles.summaryVariantTag}><span className={styles.summaryVariantKey}>{k}:</span> {v}</span>)}</div>}</div>)}</div>
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

      {deleteTarget && (
        <div className={`${styles.popupOverlay} ${popupExiting ? "animate-fadeOut" : "animate-fadeIn"}`} onClick={closeDeletePopup}>
          <div className={`${styles.popupBox} ${popupExiting ? "animate-scaleOut" : "animate-scaleIn"}`} onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
              <div className="relative p-6">
                <div className={styles.popupImageWrap}>
                  <div className={styles.popupImage} style={{ backgroundImage: `url('${deleteTarget.item.product.img}')` }} />
                </div>
                <h3 className={styles.popupTitle}>Hapus dari Keranjang?</h3>
                <p className={styles.popupDesc}>
                  <span className="text-on-surface font-semibold">{deleteTarget.item.product.title}</span> akan dihapus dari keranjang belanja Anda.
                </p>
                {deleteTarget.item.selectedVariants && Object.keys(deleteTarget.item.selectedVariants).length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {Object.entries(deleteTarget.item.selectedVariants).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1 bg-surface-container text-on-surface/50 text-[11px] px-2 py-0.5 rounded-md border border-outline/20">
                        <span className="text-on-surface/30">{k}:</span> {v}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.popupActions}>
                  <button onClick={closeDeletePopup} className={styles.popupCancel}>Batal</button>
                  <button onClick={confirmDelete} className={styles.popupConfirm}>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className={`${styles.undoToast} ${undoExiting ? styles.undoToastExiting : styles.undoToastEntering}`}>
          <div className={`${styles.undoToastBox} ${undoExiting ? "animate-slideUpToTop" : "animate-slideDownFromTop"}`}>
            <div className={styles.undoToastContent}>
              <span className="material-symbols-outlined text-[22px] text-red-400/70">delete</span>
              <p className={styles.undoToastText}>
                <span className="font-semibold text-on-surface">{pendingDelete.item.product.title}</span> dihapus dari keranjang
              </p>
            </div>
            <div className="flex justify-center pb-4">
              <button onClick={handleUndo} className={styles.undoToastButton}>Urungkan</button>
            </div>
            <div className={styles.undoToastProgress}>
              <div className={styles.undoToastProgressBar} />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
