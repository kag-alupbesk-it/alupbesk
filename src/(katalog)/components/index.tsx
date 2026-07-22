"use client";

import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import HeroSection from "./sections/HeroSection";
import ProfileSection from "./sections/ProfileSection";
import KatalogSection from "./sections/KatalogSection";
import PartnersSection from "./sections/PartnersSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import CartDrawer from "./ui/CartDrawer";
import ProductDetailModal from "./ui/ProductDetailModal";

export default function Components() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProfileSection />
        <KatalogSection />
        <PartnersSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <CartDrawer />
      <ProductDetailModal />
    </>
  );
}
