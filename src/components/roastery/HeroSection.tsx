import { motion } from "framer-motion";
import heroImage from "@/assets/hero-roastery.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Monitor, Smartphone } from "lucide-react";

interface HeroSectionProps {
  onWalkThrough?: () => void;
}

const HeroSection = ({ onWalkThrough }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax-like overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Artisan coffee roastery interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-sans text-sm tracking-[0.3em] uppercase text-bronze-light mb-8"
        >
          Sunshine Coast Coffee Roastery
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-primary-foreground leading-[1.1] mb-6"
        >
          Bookings. Deliveries. Invoices.{" "}
          <span className="italic">One System.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-sans text-lg md:text-xl text-primary-foreground/70 max-w-xl mx-auto mb-12 leading-relaxed"
        >
          You roast great coffee.
          <br />
          Your job isn't to chase paperwork.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={onWalkThrough}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-7 shadow-lg hover:shadow-xl transition-all rounded-full hover:scale-105 transform duration-200 w-full sm:w-auto gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Walk Through the Strategy
          </Button>

          <Link to="/demo">
            <Button
              size="lg"
              className="bg-bronze hover:bg-bronze/80 text-white font-semibold text-lg px-8 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 transform duration-200 w-full sm:w-auto gap-2"
            >
              <Monitor className="w-5 h-5" />
              See Operations Demo
            </Button>
          </Link>

          <Link to="/driver-app">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg px-8 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 transform duration-200 w-full sm:w-auto gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Try Driver App
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-px h-12 bg-primary-foreground/30"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
