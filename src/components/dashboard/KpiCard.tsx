import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "urgent" | "success" | "warning";
}

export function KpiCard({ title, value, icon: Icon, trend, variant = "default" }: KpiCardProps) {
  const variantStyles = {
    default: "border-border",
    urgent: "border-destructive/20 bg-destructive/5",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          variant === "urgent" && "bg-destructive/10 text-destructive",
          variant === "success" && "bg-success/10 text-success",
          variant === "warning" && "bg-warning/10 text-warning",
          variant === "default" && "bg-primary/10 text-primary"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs",
            trend.positive ? "text-success" : "text-destructive"
          )}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
