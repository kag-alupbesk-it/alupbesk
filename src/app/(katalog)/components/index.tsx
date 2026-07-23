"use client";

import { Suspense } from "react";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import HeroSection from "./sections/HeroSection";
import ProfileSection from "./sections/ProfileSection";
import KatalogSection from "./sections/KatalogSection";
import PartnersSection from "./sections/PartnersSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import ProductDetailModal from "./ui/ProductDetailModal";

export default function Components() {
    return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <ProfileSection />
        <Suspense fallback={<div className="py-section-gap-desktop bg-primary" />}>
          <KatalogSection />
        </Suspense>
        <PartnersSection />
        <FaqSection />
        <ContactSection />
      </main>
            <Footer />
      <ProductDetailModal />
    </>
  );
}
