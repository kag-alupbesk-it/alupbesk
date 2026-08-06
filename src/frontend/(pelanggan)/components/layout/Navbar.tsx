"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CartIcon from "../cart/CartIcon";
import ThemeToggle from "@/app/ThemeToggle";

const katalogDropdown = [
  { name: "Produk", href: "/#katalog", desc: "Browse semua produk aluminium & komponen" },
  { name: "Jasa Custom", href: "/jasa-custom", desc: "Request desain & fabrikasi custom" },
];

const perusahaanDropdown = [
  { name: "Tentang Kami", href: "/#profile", desc: "Profil dan visi misi perusahaan" },
  { name: "Mitra Kami", href: "/#partners", desc: "Perusahaan yang mempercayai kami" },
  { name: "Kontak", href: "/#kontak", desc: "Hubungi tim kami" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = ["katalog", "profile", "partners", "kontak"];
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

  const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const sectionId = href.replace("/#", "");
    if (pathname !== "/" || !sectionId) return;
    const section = document.getElementById(sectionId);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${sectionId}`);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-primary-container/95 backdrop-blur-md border-b border-outline/20">
        <div className="flex justify-between items-center h-18 px-margin-x-mobile md:px-margin-x-desktop max-w-container-max mx-auto h-[72px]">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              alt="ALUPBESK"
              className="h-9 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI"
            />
            <span className="text-[18px] font-bold text-on-surface tracking-wide">ALUPBESK</span>
          </Link>

          <div ref={dropdownRef} className="hidden lg:flex items-center gap-8">
            <div className="relative">
              <button
                onClick={() => toggleDropdown("katalog")}
              className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                   openDropdown === "katalog" ? "text-secondary" : activeSection === "katalog" ? "text-secondary" : "text-on-surface/70 hover:text-on-surface"
                 }`}
              >
                Katalog Produk
                <span className={`material-symbols-outlined text-[16px] transition-transform ${openDropdown === "katalog" ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {openDropdown === "katalog" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-surface-container-high border border-outline/20 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {katalogDropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(event) => handleSectionNavigation(event, item.href)}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-surface-container transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-on-surface group-hover:text-secondary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-on-surface/40 mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown("perusahaan")}
                className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                  openDropdown === "perusahaan" ? "text-secondary" : "text-on-surface/70 hover:text-on-surface"
                }`}
              >
                Perusahaan
                <span className={`material-symbols-outlined text-[16px] transition-transform ${openDropdown === "perusahaan" ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {openDropdown === "perusahaan" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-surface-container-high border border-outline/20 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {perusahaanDropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(event) => handleSectionNavigation(event, item.href)}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-surface-container transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-on-surface group-hover:text-secondary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-on-surface/40 mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/portofolio"
              className="text-[14px] font-medium text-on-surface/70 hover:text-on-surface transition-colors"
            >
              Portofolio
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <CartIcon />
            <ThemeToggle />
            <a
              href="https://wa.me/6283847105847"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-full text-[13px] font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="hidden xl:inline">Hubungi Kami</span>
            </a>
            <button
              className="lg:hidden text-on-surface hover:text-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined text-[30px]">menu</span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-primary-container/98 backdrop-blur-xl text-on-surface z-[110] flex flex-col p-8 transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-10">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img alt="Logo" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[30px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto flex-1">
          <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest px-3 mb-2 mt-2">Katalog Produk</p>
          {katalogDropdown.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => handleSectionNavigation(event, item.href)}
              className="flex flex-col px-3 py-3 rounded-xl hover:bg-surface-container transition-colors"
            >
              <span className="text-[16px] font-semibold text-on-surface">{item.name}</span>
              <span className="text-[11px] text-on-surface/40 mt-0.5">{item.desc}</span>
            </Link>
          ))}

          <div className="h-px bg-outline/20 my-3" />

          <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest px-3 mb-2">Perusahaan</p>
          {perusahaanDropdown.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => handleSectionNavigation(event, item.href)}
              className="flex flex-col px-3 py-3 rounded-xl hover:bg-surface-container transition-colors"
            >
              <span className="text-[16px] font-semibold text-on-surface">{item.name}</span>
              <span className="text-[11px] text-on-surface/40 mt-0.5">{item.desc}</span>
            </Link>
          ))}

          <div className="h-px bg-outline/20 my-3" />

          <Link
            href="/portofolio"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-surface-container transition-colors"
          >
            <span className="text-[16px] font-semibold text-on-surface">Portofolio</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 pt-6 border-t border-outline/20">
          <ThemeToggle className="w-10 h-10 text-on-surface/60" />
          <a
            href="https://wa.me/6283847105847"
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
