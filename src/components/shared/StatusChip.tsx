import { Badge } from "@/components/ui/badge";

type StatusChipProps = {
  status: string;
  className?: string;
};

const STATUS_TO_VARIANT: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  Draft: "inactive",
  New: "inactive",
  Confirmed: "secondary",
  Allocated: "default",
  Dispatched: "progress",
  Delivered: "complete",
  Invoiced: "complete",
  Matched: "complete",
  Assigned: "complete",
  "Needs Review": "destructive",
  Active: "complete",
  Inactive: "inactive",
  Available: "default",
  "In Service": "secondary",
  "License Expired": "destructive",
  Pending: "secondary",
  Archived: "inactive",
};

export function StatusChip({ status, className }: StatusChipProps) {
  const normalized = status in STATUS_TO_VARIANT ? status : "default";
  const variant = STATUS_TO_VARIANT[normalized] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}



