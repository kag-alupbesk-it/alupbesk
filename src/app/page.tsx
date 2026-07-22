import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Profile from "@/components/Profile";
import Katalog from "@/components/Katalog";
import Partners from "@/components/Partners";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Profile />
        <Katalog />
        <Partners />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
