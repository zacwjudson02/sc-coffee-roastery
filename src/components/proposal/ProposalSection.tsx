import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ProposalSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  withAccent?: boolean;
  [key: string]: any; // Allow other props like data-section
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const ProposalSection = ({
  children,
  className = "",
  id,
  withAccent = false,
  ...props
}: ProposalSectionProps) => {
  return (
    <motion.section
      id={id}
      className={`proposal-section ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      {...props}
    >
      <div className={`max-w-4xl ${withAccent ? "section-accent" : ""}`}>
        {children}
      </div>
    </motion.section>
  );
};

export default ProposalSection;
