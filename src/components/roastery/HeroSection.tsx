import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-roastery.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Monitor, Smartphone, Coffee } from "lucide-react";

interface HeroSectionProps {
  onWalkThrough?: () => void;
}

const HeroSection = ({ onWalkThrough }: HeroSectionProps) => {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
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

        <div className="relative max-w-xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="font-sans text-lg md:text-xl text-primary-foreground/70 leading-relaxed"
          >
            You roast great coffee.
            <br />
            Your job isn't to chase paperwork.
          </motion.p>

          {/* Personal testimonial bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}
                transition={{ duration: 0.8, delay: 1.8, type: "spring", stiffness: 100 }}
                className="absolute right-0 md:-right-24 lg:-right-32 -bottom-12 md:-bottom-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 md:p-4 max-w-[200px] md:max-w-[240px] border border-primary/10"
              >
                <div className="flex items-start gap-2">
                  <Coffee className="w-4 h-4 md:w-5 md:h-5 text-accent/60 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-primary/80 leading-tight italic">
                    "Went to Re-Fuelled to test out, actually was a beautiful coffee"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
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
