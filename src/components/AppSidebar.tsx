import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Route, 
  FileCheck, 
  Users, 
  Receipt, 
  Building2,
  Coffee,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  Settings
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
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAppData } from "@/hooks/use-appdata";
import { usePodStore } from "@/hooks/use-podstore";
import { useInvoices } from "@/hooks/use-invoices";

const menuItems = [
  { title: "Dashboard", url: "/demo", icon: LayoutDashboard },
  { title: "Bookings", url: "/demo/bookings", icon: FileText },
  { title: "Runsheets", url: "/demo/runsheets", icon: Route },
  { title: "PODs", url: "/demo/pods", icon: FileCheck },
  { title: "Staff & Resources", url: "/demo/resources", icon: Users },
  { title: "Invoicing", url: "/demo/invoicing", icon: Receipt },
  { title: "Customers & Vendors", url: "/demo/customers", icon: Building2 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const { addBooking, customers, updateBooking } = useAppData();
  const { setFile } = usePodStore();
  const { invoices, createInvoice, addLine, markStatus, updateInvoice, findOrCreateDraftByCustomer } = useInvoices();
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
      ["SC Roastery HQ", "Noosa Cafe Strip"],
      ["SC Roastery HQ", "Mooloolaba Espresso Bar"],
      ["SC Roastery HQ", "Caloundra Main St"],
      ["SC Roastery HQ", "Maroochydore Markets"],
      ["SC Roastery HQ", "Coolum Beach Cafe"],
    ];
    const drivers = ["Jake Brennan", "Lily Tran", "Sam Keogh", "Reece Murray"];
    for (let i = 0; i < count; i++) {
      const customer = customers[i % customers.length];
      const pair = samplePairs[i % samplePairs.length];
      const driver = drivers[i % drivers.length];
      const bookingId = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
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

  async function handleInjectInvoicedHistory() {
    if (!customers || customers.length === 0) { alert("No customers available"); return; }
    const samplePairs = [
      ["SC Roastery HQ", "Noosa Cafe Strip"],
      ["SC Roastery HQ", "Mooloolaba Espresso Bar"],
      ["SC Roastery HQ", "Caloundra Main St"],
      ["SC Roastery HQ", "Maroochydore Markets"],
      ["SC Roastery HQ", "Coolum Beach Cafe"],
    ];
    const today = new Date();
    let created = 0;
    customers.forEach((customer, cIdx) => {
      for (let i = 0; i < 15; i++) {
        const pair = samplePairs[(cIdx + i) % samplePairs.length];
        const date = new Date(today);
        const back = (i * 3) + (cIdx % 5); // spread over ~45 days
        date.setDate(today.getDate() - back);
        const iso = date.toISOString().slice(0,10);
        const pallets = ((i + 2) % 8) + 2;
        const unitPrice = 40 + ((i % 5) * 5);
        const total = pallets * unitPrice;
        const bookingId = `ORD-${today.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const id = addBooking({
          bookingId,
          customerId: customer.id,
          customerName: customer.company,
          pickup: pair[0],
          dropoff: pair[1],
          date: iso,
          status: "Invoiced",
          driver: undefined,
          pickupSuburb: pair[0].split(" ")[0],
          dropoffSuburb: pair[1].split(" ")[0],
          pallets,
          spaces: pallets,
          chargeTo: "Sender",
          palletType: "Standard",
          transferType: "Metro",
          podMethod: "Photo",
          podReceived: true,
          customerRef: `PO-${Math.floor(Math.random()*9000)+1000}`,
          secondRef: `REF-${Math.floor(Math.random()*900)+100}`,
          unitPrice,
          rateBasis: "per_pallet",
          invoiceTotal: Number(total.toFixed(2)),
        });
        // Pool into per-customer draft invoice by date
        const { id: invoiceId } = findOrCreateDraftByCustomer(customer.id, customer.company, iso);
        addLine(invoiceId, { description: `Delivery ${pair[0]} → ${pair[1]}`, quantity: pallets, unitPrice });
        const existing = invoices.find((x) => x.id === invoiceId);
        updateInvoice(invoiceId, { source: [ ...(existing?.source ?? []), { type: "booking", id, bookingId } ] });
        created++;
      }
    });
    alert(`Injected ${created} invoiced booking(s) across ${customers.length} customer(s).`);
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border shadow-md top-12">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-800 to-amber-900 shadow-md">
            <Coffee className="h-6 w-6 text-amber-100" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">SC Coffee Roastery</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-sidebar-primary">Software Proposal</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Back to Proposal */}
        {open && (
          <div className="px-3 py-4 border-b border-sidebar-border">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 h-10 uppercase tracking-wide text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Proposal
            </Button>
          </div>
        )}
        
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/demo"}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-3 px-3 py-2.5 rounded-md bg-sidebar-accent text-sidebar-primary font-bold shadow-sm border-l-4 border-sidebar-primary transition-all duration-200"
                          : "flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/80 hover:text-sidebar-primary hover:bg-sidebar-accent hover:border-l-4 hover:border-sidebar-foreground/30 transition-all duration-200 font-semibold"
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Collapsible Utilities */}
        <SidebarGroup className="border-t border-sidebar-border mt-2 pt-2">
          <Collapsible open={utilitiesOpen} onOpenChange={setUtilitiesOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent rounded-md mx-2">
                <span className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Demo Utilities
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${utilitiesOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5 mt-2 px-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={handleResetDemo}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Demo Data</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={handleInjectInvoicedHistory}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject 15 Invoiced/Customer</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={async () => {
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
                            markStatus(id, "Delivered");
                            updateInvoice(id, { deliveredAt: new Date(date).toISOString() });
                          }
                          alert("Demo invoice(s) injected");
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject Invoice (custom date)</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => handleInject(1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject 1 Booking</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => handleInject(3)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject 3 Bookings</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => handleInject(5)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject 5 Bookings</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => handleInject(15)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent rounded-md transition-all font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inject 15 Allocated (today)</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        
        {/* Footer Badge */}
        {open && (
          <div className="mt-auto px-3 py-4 border-t border-sidebar-border">
            <div className="relative rounded-lg p-3 border border-sidebar-border bg-sidebar-accent">
              <div className="relative flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-sidebar-primary flex items-center justify-center shadow-sm">
                  <Coffee className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-sidebar-foreground uppercase tracking-wide">Interactive Demo</p>
                  <p className="text-[10px] text-sidebar-foreground/60 font-semibold">Roastery Operations</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
