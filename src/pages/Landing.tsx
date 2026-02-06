import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Fleet } from "@/components/landing/Fleet";
import { ServiceArea } from "@/components/landing/ServiceArea";
import { Trust } from "@/components/landing/Trust";
import { Testimonials } from "@/components/landing/Testimonials";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { FloatingCTA } from "@/components/landing/FloatingCTA";

const Landing = () => {
  return (
    <div className="landing-page min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Fleet />
      <ServiceArea />
      <Trust />
      <Testimonials />
      <Contact />
      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default Landing;
