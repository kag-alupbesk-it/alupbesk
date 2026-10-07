"use client";

import { useProductDetail } from "@/frontend/(pelanggan)/hooks/useProductDetail";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import Modal from "../shared/Modal";

export default function ProductDetailModal() {
  const { detailProduct, setDetailProduct } = useProductDetail();
  const { t } = useLanguage();

  if (!detailProduct) return null;

  const product = detailProduct;

  return (
    <Modal isOpen={!!detailProduct} onClose={() => setDetailProduct(null)}>
      <div className="grid md:grid-cols-2">
        <div
          className="aspect-square md:aspect-auto md:h-full min-h-[300px] bg-cover bg-center rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          style={{ backgroundImage: `url('${product.img}')` }}
        />
        <div className="p-8 space-y-5">
          <p className="text-[12px] font-bold text-secondary uppercase tracking-widest">
            {product.category}
          </p>
          <h2 className="text-headline-h2 font-bold text-on-surface">
            {product.title}
          </h2>
          <p className="text-body-sm text-on-surface/60">
            {product.desc}
          </p>
          {product.variants?.map((v) => (
            <div key={v.name}>
              <p className="text-[12px] font-bold text-on-surface/70 mb-2">
                {v.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  return (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-2 rounded-xl border border-outline/20 bg-surface-container px-4 py-2 text-[12px] font-bold text-on-surface/70"
                    >
                      {v.colors?.[v.options.indexOf(opt)] ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: v.colors[v.options.indexOf(opt)] }}
                          />
                          {opt}
                        </span>
                      ) : (
                        opt
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}

          {product.specs && (
            <div className="space-y-3 pt-4 border-t border-outline/20">
              <p className="text-[12px] font-bold text-on-surface/70 uppercase tracking-wider">{t("technicalSpecifications")}</p>
              <div className="grid grid-cols-2 gap-3">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] text-on-surface/40">{spec.label}</p>
                    <p className="text-[12px] font-semibold text-on-surface/80">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.highlights && (
            <div className="space-y-2 pt-2">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-on-surface/60">
                  <span className="material-symbols-outlined text-[16px] text-secondary flex-shrink-0">check_circle</span>
                  {h}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
