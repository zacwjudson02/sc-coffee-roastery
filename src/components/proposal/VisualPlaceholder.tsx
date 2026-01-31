import { motion } from "framer-motion";
import { itemVariants } from "./ProposalSection";

interface VisualPlaceholderProps {
  label: string;
  description?: string;
  aspectRatio?: "wide" | "square" | "tall";
}

const VisualPlaceholder = ({
  label,
  description,
  aspectRatio = "wide",
}: VisualPlaceholderProps) => {
  const aspectClasses = {
    wide: "aspect-[16/9]",
    square: "aspect-square",
    tall: "aspect-[9/16]",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`visual-placeholder flex flex-col items-center justify-center text-center ${aspectClasses[aspectRatio]}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 15l4-4a2 2 0 012.8 0L15 15m0 0l2-2a2 2 0 012.8 0L20 14"
          />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        </svg>
        <span className="text-sm font-medium uppercase tracking-wider">
          Phase 2
        </span>
      </div>
      <p className="text-muted-foreground text-sm md:text-base">[{label}]</p>
      {description && (
        <p className="text-muted-foreground/70 text-xs mt-2 max-w-md">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default VisualPlaceholder;
