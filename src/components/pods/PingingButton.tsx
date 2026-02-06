import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type PingingButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  isPinging?: boolean;
};

export function PingingButton({ onClick, children, icon: Icon, className, disabled, isPinging = true }: PingingButtonProps) {
  return (
    <div className="relative inline-block">
      {/* Concentric circle animation */}
      {isPinging && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute inline-flex h-full w-full rounded-md bg-primary opacity-75 animate-ping" />
          <span className="absolute inline-flex h-full w-full rounded-md bg-primary opacity-75 animate-ping" style={{ animationDelay: "0.5s" }} />
          <span className="absolute inline-flex h-full w-full rounded-md bg-primary opacity-50 animate-ping" style={{ animationDelay: "1s" }} />
        </div>
      )}
      
      {/* Button */}
      <Button
        onClick={onClick}
        className={cn("relative z-10", className)}
        disabled={disabled}
      >
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {children}
      </Button>
    </div>
  );
}
