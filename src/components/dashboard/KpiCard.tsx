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
    default: "border-slate-300 bg-white hover:border-emerald-700 shadow-md hover:shadow-lg",
    urgent: "border-slate-300 bg-white hover:border-red-600 shadow-md hover:shadow-lg",
    success: "border-slate-300 bg-white hover:border-emerald-700 shadow-md hover:shadow-lg",
    warning: "border-slate-300 bg-white hover:border-orange-600 shadow-md hover:shadow-lg",
  };

  const iconStyles = {
    default: "bg-emerald-700 text-white shadow-md",
    urgent: "bg-red-600 text-white shadow-md",
    success: "bg-emerald-700 text-white shadow-md",
    warning: "bg-orange-600 text-white shadow-md",
  };

  return (
    <Card className={cn("transition-all duration-200 hover:-translate-y-1 border-2", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs font-semibold mt-1.5 uppercase tracking-wide",
            trend.positive ? "text-emerald-700" : "text-red-600"
          )}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
