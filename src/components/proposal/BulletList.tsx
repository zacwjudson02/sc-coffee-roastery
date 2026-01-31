import { motion } from "framer-motion";
import { itemVariants } from "./ProposalSection";

interface BulletListProps {
  items: string[];
  variant?: "default" | "check";
}

const BulletList = ({ items, variant = "default" }: BulletListProps) => {
  return (
    <motion.ul variants={itemVariants} className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          {variant === "check" ? (
            <svg
              className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
          )}
          <span className="text-foreground/90">{item}</span>
        </li>
      ))}
    </motion.ul>
  );
};

export default BulletList;
