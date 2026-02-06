import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export const FloatingCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="floating-cta"
    >
      <a
        href="tel:1300636900"
        className="flex items-center gap-3 px-6 py-4 rounded-full bg-accent text-accent-foreground font-semibold shadow-ice hover:shadow-frost transition-shadow"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden sm:inline">1300 MENZ</span>
      </a>
    </motion.div>
  );
};
