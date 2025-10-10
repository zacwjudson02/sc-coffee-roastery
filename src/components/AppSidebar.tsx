import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Route, 
  FileCheck, 
  Users, 
  Receipt, 
  Building2,
  Truck,
  RotateCcw
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppData } from "@/hooks/use-appdata";
import { usePodStore } from "@/hooks/use-podstore";
import { useInvoices } from "@/hooks/use-invoices";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bookings", url: "/bookings", icon: FileText },
  { title: "Runsheets", url: "/runsheets", icon: Route },
  { title: "PODs", url: "/pods", icon: FileCheck },
  { title: "Staff & Resources", url: "/resources", icon: Users },
  { title: "Invoicing", url: "/invoicing", icon: Receipt },
  { title: "Customers & Vendors", url: "/customers", icon: Building2 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { addBooking, customers, updateBooking } = useAppData();
  const { setFile } = usePodStore();
  const { createInvoice, addLine, markStatus, updateInvoice } = useInvoices();
  function handleResetDemo() {
    const ok = window.confirm("Reset all demo data? This will clear local storage and reload the app.");
    if (!ok) return;
    try {
      localStorage.removeItem("smh.appdata");
      localStorage.removeItem("smh.invoices");
      localStorage.removeItem("smh.resources");
      localStorage.removeItem("bookings.savedViews");
      localStorage.removeItem("driverColors");
      localStorage.removeItem("xero_demo_connected");
    } catch {}
    window.location.reload();
  }

  function handleInject(count: number) {
    if (!customers || customers.length === 0) {
      alert("No customers available to assign. Add a customer first.");
      return;
    }
    const today = new Date().toISOString().slice(0,10);
    const samplePairs = [
      ["Melbourne Warehouse", "Sydney CBD"],
      ["Brisbane Port", "Gold Coast"],
      ["Adelaide Depot", "Melbourne"],
      ["Perth Hub", "Fremantle"],
      ["Canberra DC", "Newcastle"],
    ];
    const drivers = ["John Smith", "Sarah Jones", "Mike Brown", "Priya Patel"];
    for (let i = 0; i < count; i++) {
      const customer = customers[i % customers.length];
      const pair = samplePairs[i % samplePairs.length];
      const driver = drivers[i % drivers.length];
      const bookingId = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const pallets = (i % 6) + 2;
      const spaces = pallets;
      const id = addBooking({
        bookingId,
        customerId: customer.id,
        customerName: customer.company,
        pickup: pair[0],
        dropoff: pair[1],
        date: today,
        status: "Allocated",
        driver,
        pickupSuburb: pair[0].split(" ")[0],
        dropoffSuburb: pair[1].split(" ")[0],
        pallets,
        spaces,
        chargeTo: "Sender",
        palletType: "Standard",
        transferType: "Metro",
        podMethod: "Photo",
        podReceived: true,
        customerRef: `PO-${Math.floor(Math.random()*9000)+1000}`,
        secondRef: `REF-${Math.floor(Math.random()*900)+100}`,
        unitPrice: 50,
        rateBasis: "per_pallet",
        invoiceTotal: undefined,
      });
      // Attach a demo POD file
      try {
        const blob = new Blob(["POD DEMO"], { type: "application/pdf" });
        const file = new File([blob], `pod-${bookingId}.pdf`, { type: "application/pdf" });
        setFile(`booking:${id}`, file);
        updateBooking(id, { podReceived: true });
      } catch {}
    }
    alert(`Injected ${count} booking(s) ready to invoice.`);
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">J&L Transport</span>
              <span className="text-xs text-sidebar-foreground/60">Manifest Control</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Utilities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={handleResetDemo}>
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Demo Data</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={async () => {
                    const countStr = prompt("How many demo invoices? Enter a date (YYYY-MM-DD) then count, e.g. 2025-09-01,3", "2025-09-01,1");
                    if (!countStr) return;
                    const [dateStr, countPart] = countStr.split(",");
                    const date = dateStr?.trim() || new Date().toISOString().slice(0,10);
                    const n = Number((countPart ?? "1").trim());
                    if (!customers || customers.length === 0) { alert("No customers available"); return; }
                    for (let i = 0; i < n; i++) {
                      const customer = customers[i % customers.length];
                      const id = createInvoice({ customerId: customer.id, customer: customer.company, date, lines: [], status: "Draft" });
                      addLine(id, { description: "Demo Line", quantity: 1, unitPrice: 100 });
                      // Mark Delivered at custom date
                      markStatus(id, "Delivered");
                      updateInvoice(id, { deliveredAt: new Date(date).toISOString() });
                    }
                    alert("Demo invoice(s) injected");
                  }}>
                    <FileText className="h-4 w-4" />
                    <span>Inject Invoice (custom date)</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleInject(1)} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Inject 1 Booking</span>
                    </button>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => handleInject(3)}>
                    <FileText className="h-4 w-4" />
                    <span>Inject 3 Bookings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => handleInject(5)}>
                    <FileText className="h-4 w-4" />
                    <span>Inject 5 Bookings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
