import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EntityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: { label: string; onClick: () => void; variant?: React.ComponentProps<typeof Button>["variant"]; };
  secondaryAction?: { label: string; onClick: () => void; variant?: React.ComponentProps<typeof Button>["variant"]; };
};

export function EntityModal({ open, onOpenChange, title, description, children, primaryAction, secondaryAction }: EntityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2 space-y-4">{children}</div>
        {(primaryAction || secondaryAction) && (
          <DialogFooter>
            {secondaryAction && (
              <Button variant={secondaryAction.variant ?? "outline"} onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
            )}
            {primaryAction && (
              <Button variant={primaryAction.variant ?? "default"} onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}









