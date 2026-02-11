import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusWidget } from "@/components/dashboard/StatusWidget";
import { 
  Coffee, 
  Package, 
  AlertCircle, 
  Receipt, 
  Users,
  CalendarCheck,
  PlayCircle,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PingingButton } from "@/components/pods/PingingButton";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const kpiData = [
    {
      title: "Today's Orders",
      value: 14,
      icon: Package,
      trend: { value: "+2 from yesterday", positive: true },
    },
    {
      title: "Deliveries in Progress",
      value: 8,
      icon: Coffee,
      variant: "warning" as const,
    },
    {
      title: "PODs Missing",
      value: 3,
      icon: AlertCircle,
      variant: "urgent" as const,
    },
    {
      title: "Uninvoiced Orders",
      value: 5,
      icon: Receipt,
      variant: "warning" as const,
    },
    {
      title: "Active Team",
      value: 12,
      icon: Users,
      variant: "success" as const,
    },
    {
      title: "Completed Today",
      value: 6,
      icon: CalendarCheck,
      variant: "success" as const,
      trend: { value: "On track", positive: true },
    },
  ];

  const urgentPods = [
    {
      id: "1",
      label: "ORD-2026-0195",
      status: "urgent" as const,
      detail: "Due 2 hours ago - Noosa",
    },
    {
      id: "2",
      label: "ORD-2026-0196",
      status: "urgent" as const,
      detail: "Due 4 hours ago - Mooloolaba",
    },
    {
      id: "3",
      label: "ORD-2026-0197",
      status: "progress" as const,
      detail: "Uploaded - Awaiting review",
    },
  ];

  const todayBookings = [
    {
      id: "1",
      label: "ORD-2026-0201",
      status: "progress" as const,
      detail: "En route to Noosa - ETA 2:30 PM",
    },
    {
      id: "2",
      label: "ORD-2026-0202",
      status: "progress" as const,
      detail: "En route to Mooloolaba - ETA 3:00 PM",
    },
    {
      id: "3",
      label: "ORD-2026-0203",
      status: "progress" as const,
      detail: "Dispatched to Caloundra - ETA 4:00 PM",
    },
    {
      id: "4",
      label: "ORD-2026-0208",
      status: "inactive" as const,
      detail: "Awaiting allocation - Buderim",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          SC Coffee Roastery Operations
        </h1>
        <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wide">
          Real-time overview of roastery & delivery operations
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Status Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatusWidget
          title="Urgent PODs Missing"
          items={urgentPods}
          onViewAll={() => navigate("/demo/pods")}
        />
        <StatusWidget
          title="Today's Orders"
          items={todayBookings}
          onViewAll={() => navigate("/demo/bookings")}
        />
        
        {/* Quick Actions Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              Demo Features
            </CardTitle>
            <CardDescription>
              Try our interactive demos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">POD Workflow</div>
                  <div className="text-xs text-muted-foreground">See automatic OCR matching in action</div>
                </div>
              </div>
              <PingingButton
                onClick={() => navigate("/demo/pods")}
                icon={PlayCircle}
                isPinging={true}
                className="w-full"
              >
                Try POD Demo
              </PingingButton>
            </div>
            
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Navigate to the PODs page to experience the full interactive workflow
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
