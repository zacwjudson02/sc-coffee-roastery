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
  // Shift workflow (humanized)
  Planned: "secondary",
  "In Progress": "progress",
  Completed: "complete",
  Cancelled: "destructive",
};

export function StatusChip({ status, className }: StatusChipProps) {
  const normalized = status in STATUS_TO_VARIANT ? status : "default";
  const variant = STATUS_TO_VARIANT[normalized] ?? "default";
  const DOT_CLASS: Record<string, string> = {
    Active: "bg-emerald-500",
    Inactive: "bg-zinc-400",
    Draft: "bg-zinc-400",
    New: "bg-zinc-400",
    Confirmed: "bg-blue-500",
    Allocated: "bg-indigo-500",
    Dispatched: "bg-amber-500",
    Delivered: "bg-emerald-500",
    Invoiced: "bg-emerald-500",
    Matched: "bg-emerald-500",
    Assigned: "bg-emerald-500",
    "Needs Review": "bg-red-500",
    Available: "bg-emerald-500",
    "In Service": "bg-blue-500",
    "License Expired": "bg-red-500",
    Pending: "bg-amber-500",
    Archived: "bg-zinc-400",
    Planned: "bg-blue-500",
    "In Progress": "bg-amber-500",
    Completed: "bg-emerald-500",
    Cancelled: "bg-red-500",
    default: "bg-zinc-400",
  };
  const dot = DOT_CLASS[normalized] ?? DOT_CLASS.default;
  return (
    <Badge variant={variant} className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </Badge>
  );
}



