"use client";
import type { Product } from "@/services/catalog";
import { useCart } from "@/frontend/(katalog)/checkout/CartContext";

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const { setDetailProduct, addToCart } = useCart();
  const price = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price);

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (product.variants?.length) { setDetailProduct(product); return; }
    addToCart(product, 1);
  };

  return (
    <article
      onClick={() => setDetailProduct(product)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:bg-white/10 hover:shadow-2xl"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.img}
          alt={product.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-2 top-2 ${product.badgeBg} rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[10px]`}
        >
          {product.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-5">
        <h3 className="min-h-[34px] line-clamp-2 text-[13px] text-white sm:min-h-0 sm:text-headline-h3">
          {product.title}
        </h3>
        <p className="mb-2 text-[13px] font-bold text-secondary sm:mb-4 sm:text-label-sm">
          {price}
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span
            className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${
              product.stock > 50 ? "text-emerald-400" : product.stock > 0 ? "text-yellow-400" : "text-red-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                product.stock > 50 ? "bg-emerald-400" : product.stock > 0 ? "bg-yellow-400" : "bg-red-400"
              }`}
            />
            {product.stock > 50 ? "Ready Stock" : product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
          </span>
          {product.variants
            ?.filter((v) => v.name !== "Warna")
            .map((v) => (
              <span key={v.name} className="text-[10px] sm:text-[11px] text-white/40">
                {v.name}: <span className="text-white/60">{v.options.length} opsi</span>
              </span>
            ))}
        </div>

        <div className="mt-auto hidden gap-2 sm:flex">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setDetailProduct(product);
            }}
            className="flex-1 rounded-lg border border-white/20 py-3 text-label-sm font-bold text-white transition-all group-hover:border-secondary group-hover:bg-secondary group-hover:text-primary"
          >
            Detail
          </button>
          <button
            onClick={handleQuickAdd}
            className="rounded-lg border border-white/20 px-4 py-3 text-white transition-all hover:border-secondary hover:bg-secondary hover:text-primary"
            aria-label={`Tambah ${product.title}`}
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
