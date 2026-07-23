"use client";

import { Suspense } from "react";
import { Navbar, Footer } from "./layout";
import {
  HeroSection,
  ProfileSection,
  KatalogSection,
  PartnersSection,
  FaqSection,
  ContactSection,
} from "./sections";
import { ProductDetailModal } from "./product";

export default function Components() {
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
