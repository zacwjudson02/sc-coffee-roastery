import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusWidget } from "@/components/dashboard/StatusWidget";
import { 
  TruckIcon, 
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
      title: "Today's Bookings",
      value: 14,
      icon: Package,
      trend: { value: "+2 from yesterday", positive: true },
    },
    {
      title: "Jobs in Progress",
      value: 8,
      icon: TruckIcon,
      variant: "warning" as const,
    },
    {
      title: "PODs Missing",
      value: 3,
      icon: AlertCircle,
      variant: "urgent" as const,
    },
    {
      title: "Uninvoiced Jobs",
      value: 5,
      icon: Receipt,
      variant: "warning" as const,
    },
    {
      title: "Active Drivers",
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
      label: "BK-2024-0143",
      status: "urgent" as const,
      detail: "Due 2 hours ago - Melbourne CBD",
    },
    {
      id: "2",
      label: "BK-2024-0138",
      status: "urgent" as const,
      detail: "Due 4 hours ago - Sydney",
    },
    {
      id: "3",
      label: "BK-2024-0135",
      status: "progress" as const,
      detail: "Uploaded - Awaiting review",
    },
  ];

  const todayBookings = [
    {
      id: "1",
      label: "BK-2024-0150",
      status: "progress" as const,
      detail: "En route - ETA 2:30 PM",
    },
    {
      id: "2",
      label: "BK-2024-0149",
      status: "complete" as const,
      detail: "Delivered - 11:45 AM",
    },
    {
      id: "3",
      label: "BK-2024-0148",
      status: "progress" as const,
      detail: "Dispatched - ETA 4:00 PM",
    },
    {
      id: "4",
      label: "BK-2024-0147",
      status: "inactive" as const,
      detail: "Awaiting allocation",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 uppercase">
          Menz Transport Operations
        </h1>
        <p className="text-slate-600 font-semibold text-sm uppercase tracking-wide">
          Real-time overview of logistics operations
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
          onViewAll={() => navigate("/pods")}
        />
        <StatusWidget
          title="Today's Bookings"
          items={todayBookings}
          onViewAll={() => navigate("/bookings")}
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
                onClick={() => navigate("/pods")}
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
