import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "none";
  className?: string;
}

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: direction === "up" ? 30 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
