"use client";

import { Suspense } from "react";
import Navbar from "./layout/Navbar/Navbar";
import Footer from "./layout/Footer/Footer";
import HeroSection from "./hero";
import ProfileSection from "./profile";
import PortfolioSection from "./portfolio";
import PartnersSection from "./partners";
import FaqSection from "./faq";
import ContactSection from "./contact";

export default function PelangganComponents() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <Suspense fallback={<div className="py-section-gap-desktop bg-primary-container" />}>
          <PortfolioSection hideNavbar id="katalog" />
        </Suspense>
        <ProfileSection />
        <PartnersSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
