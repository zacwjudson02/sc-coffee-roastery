import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusWidget } from "@/components/dashboard/StatusWidget";
import { 
  TruckIcon, 
  Package, 
  AlertCircle, 
  Receipt, 
  Users,
  CalendarCheck
} from "lucide-react";

export default function Dashboard() {
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your transport operations
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Status Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatusWidget
          title="Urgent PODs Missing"
          items={urgentPods}
          onViewAll={() => console.log("View all PODs")}
        />
        <StatusWidget
          title="Today's Bookings"
          items={todayBookings}
          onViewAll={() => console.log("View all bookings")}
        />
      </div>
    </div>
  );
}
