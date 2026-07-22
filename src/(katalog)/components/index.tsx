"use client";

import { CartProvider } from "./contexts/CartContext";
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
import CheckoutModal from "./ui/CheckoutModal";

export default function Components() {
  return (
    <CartProvider>
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
      <CheckoutModal />
    </CartProvider>
  );
}
