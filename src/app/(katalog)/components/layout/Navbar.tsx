"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CartIcon from "../ui/CartIcon";

// 4 menu utama — bersih, tidak penuh
const mainNav = [
  { name: "Tentang Kami", href: "#profile" },
  { name: "Kontak", href: "#kontak" },
];

// Dropdown: Produk & Layanan
const produkNav = [
  { name: "Katalog Produk", href: "/#katalog", desc: "Browse semua produk aluminium & komponen" },
  { name: "Jasa Custom", href: "/jasa-custom", desc: "Request desain & fabrikasi custom" },
];

// Dropdown: Portofolio
const portofolioNav = [
  { name: "Galeri Proyek", href: "/portofolio", desc: "Contoh proyek yang sudah kami kerjakan" },
  { name: "Mitra & Klien", href: "/#partners", desc: "Perusahaan yang mempercayai kami" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track active section saat scroll
  useEffect(() => {
    const sections = ["profile", "katalog", "partners", "kontak"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-primary/95 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center h-18 px-margin-x-mobile md:px-margin-x-desktop max-w-container-max mx-auto h-[72px]">

          {/* Logo — klik untuk kembali ke beranda */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              alt="ALUPBESK"
              className="h-9 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI"
            />
            <span className="text-[18px] font-bold text-white tracking-wide">ALUPBESK</span>
          </Link>

          {/* Desktop Nav */}
          <div ref={dropdownRef} className="hidden lg:flex items-center gap-8">

            {/* Dropdown: Produk & Layanan */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("produk")}
                className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                  openDropdown === "produk" ? "text-secondary" : "text-white/70 hover:text-white"
                }`}
              >
                Produk & Layanan
                <span className={`material-symbols-outlined text-[16px] transition-transform ${
                  openDropdown === "produk" ? "rotate-180" : ""
                }`}>expand_more</span>
              </button>
              {openDropdown === "produk" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-primary-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {produkNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-white group-hover:text-secondary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-white/40 mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown: Portofolio */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("portofolio")}
                className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                  openDropdown === "portofolio" ? "text-secondary" : "text-white/70 hover:text-white"
                }`}
              >
                Portofolio
                <span className={`material-symbols-outlined text-[16px] transition-transform ${
                  openDropdown === "portofolio" ? "rotate-180" : ""
                }`}>expand_more</span>
              </button>
              {openDropdown === "portofolio" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-primary-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {portofolioNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-white group-hover:text-secondary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-white/40 mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Menu utama biasa */}
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[14px] font-medium transition-colors ${
                  (item.href === "#profile" && activeSection === "profile") ||
                  (item.href === "#kontak" && activeSection === "kontak")
                    ? "text-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA kanan */}
          <div className="flex items-center gap-3">
            <CartIcon />
            {/* Tombol WA — ringkas dengan ikon saja di tablet, teks di desktop besar */}
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-full text-[13px] font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="hidden xl:inline">Hubungi Kami</span>
            </a>
            {/* Hamburger — hanya di mobile/tablet */}
            <button
              className="lg:hidden text-white hover:text-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined text-[30px]">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — full screen slide */}
      <div
        className={`fixed inset-0 bg-primary/98 backdrop-blur-xl text-white z-[110] flex flex-col p-8 transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header mobile */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img alt="Logo" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[30px]">close</span>
          </button>
        </div>

        {/* Menu mobile */}
        <div className="flex flex-col gap-1 overflow-y-auto flex-1">
          {/* Produk & Layanan group */}
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2 mt-2">Produk & Layanan</p>
          {produkNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span className="text-[16px] font-semibold text-white">{item.name}</span>
            </Link>
          ))}

          <div className="h-px bg-white/10 my-3" />

          {/* Portofolio group */}
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Portofolio</p>
          {portofolioNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span className="text-[16px] font-semibold text-white">{item.name}</span>
            </Link>
          ))}

          <div className="h-px bg-white/10 my-3" />

          {/* Menu lain */}
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span className="text-[16px] font-semibold text-white/80">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* CTA bawah */}
        <div className="pt-6 border-t border-white/10">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center items-center gap-2 bg-secondary text-primary py-4 rounded-xl font-bold hover:brightness-110 transition-all text-[14px]"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
