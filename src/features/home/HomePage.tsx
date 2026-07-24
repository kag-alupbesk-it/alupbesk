"use client";
import { Navbar, Footer } from "@/frontend/(katalog)/components/layout";
import HeroSection from "@/frontend/(katalog)/components/sections/HeroSection";
import BestSeller from "@/frontend/(katalog)/components/sections/BestSeller";
import ProfileSection from "@/frontend/(katalog)/components/sections/ProfileSection";
import FaqSection from "@/frontend/(katalog)/components/sections/FaqSection";
import ContactSection from "@/frontend/(katalog)/components/sections/ContactSection";
import { ProductDetailModal } from "@/frontend/(katalog)/components/product";
import { CatalogPreview } from "@/features/catalog/components/CatalogPreview";
import PartnersSection from "./components/PartnersSection";
// Function untuk menyusun seluruh bagian beranda.
export default function HomePage() { return <><Navbar /><main><HeroSection /><BestSeller /><CatalogPreview /><ProfileSection /><PartnersSection /><FaqSection /><ContactSection /></main><Footer /><ProductDetailModal /></>; }