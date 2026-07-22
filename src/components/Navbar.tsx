"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  // Daftar menu navigasi untuk menghindari penulisan berulang
  const navItems = [
    { name: "Beranda", id: "beranda" },
    { name: "Profile", id: "profile" },
    { name: "Katalog", id: "katalog" },
    { name: "Partners", id: "partners" },
    { name: "FAQ", id: "faq" },
    { name: "Kontak", id: "kontak" },
  ];

  // Mendeteksi posisi scroll untuk mengubah status "Active" secara otomatis
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset untuk tinggi navbar

      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(item.id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-primary/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="flex justify-between items-center h-20 px-margin-x-mobile md:px-margin-x-desktop max-w-container-max mx-auto">
          
          {/* Logo */}
          <Link href="#beranda" onClick={() => setActiveSection("beranda")} className="flex items-center gap-4 cursor-pointer">
            <img
              alt="ALUPBESK Logo"
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI"
            />
            <span className="text-headline-h3 font-headline-h3 font-bold text-white">
              ALUPBESK
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`font-label-sm pb-1 transition-all duration-300 border-b-2 ${
                  activeSection === item.id
                    ? "text-secondary font-bold border-secondary" // Style saat aktif
                    : "text-white/70 font-normal border-transparent hover:text-white hover:border-white/50" // Style saat tidak aktif & hover
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <a className="hidden md:flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-full font-label-sm font-bold hover:bg-white transition-all duration-300 transform active:scale-95" href="#">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Hubungi via WhatsApp
            </a>
            <button className="lg:hidden text-white hover:text-secondary transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined text-[32px]">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-primary/95 backdrop-blur-xl text-white z-[110] flex flex-col p-8 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <img
            alt="Logo"
            className="h-8"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI"
          />
          <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-6 text-headline-h2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`transition-colors ${
                activeSection === item.id 
                  ? "text-secondary font-bold" // Style Mobile saat aktif
                  : "text-white/70 hover:text-white" // Style Mobile saat tidak aktif & hover
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="mt-auto">
          <a className="w-full flex justify-center items-center gap-3 bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-white transition-colors" href="#">
            <span className="material-symbols-outlined">chat</span> Hubungi Kami
          </a>
        </div>
      </div>
    </>
  );
}