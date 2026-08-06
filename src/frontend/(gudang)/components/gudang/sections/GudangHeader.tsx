import * as s from "../style";

interface GudangHeaderProps {
  totalStok: number;
  totalJenisItem: number;
  jumlahLowStock: number;
}

export function GudangHeader({ totalStok, totalJenisItem, jumlahLowStock }: GudangHeaderProps) {
  return (
    <header className={s.header}>
      <div>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>Data Gudang Inventaris</h1>
          <span className={s.badge}>Kelola Stok</span>
        </div>
        <p className={s.headerSubtitle}>Monitoring stok barang dan status penyesuaian inventaris. Data produk dikelola oleh divisi marketing.</p>
      </div>

      <div className={s.headerActions}>
        <div className={s.metricCard}>
          <div className={s.metricIcon}>
            <span className={s.iconMd}>inventory_2</span>
          </div>
          <div>
            <p className={s.metricLabel}>Total Unit Stok</p>
            <p className={s.metricValue}>{totalStok.toLocaleString("id-ID")} Pcs</p>
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricIconAlt}>
            <span className={s.iconMd}>category</span>
          </div>
          <div>
            <p className={s.metricLabel}>Variasi Item</p>
            <p className={s.metricValueAlt}>{totalJenisItem} SKU</p>
          </div>
        </div>

        {jumlahLowStock > 0 && (
          <div className={s.lowStockCard}>
            <span className={s.lowStockDot} />
            <div>
              <p className={s.lowStockLabel}>Stok Menipis</p>
              <p className={s.lowStockValue}>{jumlahLowStock} Item</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
