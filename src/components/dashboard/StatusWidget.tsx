import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface StatusItem {
  id: string;
  label: string;
  status: "urgent" | "progress" | "complete" | "inactive";
  detail?: string;
}

interface StatusWidgetProps {
  title: string;
  items: StatusItem[];
  onViewAll?: () => void;
}

export function StatusWidget({ title, items, onViewAll }: StatusWidgetProps) {
  return (
    <Card className="border-2 border-slate-300 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-slate-50 border-b-2 border-slate-300">
        <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-emerald-700 hover:text-emerald-800 hover:bg-white text-xs font-bold uppercase">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No items to display</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border-2 border-slate-200 p-3 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{item.label}</p>
                {item.detail && (
                  <p className="text-xs text-slate-600 font-medium">{item.detail}</p>
                )}
              </div>
              <Badge variant={item.status} className="font-bold text-xs">
                {item.status === "urgent" && "Action Required"}
                {item.status === "progress" && "In Progress"}
                {item.status === "complete" && "Complete"}
                {item.status === "inactive" && "Inactive"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
