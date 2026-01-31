import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm",
        secondary: "border-transparent bg-slate-200 text-slate-700 hover:bg-slate-300",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "text-slate-700 border-slate-400",
        urgent: "border-red-400 bg-red-50 text-red-700 shadow-sm",
        progress: "border-orange-400 bg-orange-50 text-orange-700 shadow-sm",
        complete: "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm",
        inactive: "border-slate-400 bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
