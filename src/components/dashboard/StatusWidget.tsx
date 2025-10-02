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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items to display</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                {item.detail && (
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                )}
              </div>
              <Badge variant={item.status}>
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
