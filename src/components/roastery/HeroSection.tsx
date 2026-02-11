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
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.8, type: "spring", stiffness: 100 }}
            className="absolute -right-4 md:-right-16 -bottom-8 md:-bottom-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 md:p-4 max-w-[180px] md:max-w-[220px] border border-primary/10"
          >
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-accent/60 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="text-xs md:text-sm text-primary/80 leading-tight italic">
                "Went to Re-Fuelled to try it, beautiful coffee"
              </p>
            </div>
            <div className="mt-1 ml-6">
              <p className="text-[10px] md:text-xs text-primary/50 font-medium">— Personal experience</p>
            </div>
          </motion.div>
        </div>

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
