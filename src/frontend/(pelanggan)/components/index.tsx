"use client";

import { Suspense } from "react";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import HeroSection from "./hero";
import ProfileSection from "./profile";
import KatalogSection from "./katalog";
import PartnersSection from "./partners";
import FaqSection from "./faq";
import ContactSection from "./contact";
import { ProductDetailModal } from "./product";

export default function PelangganComponents() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <Suspense fallback={<div className="py-section-gap-desktop bg-primary" />}>
          <KatalogSection />
        </Suspense>
        <ProfileSection />
        <PartnersSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <ProductDetailModal />
    </>
  );
}
